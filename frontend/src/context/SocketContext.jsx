import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { io } from 'socket.io-client';

const SocketContext = createContext(null);

const SOCKET_SERVER_URL =
  import.meta.env.VITE_SOCKET_URL ||
  'https://real-communication-codealpha-task-production.up.railway.app';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketInstance = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log(
        '🔌 Connected to Railway Socket Server:',
        socketInstance.id
      );
    });

    socketInstance.on('connect_error', (error) => {
      console.error(
        '❌ Socket connection error:',
        error.message
      );
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });

    setSocket(socketInstance);

    return () => {
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
  return useContext(SocketContext);
};