import { useEffect, useRef, useState } from 'react';
import { useSocket } from './useSocket';
import { SOCKET_EVENTS } from '../utils/constants';

const servers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export const useWebRTC = (roomId, localStream) => {
  const { socket } = useSocket();
  const [peers, setPeers] = useState({});
  const peersRef = useRef({});

  useEffect(() => {
    if (!socket || !localStream) return;

    // Handle incoming peer connection offers, answers, and ICE candidates
    socket.on(SOCKET_EVENTS.USER_JOINED, async ({ userId }) => {
      const peerConnection = createPeerConnection(userId, socket);
      peersRef.current[userId] = peerConnection;

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      socket.emit(SOCKET_EVENTS.WEBRTC_OFFER, { target: userId, offer });
    });

    socket.on(SOCKET_EVENTS.WEBRTC_OFFER, async ({ from, offer }) => {
      const peerConnection = createPeerConnection(from, socket);
      peersRef.current[from] = peerConnection;

      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      socket.emit(SOCKET_EVENTS.WEBRTC_ANSWER, { target: from, answer });
    });

    socket.on(SOCKET_EVENTS.WEBRTC_ANSWER, async ({ from, answer }) => {
      const peerConnection = peersRef.current[from];
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on(SOCKET_EVENTS.WEBRTC_ICE_CANDIDATE, async ({ from, candidate }) => {
      const peerConnection = peersRef.current[from];
      if (peerConnection) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    socket.on(SOCKET_EVENTS.USER_LEFT, ({ userId }) => {
      if (peersRef.current[userId]) {
        peersRef.current[userId].close();
        delete peersRef.current[userId];
        setPeers((prev) => {
          const newPeers = { ...prev };
          delete newPeers[userId];
          return newPeers;
        });
      }
    });

    return () => {
      socket.off(SOCKET_EVENTS.USER_JOINED);
      socket.off(SOCKET_EVENTS.WEBRTC_OFFER);
      socket.off(SOCKET_EVENTS.WEBRTC_ANSWER);
      socket.off(SOCKET_EVENTS.WEBRTC_ICE_CANDIDATE);
      socket.off(SOCKET_EVENTS.USER_LEFT);
    };
  }, [socket, localStream]);

  const createPeerConnection = (userId, socketInstance) => {
    const pc = new RTCPeerConnection(servers);

    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketInstance.emit(SOCKET_EVENTS.WEBRTC_ICE_CANDIDATE, {
          target: userId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      setPeers((prev) => ({
        ...prev,
        [userId]: event.streams[0],
      }));
    };

    return pc;
  };

  return { peers };
};