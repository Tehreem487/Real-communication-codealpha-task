import React from 'react';
import VideoPlayer from './VideoPlayer';

export default function VideoGrid({ participants = [], isVideoOff, isMuted }) {
  // localStorage se logged-in user ka data read karein (jo auth/login ke waqt save hota hai)
  const storedUser = JSON.parse(localStorage.getItem('userInfo') || localStorage.getItem('user') || '{}');
  const currentUserName = storedUser.name || 'User';

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
      {/* Dynamic Name jo user login hoga uska real name show hoga */}
      <VideoPlayer 
        name={`${currentUserName} (You)`} 
        isLocal={true} 
        isVideoOff={isVideoOff} 
        isMuted={isMuted} 
      />
      
      {/* Room ke baaki participants */}
      {participants.map((p, idx) => (
        <VideoPlayer key={idx} name={p.name} isLocal={false} />
      ))}
    </div>
  );
}