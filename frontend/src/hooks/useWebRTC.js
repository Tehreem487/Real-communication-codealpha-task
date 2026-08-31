import { useEffect, useRef, useState } from 'react';
import { useSocket } from './useSocket';
import { SOCKET_EVENTS } from '../utils/constants';

const ICE_SERVERS = {
  iceServers: [
    {
      urls: 'stun:stun.l.google.com:19302',
    },
    {
      urls: 'stun:stun1.l.google.com:19302',
    },
  ],
};

export const useWebRTC = (roomId, localStream) => {
  const socket = useSocket();

  const [peers, setPeers] = useState({});

  const peerConnections = useRef({});
  const localStreamRef = useRef(localStream);

  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  useEffect(() => {
    if (!socket || !roomId) return;

    const createPeerConnection = (remoteUserId) => {
      if (peerConnections.current[remoteUserId]) {
        return peerConnections.current[remoteUserId];
      }

      const pc = new RTCPeerConnection(ICE_SERVERS);

      if (localStreamRef.current) {
        localStreamRef.current
          .getTracks()
          .forEach((track) => {
            pc.addTrack(
              track,
              localStreamRef.current
            );
          });
      }

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit(
            SOCKET_EVENTS.WEBRTC_ICE_CANDIDATE,
            {
              target: remoteUserId,
              candidate: event.candidate,
            }
          );
        }
      };

      pc.ontrack = (event) => {
        const remoteStream = event.streams[0];

        if (!remoteStream) return;

        setPeers((prev) => ({
          ...prev,
          [remoteUserId]: remoteStream,
        }));
      };

      pc.onconnectionstatechange = () => {
        if (
          pc.connectionState === 'failed' ||
          pc.connectionState === 'closed' ||
          pc.connectionState === 'disconnected'
        ) {
          pc.close();

          delete peerConnections.current[
            remoteUserId
          ];

          setPeers((prev) => {
            const updated = { ...prev };
            delete updated[remoteUserId];
            return updated;
          });
        }
      };

      peerConnections.current[remoteUserId] = pc;

      return pc;
    };

    const handleRoomUsers = async (users) => {
      for (const userId of users) {
        const pc = createPeerConnection(userId);

        const offer = await pc.createOffer();

        await pc.setLocalDescription(offer);

        socket.emit(
          SOCKET_EVENTS.WEBRTC_OFFER,
          {
            target: userId,
            offer,
          }
        );
      }
    };

    const handleUserJoined = () => {
      // Existing users will receive the room user list.
    };

    const handleOffer = async ({
      from,
      offer,
    }) => {
      const pc = createPeerConnection(from);

      await pc.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      const answer = await pc.createAnswer();

      await pc.setLocalDescription(answer);

      socket.emit(
        SOCKET_EVENTS.WEBRTC_ANSWER,
        {
          target: from,
          answer,
        }
      );
    };

    const handleAnswer = async ({
      from,
      answer,
    }) => {
      const pc =
        peerConnections.current[from];

      if (!pc) return;

      await pc.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    };

    const handleIceCandidate = async ({
      from,
      candidate,
    }) => {
      const pc =
        peerConnections.current[from];

      if (!pc || !candidate) return;

      try {
        await pc.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch (error) {
        console.error(
          'ICE candidate error:',
          error
        );
      }
    };

    const handleUserLeft = (userId) => {
      const pc =
        peerConnections.current[userId];

      if (pc) {
        pc.close();
      }

      delete peerConnections.current[userId];

      setPeers((prev) => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    };

    socket.on(
      SOCKET_EVENTS.ROOM_USERS,
      handleRoomUsers
    );

    socket.on(
      SOCKET_EVENTS.USER_JOINED,
      handleUserJoined
    );

    socket.on(
      SOCKET_EVENTS.WEBRTC_OFFER,
      handleOffer
    );

    socket.on(
      SOCKET_EVENTS.WEBRTC_ANSWER,
      handleAnswer
    );

    socket.on(
      SOCKET_EVENTS.WEBRTC_ICE_CANDIDATE,
      handleIceCandidate
    );

    socket.on(
      SOCKET_EVENTS.USER_LEFT,
      handleUserLeft
    );

    socket.emit(
      SOCKET_EVENTS.JOIN_ROOM,
      {
        roomId,
      }
    );

    return () => {
      socket.off(
        SOCKET_EVENTS.ROOM_USERS,
        handleRoomUsers
      );

      socket.off(
        SOCKET_EVENTS.USER_JOINED,
        handleUserJoined
      );

      socket.off(
        SOCKET_EVENTS.WEBRTC_OFFER,
        handleOffer
      );

      socket.off(
        SOCKET_EVENTS.WEBRTC_ANSWER,
        handleAnswer
      );

      socket.off(
        SOCKET_EVENTS.WEBRTC_ICE_CANDIDATE,
        handleIceCandidate
      );

      socket.off(
        SOCKET_EVENTS.USER_LEFT,
        handleUserLeft
      );

      Object.values(
        peerConnections.current
      ).forEach((pc) => pc.close());

      peerConnections.current = {};

      socket.emit(
        SOCKET_EVENTS.USER_LEFT,
        socket.id
      );
    };
  }, [socket, roomId]);

  return {
    peers,
  };
};