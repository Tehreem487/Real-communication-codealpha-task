import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useSocket } from './useSocket';

export function useWebRTC(roomId, localStream) {
  const socket = useSocket();

  const [peers, setPeers] = useState([]);

  const peerConnections = useRef({});
  const localStreamRef = useRef(null);

  /*
   * Keep latest local stream available
   */
  useEffect(() => {
    localStreamRef.current = localStream;

    if (!localStream) return;

    /*
     * Add newly available tracks
     * to existing peer connections.
     */
    Object.values(
      peerConnections.current
    ).forEach((pc) => {
      const senders = pc.getSenders();

      localStream.getTracks().forEach((track) => {
        const alreadyAdded = senders.some(
          (sender) =>
            sender.track?.id === track.id
        );

        if (!alreadyAdded) {
          try {
            pc.addTrack(
              track,
              localStream
            );
          } catch (error) {
            console.error(
              'Adding track error:',
              error
            );
          }
        }
      });
    });
  }, [localStream]);

  /*
   * Remove peer safely
   */
  const removePeer = useCallback(
    (userId) => {
      const pc =
        peerConnections.current[userId];

      if (pc) {
        try {
          pc.close();
        } catch (error) {
          console.error(error);
        }
      }

      delete peerConnections.current[userId];

      setPeers((current) =>
        Array.isArray(current)
          ? current.filter(
              (peer) => peer.id !== userId
            )
          : []
      );
    },
    []
  );

  useEffect(() => {
    if (!socket || !roomId) return;

    /*
     * Create PeerConnection
     */
    const createPeerConnection = (
      userId,
      createOffer = false
    ) => {
      if (!userId) return null;

      if (
        peerConnections.current[userId]
      ) {
        return peerConnections.current[
          userId
        ];
      }

      const pc =
        new RTCPeerConnection({
          iceServers: [
            {
              urls:
                'stun:stun.l.google.com:19302',
            },
            {
              urls:
                'stun:stun1.l.google.com:19302',
            },
          ],
        });

      peerConnections.current[userId] =
        pc;

      /*
       * Add current local tracks
       */
      const currentStream =
        localStreamRef.current;

      if (currentStream) {
        currentStream
          .getTracks()
          .forEach((track) => {
            try {
              pc.addTrack(
                track,
                currentStream
              );
            } catch (error) {
              console.error(
                'addTrack error:',
                error
              );
            }
          });
      }

      /*
       * Remote track
       */
      pc.ontrack = (event) => {
        const remoteStream =
          event.streams?.[0];

        if (!remoteStream) return;

        setPeers((current) => {
          const safeCurrent =
            Array.isArray(current)
              ? current
              : [];

          const existing =
            safeCurrent.find(
              (peer) =>
                peer.id === userId
            );

          if (existing) {
            return safeCurrent.map(
              (peer) =>
                peer.id === userId
                  ? {
                      ...peer,
                      stream:
                        remoteStream,
                    }
                  : peer
            );
          }

          return [
            ...safeCurrent,
            {
              id: userId,
              stream: remoteStream,
            },
          ];
        });
      };

      /*
       * ICE candidate
       */
      pc.onicecandidate = (event) => {
        if (!event.candidate) return;

        socket.emit(
          'webrtc-ice-candidate',
          {
            to: userId,
            candidate:
              event.candidate,
            roomId,
          }
        );
      };

      /*
       * Connection state
       */
      pc.onconnectionstatechange =
        () => {
          const state =
            pc.connectionState;

          console.log(
            `Peer ${userId} connection:`,
            state
          );

          if (
            state === 'failed' ||
            state === 'closed' ||
            state === 'disconnected'
          ) {
            removePeer(userId);
          }
        };

      /*
       * Create offer
       */
      if (createOffer) {
        pc.createOffer()
          .then((offer) =>
            pc.setLocalDescription(
              offer
            )
          )
          .then(() => {
            socket.emit(
              'webrtc-offer',
              {
                to: userId,
                offer:
                  pc.localDescription,
                roomId,
              }
            );
          })
          .catch((error) => {
            console.error(
              'Create offer error:',
              error
            );
          });
      }

      return pc;
    };

    /*
     * Existing users in room
     */
    const handleRoomUsers = (users) => {
      const safeUsers =
        Array.isArray(users)
          ? users
          : [];

      console.log(
        'Room users:',
        safeUsers
      );

      safeUsers.forEach((userId) => {
        if (
          userId &&
          userId !== socket.id
        ) {
          createPeerConnection(
            userId,
            true
          );
        }
      });
    };

    /*
     * New user joined
     */
    const handleUserJoined = (
      userId
    ) => {
      if (
        !userId ||
        userId === socket.id
      ) {
        return;
      }

      console.log(
        'User joined:',
        userId
      );

      createPeerConnection(
        userId,
        false
      );
    };

    /*
     * Offer
     */
    const handleOffer = async ({
      from,
      offer,
    }) => {
      if (!from || !offer) return;

      const pc =
        createPeerConnection(
          from,
          false
        );

      if (!pc) return;

      try {
        await pc.setRemoteDescription(
          new RTCSessionDescription(
            offer
          )
        );

        const answer =
          await pc.createAnswer();

        await pc.setLocalDescription(
          answer
        );

        socket.emit(
          'webrtc-answer',
          {
            to: from,
            answer,
            roomId,
          }
        );
      } catch (error) {
        console.error(
          'Offer handling error:',
          error
        );
      }
    };

    /*
     * Answer
     */
    const handleAnswer = async ({
      from,
      answer,
    }) => {
      if (!from || !answer) return;

      const pc =
        peerConnections.current[
          from
        ];

      if (!pc) return;

      try {
        await pc.setRemoteDescription(
          new RTCSessionDescription(
            answer
          )
        );
      } catch (error) {
        console.error(
          'Answer handling error:',
          error
        );
      }
    };

    /*
     * ICE
     */
    const handleIceCandidate =
      async ({
        from,
        candidate,
      }) => {
        if (!from || !candidate)
          return;

        const pc =
          peerConnections.current[
            from
          ];

        if (!pc) return;

        try {
          await pc.addIceCandidate(
            new RTCIceCandidate(
              candidate
            )
          );
        } catch (error) {
          console.error(
            'ICE candidate error:',
            error
          );
        }
      };

    /*
     * User left
     */
    const handleUserLeft = (
      userId
    ) => {
      console.log(
        'User left:',
        userId
      );

      removePeer(userId);
    };

    /*
     * Socket listeners
     */
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

    /*
     * Join room
     */
    socket.emit(
      'join-room',
      roomId
    );

    /*
     * Cleanup
     */
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
  }, [
    socket,
    roomId,
    removePeer,
  ]);

  return {
    peers: Array.isArray(peers)
      ? peers
      : [],
  };
}

export default useWebRTC;