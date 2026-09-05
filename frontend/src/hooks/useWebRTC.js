import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

export function useWebRTC(
  roomId,
  localStream,
  socket
) {
  const [peers, setPeers] = useState([]);

  const peerConnections = useRef({});
  const localStreamRef = useRef(null);
  const pendingCandidates = useRef({});

  /*
   * Keep latest local stream
   */
  useEffect(() => {
    localStreamRef.current = localStream;

    if (!localStream) return;

    Object.values(peerConnections.current).forEach(
      (pc) => {
        const senders = pc.getSenders();

        localStream.getTracks().forEach((track) => {
          const exists = senders.some(
            (sender) =>
              sender.track &&
              sender.track.kind === track.kind
          );

          if (!exists) {
            try {
              pc.addTrack(track, localStream);
            } catch (error) {
              console.error(
                'Adding local track error:',
                error
              );
            }
          }
        });
      }
    );
  }, [localStream]);

  /*
   * Remove peer
   */
  const removePeer = useCallback((userId) => {
    const pc =
      peerConnections.current[userId];

    if (pc) {
      try {
        pc.ontrack = null;
        pc.onicecandidate = null;
        pc.close();
      } catch (error) {
        console.error(error);
      }
    }

    delete peerConnections.current[userId];

    delete pendingCandidates.current[userId];

    setPeers((current) => {
      if (!Array.isArray(current)) {
        return [];
      }

      return current.filter(
        (peer) => peer.id !== userId
      );
    });
  }, []);

  useEffect(() => {
    if (!socket || !roomId) {
      return;
    }

    console.log(
      'Joining WebRTC room:',
      roomId
    );

    /*
     * Create Peer Connection
     */
    const createPeerConnection = (
      userId,
      shouldCreateOffer = false
    ) => {
      if (!userId) {
        return null;
      }

      if (
        peerConnections.current[userId]
      ) {
        return peerConnections.current[userId];
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

      peerConnections.current[userId] = pc;

      /*
       * Add local tracks
       */
      const stream =
        localStreamRef.current;

      if (stream) {
        stream
          .getTracks()
          .forEach((track) => {
            try {
              pc.addTrack(
                track,
                stream
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
       * Remote stream
       */
      pc.ontrack = (event) => {
        const remoteStream =
          event.streams?.[0];

        if (!remoteStream) {
          return;
        }

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
       * ICE
       */
      pc.onicecandidate = (event) => {
        if (
          !event.candidate ||
          !socket.connected
        ) {
          return;
        }

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
          console.log(
            `Peer ${userId}:`,
            pc.connectionState
          );

          if (
            pc.connectionState ===
              'failed' ||
            pc.connectionState ===
              'closed'
          ) {
            removePeer(userId);
          }
        };

      /*
       * Offer
       */
      if (shouldCreateOffer) {
        pc.createOffer()
          .then((offer) =>
            pc.setLocalDescription(
              offer
            )
          )
          .then(() => {
            if (
              !pc.localDescription
            ) {
              return;
            }

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
     * Existing users
     */
    const handleRoomUsers = (
      users
    ) => {
      console.log(
        'Existing room users:',
        users
      );

      if (!Array.isArray(users)) {
        return;
      }

      users.forEach((userId) => {
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
     * New user
     */
    const handleUserJoined = (
      userId
    ) => {
      console.log(
        'New user joined:',
        userId
      );

      if (
        !userId ||
        userId === socket.id
      ) {
        return;
      }

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
      if (!from || !offer) {
        return;
      }

      console.log(
        'Received offer from:',
        from
      );

      const pc =
        createPeerConnection(
          from,
          false
        );

      if (!pc) {
        return;
      }

      try {
        await pc.setRemoteDescription(
          new RTCSessionDescription(
            offer
          )
        );

        /*
         * Add pending ICE
         */
        const pending =
          pendingCandidates.current[
            from
          ] || [];

        for (
          const candidate of pending
        ) {
          try {
            await pc.addIceCandidate(
              new RTCIceCandidate(
                candidate
              )
            );
          } catch (error) {
            console.error(
              'Pending ICE error:',
              error
            );
          }
        }

        delete pendingCandidates
          .current[from];

        const answer =
          await pc.createAnswer();

        await pc.setLocalDescription(
          answer
        );

        socket.emit(
          'webrtc-answer',
          {
            to: from,
            answer:
              pc.localDescription,
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
      if (!from || !answer) {
        return;
      }

      console.log(
        'Received answer from:',
        from
      );

      const pc =
        peerConnections.current[
          from
        ];

      if (!pc) {
        return;
      }

      try {
        await pc.setRemoteDescription(
          new RTCSessionDescription(
            answer
          )
        );

        const pending =
          pendingCandidates.current[
            from
          ] || [];

        for (
          const candidate of pending
        ) {
          try {
            await pc.addIceCandidate(
              new RTCIceCandidate(
                candidate
              )
            );
          } catch (error) {
            console.error(
              'Pending ICE error:',
              error
            );
          }
        }

        delete pendingCandidates
          .current[from];
      } catch (error) {
        console.error(
          'Answer handling error:',
          error
        );
      }
    };

    /*
     * ICE candidate
     */
    const handleIceCandidate =
      async ({
        from,
        candidate,
      }) => {
        if (
          !from ||
          !candidate
        ) {
          return;
        }

        const pc =
          peerConnections.current[
            from
          ];

        if (!pc) {
          return;
        }

        /*
         * If remote description
         * is not ready yet,
         * save candidate.
         */
        if (
          !pc.remoteDescription
        ) {
          if (
            !pendingCandidates
              .current[from]
          ) {
            pendingCandidates.current[
              from
            ] = [];
          }

          pendingCandidates.current[
            from
          ].push(candidate);

          return;
        }

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

      if (!userId) {
        return;
      }

      removePeer(userId);
    };

    /*
     * Socket events
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
    if (socket.connected) {
      socket.emit(
        'join-room',
        roomId
      );
    } else {
      socket.once('connect', () => {
        socket.emit(
          'join-room',
          roomId
        );
      });
    }

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

      pendingCandidates.current = {};

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