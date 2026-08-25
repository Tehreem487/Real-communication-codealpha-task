import React, { createContext, useContext, useState } from 'react';

const MeetingContext = createContext(null);

export const MeetingProvider = ({ children }) => {
  const [activeRoom, setActiveRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  return (
    <MeetingContext.Provider value={{ activeRoom, setActiveRoom, participants, setParticipants, isMuted, setIsMuted, isVideoOff, setIsVideoOff }}>
      {children}
    </MeetingContext.Provider>
  );
};

export const useMeeting = () => useContext(MeetingContext);