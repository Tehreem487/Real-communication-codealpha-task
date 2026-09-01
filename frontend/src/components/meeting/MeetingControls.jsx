import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function MeetingControls({
  isMuted,
  setIsMuted,
  isVideoOff,
  setIsVideoOff,
  stream,
  setStream,
  myVideoRef,
  onLeave,
}) {
  const navigate =
    useNavigate();


  const toggleMute = () => {
    if (stream) {
      stream
        .getAudioTracks()
        .forEach(
          (track) => {
            track.enabled =
              isMuted;
          }
        );
    }

    setIsMuted(
      !isMuted
    );
  };


  const toggleVideo =
    async () => {

      if (!isVideoOff) {

        if (stream) {
          stream
            .getVideoTracks()
            .forEach(
              (track) =>
                track.stop()
            );
        }

        setIsVideoOff(
          true
        );

        return;
      }


      try {

        const newStream =
          await navigator.mediaDevices.getUserMedia(
            {
              video: true,
              audio: true,
            }
          );


        newStream
          .getAudioTracks()
          .forEach(
            (track) => {
              track.enabled =
                !isMuted;
            }
          );


        if (setStream) {
          setStream(
            newStream
          );
        }


        if (
          myVideoRef?.current
        ) {
          myVideoRef.current.srcObject =
            newStream;
        }


        setIsVideoOff(
          false
        );

      } catch (error) {

        console.error(
          'Unable to restart camera:',
          error
        );

      }
    };


  const leaveRoom = () => {

    if (stream) {
      stream
        .getTracks()
        .forEach(
          (track) =>
            track.stop()
        );
    }

    if (onLeave) {
      onLeave();
    } else {
      navigate(
        '/dashboard'
      );
    }
  };


  return (
    <div
      style={{
        display: 'flex',
        justifyContent:
          'center',
        alignItems:
          'center',
        gap: '15px',
        padding:
          '15px',
        background:
          '#121212',
        borderTop:
          '1px solid #222',
        flexShrink: 0,
      }}
    >

      <button
        onClick={
          toggleMute
        }
        style={{
          background:
            isMuted
              ? '#ef4444'
              : '#222',
          color: '#fff',
          border:
            '1px solid #333',
          padding:
            '10px 20px',
          borderRadius:
            '10px',
          cursor:
            'pointer',
          fontWeight:
            '600',
        }}
      >
        {isMuted
          ? 'Unmute'
          : 'Mute'}
      </button>


      <button
        onClick={
          toggleVideo
        }
        style={{
          background:
            isVideoOff
              ? '#ef4444'
              : '#222',
          color: '#fff',
          border:
            '1px solid #333',
          padding:
            '10px 20px',
          borderRadius:
            '10px',
          cursor:
            'pointer',
          fontWeight:
            '600',
        }}
      >
        {isVideoOff
          ? 'Start Video'
          : 'Stop Video'}
      </button>


      <button
        onClick={
          leaveRoom
        }
        style={{
          background:
            '#ef4444',
          color: '#fff',
          border: 'none',
          padding:
            '10px 25px',
          borderRadius:
            '10px',
          cursor:
            'pointer',
          fontWeight:
            '700',
        }}
      >
        Leave Room
      </button>

    </div>
  );
}