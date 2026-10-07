import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

import { useSocket } from '../hooks/useSocket';
import useWebRTC from "../hooks/useWebRTC";

import VideoGrid from '../components/meeting/VideoGrid';
import MeetingControls from '../components/meeting/MeetingControls';
import ChatPanel from '../components/chat/ChatPanel';
import Whiteboard from '../components/whiteboard/Whiteboard';
import { ScreenShare } from '../components/screenShare/ScreenShare';

export default function MeetingRoom() {
  const { roomId: urlRoomId } = useParams();

  const location = useLocation();
  const navigate = useNavigate();

  const socket = useSocket();

  /*
   * =========================================
   * ROOM ID
   * =========================================
   */

  const roomId =
    urlRoomId ||
    location.state?.roomId ||
    `room-${Date.now()}`;

  /*
   * =========================================
   * SAVED CAMERA / MIC STATE
   * =========================================
   */

  const getSavedBoolean = (
    key,
    fallback = false
  ) => {
    try {
      const value = localStorage.getItem(key);

      if (value === null) {
        return fallback;
      }

      return value === 'true';
    } catch {
      return fallback;
    }
  };

  const [isMuted, setIsMuted] = useState(() =>
    getSavedBoolean(
      `meeting_muted_${roomId}`,
      false
    )
  );

  const [isVideoOff, setIsVideoOff] = useState(() =>
    getSavedBoolean(
      `meeting_camera_off_${roomId}`,
      false
    )
  );

  /*
   * =========================================
   * UI STATE
   * =========================================
   */

  const [activeTab, setActiveTab] = useState(
    location.state?.defaultTab || 'video'
  );

  const [stream, setStream] = useState(null);

  const [copied, setCopied] = useState(false);

  const [showChatMobile, setShowChatMobile] =
    useState(false);

  const [participants, setParticipants] =
    useState([]);

  const myVideoRef = useRef(null);

  /*
   * =========================================
   * WEBRTC
   *
   * IMPORTANT:
   * localStream is passed only after it exists.
   * This allows useWebRTC to attach camera/mic
   * tracks BEFORE joining/creating offers.
   * =========================================
   */

  const {
    peers,
  } = useWebRTC({
    socket,
    roomId,
    localStream: stream,
  });

  /*
   * =========================================
   * START CAMERA + MICROPHONE
   * =========================================
   */

  useEffect(() => {
    let mounted = true;

    const startMedia = async () => {
      try {
        /*
         * Request camera only if camera is enabled.
         */
        const constraints = {
          audio: true,
          video: !isVideoOff,
        };

        console.log(
          'Requesting local media:',
          constraints
        );

        const userStream =
          await navigator.mediaDevices.getUserMedia(
            constraints
          );

        /*
         * Component was unmounted while permission
         * dialog was open.
         */
        if (!mounted) {
          userStream
            .getTracks()
            .forEach((track) => track.stop());

          return;
        }

        /*
         * Apply saved microphone state.
         */
        userStream
          .getAudioTracks()
          .forEach((track) => {
            track.enabled = !isMuted;
          });

        /*
         * Apply saved camera state.
         */
        userStream
          .getVideoTracks()
          .forEach((track) => {
            track.enabled = !isVideoOff;
          });

        console.log(
          'Local stream ready:',
          userStream
        );

        setStream(userStream);
      } catch (error) {
        console.error(
          'Media permission error:',
          error
        );

        /*
         * If camera failed, try microphone only.
         */
        if (!isVideoOff) {
          try {
            const audioOnlyStream =
              await navigator.mediaDevices.getUserMedia(
                {
                  audio: true,
                  video: false,
                }
              );

            if (!mounted) {
              audioOnlyStream
                .getTracks()
                .forEach((track) =>
                  track.stop()
                );

              return;
            }

            audioOnlyStream
              .getAudioTracks()
              .forEach((track) => {
                track.enabled = !isMuted;
              });

            setIsVideoOff(true);

            localStorage.setItem(
              `meeting_camera_off_${roomId}`,
              'true'
            );

            setStream(audioOnlyStream);
          } catch (audioError) {
            console.error(
              'Microphone permission error:',
              audioError
            );

            setStream(null);
          }
        } else {
          /*
           * Camera was intentionally off but microphone
           * also failed.
           */
          setStream(null);
        }
      }
    };

    startMedia();

    return () => {
      mounted = false;
    };

    // We intentionally initialize media once per room.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  /*
   * =========================================
   * ATTACH LOCAL VIDEO
   * =========================================
   */

  useEffect(() => {
    if (!myVideoRef.current) {
      return;
    }

    if (stream) {
      myVideoRef.current.srcObject = stream;

      /*
       * Some browsers need play() after assigning
       * srcObject.
       */
      const playLocalVideo = async () => {
        try {
          await myVideoRef.current?.play();
        } catch (error) {
          console.warn(
            'Local video autoplay blocked:',
            error
          );
        }
      };

      playLocalVideo();
    } else {
      myVideoRef.current.srcObject = null;
    }

    return () => {
      if (myVideoRef.current) {
        myVideoRef.current.srcObject = null;
      }
    };
  }, [stream]);

  /*
   * =========================================
   * PARTICIPANTS
   * =========================================
   *
   * This is only the participant list.
   *
   * Actual video streams come from useWebRTC().
   * =========================================
   */

  useEffect(() => {
    if (!socket || !roomId) {
      return;
    }

    const handleParticipants = (users) => {
      console.log(
        'Room participants:',
        users
      );

      setParticipants(
        Array.isArray(users)
          ? users
          : []
      );
    };

    socket.on(
      'room-participants',
      handleParticipants
    );

    return () => {
      socket.off(
        'room-participants',
        handleParticipants
      );
    };
  }, [socket, roomId]);

  /*
   * =========================================
   * SAVE CAMERA STATE
   * =========================================
   */

  useEffect(() => {
    try {
      localStorage.setItem(
        `meeting_camera_off_${roomId}`,
        String(isVideoOff)
      );
    } catch (error) {
      console.error(
        'Could not save camera state:',
        error
      );
    }
  }, [isVideoOff, roomId]);

  /*
   * =========================================
   * SAVE MICROPHONE STATE
   * =========================================
   */

  useEffect(() => {
    try {
      localStorage.setItem(
        `meeting_muted_${roomId}`,
        String(isMuted)
      );
    } catch (error) {
      console.error(
        'Could not save microphone state:',
        error
      );
    }
  }, [isMuted, roomId]);

  /*
   * =========================================
   * COPY PUBLIC MEETING LINK
   * =========================================
   */

  const handleCopyLink = async () => {
    /*
     * Always generate the deployed public URL.
     */
    const frontendUrl =
      'https://real-communication-codealpha-task.vercel.app';

    const meetingUrl =
      `${frontendUrl}/room/${roomId}`;

    console.log(
      'PUBLIC MEETING LINK:',
      meetingUrl
    );

    try {
      await navigator.clipboard.writeText(
        meetingUrl
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        'Clipboard API error:',
        error
      );

      /*
       * Fallback for older browsers.
       */
      try {
        const textArea =
          document.createElement('textarea');

        textArea.value = meetingUrl;

        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '0';
        textArea.style.opacity = '0';

        document.body.appendChild(
          textArea
        );

        textArea.focus();
        textArea.select();

        document.execCommand('copy');

        document.body.removeChild(
          textArea
        );

        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch (fallbackError) {
        console.error(
          'Clipboard fallback error:',
          fallbackError
        );
      }
    }
  };

  /*
   * =========================================
   * LEAVE MEETING
   * =========================================
   */

  const handleLeave = () => {
    /*
     * Stop local camera and microphone.
     */
    if (stream) {
      stream
        .getTracks()
        .forEach((track) => {
          track.stop();
        });
    }

    /*
     * Remove local video.
     */
    if (myVideoRef.current) {
      myVideoRef.current.srcObject = null;
    }

    /*
     * Tell backend that this user left.
     */
    if (socket) {
      socket.emit(
        'leave-room',
        roomId
      );
    }

    setStream(null);

    /*
     * Return to dashboard.
     */
    navigate('/dashboard');
  };

  /*
   * =========================================
   * ROOM NAME
   * =========================================
   */

  const roomName =
    location.state?.roomName ||
    `Meeting ${roomId}`;

  /*
   * =========================================
   * RENDER
   * =========================================
   */

  return (
    <div
      style={{
        height: '100dvh',
        width: '100vw',
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
        fontFamily:
          'system-ui, sans-serif',
      }}
    >

      {/* =====================================
          HEADER
          ===================================== */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          background: '#121212',
          borderBottom: '1px solid #222',
          flexShrink: 0,
          gap: '10px',
        }}
      >

        {/* ROOM INFO */}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            minWidth: 0,
          }}
        >

          <span
            style={{
              width: '8px',
              height: '8px',
              background: '#10b981',
              borderRadius: '50%',
              display: 'inline-block',
              flexShrink: 0,
            }}
          />

          <div
            style={{
              color: '#fff',
              fontWeight: '700',
              fontSize: '13px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {roomName}
          </div>

          <button
            onClick={handleCopyLink}
            style={{
              background: '#1f1f1f',
              color: copied
                ? '#10b981'
                : '#ff6600',
              border: '1px solid #333',
              padding: '5px 10px',
              borderRadius: '5px',
              fontSize: '11px',
              cursor: 'pointer',
              fontWeight: '700',
              whiteSpace: 'nowrap',
            }}
          >
            {copied
              ? '✓ Link Copied'
              : '📋 Invite'}
          </button>
        </div>

        {/* TABS */}

        <div
          style={{
            display: 'flex',
            gap: '5px',
            overflowX: 'auto',
          }}
        >

          <button
            onClick={() =>
              setActiveTab('video')
            }
            style={tabStyle(
              activeTab === 'video'
            )}
          >
            Video
          </button>

          <button
            onClick={() =>
              setActiveTab('whiteboard')
            }
            style={tabStyle(
              activeTab === 'whiteboard'
            )}
          >
            Whiteboard
          </button>

          <button
            onClick={() =>
              setActiveTab('screenshare')
            }
            style={tabStyle(
              activeTab === 'screenshare'
            )}
          >
            Share
          </button>

          <button
            onClick={() =>
              setShowChatMobile(
                (previous) => !previous
              )
            }
            style={tabStyle(
              showChatMobile
            )}
          >
            Chat
          </button>

        </div>
      </div>

      {/* =====================================
          BODY
          ===================================== */}

      <div
        style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
        }}
      >

        {/* MAIN */}

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >

          {/* CONTENT */}

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '8px',
              boxSizing: 'border-box',
            }}
          >

            {/* VIDEO */}

            {activeTab === 'video' && (
              <VideoGrid
                peers={peers}
                participants={participants}
                isVideoOff={isVideoOff}
                isMuted={isMuted}
                myVideoRef={myVideoRef}
                stream={stream}
              />
            )}

            {/* WHITEBOARD */}

            {activeTab === 'whiteboard' && (
              <Whiteboard
                socket={socket}
                roomId={roomId}
              />
            )}

            {/* SCREEN SHARE */}

            {activeTab === 'screenshare' && (
              <ScreenShare />
            )}

          </div>

          {/* CONTROLS */}

          <MeetingControls
            roomId={roomId}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
            isVideoOff={isVideoOff}
            setIsVideoOff={setIsVideoOff}
            stream={stream}
            setStream={setStream}
            myVideoRef={myVideoRef}
            onLeave={handleLeave}
          />

        </div>

        {/* =====================================
            CHAT
            ===================================== */}

        {showChatMobile && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: 'min(320px, 100%)',
              background: '#121212',
              borderLeft: '1px solid #222',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 20,
            }}
          >

            {/* CHAT HEADER */}

            <div
              style={{
                padding: '8px 12px',
                background: '#1a1a1a',
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems: 'center',
              }}
            >

              <span
                style={{
                  color: '#fff',
                  fontWeight: '700',
                }}
              >
                Room Chat
              </span>

              <button
                onClick={() =>
                  setShowChatMobile(false)
                }
                style={{
                  background: '#ff6600',
                  color: '#000',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '700',
                }}
              >
                Close
              </button>

            </div>

            {/* CHAT BODY */}

            <div
              style={{
                flex: 1,
                overflowY: 'auto',
              }}
            >
              <ChatPanel
                socket={socket}
                roomId={roomId}
              />
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

/*
 * =========================================
 * TAB STYLE
 * =========================================
 */

const tabStyle = (active) => ({
  background: active
    ? '#ff6600'
    : '#1a1a1a',

  color: active
    ? '#000'
    : '#fff',

  border: '1px solid #333',

  padding: '5px 9px',

  borderRadius: '5px',

  fontWeight: '700',

  cursor: 'pointer',

  fontSize: '11px',

  whiteSpace: 'nowrap',
});