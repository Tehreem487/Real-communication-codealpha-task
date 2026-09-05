import React, {
  useEffect,
  useRef,
} from 'react';

export default function VideoPlayer({
  stream = null,
  videoRef: externalRef = null,
  muted = false,
  label = 'Participant',
  isVideoOff = false,
  isMuted = false,
}) {
  const internalRef = useRef(null);

  const videoRef =
    externalRef || internalRef;

  /*
  |--------------------------------------------------------------------------
  | ATTACH STREAM
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (!stream) {
      video.srcObject = null;
      return;
    }

    /*
     * Don't unnecessarily replace the stream.
     */
    if (video.srcObject !== stream) {
      video.srcObject = stream;
    }

    /*
     * Mobile browsers ke liye.
     */
    video
      .play()
      .catch(() => {
        /*
         * Browser autoplay restriction.
         * User interaction ke baad video play ho sakti hai.
         */
      });

    return () => {
      /*
       * IMPORTANT:
       * Remote/local stream ke tracks yahan stop nahi karne.
       * Stream ka owner MeetingRoom/useWebRTC hai.
       */
    };
  }, [stream, videoRef]);

  /*
  |--------------------------------------------------------------------------
  | CLEAN VIDEO ELEMENT
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [videoRef]);

  return (
    <div
      style={{
        position: 'relative',
        background: '#151515',
        border: '1px solid #292929',
        borderRadius: '10px',
        overflow: 'hidden',
        minHeight: '220px',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* ==============================
          VIDEO
      ============================== */}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        controls={false}
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

      {/* ==============================
          CAMERA OFF
      ============================== */}

      {isVideoOff && (
        <div
          style={{
            minHeight: '220px',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#101010',
            color: '#9ca3af',
            fontSize: '14px',
            gap: '8px',
          }}
        >
          <div
            style={{
              width: '55px',
              height: '55px',
              borderRadius: '50%',
              background: '#242424',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
            }}
          >
            📷
          </div>

          <span>
            Camera Off
          </span>
        </div>
      )}

      {/* ==============================
          NO STREAM
      ============================== */}

      {!stream &&
        !isVideoOff &&
        !externalRef && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              minHeight: '220px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b7280',
              fontSize: '13px',
              background: '#080808',
            }}
          >
            Connecting...
          </div>
        )}

      {/* ==============================
          LABEL
      ============================== */}

      <div
        style={{
          position: 'absolute',
          left: '10px',
          bottom: '10px',
          background: 'rgba(0, 0, 0, 0.75)',
          color: '#fff',
          padding: '5px 9px',
          borderRadius: '5px',
          fontSize: '12px',
          fontWeight: '600',
          zIndex: 3,
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