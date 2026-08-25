const express = require('express');
const router = express.Router();
const { getMessages, saveMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:roomId', protect, getMessages);
router.post('/', protect, saveMessage);

module.exports = router;