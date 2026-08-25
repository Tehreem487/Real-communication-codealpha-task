import React, { createContext, useContext, useEffect, useState } from 'react';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Simulated Socket Connection or replace with io('http://localhost:5000')
    const mockSocket = {
      on: (event, cb) => {},
      emit: (event, data) => {},
      disconnect: () => {}
    };
    setSocket(mockSocket);
    return () => mockSocket.disconnect();
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);