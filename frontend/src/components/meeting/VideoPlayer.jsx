import React, {
  useEffect,
  useRef,
} from 'react';

export default function VideoPlayer({
  stream,
  videoRef: externalRef,
  muted = false,
  label = 'Participant',
  isVideoOff = false,
  isMuted = false,
}) {
  const internalRef = useRef(null);

  const videoRef =
    externalRef || internalRef;

  useEffect(() => {
    if (!videoRef.current) return;

    if (stream) {
      videoRef.current.srcObject =
        stream;
    }
  }, [stream, videoRef]);

  return (
    <div
      style={{
        position: 'relative',
        background: '#151515',
        border:
          '1px solid #292929',
        borderRadius: '10px',
        overflow: 'hidden',
        minHeight: '220px',
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '220px',
          objectFit: 'cover',
          display:
            isVideoOff
              ? 'none'
              : 'block',
          background: '#080808',
        }}
      />

      {isVideoOff && (
        <div
          style={{
            minHeight: '220px',
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              'center',
            background: '#101010',
            color: '#9ca3af',
            fontSize: '14px',
          }}
        >
          Camera Off
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          left: '10px',
          bottom: '10px',
          background:
            'rgba(0,0,0,0.7)',
          color: '#fff',
          padding:
            '5px 9px',
          borderRadius: '5px',
          fontSize: '12px',
          fontWeight: '600',
        }}
      >
        {label}

        {isMuted && (
          <span
            style={{
              marginLeft: '6px',
              color: '#ef4444',
            }}
          >
            🔇
          </span>
        )}
      </div>
    </div>
  );
}