require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');

const app = require('./app');
const connectDB = require('./config/db');

connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: [
      'GET',
      'POST',
      'PUT',
      'DELETE',
      'OPTIONS',
    ],
    credentials: true,
  },

  transports: [
    'websocket',
    'polling',
  ],
});

const rooms = new Map();

io.on('connection', (socket) => {
  console.log(
    `🟢 User connected: ${socket.id}`
  );

  socket.on(
    'join-room',
    ({ roomId, userName }) => {
      if (!roomId) return;

      socket.join(roomId);

      socket.roomId = roomId;

      socket.userName =
        userName || 'Participant';

      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Map());
      }

      const room =
        rooms.get(roomId);

      const existingUsers =
        Array.from(
          room.entries()
        ).map(
          ([userId, user]) => ({
            userId,
            name: user.name,
          })
        );

      // Send existing users to new user
      socket.emit(
        'room-users',
        existingUsers.map(
          (user) => user.userId
        )
      );

      room.set(socket.id, {
        name: socket.userName,
      });

      // Send complete participant list
      io.to(roomId).emit(
        'room-participants',
        Array.from(
          room.entries()
        ).map(
          ([userId, user]) => ({
            userId,
            name: user.name,
          })
        )
      );

      // Tell existing users that new user joined
      socket
        .to(roomId)
        .emit(
          'user-joined',
          {
            userId:
              socket.id,
            name:
              socket.userName,
          }
        );

      console.log(
        `👤 ${socket.userName} joined room ${roomId}`
      );
    }
  );

  // WebRTC Offer
  socket.on(
    'webrtc-offer',
    ({ target, offer }) => {
      io.to(target).emit(
        'webrtc-offer',
        {
          from: socket.id,
          offer,
        }
      );
    }
  );

  // WebRTC Answer
  socket.on(
    'webrtc-answer',
    ({ target, answer }) => {
      io.to(target).emit(
        'webrtc-answer',
        {
          from: socket.id,
          answer,
        }
      );
    }
  );

  // ICE Candidate
  socket.on(
    'webrtc-ice-candidate',
    ({ target, candidate }) => {
      io.to(target).emit(
        'webrtc-ice-candidate',
        {
          from: socket.id,
          candidate,
        }
      );
    }
  );

  // Chat
  socket.on(
    'send-message',
    (data) => {
      if (!data?.roomId) return;

      io.to(data.roomId).emit(
        'receive-message',
        {
          ...data,
          senderId:
            socket.id,
        }
      );
    }
  );

  // Whiteboard
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

  socket.on(
    'disconnect',
    () => {
      const roomId =
        socket.roomId;

      if (!roomId) {
        console.log(
          `🔴 User disconnected: ${socket.id}`
        );
        return;
      }

      const room =
        rooms.get(roomId);

      if (room) {
        room.delete(
          socket.id
        );

        socket
          .to(roomId)
          .emit(
            'user-left',
            socket.id
          );

        io.to(roomId).emit(
          'room-participants',
          Array.from(
            room.entries()
          ).map(
            ([userId, user]) => ({
              userId,
              name: user.name,
            })
          )
        );

        if (room.size === 0) {
          rooms.delete(roomId);
        }
      }

      console.log(
        `🔴 User left room: ${roomId}`
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
      `🚀 Server running on port ${PORT}`
    );
  }
);