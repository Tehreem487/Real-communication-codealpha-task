const roomSocket = (io, socket) => {
  socket.on('join-room-channel', ({ roomId, userId }) => {
    socket.join(roomId);
    console.log(`User ${userId} joined room channel: ${roomId}`);
    
    // Notify other users in the room
    socket.to(roomId).emit('user-joined-notification', { userId });
  });

  socket.on('leave-room', ({ roomId, userId }) => {
    socket.leave(roomId);
    socket.to(roomId).emit('user-left-notification', { userId });
  });
};

module.exports = roomSocket;