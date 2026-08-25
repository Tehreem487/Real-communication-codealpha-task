import React, { useState, useEffect, useRef } from 'react';

export const ScreenShare = () => {
  const [screenStream, setScreenStream] = useState(null);
  const screenVideoRef = useRef(null);

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      setScreenStream(stream);
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = stream;
      }

      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
    } catch (err) {
      console.error('Error sharing screen:', err);
    }
  };

  const stopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
    }
  };

  useEffect(() => {
    if (screenStream && screenVideoRef.current) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  useEffect(() => {
    return () => {
      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [screenStream]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', background: '#121212', borderRadius: '12px', border: '1px solid #222', padding: '20px', boxSizing: 'border-box' }}>
      {screenStream ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', width: '100%', height: '100%' }}>
          <video 
            ref={screenVideoRef} 
            autoPlay 
            playsInline 
            style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', background: '#000', borderRadius: '8px', border: '1px solid #333' }} 
          />
          <button 
            onClick={stopScreenShare} 
            style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}
          >
            Stop Sharing
          </button>
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>💻</div>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: '#ff6600' }}>Share your screen with participants</h3>
          <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: '#888' }}>Click below to broadcast your display window or tab.</p>
          <button 
            onClick={startScreenShare} 
            style={{ background: '#ff6600', color: '#000', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            Start Screen Share
          </button>
        </div>
      )}
    </div>
  );
};