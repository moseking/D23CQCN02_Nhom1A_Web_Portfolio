const jwt =
  require("jsonwebtoken");

const User =
  require("../models/User");

const protect =
  async (
    req,
    res,
    next
  ) => {
    try {
      const authHeader =
        req.headers
          ?.authorization;

      if (
        !authHeader ||
        !authHeader.startsWith(
          "Bearer "
        )
      ) {
        return res
          .status(401)
          .json({
            message:
              "Not authorized",
          });
      }

      const token =
        authHeader.split(
          " "
        )[1];

      const decoded =
        jwt.verify(
          token,
          process.env
            .JWT_SECRET
        );

      const user =
        await User.findById(
          decoded.userId
        ).select(
          "-password -verifyOTP -verifyOTPExpire -resetPasswordOtp -resetPasswordOtpExpires"
        );

      if (!user) {
        return res
          .status(401)
          .json({
            message:
              "User not found",
          });
      }

      if (
        user.status ===
        "banned"
      ) {
        return res
          .status(403)
          .json({
            message:
              "Account banned",
          });
      }

      req.user = {
        userId: user._id,
        username: user.username,
        role: user.role,
      };

      next();
    } catch (error) {
      res.status(401).json({
        message:
          "Invalid token",
      });
    }
  };

module.exports = {
  protect,
};
