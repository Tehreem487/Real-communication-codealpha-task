import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function MeetingControls({ isMuted, setIsMuted, isVideoOff, setIsVideoOff, stream, setStream, myVideoRef }) {
  const navigate = useNavigate();

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
    }
    setIsMuted(!isMuted);
  };

  const toggleVideo = async () => {
    if (!isVideoOff) {
      // Video off karni hai: Camera tracks ko mukammal stop kar do taake light off ho jaye
      if (stream) {
        stream.getVideoTracks().forEach(track => track.stop());
      }
      setIsVideoOff(true);
    } else {
      // Video on karni hai: Naya media stream request karo
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        
        // Audio mute state ko maintain rakhein
        newStream.getAudioTracks().forEach(track => {
          track.enabled = !isMuted;
        });

        if (setStream) setStream(newStream);
        if (myVideoRef && myVideoRef.current) {
          myVideoRef.current.srcObject = newStream;
        }
        setIsVideoOff(false);
      } catch (err) {
        console.error("Error restarting video:", err);
      }
    }
  };

  const leaveRoom = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    navigate('/dashboard');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', padding: '15px', background: '#121212', borderTop: '1px solid #222' }}>
      <button 
        onClick={toggleMute}
        style={{ background: isMuted ? '#ef4444' : '#222', color: '#fff', border: '1px solid #333', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}
      >
        {isMuted ? 'Unmute' : 'Mute'}
      </button>

      <button 
        onClick={toggleVideo}
        style={{ background: isVideoOff ? '#ef4444' : '#222', color: '#fff', border: '1px solid #333', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}
      >
        {isVideoOff ? 'Start Video' : 'Stop Video'}
      </button>

      <button 
        onClick={leaveRoom}
        style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '10px 25px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}
      >
        Leave Room
      </button>
    </div>
  );
}