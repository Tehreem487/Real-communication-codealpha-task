const whiteboardSocket = (io, socket) => {
  socket.on('draw-line', ({ roomId, x0, y0, x1, y1, color }) => {
    socket.to(roomId).emit('draw-line', { x0, y0, x1, y1, color });
  });

  socket.on('clear-canvas', (roomId) => {
    socket.to(roomId).emit('clear-canvas');
  });
};

module.exports = whiteboardSocket;