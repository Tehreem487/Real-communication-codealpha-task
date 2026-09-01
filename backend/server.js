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
    methods: [
      'GET',
      'POST',
    ],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log(
    `User connected: ${socket.id}`
  );

  socket.on(
    'join-room',
    (roomId, userId) => {
      if (!roomId) return;

      socket.join(roomId);

      console.log(
        `User ${userId} joined room ${roomId}`
      );

      /*
       * Existing users ko new user notify
       */
      socket
        .to(roomId)
        .emit(
          'user-connected',
          userId
        );

      /*
       * Current room users
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
        users.map((socketId) => ({
          socketId,
          name:
            socketId === socket.id
              ? userId
              : `Participant`,
        }))
      );
    }
  );

  /*
   * Leave room
   */
  socket.on(
    'leave-room',
    ({ roomId, userId }) => {
      if (!roomId) return;

      socket.leave(roomId);

      socket
        .to(roomId)
        .emit(
          'user-disconnected',
          userId
        );
    }
  );

  /*
   * Chat
   */
  socket.on(
    'send-message',
    (data) => {
      if (!data?.roomId) return;

      io.to(data.roomId).emit(
        'receive-message',
        data
      );
    }
  );

  /*
   * Whiteboard
   */
  socket.on(
    'draw-stroke',
    (data) => {
      if (!data?.roomId) return;

      socket
        .to(data.roomId)
        .emit(
          'draw-stroke',
          data
        );
    }
  );

  /*
   * Disconnect
   */
  socket.on(
    'disconnect',
    () => {
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