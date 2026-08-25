const Message = require('../models/Message');

// @desc    Get messages for a room
// @route   GET /api/messages/:roomId
const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ roomId }).populate('sender', 'name avatar').sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Save a message
// @route   POST /api/messages
const saveMessage = async (req, res) => {
  try {
    const { roomId, message } = req.body;
    const newMessage = await Message.create({
      roomId,
      sender: req.user._id,
      message
    });
    const populatedMessage = await newMessage.populate('sender', 'name avatar');
    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMessages, saveMessage };