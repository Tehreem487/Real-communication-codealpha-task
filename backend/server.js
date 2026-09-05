const http = require('http');
const { Server } = require('socket.io');

require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

connectDB();

const server = http.createServer(app);

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',

  // Vercel frontend
  'https://real-communication-codealpha-task.vercel.app',
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

/*
|--------------------------------------------------------------------------
| SOCKET CONNECTION
|--------------------------------------------------------------------------
*/

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  /*
  |--------------------------------------------------------------------------
  | JOIN ROOM
  |--------------------------------------------------------------------------
  */

  socket.on('join-room', (roomId, userId) => {
    if (!roomId) {
      return;
    }

    /*
     * Agar frontend userId nahi bhej raha
     * to socket.id use hoga.
     */
    const currentUserId =
      userId || socket.id;

    socket.join(roomId);

    console.log(
      `User ${currentUserId} joined room ${roomId}`
    );

    /*
     * Existing users ko batana:
     * ek new user room mein aya hai.
     */
    socket
      .to(roomId)
      .emit(
        'user-joined',
        socket.id
      );

    /*
     * Room ke existing users.
     */
    const room =
      io.sockets.adapter.rooms.get(roomId);

    const users = room
      ? Array.from(room)
      : [];

    /*
     * Frontend useWebRTC.js
     * "room-users" listen karta hai.
     */
    socket.emit(
      'room-users',
      users.filter(
        (id) => id !== socket.id
      )
    );

    /*
     * Participant list ke liye.
     */
    io.to(roomId).emit(
      'room-participants',
      users.map((socketId) => ({
        socketId,
        name:
          socketId === socket.id
            ? currentUserId
            : 'Participant',
      }))
    );
  });

  /*
  |--------------------------------------------------------------------------
  | LEAVE ROOM
  |--------------------------------------------------------------------------
  */

  socket.on(
    'leave-room',
    ({ roomId, userId } = {}) => {
      if (!roomId) {
        return;
      }

      socket.leave(roomId);

      console.log(
        `User ${userId || socket.id} left room ${roomId}`
      );

      /*
       * Frontend useWebRTC.js
       * "user-left" listen karta hai.
       */
      socket
        .to(roomId)
        .emit(
          'user-left',
          socket.id
        );

      /*
       * Updated participant list
       */
      const room =
        io.sockets.adapter.rooms.get(roomId);

      const users = room
        ? Array.from(room)
        : [];

      io.to(roomId).emit(
        'room-participants',
        users.map((socketId) => ({
          socketId,
          name: 'Participant',
        }))
      );
    }
  );

  /*
  |--------------------------------------------------------------------------
  | CHAT
  |--------------------------------------------------------------------------
  */

  socket.on(
    'send-message',
    (data) => {
      if (!data?.roomId) {
        return;
      }

      io.to(data.roomId).emit(
        'receive-message',
        data
      );
    }
  );

  /*
  |--------------------------------------------------------------------------
  | WHITEBOARD
  |--------------------------------------------------------------------------
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
  |--------------------------------------------------------------------------
  | WEBRTC OFFER
  |--------------------------------------------------------------------------
  */

  socket.on(
    'webrtc-offer',
    ({
      to,
      offer,
      roomId,
    } = {}) => {
      if (!to || !offer) {
        return;
      }

      io.to(to).emit(
        'webrtc-offer',
        {
          from: socket.id,
          offer,
          roomId,
        }
      );
    }
  );

  /*
  |--------------------------------------------------------------------------
  | WEBRTC ANSWER
  |--------------------------------------------------------------------------
  */

  socket.on(
    'webrtc-answer',
    ({
      to,
      answer,
      roomId,
    } = {}) => {
      if (!to || !answer) {
        return;
      }

      io.to(to).emit(
        'webrtc-answer',
        {
          from: socket.id,
          answer,
          roomId,
        }
      );
    }
  );

  /*
  |--------------------------------------------------------------------------
  | WEBRTC ICE CANDIDATE
  |--------------------------------------------------------------------------
  */

  socket.on(
    'webrtc-ice-candidate',
    ({
      to,
      candidate,
      roomId,
    } = {}) => {
      if (!to || !candidate) {
        return;
      }

      io.to(to).emit(
        'webrtc-ice-candidate',
        {
          from: socket.id,
          candidate,
          roomId,
        }
      );
    }
  );

  /*
  |--------------------------------------------------------------------------
  | DISCONNECT
  |--------------------------------------------------------------------------
  */

  socket.on(
    'disconnecting',
    () => {
      console.log(
        `User disconnecting: ${socket.id}`
      );

      /*
       * socket.rooms mein socket.id ke ilawa
       * joined rooms hoti hain.
       */
      const rooms = Array.from(
        socket.rooms
      ).filter(
        (roomId) =>
          roomId !== socket.id
      );

      rooms.forEach((roomId) => {
        socket
          .to(roomId)
          .emit(
            'user-left',
            socket.id
          );
      });
    }
  );

  socket.on(
    'disconnect',
    () => {
      console.log(
        `User disconnected: ${socket.id}`
      );
    }
  );
});

/*
|--------------------------------------------------------------------------
| SERVER
|--------------------------------------------------------------------------
*/

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