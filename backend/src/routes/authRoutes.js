const express = require("express");

const {
  login,
  register,
  getMe,
  getCreators,
} = require("../controllers/authController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/creators", getCreators);

module.exports = router;
