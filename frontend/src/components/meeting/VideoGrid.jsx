import React from 'react';
import VideoPlayer from './VideoPlayer';

export default function VideoGrid({ participants = [], isVideoOff, isMuted }) {
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
      gap: '12px', 
      width: '100%', 
      minHeight: '100%', 
      padding: '10px', 
      boxSizing: 'border-box',
      alignContent: 'start'
    }}>
      <VideoPlayer name="Tehreem (You)" isLocal={true} isVideoOff={isVideoOff} isMuted={isMuted} />
      {participants.map((p, idx) => (
        <VideoPlayer key={idx} name={p.name} isLocal={false} />
      ))}
    </div>
  );
}