const express = require("express");

const {
  login,
  register,
  getMe,
  getCreators,
  toggleFollowUser,
} = require("../controllers/authController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/creators", getCreators);
router.post("/users/:id/follow", protect, toggleFollowUser);

module.exports = router;
