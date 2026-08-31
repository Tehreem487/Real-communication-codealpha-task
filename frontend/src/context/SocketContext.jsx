import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { io } from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log(
        '🟢 Socket connected:',
        socketInstance.id
      );
    });

    socketInstance.on('connect_error', (error) => {
      console.error(
        '🔴 Socket connection error:',
        error.message
      );
    });

    socketInstance.on('disconnect', (reason) => {
      console.log(
        '🟡 Socket disconnected:',
        reason
      );
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