const express = require("express");

const {
  login,
  register,
  verifyEmail,
  resendOtp,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  getMe,
  updateMyProfile,
  getCreators,
  getUserPortfolio,
  toggleFollowUser,
} = require("../controllers/authController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOtp);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);
router.get("/me", protect, getMe);
router.patch("/me/profile", protect, updateMyProfile);
router.get("/creators", getCreators);
router.get("/users/:id/portfolio", getUserPortfolio);
router.post("/users/:id/follow", protect, toggleFollowUser);

module.exports = router;
