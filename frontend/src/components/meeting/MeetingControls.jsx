```jsx
import React from 'react';

export default function MeetingControls({
  isMuted,
  setIsMuted,
  isVideoOff,
  setIsVideoOff,
  stream,
  setStream,
  myVideoRef,
}) {

  /*
   * -----------------------------------------
   * TOGGLE MICROPHONE
   * -----------------------------------------
   */

  const toggleMute = () => {
    const newMutedState =
      !isMuted;

    if (stream) {
      stream
        .getAudioTracks()
        .forEach((track) => {
          track.enabled =
            !newMutedState;
        });
    }

    setIsMuted(
      newMutedState
    );
  };

  /*
   * -----------------------------------------
   * TOGGLE CAMERA
   * -----------------------------------------
   */

  const toggleVideo = () => {
    const newVideoOffState =
      !isVideoOff;

    if (stream) {
      stream
        .getVideoTracks()
        .forEach((track) => {
          track.enabled =
            !newVideoOffState;
        });
    }

    /*
     * Keep video element in sync.
     */
    if (myVideoRef?.current) {
      myVideoRef.current.style.opacity =
        newVideoOffState
          ? '0'
          : '1';
    }

    setIsVideoOff(
      newVideoOffState
    );
  };

  /*
   * -----------------------------------------
   * LEAVE / STOP MEDIA
   * -----------------------------------------
   */

  const stopMedia = () => {
    if (stream) {
      stream
        .getTracks()
        .forEach((track) => {
          track.stop();
        });

      setStream(null);
    }

    if (myVideoRef?.current) {
      myVideoRef.current.srcObject =
        null;
    }
  };

  return (
    <div
      style={{
        minHeight: '64px',
        background: '#121212',
        borderTop:
          '1px solid #222',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding:
          '8px 12px',
        flexShrink: 0,
      }}
    >

      {/* MICROPHONE */}

      <button
        onClick={toggleMute}
        title={
          isMuted
            ? 'Turn microphone on'
            : 'Mute microphone'
        }
        style={{
          width: '42px',
          height: '42px',
          borderRadius:
            '50%',
          border:
            '1px solid #333',
          background:
            isMuted
              ? '#ef4444'
              : '#1f1f1f',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '18px',
        }}
      >
        {isMuted
          ? '🔇'
          : '🎙️'}
      </button>

      {/* CAMERA */}

      <button
        onClick={toggleVideo}
        title={
          isVideoOff
            ? 'Turn camera on'
            : 'Turn camera off'
        }
        style={{
          width: '42px',
          height: '42px',
          borderRadius:
            '50%',
          border:
            '1px solid #333',
          background:
            isVideoOff
              ? '#ef4444'
              : '#1f1f1f',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '18px',
        }}
      >
        {isVideoOff
          ? '📹'
          : '📷'}
      </button>

      {/* CAMERA STATUS */}

      <span
        style={{
          color:
            isVideoOff
              ? '#ef4444'
              : '#9ca3af',
          fontSize:
            '12px',
          fontWeight:
            '600',
          minWidth:
            '75px',
        }}
      >
        {isVideoOff
          ? 'Camera Off'
          : 'Camera On'}
      </span>

    </div>
  );
}
```
