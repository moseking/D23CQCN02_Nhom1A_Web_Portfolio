const express = require("express");
const cloudinary = require("../config/cloudinary");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.post("/", upload.single("media"), async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      url: req.file.path,
      publicId: req.file.filename,
      type: req.file.mimetype.startsWith("video") ? "video" : "image",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Upload failed",
      error: error.message,
    });
  }
});

router.delete("/", async (req, res) => {
  try {
    const { publicId, resourceType = "image" } = req.body;

    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    res.status(200).json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Delete failed",
      error: error.message,
    });
  }
});

module.exports = router;
