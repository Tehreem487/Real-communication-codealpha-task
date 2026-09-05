import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  'https://real-communication-codealpha-task-production.up.railway.app';

export function useSocket() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      withCredentials: true,

      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,

      autoConnect: true,
    });

    newSocket.on('connect', () => {
      console.log(
        '✅ Connected to Railway Socket:',
        newSocket.id
      );
    });

    newSocket.on(
      'connect_error',
      (error) => {
        console.error(
          '❌ Socket connection error:',
          error.message
        );
      }
    );

    newSocket.on(
      'disconnect',
      (reason) => {
        console.log(
          '🔌 Socket disconnected:',
          reason
        );
      }
    );

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return socket;
}

export default useSocket;