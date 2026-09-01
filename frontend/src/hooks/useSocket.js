import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_API_URL;

export function useSocket() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!SOCKET_URL) {
      console.error(
        'VITE_API_URL is missing.'
      );
      return;
    }

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      console.log(
        'Socket connected:',
        newSocket.id
      );
    });

    newSocket.on('connect_error', (error) => {
      console.error(
        'Socket connection error:',
        error
      );
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return socket;
}

export default useSocket;