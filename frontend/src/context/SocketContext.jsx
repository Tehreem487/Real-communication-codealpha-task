import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

// Vite environment variable se Socket.IO server URL lo
// Local:  http://localhost:5000
// Live:   https://real-communication-codealpha-task-production.up.railway.app
const SOCKET_SERVER_URL =
  import.meta.env.VITE_SOCKET_URL ||
  'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    console.log('🔌 Connecting to Socket.IO:', SOCKET_SERVER_URL);

    const socketInstance = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    // Successfully connected
    socketInstance.on('connect', () => {
      console.log('🟢 Socket.IO Connected');
      console.log('🆔 Socket ID:', socketInstance.id);
      console.log('🌐 Server:', SOCKET_SERVER_URL);
    });

    // Connection error
    socketInstance.on('connect_error', (error) => {
      console.error('🔴 Socket.IO Connection Error:', error.message);
    });

    // Disconnected
    socketInstance.on('disconnect', (reason) => {
      console.log('🟡 Socket.IO Disconnected:', reason);
    });

    // Reconnecting
    socketInstance.io.on('reconnect_attempt', (attempt) => {
      console.log(`🔄 Reconnecting... Attempt ${attempt}`);
    });

    socketInstance.io.on('reconnect', (attempt) => {
      console.log(`🟢 Reconnected after ${attempt} attempt(s)`);
    });

    setSocket(socketInstance);

    // Cleanup
    return () => {
      console.log('🔌 Closing Socket.IO connection...');
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const socket = useContext(SocketContext);

  return socket;
};