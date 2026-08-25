const multer = require('multer');
const path = require('path');

// Configure storage for temporary local uploads before sending to Cloudinary
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// File filter for validation (e.g., images, documents)
const fileFilter = (req, file, cb) => {
  cb(null, true); // Accept all files for now; can be customized based on mimetype
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

module.exports = upload;