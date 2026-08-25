const Room = require('../models/Room');
const generateRoomId = require('../utils/generateRoomId');

// @desc    Create a new meeting room
// @route   POST /api/rooms/create
const createRoom = async (req, res) => {
  try {
    const roomId = generateRoomId();
    const room = await Room.create({
      roomId,
      host: req.user._id,
      participants: [req.user._id]
    });
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get room details by roomId
// @route   GET /api/rooms/:roomId
const getRoomByRoomId = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId }).populate('host participants', 'name email avatar');
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createRoom, getRoomByRoomId };