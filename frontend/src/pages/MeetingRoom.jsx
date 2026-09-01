import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  useLocation,
  useParams,
  useNavigate,
} from 'react-router-dom';

import { useSocket } from '../hooks/useSocket';
import { useWebRTC } from '../hooks/useWebRTC';

import VideoGrid from '../components/meeting/VideoGrid';
import MeetingControls from '../components/meeting/MeetingControls';

import ChatPanel from '../components/chat/ChatPanel';
import Whiteboard from '../components/whiteboard/Whiteboard';
import { ScreenShare } from '../components/screenShare/ScreenShare';

import {
  copyMeetingLink,
} from '../utils/helpers';

export default function MeetingRoom() {
  const { roomId } = useParams();

  const location =
    useLocation();

  const navigate =
    useNavigate();

  const socket =
    useSocket();


  /* =========================
     TAB
  ========================= */

  const [
    activeTab,
    setActiveTab,
  ] = useState(
    location.state?.defaultTab ||
    'video'
  );


  /* =========================
     MEDIA
  ========================= */

  const [
    isMuted,
    setIsMuted,
  ] = useState(false);

  const [
    isVideoOff,
    setIsVideoOff,
  ] = useState(false);

  const [
    stream,
    setStream,
  ] = useState(null);

  const myVideoRef =
    useRef(null);


  /* =========================
     CHAT
  ========================= */

  const [
    showChatMobile,
    setShowChatMobile,
  ] = useState(false);


  /* =========================
     COPY
  ========================= */

  const [
    copied,
    setCopied,
  ] = useState(false);


  /* =========================
     PARTICIPANTS
  ========================= */

  const [
    participants,
    setParticipants,
  ] = useState([]);


  /* =========================
     WEBRTC
  ========================= */

  const {
    peers = [],
  } = useWebRTC(
    roomId,
    stream
  );


  /* =========================
     CAMERA REF
  ========================= */

  useEffect(() => {
    if (
      myVideoRef.current &&
      stream
    ) {
      myVideoRef.current.srcObject =
        stream;
    }
  }, [stream]);


  /* =========================
     START CAMERA
  ========================= */

  useEffect(() => {
    let mounted = true;

    const startMedia =
      async () => {
        try {
          const userStream =
            await navigator.mediaDevices.getUserMedia(
              {
                video: true,
                audio: true,
              }
            );

          if (!mounted) {
            userStream
              .getTracks()
              .forEach((track) =>
                track.stop()
              );

            return;
          }

          setStream(userStream);

        } catch (error) {
          console.error(
            'Camera/microphone error:',
            error
          );
        }
      };

    startMedia();

    return () => {
      mounted = false;
    };
  }, []);


  /* =========================
     SOCKET ROOM
  ========================= */

  useEffect(() => {
    if (
      !socket ||
      !roomId
    ) {
      return;
    }

    const userId =
      localStorage.getItem(
        'userId'
      ) ||
      crypto.randomUUID();


    localStorage.setItem(
      'userId',
      userId
    );


    socket.emit(
      'join-room',
      roomId,
      userId
    );


    const handleParticipants =
      (users) => {
        setParticipants(
          users || []
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

      socket.emit(
        'leave-room',
        {
          roomId,
          userId,
        }
      );
    };

  }, [
    socket,
    roomId,
  ]);


  /* =========================
     COPY LINK
  ========================= */

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


  /* =========================
     LEAVE
  ========================= */

  const handleLeave =
    () => {

      if (stream) {
        stream
          .getTracks()
          .forEach(
            (track) =>
              track.stop()
          );
      }

      setStream(null);

      navigate(
        '/dashboard',
        {
          replace: true,
        }
      );
    };


  const roomName =
    location.state?.roomName ||
    `Meeting ${roomId}`;


  return (

    <div
      style={{
        height: '100dvh',
        width: '100vw',
        background:
          '#0a0a0a',
        display: 'flex',
        flexDirection:
          'column',
        overflow: 'hidden',
        position: 'fixed',
        inset: 0,
        fontFamily:
          'system-ui, sans-serif',
      }}
    >

      {/* =========================
          HEADER
      ========================= */}

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
          gap: '10px',
        }}
      >

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
              color:
                copied
                  ? '#10b981'
                  : '#ff6600',
              border:
                '1px solid #333',
              padding:
                '5px 10px',
              borderRadius:
                '5px',
              cursor:
                'pointer',
              fontWeight:
                '700',
              fontSize:
                '11px',
            }}
          >
            {copied
              ? '✓ Link Copied'
              : '📋 Invite'}
          </button>

        </div>


        <div
          style={{
            display:
              'flex',
            gap: '5px',
            flexWrap:
              'wrap',
            justifyContent:
              'flex-end',
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
                (prev) =>
                  !prev
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


      {/* =========================
          BODY
      ========================= */}

      <div
        style={{
          display: 'flex',
          flex: 1,
          overflow:
            'hidden',
          position:
            'relative',
        }}
      >

        <div
          style={{
            flex: 1,
            display:
              'flex',
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
              padding:
                '8px',
            }}
          >

            {/* VIDEO */}

            {activeTab ===
              'video' && (

              <VideoGrid
                peers={
                  peers
                }
                participants={
                  participants
                }
                isVideoOff={
                  isVideoOff
                }
                isMuted={
                  isMuted
                }
                stream={
                  stream
                }
                myVideoRef={
                  myVideoRef
                }
              />

            )}


            {/* WHITEBOARD */}

            {activeTab ===
              'whiteboard' && (

              <Whiteboard
                socket={
                  socket
                }
                roomId={
                  roomId
                }
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
            isMuted={
              isMuted
            }
            setIsMuted={
              setIsMuted
            }
            isVideoOff={
              isVideoOff
            }
            setIsVideoOff={
              setIsVideoOff
            }
            stream={
              stream
            }
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


        {/* =========================
            CHAT
        ========================= */}

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
              display:
                'flex',
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
                  color:
                    '#000',
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
                socket={
                  socket
                }
                roomId={
                  roomId
                }
              />

            </div>

          </div>

        )}

      </div>

    </div>
  );
}


/* =========================
   TAB STYLE
========================= */

const tabStyle = (
  active
) => ({
  background:
    active
      ? '#ff6600'
      : '#1a1a1a',

  color:
    active
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
});