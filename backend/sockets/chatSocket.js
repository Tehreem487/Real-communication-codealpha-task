const Message = require('../models/Message');

const chatSocket = (io, socket) => {
  socket.on('send-message', async (data) => {
    try {
      const { roomId, senderId, message } = data;
      
      // Save message directly to database
      const newMessage = await Message.create({
        roomId,
        sender: senderId,
        message
      });
      
      const populatedMessage = await newMessage.populate('sender', 'name avatar');

      // Broadcast message to everyone in the room (including sender)
      io.to(roomId).emit('receive-message', populatedMessage);
    } catch (error) {
      console.error('Chat socket error:', error.message);
    }
  });
};

module.exports = chatSocket;