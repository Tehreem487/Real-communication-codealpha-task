import React from 'react';
import VideoPlayer from './VideoPlayer';

export default function VideoGrid({
  peers = [],
  participants = [],
  isVideoOff = false,
  isMuted = false,
  myVideoRef,
}) {
  const safePeers = Array.isArray(peers)
    ? peers.filter(Boolean)
    : [];

  const safeParticipants = Array.isArray(participants)
    ? participants
    : [];

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minHeight: '300px',
        display: 'grid',
        gridTemplateColumns:
          'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '10px',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      {/* ==============================
          LOCAL VIDEO
      ============================== */}

      <VideoPlayer
        stream={null}
        videoRef={myVideoRef}
        muted={true}
        label="You"
        isVideoOff={isVideoOff}
        isMuted={isMuted}
      />

      {/* ==============================
          REMOTE VIDEOS
      ============================== */}

      {safePeers.map((peer, index) => {
        const peerId =
          peer?.id ||
          peer?.socketId ||
          `peer-${index}`;

        const participant = safeParticipants.find(
          (item) =>
            item?.socketId === peerId ||
            item?.id === peerId
        );

        return (
          <VideoPlayer
            key={peerId}
            stream={peer?.stream || null}
            label={
              peer?.name ||
              participant?.name ||
              `Participant ${index + 1}`
            }
            muted={false}
            isVideoOff={false}
            isMuted={false}
          />
        );
      })}

      {/* ==============================
          WAITING MESSAGE
      ============================== */}

      {safePeers.length === 0 && (
        <div
          style={{
            position: 'fixed',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#6b7280',
            textAlign: 'center',
            pointerEvents: 'none',
            zIndex: 2,
            width: '220px',
          }}
        >
          <div
            style={{
              fontSize: '30px',
              marginBottom: '8px',
            }}
          >
            🎥
          </div>

          <div
            style={{
              fontSize: '14px',
              lineHeight: '1.5',
            }}
          >
            Waiting for other
            participants...
          </div>
        </div>
      )}
    </div>
  );
}