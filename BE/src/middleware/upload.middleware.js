const multer = require('multer');

// Cấu hình lưu trữ
const storage = multer.memoryStorage(); // Lưu file trong memory để xử lý

// Cấu hình filter cho phép các loại file cụ thể
const fileFilter = (req, file, cb) => {
  // Chấp nhận image, video và audio
  if (file.mimetype.startsWith('image/') || 
      file.mimetype.startsWith('video/') || 
      file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Only images, videos, and audio files are allowed.'), false);
  }
};

// Cấu hình giới hạn file
const limits = {
  fileSize: 50 * 1024 * 1024, // 50MB max file size
  files: 10 // Tối đa 10 files
};

// Middleware xử lý upload nhiều files với field name là 'media'
const uploadMedia = multer({
  storage,
  fileFilter,
  limits
}).array('media', 10);

// Middleware xử lý upload một file duy nhất
const uploadSingleMedia = multer({
  storage,
  fileFilter,
  limits
}).single('media');

// Middleware wrapper để xử lý lỗi
const handleMultipartData = (req, res, next) => {
  uploadMedia(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Lỗi từ Multer
      return res.status(400).json({
        success: false,
        message: `File upload error: ${err.message}`
      });
    } else if (err) {
      // Lỗi khác
      return res.status(400).json({
        success: false,
        message: `Error uploading file: ${err.message}`
      });
    }
    // Thành công, tiếp tục
    next();
  });
};

// Middleware xử lý upload một file duy nhất
const handleSingleFile = (req, res, next) => {
  uploadSingleMedia(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: `File upload error: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: `Error uploading file: ${err.message}`
      });
    }
    next();
  });
};

module.exports = {
  handleMultipartData,
  handleSingleFile
};