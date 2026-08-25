const roomSocket = require('./roomSocket');
const chatSocket = require('./chatSocket');
const webrtcSocket = require('./webrtcSocket');
const whiteboardSocket = require('./whiteboardSocket');

const connectionHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // Register individual socket handlers
    roomSocket(io, socket);
    chatSocket(io, socket);
    webrtcSocket(io, socket);
    whiteboardSocket(io, socket);

    socket.on('disconnect', () => {
      console.log(`User Disconnected: ${socket.id}`);
    });
  });
};

module.exports = connectionHandler;