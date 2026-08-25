import React from 'react';
import VideoPlayer from './VideoPlayer';

export default function VideoGrid({ participants = [], isVideoOff, isMuted }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', width: '100%', height: '100%', padding: '20px', boxSizing: 'border-box' }}>
      <VideoPlayer name="Tehreem (You)" isLocal={true} isVideoOff={isVideoOff} isMuted={isMuted} />
      {participants.map((p, idx) => (
        <VideoPlayer key={idx} name={p.name} isLocal={false} />
      ))}
    </div>
  );
}