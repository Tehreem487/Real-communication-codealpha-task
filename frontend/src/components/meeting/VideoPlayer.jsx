import React, { useState, useEffect, useRef } from 'react';

export default function VideoPlayer({ name, isLocal, isVideoOff, isMuted }) {
  const videoRef = useRef(null);
  const [hasStream, setHasStream] = useState(false);

  useEffect(() => {
    let currentStream = null;

    if (isLocal && !isVideoOff) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          currentStream = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setHasStream(true);
          }
        })
        .catch((err) => {
          console.error("Camera permission error: ", err);
          setHasStream(false);
        });
    } else {
      // Agar video off hai ya local nahi hai, toh purana stream track completely stop kar do
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setHasStream(false);
    }

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [isLocal, isVideoOff]);

  return (
    <div style={{ background: '#141414', border: '1px solid #262626', borderRadius: '14px', overflow: 'hidden', position: 'relative', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* Real Video Element or Fallback Avatar */}
      {isLocal && !isVideoOff ? (
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted={true} 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover', 
            transform: 'scaleX(-1)',
            display: hasStream ? 'block' : 'none' 
          }} 
        />
      ) : null}

      {/* Fallback Avatar jab tak stream load na ho ya video off ho */}
      {(!isLocal || isVideoOff || !hasStream) && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#141414' }}>
          <div style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, #ff6600, #cc5200)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '700', color: '#000' }}>
            {name ? name.charAt(0) : 'T'}
          </div>
        </div>
      )}

      {/* Name Tag */}
      <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(0,0,0,0.7)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', color: '#fff', border: '1px solid #333', zIndex: 2 }}>
        {name} {isLocal && '(Host)'} {isVideoOff && '(Camera Off)'}
      </div>
    </div>
  );
}