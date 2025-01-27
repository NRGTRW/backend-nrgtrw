import multer from "multer";
import { v4 as uuidv4 } from "uuid";

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File validation configuration
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (JPEG, PNG, WEBP)"), false);
  }
};

// Create multer instance with configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
    files: 1 // Allow only single file upload
  }
});

// Error handling middleware for file uploads
const handleMulterErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Handle specific Multer errors
    const errors = {
      LIMIT_FILE_SIZE: "File too large (max 20MB)",
      LIMIT_FILE_COUNT: "Only one file allowed",
      LIMIT_UNEXPECTED_FILE: "Unexpected file field"
    };
    return res.status(400).json({
      error: errors[err.code] || "File upload error",
      details: err.message
    });
  } else if (err) {
    // Handle other errors
    return res.status(400).json({
      error: err.message || "File upload failed",
      details: err.stack
    });
  }
  next();
};

export { upload, handleMulterErrors };