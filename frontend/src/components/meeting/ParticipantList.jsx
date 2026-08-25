import React from 'react';

export const ParticipantList = ({ participants = [] }) => {
  return (
    <div className="participant-list-container">
      <div className="sidebar-header">
        <h3>Participants ({participants.length + 1})</h3>
      </div>
      <div className="participants-scroll">
        <div className="participant-item">
          <div className="mini-avatar">T</div>
          <span>Tehreem (Host)</span>
        </div>
        {participants.map((p, idx) => (
          <div key={idx} className="participant-item">
            <div className="mini-avatar">{p.name ? p.name[0] : 'U'}</div>
            <span>{p.name || 'Participant'}</span>
          </div>
        ))}
      </div>
    </div>
  );
};