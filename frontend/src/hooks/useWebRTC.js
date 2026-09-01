import { useEffect, useRef, useState } from 'react';
import { useSocket } from './useSocket';

export function useWebRTC(roomId, localStream) {
  const socket = useSocket();

  const [peers, setPeers] = useState([]);

  const peerConnections = useRef({});
  const localStreamRef = useRef(null);

  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  useEffect(() => {
    if (!socket || !roomId) return;

    const createPeerConnection = (userId, createOffer = false) => {
      if (peerConnections.current[userId]) {
        return peerConnections.current[userId];
      }

      const pc = new RTCPeerConnection({
        iceServers: [
          {
            urls: 'stun:stun.l.google.com:19302',
          },
          {
            urls: 'stun:stun1.l.google.com:19302',
          },
        ],
      });

      peerConnections.current[userId] = pc;

      const stream = localStreamRef.current;

      if (stream) {
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });
      }

      pc.ontrack = (event) => {
        const remoteStream = event.streams[0];

        if (!remoteStream) return;

        setPeers((current) => {
          const existing = current.find(
            (peer) => peer.id === userId
          );

          if (existing) {
            return current.map((peer) =>
              peer.id === userId
                ? {
                    ...peer,
                    stream: remoteStream,
                  }
                : peer
            );
          }

          return [
            ...current,
            {
              id: userId,
              stream: remoteStream,
            },
          ];
        });
      };

      pc.onicecandidate = (event) => {
        if (!event.candidate) return;

        socket.emit('webrtc-ice-candidate', {
          to: userId,
          candidate: event.candidate,
          roomId,
        });
      };

      if (createOffer) {
        pc.createOffer()
          .then((offer) => pc.setLocalDescription(offer))
          .then(() => {
            socket.emit('webrtc-offer', {
              to: userId,
              offer: pc.localDescription,
              roomId,
            });
          })
          .catch((error) => {
            console.error('Create offer error:', error);
          });
      }

      return pc;
    };

    const handleRoomUsers = (users) => {
      const safeUsers = Array.isArray(users)
        ? users
        : [];

      safeUsers.forEach((userId) => {
        if (userId !== socket.id) {
          createPeerConnection(userId, true);
        }
      });
    };

    const handleUserJoined = (userId) => {
      if (!userId || userId === socket.id) return;

      createPeerConnection(userId, false);
    };

    const handleOffer = async ({
      from,
      offer,
    }) => {
      if (!from || !offer) return;

      const pc = createPeerConnection(from, false);

      try {
        await pc.setRemoteDescription(
          new RTCSessionDescription(offer)
        );

        const answer = await pc.createAnswer();

        await pc.setLocalDescription(answer);

        socket.emit('webrtc-answer', {
          to: from,
          answer,
          roomId,
        });
      } catch (error) {
        console.error('Offer handling error:', error);
      }
    };

    const handleAnswer = async ({
      from,
      answer,
    }) => {
      const pc = peerConnections.current[from];

      if (!pc || !answer) return;

      try {
        await pc.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      } catch (error) {
        console.error('Answer handling error:', error);
      }
    };

    const handleIceCandidate = async ({
      from,
      candidate,
    }) => {
      const pc = peerConnections.current[from];

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
      const pc = peerConnections.current[userId];

      if (pc) {
        pc.close();
        delete peerConnections.current[userId];
      }

      setPeers((current) =>
        current.filter(
          (peer) => peer.id !== userId
        )
      );
    };

    socket.on(
      'room-users',
      handleRoomUsers
    );

    socket.on(
      'user-joined',
      handleUserJoined
    );

    socket.on(
      'webrtc-offer',
      handleOffer
    );

    socket.on(
      'webrtc-answer',
      handleAnswer
    );

    socket.on(
      'webrtc-ice-candidate',
      handleIceCandidate
    );

    socket.on(
      'user-left',
      handleUserLeft
    );

    socket.emit('join-room', roomId);

    return () => {
      socket.off(
        'room-users',
        handleRoomUsers
      );

      socket.off(
        'user-joined',
        handleUserJoined
      );

      socket.off(
        'webrtc-offer',
        handleOffer
      );

      socket.off(
        'webrtc-answer',
        handleAnswer
      );

      socket.off(
        'webrtc-ice-candidate',
        handleIceCandidate
      );

      socket.off(
        'user-left',
        handleUserLeft
      );

      Object.values(
        peerConnections.current
      ).forEach((pc) => {
        try {
          pc.close();
        } catch (error) {
          console.error(error);
        }
      });

      peerConnections.current = {};
      setPeers([]);
    };
  }, [socket, roomId]);

  return {
    peers: Array.isArray(peers) ? peers : [],
  };
}

export default useWebRTC;