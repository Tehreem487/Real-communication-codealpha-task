const express = require('express');
const router = express.Router();
const { uploadFile } = require('../controllers/fileController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Multer upload middleware

router.post('/upload', protect, upload.single('file'), uploadFile);

module.exports = router;