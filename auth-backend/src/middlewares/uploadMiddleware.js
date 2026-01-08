const multer = require("multer");
const path = require("path");
const AppError = require("../utils/appError");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/avatars");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `avatar-${req.user.userId}-${Date.now()}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];

if (!allowedTypes.includes(file.mimetype)) {
  return cb(new AppError("Only PNG, JPG, and JPEG files are allowed", 400));
}
  cb(null, true);
};

const uploadAvatarMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB
  },
});

module.exports = uploadAvatarMiddleware;
