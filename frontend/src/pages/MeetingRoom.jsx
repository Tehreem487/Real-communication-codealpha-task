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
import { useWebRTC } from '../hooks/useWebRTC';

import VideoGrid from '../components/meeting/VideoGrid';
import MeetingControls from '../components/meeting/MeetingControls';
import ChatPanel from '../components/chat/ChatPanel';
import Whiteboard from '../components/whiteboard/Whiteboard';
import { ScreenShare } from '../components/screenShare/ScreenShare';

import { copyMeetingLink } from '../utils/helpers';

export default function MeetingRoom() {
  const {
    roomId: urlRoomId,
  } = useParams();

  const location = useLocation();
  const navigate = useNavigate();

  const socket = useSocket();

  /*
   * -----------------------------------------
   * ROOM ID
   * -----------------------------------------
   */

  const roomId =
    urlRoomId ||
    location.state?.roomId ||
    `room-${Date.now()}`;

  /*
   * -----------------------------------------
   * SAVED CAMERA / MIC STATE
   * -----------------------------------------
   */

  const getSavedBoolean = (
    key,
    fallback = false
  ) => {
    try {
      const value =
        localStorage.getItem(key);

      if (value === null) {
        return fallback;
      }

      return value === 'true';
    } catch {
      return fallback;
    }
  };

  const [isMuted, setIsMuted] =
    useState(() =>
      getSavedBoolean(
        `meeting_muted_${roomId}`,
        false
      )
    );

  const [isVideoOff, setIsVideoOff] =
    useState(() =>
      getSavedBoolean(
        `meeting_camera_off_${roomId}`,
        false
      )
    );

  /*
   * -----------------------------------------
   * UI STATE
   * -----------------------------------------
   */

  const [activeTab, setActiveTab] =
    useState(
      location.state?.defaultTab ||
        'video'
    );

  const [stream, setStream] =
    useState(null);

  const [copied, setCopied] =
    useState(false);

  const [showChatMobile, setShowChatMobile] =
    useState(false);

  const [participants, setParticipants] =
    useState([]);

  const myVideoRef = useRef(null);

  /*
   * -----------------------------------------
   * WEBRTC
   * -----------------------------------------
   */

  const {
    peers,
  } = useWebRTC(
    roomId,
    stream
  );

  /*
   * -----------------------------------------
   * START MEDIA
   * -----------------------------------------
   */

  useEffect(() => {
    let mounted = true;

    const startMedia =
      async () => {
        try {
          /*
           * IMPORTANT:
           * If camera was OFF before refresh,
           * DO NOT request camera.
           */

          const constraints = {
            audio: true,
            video: !isVideoOff,
          };

          const userStream =
            await navigator.mediaDevices.getUserMedia(
              constraints
            );

          if (!mounted) {
            userStream
              .getTracks()
              .forEach((track) =>
                track.stop()
              );

            return;
          }

          /*
           * Apply saved mute state
           */

          userStream
            .getAudioTracks()
            .forEach((track) => {
              track.enabled =
                !isMuted;
            });

          /*
           * Apply camera state
           */

          userStream
            .getVideoTracks()
            .forEach((track) => {
              track.enabled =
                !isVideoOff;
            });

          setStream(userStream);

          if (myVideoRef.current) {
            myVideoRef.current.srcObject =
              userStream;
          }
        } catch (error) {
          console.error(
            'Media permission error:',
            error
          );

          /*
           * If user blocked camera,
           * try microphone only.
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
                .forEach(
                  (track) => {
                    track.enabled =
                      !isMuted;
                  }
                );

              setIsVideoOff(true);

              localStorage.setItem(
                `meeting_camera_off_${roomId}`,
                'true'
              );

              setStream(
                audioOnlyStream
              );
            } catch (
              audioError
            ) {
              console.error(
                'Microphone error:',
                audioError
              );

              setStream(null);
            }
          }
        }
      };

    startMedia();

    return () => {
      mounted = false;
    };

    /*
     * We intentionally start media once
     * when room opens.
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  /*
   * -----------------------------------------
   * ATTACH VIDEO
   * -----------------------------------------
   */

  useEffect(() => {
    if (
      stream &&
      myVideoRef.current
    ) {
      myVideoRef.current.srcObject =
        stream;
    }
  }, [stream]);

  /*
   * -----------------------------------------
   * PARTICIPANTS
   * -----------------------------------------
   */

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleParticipants =
      (users) => {
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
   * -----------------------------------------
   * SAVE CAMERA STATE
   * -----------------------------------------
   */

  useEffect(() => {
    localStorage.setItem(
      `meeting_camera_off_${roomId}`,
      String(isVideoOff)
    );
  }, [
    isVideoOff,
    roomId,
  ]);

  /*
   * -----------------------------------------
   * SAVE MIC STATE
   * -----------------------------------------
   */

  useEffect(() => {
    localStorage.setItem(
      `meeting_muted_${roomId}`,
      String(isMuted)
    );
  }, [
    isMuted,
    roomId,
  ]);

  /*
   * -----------------------------------------
   * COPY ROOM LINK
   * -----------------------------------------
   */

  const handleCopyLink =
    async () => {
      const success =
        await copyMeetingLink(
          roomId
        );

      if (success) {
        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 2000);
      }
    };

  /*
   * -----------------------------------------
   * LEAVE
   * -----------------------------------------
   */

  const handleLeave = () => {
    /*
     * Stop local media
     */

    if (stream) {
      stream
        .getTracks()
        .forEach((track) => {
          track.stop();
        });
    }

    if (myVideoRef.current) {
      myVideoRef.current.srcObject =
        null;
    }

    setStream(null);

    /*
     * Notify server
     */

    if (socket) {
      socket.emit(
        'leave-room',
        roomId
      );
    }

    /*
     * Go dashboard
     */

    navigate('/dashboard');
  };

  /*
   * -----------------------------------------
   * ROOM NAME
   * -----------------------------------------
   */

  const roomName =
    location.state?.roomName ||
    `Meeting ${roomId}`;

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

      {/* HEADER */}

      <div
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'center',
          padding:
            '8px 12px',
          background:
            '#121212',
          borderBottom:
            '1px solid #222',
          flexShrink: 0,
          gap: '10px',
        }}
      >

        {/* ROOM INFO */}

        <div
          style={{
            display: 'flex',
            alignItems:
              'center',
            gap: '10px',
            minWidth: 0,
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              background:
                '#10b981',
              borderRadius:
                '50%',
              display:
                'inline-block',
              flexShrink: 0,
            }}
          />

          <div
            style={{
              color: '#fff',
              fontWeight: '700',
              fontSize: '13px',
              overflow:
                'hidden',
              textOverflow:
                'ellipsis',
              whiteSpace:
                'nowrap',
            }}
          >
            {roomName}
          </div>

          <button
            onClick={
              handleCopyLink
            }
            style={{
              background:
                '#1f1f1f',
              color: copied
                ? '#10b981'
                : '#ff6600',
              border:
                '1px solid #333',
              padding:
                '5px 10px',
              borderRadius:
                '5px',
              fontSize:
                '11px',
              cursor:
                'pointer',
              fontWeight:
                '700',
              whiteSpace:
                'nowrap',
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
            overflowX:
              'auto',
          }}
        >
          <button
            onClick={() =>
              setActiveTab(
                'video'
              )
            }
            style={tabStyle(
              activeTab ===
                'video'
            )}
          >
            Video
          </button>

          <button
            onClick={() =>
              setActiveTab(
                'whiteboard'
              )
            }
            style={tabStyle(
              activeTab ===
                'whiteboard'
            )}
          >
            Whiteboard
          </button>

          <button
            onClick={() =>
              setActiveTab(
                'screenshare'
              )
            }
            style={tabStyle(
              activeTab ===
                'screenshare'
            )}
          >
            Share
          </button>

          <button
            onClick={() =>
              setShowChatMobile(
                (previous) =>
                  !previous
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

      {/* BODY */}

      <div
        style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
          position:
            'relative',
        }}
      >

        {/* MAIN */}

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection:
              'column',
            overflow:
              'hidden',
          }}
        >

          <div
            style={{
              flex: 1,
              overflowY:
                'auto',
              padding: '8px',
              boxSizing:
                'border-box',
            }}
          >

            {/* VIDEO */}

            {activeTab ===
              'video' && (
              <VideoGrid
                peers={peers}
                participants={
                  participants
                }
                isVideoOff={
                  isVideoOff
                }
                isMuted={
                  isMuted
                }
                myVideoRef={
                  myVideoRef
                }
                stream={
                  stream
                }
              />
            )}

            {/* WHITEBOARD */}

            {activeTab ===
              'whiteboard' && (
              <Whiteboard
                socket={socket}
                roomId={roomId}
              />
            )}

            {/* SCREEN SHARE */}

            {activeTab ===
              'screenshare' && (
              <ScreenShare />
            )}

          </div>

          {/* CONTROLS */}

          <MeetingControls
            roomId={roomId}
            isMuted={isMuted}
            setIsMuted={
              setIsMuted
            }
            isVideoOff={
              isVideoOff
            }
            setIsVideoOff={
              setIsVideoOff
            }
            stream={stream}
            setStream={
              setStream
            }
            myVideoRef={
              myVideoRef
            }
            onLeave={
              handleLeave
            }
          />

        </div>

        {/* CHAT */}

        {showChatMobile && (
          <div
            style={{
              position:
                'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width:
                'min(320px, 100%)',
              background:
                '#121212',
              borderLeft:
                '1px solid #222',
              display: 'flex',
              flexDirection:
                'column',
              zIndex: 20,
            }}
          >

            <div
              style={{
                padding:
                  '8px 12px',
                background:
                  '#1a1a1a',
                display:
                  'flex',
                justifyContent:
                  'space-between',
                alignItems:
                  'center',
              }}
            >

              <span
                style={{
                  color: '#fff',
                  fontWeight:
                    '700',
                }}
              >
                Room Chat
              </span>

              <button
                onClick={() =>
                  setShowChatMobile(
                    false
                  )
                }
                style={{
                  background:
                    '#ff6600',
                  color: '#000',
                  border:
                    'none',
                  padding:
                    '4px 10px',
                  borderRadius:
                    '4px',
                  cursor:
                    'pointer',
                  fontWeight:
                    '700',
                }}
              >
                Close
              </button>

            </div>

            <div
              style={{
                flex: 1,
                overflowY:
                  'auto',
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
 * -----------------------------------------
 * TAB STYLE
 * -----------------------------------------
 */

const tabStyle = (
  active
) => ({
  background: active
    ? '#ff6600'
    : '#1a1a1a',

  color: active
    ? '#000'
    : '#fff',

  border:
    '1px solid #333',

  padding:
    '5px 9px',

  borderRadius:
    '5px',

  fontWeight:
    '700',

  cursor:
    'pointer',

  fontSize:
    '11px',

  whiteSpace:
    'nowrap',
});