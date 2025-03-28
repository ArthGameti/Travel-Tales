// File: multer.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save files to the uploads directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`); // Unique filename
  },
});

// File filter to allow images and videos
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif/;
  const allowedVideoTypes = /mp4|mov|avi|webm|mkv/; // Added webm and mkv
  const extname = path.extname(file.originalname).toLowerCase();
  const isImageExt = allowedImageTypes.test(extname);
  const isVideoExt = allowedVideoTypes.test(extname);

  // Check MIME types for images and videos
  const isImageMime = allowedImageTypes.test(file.mimetype);
  const isVideoMime = [
    "video/mp4",
    "video/quicktime", // For .mov files
    "video/x-msvideo", // For .avi files
    "video/webm", // For .webm files
    "video/x-matroska", // For .mkv files
  ].includes(file.mimetype);

  if ((isImageExt && isImageMime) || (isVideoExt && isVideoMime)) {
    return cb(null, true);
  } else {
    // Instead of throwing an error, pass the error to multer
    return cb(
      new multer.MulterError(
        "INVALID_FILE_TYPE",
        "Only images (jpeg, jpg, png, gif) and videos (mp4, mov, avi, webm, mkv) are allowed"
      ),
      false
    );
  }
};

// Multer configuration for multiple images and a single video
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per file
}).fields([
  { name: "images", maxCount: 5 }, // Allow up to 5 images
  { name: "video", maxCount: 1 }, // Allow 1 video
]);

// Multer configuration for a single image (for /image-upload endpoint)
const uploadSingleImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for single image
}).single("image");

module.exports = { upload, uploadSingleImage };
