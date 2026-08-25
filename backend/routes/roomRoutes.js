const express = require('express');
const router = express.Router();
const { createRoom, getRoomByRoomId } = require('../controllers/roomController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create', protect, createRoom);
router.get('/:roomId', protect, getRoomByRoomId);

module.exports = router;