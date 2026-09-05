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
  const pendingIceCandidates = useRef({});
  const localStreamRef = useRef(localStream);

  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  const removePeer = useCallback((userId) => {
    const pc = peerConnections.current[userId];

    if (pc) {
      try {
        pc.ontrack = null;
        pc.onicecandidate = null;
        pc.onconnectionstatechange = null;
        pc.close();
      } catch (error) {
        console.error(error);
      }
    }

    delete peerConnections.current[userId];
    delete pendingIceCandidates.current[userId];

    setPeers((current) =>
      Array.isArray(current)
        ? current.filter(
            (peer) => peer.id !== userId
          )
        : []
    );
  }, []);

  useEffect(() => {
    /*
     * VERY IMPORTANT:
     * Join room only after socket + room + media
     * are all ready.
     */
    if (
      !socket ||
      !roomId ||
      !localStream
    ) {
      return;
    }

    const createPeerConnection = async (
      userId,
      initiator
    ) => {
      if (
        !userId ||
        userId === socket.id
      ) {
        return null;
      }

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

      pendingIceCandidates.current[userId] =
        [];

      /*
       * Add local audio/video tracks
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
       * RECEIVE REMOTE STREAM
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
              stream:
                remoteStream,
            },
          ];
        });
      };

      /*
       * ICE
       */
      pc.onicecandidate = (
        event
      ) => {
        if (!event.candidate) {
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
       * CONNECTION STATE
       */
      pc.onconnectionstatechange =
        () => {
          console.log(
            `Peer ${userId}:`,
            pc.connectionState
          );

          if (
            [
              'failed',
              'closed',
              'disconnected',
            ].includes(
              pc.connectionState
            )
          ) {
            removePeer(userId);
          }
        };

      /*
       * CREATE OFFER
       *
       * Only the NEW user creates
       * offers to existing users.
       */
      if (initiator) {
        try {
          const offer =
            await pc.createOffer();

          await pc.setLocalDescription(
            offer
          );

          socket.emit(
            'webrtc-offer',
            {
              to: userId,
              offer:
                pc.localDescription,
              roomId,
            }
          );
        } catch (error) {
          console.error(
            'Offer error:',
            error
          );
        }
      }

      return pc;
    };

    /*
     * Flush ICE candidates that arrived
     * before remote description.
     */
    const flushIceCandidates =
      async (userId, pc) => {
        const queued =
          pendingIceCandidates
            .current[userId] || [];

        for (const candidate of queued) {
          try {
            await pc.addIceCandidate(
              new RTCIceCandidate(
                candidate
              )
            );
          } catch (error) {
            console.error(
              'Queued ICE error:',
              error
            );
          }
        }

        pendingIceCandidates.current[
          userId
        ] = [];
      };

    /*
     * Existing users in room.
     *
     * NEW USER creates offers.
     */
    const handleRoomUsers = async (
      users
    ) => {
      const safeUsers =
        Array.isArray(users)
          ? users
          : [];

      console.log(
        'Existing room users:',
        safeUsers
      );

      for (const userId of safeUsers) {
        if (
          userId &&
          userId !== socket.id
        ) {
          await createPeerConnection(
            userId,
            true
          );
        }
      }
    };

    /*
     * Existing users only receive
     * notification.
     */
    const handleUserJoined = (
      userId
    ) => {
      console.log(
        'User joined:',
        userId
      );
    };

    /*
     * OFFER
     */
    const handleOffer = async ({
      from,
      offer,
    }) => {
      if (!from || !offer) {
        return;
      }

      const pc =
        await createPeerConnection(
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

        await flushIceCandidates(
          from,
          pc
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
            answer:
              pc.localDescription,
            roomId,
          }
        );
      } catch (error) {
        console.error(
          'Handle offer error:',
          error
        );
      }
    };

    /*
     * ANSWER
     */
    const handleAnswer = async ({
      from,
      answer,
    }) => {
      if (!from || !answer) {
        return;
      }

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

        await flushIceCandidates(
          from,
          pc
        );
      } catch (error) {
        console.error(
          'Handle answer error:',
          error
        );
      }
    };

    /*
     * ICE CANDIDATE
     */
    const handleIceCandidate = async ({
      from,
      candidate,
    }) => {
      if (!from || !candidate) {
        return;
      }

      const pc =
        peerConnections.current[
          from
        ];

      /*
       * Candidate arrived before
       * remote description.
       */
      if (
        !pc ||
        !pc.remoteDescription
      ) {
        if (
          !pendingIceCandidates
            .current[from]
        ) {
          pendingIceCandidates.current[
            from
          ] = [];
        }

        pendingIceCandidates.current[
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
          'ICE error:',
          error
        );
      }
    };

    /*
     * USER LEFT
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
     * SOCKET LISTENERS
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
     * JOIN ONLY AFTER MEDIA EXISTS
     */
    socket.emit(
      'join-room',
      roomId
    );

    console.log(
      'Joined meeting room:',
      roomId
    );

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

      try {
        socket.emit(
          'leave-room',
          roomId
        );
      } catch (error) {
        console.error(error);
      }

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
      pendingIceCandidates.current = {};

      setPeers([]);
    };
  }, [
    roomId,
    localStream,
    socket,
    removePeer,
  ]);

  return {
    peers: Array.isArray(peers)
      ? peers
      : [],
  };
}

export default useWebRTC;