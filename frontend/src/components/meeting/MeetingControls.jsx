import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function MeetingControls({ isMuted, setIsMuted, isVideoOff, setIsVideoOff }) {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', padding: '15px', background: '#121212', borderTop: '1px solid #222' }}>
      <button 
        onClick={() => setIsMuted(!isMuted)}
        style={{ background: isMuted ? '#ef4444' : '#222', color: '#fff', border: '1px solid #333', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}
      >
        {isMuted ? 'Unmute' : 'Mute'}
      </button>

      <button 
        onClick={() => setIsVideoOff(!isVideoOff)}
        style={{ background: isVideoOff ? '#ef4444' : '#222', color: '#fff', border: '1px solid #333', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}
      >
        {isVideoOff ? 'Start Video' : 'Stop Video'}
      </button>

      <button 
        onClick={() => navigate('/dashboard')}
        style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '10px 25px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}
      >
        Leave Room
      </button>
    </div>
  );
}