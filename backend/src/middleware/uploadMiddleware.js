const multer = require("multer");

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_UPLOAD_BYTES,
    files: 5,
  },
  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith("image/");
    const isVideo = file.mimetype.startsWith("video/");

    if (!isImage && !isVideo) {
      return cb(new Error("Only image and video files are allowed"));
    }

    cb(null, true);
  },
});

module.exports = upload;
