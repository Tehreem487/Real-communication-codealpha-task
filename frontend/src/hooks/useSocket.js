import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5000';

export function useSocket() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!SOCKET_URL) {
      console.error('Socket URL is missing.');
      return;
    }

    console.log(
      'Connecting Socket.IO:',
      SOCKET_URL
    );

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log(
        'Socket connected:',
        newSocket.id
      );
    });

    newSocket.on('disconnect', (reason) => {
      console.log(
        'Socket disconnected:',
        reason
      );
    });

    newSocket.on('connect_error', (error) => {
      console.error(
        'Socket connection error:',
        error.message
      );
    });

    setSocket(newSocket);

    return () => {
      newSocket.removeAllListeners();
      newSocket.disconnect();
      setSocket(null);
    };
  }, []);

  return socket;
}

export default useSocket;