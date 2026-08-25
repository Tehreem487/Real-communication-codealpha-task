const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');

require('dotenv').config();

// Connect to MongoDB Database (if configured)
if (connectDB) {
  connectDB();
}

// Create HTTP server from Express app
const server = http.createServer(app);

// Initialize Socket.io with CORS enabled
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Register WebRTC & Room Signaling Handlers
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // When a user joins a meeting room
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    console.log(`User [${userId}] joined room: ${roomId}`);
    
    // Broadcast to other users in the room that a new peer connected
    socket.to(roomId).emit('user-connected', userId);

    // Handle user disconnect
    socket.on('disconnect', () => {
      console.log(`User [${userId}] disconnected from room: ${roomId}`);
      socket.to(roomId).emit('user-disconnected', userId);
    });
  });

  // Real-time Chat Messaging Events
  socket.on('send-message', (data) => {
    io.to(data.roomId).emit('receive-message', data);
  });

  // Whiteboard drawing synchronization events
  socket.on('draw-stroke', (data) => {
    socket.to(data.roomId).emit('draw-stroke', data);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
});