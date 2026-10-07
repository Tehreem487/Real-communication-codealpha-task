import { useEffect, useRef, useState } from "react";

const ICE_SERVERS = [
  {
    urls: "stun:stun.l.google.com:19302",
  },
  {
    urls: "stun:stun1.l.google.com:19302",
  },
];

export default function useWebRTC(socketOrOptions, roomIdArg, localStreamArg) {
  /*
    Supports both styles:

    useWebRTC(socket, roomId, localStream)

    OR

    useWebRTC({
      socket,
      roomId,
      localStream,
    })
  */

  const socket =
    socketOrOptions && socketOrOptions.socket
      ? socketOrOptions.socket
      : socketOrOptions;

  const roomId =
    socketOrOptions && socketOrOptions.socket
      ? socketOrOptions.roomId
      : roomIdArg;

  const localStream =
    socketOrOptions && socketOrOptions.socket
      ? socketOrOptions.localStream
      : localStreamArg;

  const [peers, setPeers] = useState([]);

  const peersRef = useRef({});
  const iceCandidatesRef = useRef({});
  const joinedRoomRef = useRef(false);
  const mountedRef = useRef(true);

  /*
    Get an ID from different possible server payload formats.
  */
  const getUserId = (data) => {
    if (!data) return null;

    if (typeof data === "string") {
      return data;
    }

    return (
      data.id ||
      data.userId ||
      data.socketId ||
      data.peerId ||
      data.from ||
      data.senderId ||
      data.user?.id ||
      null
    );
  };

  /*
    Get peer IDs from room-users payload.
  */
  const getUserIds = (data) => {
    if (!data) return [];

    let users = data;

    if (!Array.isArray(users)) {
      users =
        data.users ||
        data.participants ||
        data.peers ||
        data.roomUsers ||
        [];
    }

    if (!Array.isArray(users)) {
      return [];
    }

    return users
      .map((user) => getUserId(user))
      .filter(Boolean);
  };

  /*
    Update React peers state from the internal peer map.
  */
  const syncPeers = () => {
    if (!mountedRef.current) return;

    const nextPeers = Object.entries(peersRef.current).map(
      ([id, peer]) => ({
        id,
        stream: peer.stream,
      })
    );

    setPeers(nextPeers);
  };

  /*
    Create a peer connection.
  */
  const createPeerConnection = (remoteId) => {
    if (!remoteId) return null;

    if (peersRef.current[remoteId]?.connection) {
      return peersRef.current[remoteId].connection;
    }

    console.log("Creating peer connection:", remoteId);

    const peerConnection = new RTCPeerConnection({
      iceServers: ICE_SERVERS,
    });

    /*
      Add local camera + microphone tracks BEFORE creating an offer.
      This is very important because the SDP offer needs to describe
      the media tracks being sent.
    */
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        try {
          peerConnection.addTrack(track, localStream);
        } catch (error) {
          console.error("Error adding local track:", error);
        }
      });
    }

    /*
      ICE candidates are sent to the specific remote socket.
    */
    peerConnection.onicecandidate = (event) => {
      if (!event.candidate || !socket) return;

      console.log("Sending ICE candidate to:", remoteId);

      socket.emit("webrtc-ice-candidate", {
        to: remoteId,
        target: remoteId,
        from: socket.id,
        candidate: event.candidate,
      });
    };

    /*
      THIS is where the remote participant's video/audio arrives.
    */
    peerConnection.ontrack = (event) => {
      console.log("Remote track received from:", remoteId);

      let remoteStream = null;

      if (event.streams && event.streams[0]) {
        remoteStream = event.streams[0];
      } else {
        remoteStream = new MediaStream();

        if (event.track) {
          remoteStream.addTrack(event.track);
        }
      }

      const currentPeer = peersRef.current[remoteId];

      if (!currentPeer) {
        peersRef.current[remoteId] = {
          connection: peerConnection,
          stream: remoteStream,
        };
      } else {
        currentPeer.stream = remoteStream;
      }

      syncPeers();
    };

    /*
      Connection state monitoring.
    */
    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState;

      console.log(
        `Peer ${remoteId} connection state:`,
        state
      );

      if (
        state === "failed" ||
        state === "closed"
      ) {
        removePeer(remoteId);
      }
    };

    peerConnection.oniceconnectionstatechange = () => {
      console.log(
        `Peer ${remoteId} ICE state:`,
        peerConnection.iceConnectionState
      );

      if (
        peerConnection.iceConnectionState === "failed" ||
        peerConnection.iceConnectionState === "closed"
      ) {
        removePeer(remoteId);
      }
    };

    peersRef.current[remoteId] = {
      connection: peerConnection,
      stream: null,
    };

    iceCandidatesRef.current[remoteId] =
      iceCandidatesRef.current[remoteId] || [];

    syncPeers();

    return peerConnection;
  };

  /*
    Remove a peer.
  */
  const removePeer = (remoteId) => {
    if (!remoteId) return;

    console.log("Removing peer:", remoteId);

    const peer = peersRef.current[remoteId];

    if (peer?.connection) {
      try {
        peer.connection.ontrack = null;
        peer.connection.onicecandidate = null;
        peer.connection.close();
      } catch (error) {
        console.error("Error closing peer:", error);
      }
    }

    delete peersRef.current[remoteId];
    delete iceCandidatesRef.current[remoteId];

    syncPeers();
  };

  /*
    Add queued ICE candidates after remote description exists.
  */
  const flushIceCandidates = async (remoteId) => {
    const peer = peersRef.current[remoteId];

    if (!peer?.connection) return;

    const queued =
      iceCandidatesRef.current[remoteId] || [];

    if (!queued.length) return;

    console.log(
      "Adding queued ICE candidates:",
      remoteId,
      queued.length
    );

    for (const candidate of queued) {
      try {
        await peer.connection.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch (error) {
        console.error(
          "Error adding queued ICE candidate:",
          error
        );
      }
    }

    iceCandidatesRef.current[remoteId] = [];
  };

  /*
    Create an offer for an existing participant.
  */
  const createOffer = async (remoteId) => {
    if (!remoteId || !socket || !localStream) {
      return;
    }

    if (remoteId === socket.id) {
      return;
    }

    try {
      console.log("Creating offer for:", remoteId);

      const peerConnection =
        peersRef.current[remoteId]?.connection ||
        createPeerConnection(remoteId);

      if (!peerConnection) return;

      const offer = await peerConnection.createOffer();

      await peerConnection.setLocalDescription(offer);

      socket.emit("webrtc-offer", {
        to: remoteId,
        target: remoteId,
        from: socket.id,
        offer: peerConnection.localDescription,
      });

      console.log("Offer sent to:", remoteId);
    } catch (error) {
      console.error(
        `Error creating offer for ${remoteId}:`,
        error
      );
    }
  };

  /*
    Handle incoming offer.
  */
  const handleOffer = async (data) => {
    if (!socket || !localStream) {
      return;
    }

    const remoteId = getUserId(data);

    const offer =
      data?.offer ||
      data?.description ||
      data?.sdp;

    if (!remoteId || !offer) {
      console.warn(
        "Invalid WebRTC offer received:",
        data
      );
      return;
    }

    if (remoteId === socket.id) {
      return;
    }

    try {
      console.log("Received offer from:", remoteId);

      const peerConnection =
        peersRef.current[remoteId]?.connection ||
        createPeerConnection(remoteId);

      if (!peerConnection) return;

      /*
        If an old connection exists in an unstable state,
        use the new offer carefully.
      */
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      await flushIceCandidates(remoteId);

      const answer =
        await peerConnection.createAnswer();

      await peerConnection.setLocalDescription(answer);

      socket.emit("webrtc-answer", {
        to: remoteId,
        target: remoteId,
        from: socket.id,
        answer: peerConnection.localDescription,
      });

      console.log("Answer sent to:", remoteId);
    } catch (error) {
      console.error(
        `Error handling offer from ${remoteId}:`,
        error
      );
    }
  };

  /*
    Handle incoming answer.
  */
  const handleAnswer = async (data) => {
    const remoteId = getUserId(data);

    const answer =
      data?.answer ||
      data?.description ||
      data?.sdp;

    if (!remoteId || !answer) {
      console.warn(
        "Invalid WebRTC answer received:",
        data
      );
      return;
    }

    try {
      console.log("Received answer from:", remoteId);

      const peer =
        peersRef.current[remoteId];

      if (!peer?.connection) {
        console.warn(
          "No peer connection found for answer:",
          remoteId
        );
        return;
      }

      const connection = peer.connection;

      /*
        Only set the answer when we are expecting one.
      */
      if (
        connection.signalingState ===
        "have-local-offer"
      ) {
        await connection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );

        await flushIceCandidates(remoteId);

        console.log(
          "Remote answer applied:",
          remoteId
        );
      }
    } catch (error) {
      console.error(
        `Error handling answer from ${remoteId}:`,
        error
      );
    }
  };

  /*
    Handle incoming ICE candidate.
  */
  const handleIceCandidate = async (data) => {
    const remoteId = getUserId(data);

    const candidate =
      data?.candidate ||
      data?.iceCandidate;

    if (!remoteId || !candidate) {
      return;
    }

    try {
      const peer =
        peersRef.current[remoteId];

      /*
        If peer does not exist yet, keep candidate queued.
      */
      if (!peer?.connection) {
        iceCandidatesRef.current[remoteId] =
          iceCandidatesRef.current[remoteId] || [];

        iceCandidatesRef.current[remoteId].push(
          candidate
        );

        return;
      }

      const connection = peer.connection;

      /*
        ICE candidates should be added after the
        remote description has been applied.
      */
      if (connection.remoteDescription) {
        await connection.addIceCandidate(
          new RTCIceCandidate(candidate)
        );

        console.log(
          "ICE candidate added:",
          remoteId
        );
      } else {
        iceCandidatesRef.current[remoteId] =
          iceCandidatesRef.current[remoteId] || [];

        iceCandidatesRef.current[remoteId].push(
          candidate
        );

        console.log(
          "ICE candidate queued:",
          remoteId
        );
      }
    } catch (error) {
      console.error(
        `Error handling ICE candidate from ${remoteId}:`,
        error
      );
    }
  };

  /*
    Handle participant leaving.
  */
  const handleUserLeft = (data) => {
    const remoteId = getUserId(data);

    if (!remoteId) return;

    removePeer(remoteId);
  };

  /*
    Main WebRTC signaling effect.
    We intentionally wait for localStream.
  */
  useEffect(() => {
    mountedRef.current = true;

    if (
      !socket ||
      !roomId ||
      !localStream
    ) {
      console.log(
        "WebRTC waiting for socket, room or local stream..."
      );

      return undefined;
    }

    /*
      Prevent duplicate room joins.
    */
    joinedRoomRef.current = false;

    const handleRoomUsers = async (data) => {
      const users = getUserIds(data);

      console.log(
        "Existing users in room:",
        users
      );

      /*
        IMPORTANT:

        The NEW participant creates offers
        to everyone who was already in the room.

        Existing participants do not need to create
        an offer back, preventing offer collisions.
      */
      for (const userId of users) {
        if (
          userId &&
          userId !== socket.id
        ) {
          await createOffer(userId);
        }
      }
    };

    const handleUserJoined = (data) => {
      const remoteId = getUserId(data);

      if (!remoteId) return;

      console.log(
        "New participant joined:",
        remoteId
      );

      /*
        Do NOT create an offer here.

        The newly joined participant receives our
        socket ID through room-users and creates
        the offer to us.
      */
    };

    /*
      Register listeners BEFORE joining the room.
    */
    socket.on(
      "room-users",
      handleRoomUsers
    );

    socket.on(
      "user-joined",
      handleUserJoined
    );

    socket.on(
      "user-left",
      handleUserLeft
    );

    socket.on(
      "webrtc-offer",
      handleOffer
    );

    socket.on(
      "webrtc-answer",
      handleAnswer
    );

    socket.on(
      "webrtc-ice-candidate",
      handleIceCandidate
    );

    /*
      Now join the room.

      The local stream already exists, so every
      RTCPeerConnection created after this point
      gets the camera/mic tracks immediately.
    */
    const joinRoom = () => {
      if (joinedRoomRef.current) return;

      joinedRoomRef.current = true;

      console.log(
        "Joining WebRTC room:",
        roomId
      );

      socket.emit("join-room", roomId);
    };

    /*
      If socket is already connected, join immediately.
      Otherwise wait for connect.
    */
    if (socket.connected) {
      joinRoom();
    } else {
      socket.once("connect", joinRoom);
    }

    return () => {
      mountedRef.current = false;

      console.log(
        "Cleaning up WebRTC room:",
        roomId
      );

      socket.off(
        "room-users",
        handleRoomUsers
      );

      socket.off(
        "user-joined",
        handleUserJoined
      );

      socket.off(
        "user-left",
        handleUserLeft
      );

      socket.off(
        "webrtc-offer",
        handleOffer
      );

      socket.off(
        "webrtc-answer",
        handleAnswer
      );

      socket.off(
        "webrtc-ice-candidate",
        handleIceCandidate
      );

      socket.off(
        "connect",
        joinRoom
      );

      /*
        Close every peer connection.
      */
      Object.keys(peersRef.current).forEach(
        (remoteId) => {
          const peer =
            peersRef.current[remoteId];

          try {
            peer?.connection?.close();
          } catch (error) {
            console.error(error);
          }
        }
      );

      peersRef.current = {};
      iceCandidatesRef.current = {};

      setPeers([]);
      joinedRoomRef.current = false;
    };
  }, [socket, roomId, localStream]);

  return {
    peers,
    removePeer,
  };
}