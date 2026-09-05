const http = require('http');
const { Server } = require('socket.io');

require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

connectDB();

const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://real-communication-codealpha-task.vercel.app',
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['polling', 'websocket'],
});

io.on('connection', (socket) => {
  console.log(
    `User connected: ${socket.id}`
  );

  /*
   * JOIN ROOM
   */
  socket.on(
    'join-room',
    (roomId) => {
      if (!roomId) return;

      socket.data.roomId = roomId;

      socket.join(roomId);

      const room =
        io.sockets.adapter.rooms.get(
          roomId
        );

      const existingUsers = room
        ? Array.from(room).filter(
            (id) => id !== socket.id
          )
        : [];

      /*
       * Send existing users
       * ONLY to new user.
       */
      socket.emit(
        'room-users',
        existingUsers
      );

      /*
       * Tell existing users
       * that someone joined.
       */
      socket
        .to(roomId)
        .emit(
          'user-joined',
          socket.id
        );

      /*
       * Participant list
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

      console.log(
        `Socket ${socket.id} joined room ${roomId}`
      );
    }
  );

  /*
   * WEBRTC OFFER
   */
  socket.on(
    'webrtc-offer',
    ({
      to,
      offer,
      roomId,
    }) => {
      if (
        !to ||
        !offer ||
        !roomId
      ) {
        return;
      }

      io.to(to).emit(
        'webrtc-offer',
        {
          from: socket.id,
          offer,
        }
      );
    }
  );

  /*
   * WEBRTC ANSWER
   */
  socket.on(
    'webrtc-answer',
    ({
      to,
      answer,
      roomId,
    }) => {
      if (
        !to ||
        !answer ||
        !roomId
      ) {
        return;
      }

      io.to(to).emit(
        'webrtc-answer',
        {
          from: socket.id,
          answer,
        }
      );
    }
  );

  /*
   * ICE CANDIDATE
   */
  socket.on(
    'webrtc-ice-candidate',
    ({
      to,
      candidate,
      roomId,
    }) => {
      if (
        !to ||
        !candidate ||
        !roomId
      ) {
        return;
      }

      io.to(to).emit(
        'webrtc-ice-candidate',
        {
          from: socket.id,
          candidate,
        }
      );
    }
  );

  /*
   * LEAVE ROOM
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

      socket.leave(
        actualRoomId
      );

      socket
        .to(actualRoomId)
        .emit(
          'user-left',
          socket.id
        );

      const room =
        io.sockets.adapter.rooms.get(
          actualRoomId
        );

      const users = room
        ? Array.from(room)
        : [];

      io.to(actualRoomId).emit(
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

      socket.data.roomId =
        null;
    }
  );

  /*
   * CHAT
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
   * WHITEBOARD
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
   * DISCONNECT
   */
  socket.on(
    'disconnect',
    () => {
      const roomId =
        socket.data.roomId;

      if (roomId) {
        socket
          .to(roomId)
          .emit(
            'user-left',
            socket.id
          );

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
        `User disconnected: ${socket.id}`
      );
    }
  );
});

const PORT =
  process.env.PORT || 5000;

server.listen(
  PORT,
  '0.0.0.0',
  () => {
    console.log(
      `Server running on port ${PORT}`
    );
  }
);