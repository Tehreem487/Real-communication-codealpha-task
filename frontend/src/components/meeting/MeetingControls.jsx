import React, {
  useEffect,
  useState,
} from 'react';

export default function MeetingControls({
  isMuted,
  setIsMuted,
  isVideoOff,
  setIsVideoOff,
  stream,
  setStream,
  myVideoRef,
  onLeave,
  roomId,
}) {
  const [isScreenSharing, setIsScreenSharing] =
    useState(false);

  /*
   * -----------------------------------------
   * AUDIO TRACK
   * -----------------------------------------
   */

  useEffect(() => {
    if (!stream) return;

    stream
      .getAudioTracks()
      .forEach((track) => {
        track.enabled = !isMuted;
      });
  }, [stream, isMuted]);

  /*
   * -----------------------------------------
   * VIDEO TRACK
   * -----------------------------------------
   */

  useEffect(() => {
    if (!stream) return;

    stream
      .getVideoTracks()
      .forEach((track) => {
        track.enabled = !isVideoOff;
      });
  }, [stream, isVideoOff]);

  /*
   * -----------------------------------------
   * SAVE CAMERA STATE
   * -----------------------------------------
   */

  useEffect(() => {
    if (!roomId) return;

    localStorage.setItem(
      `meeting_camera_off_${roomId}`,
      String(isVideoOff)
    );
  }, [isVideoOff, roomId]);

  /*
   * -----------------------------------------
   * SAVE MIC STATE
   * -----------------------------------------
   */

  useEffect(() => {
    if (!roomId) return;

    localStorage.setItem(
      `meeting_muted_${roomId}`,
      String(isMuted)
    );
  }, [isMuted, roomId]);

  /*
   * -----------------------------------------
   * MUTE
   * -----------------------------------------
   */

  const handleMute = () => {
    setIsMuted(
      (previous) => !previous
    );
  };

  /*
   * -----------------------------------------
   * CAMERA
   * -----------------------------------------
   */

  const handleVideo = async () => {
    /*
     * TURN CAMERA OFF
     */

    if (!isVideoOff) {
      if (stream) {
        stream
          .getVideoTracks()
          .forEach((track) => {
            track.enabled = false;
          });
      }

      setIsVideoOff(true);
      return;
    }

    /*
     * TURN CAMERA ON
     */

    try {
      let currentStream = stream;

      /*
       * If stream doesn't have video,
       * request camera now.
       */

      if (
        !currentStream ||
        currentStream.getVideoTracks()
          .length === 0
      ) {
        const cameraStream =
          await navigator.mediaDevices.getUserMedia(
            {
              video: true,
            }
          );

        const cameraTrack =
          cameraStream.getVideoTracks()[0];

        if (!cameraTrack) {
          return;
        }

        if (!currentStream) {
          currentStream =
            new MediaStream();

          setStream(currentStream);
        }

        currentStream.addTrack(
          cameraTrack
        );

        if (myVideoRef?.current) {
          myVideoRef.current.srcObject =
            currentStream;
        }
      } else {
        currentStream
          .getVideoTracks()
          .forEach((track) => {
            track.enabled = true;
          });
      }

      setIsVideoOff(false);
    } catch (error) {
      console.error(
        'Camera start error:',
        error
      );

      alert(
        'Camera access is required to turn the camera on.'
      );
    }
  };

  /*
   * -----------------------------------------
   * SCREEN SHARE
   * -----------------------------------------
   */

  const handleScreenShare =
    async () => {
      try {
        /*
         * STOP SCREEN SHARE
         */

        if (isScreenSharing) {
          const cameraStream =
            await navigator.mediaDevices.getUserMedia(
              {
                video: true,
              }
            );

          const newVideoTrack =
            cameraStream.getVideoTracks()[0];

          if (!newVideoTrack) return;

          if (stream) {
            const oldVideoTracks =
              stream.getVideoTracks();

            oldVideoTracks.forEach(
              (track) => {
                track.stop();

                stream.removeTrack(
                  track
                );
              }
            );

            stream.addTrack(
              newVideoTrack
            );

            if (myVideoRef?.current) {
              myVideoRef.current.srcObject =
                stream;
            }
          }

          setIsScreenSharing(false);
          setIsVideoOff(false);

          return;
        }

        /*
         * START SCREEN SHARE
         */

        if (
          !navigator.mediaDevices
            ?.getDisplayMedia
        ) {
          alert(
            'Screen sharing is not supported in this browser.'
          );
          return;
        }

        const screenStream =
          await navigator.mediaDevices.getDisplayMedia(
            {
              video: true,
              audio: false,
            }
          );

        const screenTrack =
          screenStream.getVideoTracks()[0];

        if (!screenTrack) return;

        if (stream) {
          const oldVideoTrack =
            stream.getVideoTracks()[0];

          if (oldVideoTrack) {
            oldVideoTrack.stop();

            stream.removeTrack(
              oldVideoTrack
            );
          }

          stream.addTrack(
            screenTrack
          );

          if (myVideoRef?.current) {
            myVideoRef.current.srcObject =
              stream;
          }
        }

        setIsScreenSharing(true);
        setIsVideoOff(false);

        /*
         * Browser STOP SHARE
         */

        screenTrack.onended =
          async () => {
            try {
              const cameraStream =
                await navigator.mediaDevices.getUserMedia(
                  {
                    video: true,
                  }
                );

              const cameraTrack =
                cameraStream.getVideoTracks()[0];

              if (
                stream &&
                cameraTrack
              ) {
                const currentVideoTrack =
                  stream.getVideoTracks()[0];

                if (
                  currentVideoTrack
                ) {
                  currentVideoTrack.stop();

                  stream.removeTrack(
                    currentVideoTrack
                  );
                }

                stream.addTrack(
                  cameraTrack
                );

                if (
                  myVideoRef?.current
                ) {
                  myVideoRef.current.srcObject =
                    stream;
                }
              }

              setIsScreenSharing(
                false
              );

              setIsVideoOff(
                false
              );
            } catch (error) {
              console.error(
                'Camera restore error:',
                error
              );

              setIsScreenSharing(
                false
              );

              setIsVideoOff(true);
            }
          };
      } catch (error) {
        console.error(
          'Screen sharing error:',
          error
        );

        /*
         * User cancelled share.
         */
        if (
          error?.name ===
          'NotAllowedError'
        ) {
          return;
        }
      }
    };

  /*
   * -----------------------------------------
   * LEAVE
   * -----------------------------------------
   */

  const handleLeave = () => {
    if (stream) {
      stream
        .getTracks()
        .forEach((track) => {
          track.stop();
        });
    }

    if (myVideoRef?.current) {
      myVideoRef.current.srcObject =
        null;
    }

    if (setStream) {
      setStream(null);
    }

    if (onLeave) {
      onLeave();
    }
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '64px',
        background: '#121212',
        borderTop:
          '1px solid #252525',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 15px',
        boxSizing: 'border-box',
        flexShrink: 0,
      }}
    >

      {/* MICROPHONE */}

      <button
        type="button"
        onClick={handleMute}
        title={
          isMuted
            ? 'Turn microphone on'
            : 'Mute microphone'
        }
        style={controlButtonStyle(
          isMuted,
          '#ef4444'
        )}
      >
        {isMuted
          ? '🔇'
          : '🎤'}

        <span className="control-label">
          {isMuted
            ? 'Unmute'
            : 'Mute'}
        </span>
      </button>

      {/* CAMERA */}

      <button
        type="button"
        onClick={handleVideo}
        title={
          isVideoOff
            ? 'Turn camera on'
            : 'Turn camera off'
        }
        style={controlButtonStyle(
          isVideoOff,
          '#ef4444'
        )}
      >
        {isVideoOff
          ? '📷'
          : '🎥'}

        <span className="control-label">
          {isVideoOff
            ? 'Camera On'
            : 'Camera Off'}
        </span>
      </button>

      {/* SCREEN SHARE */}

      <button
        type="button"
        onClick={
          handleScreenShare
        }
        title={
          isScreenSharing
            ? 'Stop sharing'
            : 'Share screen'
        }
        style={controlButtonStyle(
          isScreenSharing,
          '#ff6600'
        )}
      >
        🖥️

        <span className="control-label">
          {isScreenSharing
            ? 'Stop Share'
            : 'Share'}
        </span>
      </button>

      {/* LEAVE */}

      <button
        type="button"
        onClick={handleLeave}
        title="Leave meeting"
        style={{
          background: '#dc2626',
          color: '#fff',
          border: 'none',
          padding: '9px 15px',
          borderRadius: '7px',
          fontSize: '12px',
          fontWeight: '700',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}
      >
        📞

        <span className="control-label">
          Leave
        </span>
      </button>

      <style>
        {`
          .control-label {
            display: inline;
          }

          @media (max-width: 600px) {
            .control-label {
              display: none;
            }
          }
        `}
      </style>
    </div>
  );
}

/*
 * -----------------------------------------
 * BUTTON STYLE
 * -----------------------------------------
 */

const controlButtonStyle = (
  active,
  activeColor
) => ({
  background: active
    ? 'rgba(239, 68, 68, 0.15)'
    : '#1f1f1f',

  color: active
    ? activeColor
    : '#fff',

  border: `1px solid ${
    active
      ? 'rgba(239, 68, 68, 0.35)'
      : '#333'
  }`,

  padding: '9px 13px',

  borderRadius: '7px',

  fontSize: '12px',

  fontWeight: '700',

  cursor: 'pointer',

  display: 'flex',

  alignItems: 'center',

  justifyContent: 'center',

  gap: '6px',

  minWidth: '42px',

  transition:
    'all 0.2s ease',
});