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
    ? peers
    : [];

  const safeParticipants =
    Array.isArray(participants)
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
      }}
    >
      {/* LOCAL VIDEO */}

      <VideoPlayer
        stream={null}
        videoRef={myVideoRef}
        muted={true}
        label="You"
        isVideoOff={isVideoOff}
        isMuted={isMuted}
      />

      {/* REMOTE VIDEOS */}

      {safePeers.map(
        (peer, index) => (
          <VideoPlayer
            key={
              peer?.id ||
              peer?.socketId ||
              index
            }
            stream={
              peer?.stream || null
            }
            label={
              peer?.name ||
              `Participant ${
                index + 1
              }`
            }
            muted={false}
          />
        )
      )}

      {/* Empty state */}

      {safePeers.length === 0 && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform:
              'translate(-50%, -50%)',
            color: '#6b7280',
            textAlign: 'center',
            pointerEvents: 'none',
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

          <div>
            Waiting for other
            participants...
          </div>
        </div>
      )}
    </div>
  );
}