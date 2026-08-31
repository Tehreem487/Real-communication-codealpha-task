import React, { useEffect, useRef } from 'react';

const RemoteVideo = ({ stream, name }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div
      style={{
        position: 'relative',
        background: '#181818',
        borderRadius: '12px',
        overflow: 'hidden',
        minHeight: '220px',
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{
          width: '100%',
          height: '100%',
          minHeight: '220px',
          objectFit: 'cover',
          display: 'block',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: '12px',
          bottom: '10px',
          background: 'rgba(0,0,0,.65)',
          color: '#fff',
          padding: '5px 9px',
          borderRadius: '6px',
          fontSize: '13px',
        }}
      >
        {name || 'Participant'}
      </div>
    </div>
  );
};

export default function VideoGrid({
  participants = [],
  peers = {},
  isVideoOff,
  isMuted,
  myVideoRef,
}) {
  const storedUser = JSON.parse(
    localStorage.getItem('userInfo') ||
      localStorage.getItem('user') ||
      '{}'
  );

  const currentUserName =
    storedUser.name ||
    storedUser.username ||
    'You';

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '12px',
        width: '100%',
        padding: '10px',
        boxSizing: 'border-box',
      }}
    >
      {/* Local Video */}
      <div
        style={{
          position: 'relative',
          background: '#181818',
          borderRadius: '12px',
          overflow: 'hidden',
          minHeight: '220px',
        }}
      >
        {isVideoOff ? (
          <div
            style={{
              height: '220px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '50px',
            }}
          >
            👤
          </div>
        ) : (
          <video
            ref={myVideoRef}
            autoPlay
            muted
            playsInline
            style={{
              width: '100%',
              height: '100%',
              minHeight: '220px',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        )}

        <div
          style={{
            position: 'absolute',
            left: '12px',
            bottom: '10px',
            background: 'rgba(0,0,0,.65)',
            color: '#fff',
            padding: '5px 9px',
            borderRadius: '6px',
            fontSize: '13px',
          }}
        >
          {currentUserName} (You)
          {isMuted ? ' 🔇' : ''}
        </div>
      </div>

      {/* Remote Participants */}
      {Object.entries(peers).map(
        ([userId, stream]) => (
          <RemoteVideo
            key={userId}
            stream={stream}
            name={
              participants.find(
                (p) => p.userId === userId
              )?.name || 'Participant'
            }
          />
        )
      )}
    </div>
  );
}