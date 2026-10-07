const http = require('http');
const { Server } = require('socket.io');

require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

connectDB();

const server = http.createServer(app);

/*
 * =========================================
 * ALLOWED FRONTEND URLS
 * =========================================
 */

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://real-communication-codealpha-task.vercel.app',
];

/*
 * =========================================
 * SOCKET.IO
 * =========================================
 */

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },

  transports: [
    'polling',
    'websocket',
  ],

  connectionStateRecovery: {
    maxDisconnectionDuration:
      2 * 60 * 1000,

    skipMiddlewares: true,
  },
});

/*
 * =========================================
 * SOCKET CONNECTION
 * =========================================
 */

io.on('connection', (socket) => {
  console.log(
    `✅ User connected: ${socket.id}`
  );

  /*
   * =======================================
   * JOIN ROOM
   * =======================================
   */

  socket.on(
    'join-room',
    (roomId) => {
      if (!roomId) {
        console.log(
          '⚠️ join-room called without roomId'
        );

        return;
      }

      /*
       * Save room ID on socket.
       * This is important because later WebRTC
       * events don't necessarily send roomId.
       */
      socket.data.roomId = roomId;

      /*
       * Join Socket.IO room.
       */
      socket.join(roomId);

      /*
       * Get room AFTER joining.
       */
      const room =
        io.sockets.adapter.rooms.get(
          roomId
        );

      /*
       * Existing users are everyone except
       * the newly joined socket.
       */
      const existingUsers = room
        ? Array.from(room).filter(
            (id) => id !== socket.id
          )
        : [];

      console.log(
        `🚪 ${socket.id} joined room: ${roomId}`
      );

      console.log(
        '👥 Existing users:',
        existingUsers
      );

      /*
       * -----------------------------------
       * Tell NEW user about existing users
       * -----------------------------------
       *
       * The frontend will create WebRTC offers
       * to these users.
       */

      socket.emit(
        'room-users',
        existingUsers
      );

      /*
       * -----------------------------------
       * Tell EXISTING users that a new user
       * joined.
       * -----------------------------------
       */

      socket
        .to(roomId)
        .emit(
          'user-joined',
          socket.id
        );

      /*
       * -----------------------------------
       * PARTICIPANT LIST
       * -----------------------------------
       */

      const users = room
        ? Array.from(room)
        : [socket.id];

      io.to(roomId).emit(
        'room-participants',
        users.map(
          (socketId) => ({
            socketId,

            name:
              socketId === socket.id
                ? 'You'
                : 'Participant',
          })
        )
      );
    }
  );

  /*
   * =========================================
   * WEBRTC OFFER
   * =========================================
   */

  socket.on(
    'webrtc-offer',
    (data) => {
      const {
        to,
        target,
        offer,
      } = data || {};

      /*
       * Support both "to" and "target".
       */
      const targetSocket =
        to || target;

      if (
        !targetSocket ||
        !offer
      ) {
        console.log(
          '⚠️ Invalid WebRTC offer from:',
          socket.id
        );

        return;
      }

      /*
       * Get room from socket.
       *
       * We DO NOT require roomId from frontend
       * anymore because join-room already stored
       * it in socket.data.roomId.
       */
      const roomId =
        socket.data.roomId;

      if (!roomId) {
        console.log(
          '⚠️ Offer rejected - socket is not in a room:',
          socket.id
        );

        return;
      }

      /*
       * Make sure target user is actually
       * inside the same room.
       */
      const room =
        io.sockets.adapter.rooms.get(
          roomId
        );

      if (
        !room ||
        !room.has(targetSocket)
      ) {
        console.log(
          '⚠️ Offer target is not in same room:',
          targetSocket
        );

        return;
      }

      console.log(
        `📤 OFFER: ${socket.id} → ${targetSocket}`
      );

      io.to(targetSocket).emit(
        'webrtc-offer',
        {
          from: socket.id,
          offer,
        }
      );
    }
  );

  /*
   * =========================================
   * WEBRTC ANSWER
   * =========================================
   */

  socket.on(
    'webrtc-answer',
    (data) => {
      const {
        to,
        target,
        answer,
      } = data || {};

      const targetSocket =
        to || target;

      if (
        !targetSocket ||
        !answer
      ) {
        console.log(
          '⚠️ Invalid WebRTC answer from:',
          socket.id
        );

        return;
      }

      const roomId =
        socket.data.roomId;

      if (!roomId) {
        console.log(
          '⚠️ Answer rejected - socket is not in a room:',
          socket.id
        );

        return;
      }

      /*
       * Make sure target belongs to same room.
       */
      const room =
        io.sockets.adapter.rooms.get(
          roomId
        );

      if (
        !room ||
        !room.has(targetSocket)
      ) {
        console.log(
          '⚠️ Answer target is not in same room:',
          targetSocket
        );

        return;
      }

      console.log(
        `📤 ANSWER: ${socket.id} → ${targetSocket}`
      );

      io.to(targetSocket).emit(
        'webrtc-answer',
        {
          from: socket.id,
          answer,
        }
      );
    }
  );

  /*
   * =========================================
   * ICE CANDIDATE
   * =========================================
   */

  socket.on(
    'webrtc-ice-candidate',
    (data) => {
      const {
        to,
        target,
        candidate,
      } = data || {};

      const targetSocket =
        to || target;

      if (
        !targetSocket ||
        !candidate
      ) {
        console.log(
          '⚠️ Invalid ICE candidate from:',
          socket.id
        );

        return;
      }

      const roomId =
        socket.data.roomId;

      if (!roomId) {
        console.log(
          '⚠️ ICE rejected - socket is not in a room:',
          socket.id
        );

        return;
      }

      /*
       * Make sure target belongs to same room.
       */
      const room =
        io.sockets.adapter.rooms.get(
          roomId
        );

      if (
        !room ||
        !room.has(targetSocket)
      ) {
        return;
      }

      /*
       * Send ICE candidate directly to target.
       */

      io.to(targetSocket).emit(
        'webrtc-ice-candidate',
        {
          from: socket.id,
          candidate,
        }
      );
    }
  );

  /*
   * =========================================
   * CHAT
   * =========================================
   */

  socket.on(
    'send-message',
    (data) => {
      if (!data?.roomId) {
        return;
      }

      io.to(data.roomId).emit(
        'receive-message',
        {
          ...data,

          senderId:
            data.senderId ||
            socket.id,
        }
      );
    }
  );

  /*
   * =========================================
   * WHITEBOARD
   * =========================================
   */

  socket.on(
    'draw-stroke',
    (data) => {
      if (!data?.roomId) {
        return;
      }

      socket
        .to(data.roomId)
        .emit(
          'draw-stroke',
          data
        );
    }
  );

  /*
   * =========================================
   * LEAVE ROOM
   * =========================================
   */

  socket.on(
    'leave-room',
    (roomId) => {
      const actualRoomId =
        roomId ||
        socket.data.roomId;

      if (!actualRoomId) {
        return;
      }

      console.log(
        `🚪 ${socket.id} leaving room: ${actualRoomId}`
      );

      /*
       * Leave Socket.IO room.
       */
      socket.leave(
        actualRoomId
      );

      /*
       * Tell remaining users.
       */
      socket
        .to(actualRoomId)
        .emit(
          'user-left',
          socket.id
        );

      /*
       * Get remaining users.
       */
      const room =
        io.sockets.adapter.rooms.get(
          actualRoomId
        );

      const users = room
        ? Array.from(room)
        : [];

      /*
       * Update participant list.
       */
      io.to(actualRoomId).emit(
        'room-participants',
        users.map(
          (socketId) => ({
            socketId,
            name: 'Participant',
          })
        )
      );

      socket.data.roomId = null;
    }
  );

  /*
   * =========================================
   * DISCONNECT
   * =========================================
   */

  socket.on(
    'disconnect',
    (reason) => {
      const roomId =
        socket.data.roomId;

      /*
       * IMPORTANT:
       *
       * Socket.IO automatically removes a
       * disconnected socket from its rooms.
       *
       * We still notify the remaining users.
       */

      if (roomId) {
        console.log(
          `🔌 ${socket.id} disconnected from room: ${roomId}`
        );

        socket
          .to(roomId)
          .emit(
            'user-left',
            socket.id
          );

        /*
         * Get remaining users.
         */
        const room =
          io.sockets.adapter.rooms.get(
            roomId
          );

        const users = room
          ? Array.from(room)
          : [];

        io.to(roomId).emit(
          'room-participants',
          users.map(
            (socketId) => ({
              socketId,
              name: 'Participant',
            })
          )
        );
      }

      console.log(
        `🔌 User disconnected: ${socket.id}`,
        reason
      );
    }
  );
});

/*
 * =========================================
 * SERVER
 * =========================================
 */

const PORT =
  process.env.PORT || 5000;

server.listen(
  PORT,
  '0.0.0.0',
  () => {
    console.log(
      `🚀 Server running on port ${PORT}`
    );
  }
);