import { useState, useEffect, useCallback } from 'react';

export const useMediaStream = () => {
  const [localStream, setLocalStream] = useState(null);
  const [error, setError] = useState(null);

  const startStream = useCallback(async (constraints = { video: true, audio: true }) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError(err.message);
      return null;
    }
  }, []);

  const stopStream = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
  }, [localStream]);

  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [localStream]);

  return { localStream, startStream, stopStream, error };
};