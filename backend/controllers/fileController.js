const File = require('../models/File');
const cloudinary = require('../config/cloudinary');

// @desc    Upload file to Cloudinary and save reference
// @route   POST /api/files/upload
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload via buffer or file path (depending on multer setup)
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'rtc_app_files'
    });

    const fileRecord = await File.create({
      filename: req.file.originalname,
      fileUrl: result.secure_url,
      cloudinaryId: result.public_id,
      uploadedBy: req.user._id,
      roomId: req.body.roomId || null
    });

    res.status(201).json(fileRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadFile };