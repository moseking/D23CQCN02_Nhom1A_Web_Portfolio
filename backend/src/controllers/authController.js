const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const User = require("../models/User");

const Post = require("../models/Post");

const sendEmail = require("../utils/sendEmail");

const createNotification = require("../utils/createNotification");

const escapeRegex = (value) =>
  String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const VERIFY_OTP_EXPIRE_MINUTES = 5;

const createOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const getOtpExpireDate = (minutes) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

const isVerifyOtpValid = async (hashedOtp, otp) => {
  return bcrypt.compare(otp, hashedOtp);
};

const sendVerifyOtpEmail = async (email, otp) => {
  return sendEmail(
    email,
    "Email verification OTP",
    `Your verification OTP is ${otp}. This OTP will expire in ${VERIFY_OTP_EXPIRE_MINUTES} minutes.`
  );
};

const isEmailDeliveryError = (error) => {
  return [
    "EENVELOPE",
    "EMAIL_REJECTED",
    "EAUTH",
    "ECONNECTION",
    "ETIMEDOUT",
    "ESOCKET",
  ].includes(error?.code);
};

const normalizePortfolioInput = (portfolio) => {
  const normalized = {};

  if (typeof portfolio.title === "string") {
    normalized.title = portfolio.title.trim().slice(0, 80);
  }

  if (typeof portfolio.location === "string") {
    normalized.location = portfolio.location.trim().slice(0, 80);
  }

  if (typeof portfolio.website === "string") {
    normalized.website = portfolio.website.trim().slice(0, 160);
  }

  if (["showcase", "grid", "studio"].includes(portfolio.layout)) {
    normalized.layout = portfolio.layout;
  }

  if (["", "aurora", "gallery", "noir", "mint"].includes(portfolio.theme)) {
    normalized.theme = portfolio.theme;
  }

  return normalized;
};

const getEmailErrorMessage = (error) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return "Email service is not configured. Missing EMAIL_USER or EMAIL_PASS.";
  }

  if (error?.code === "EAUTH") {
    return "Email authentication failed. Please check Gmail app password.";
  }

  if (error?.code === "ECONNECTION" || error?.code === "ETIMEDOUT") {
    return "Could not connect to Gmail SMTP. Please check network or SMTP settings.";
  }

  if (error?.code === "EMAIL_REJECTED" || error?.code === "EENVELOPE") {
    return "Email was rejected by recipient server. Please check the email address.";
  }

  return "Could not send OTP email. Please try again later.";
};

const generateToken = (userId, role) => {
  return jwt.sign(
    {
      userId,
      role,
    },

    process.env.JWT_SECRET,

    {
      expiresIn: "15m",
    }
  );
};

const generateRefreshToken = (userId, role) => {
  return jwt.sign(
    {
      userId,
      role,
    },

    process.env.JWT_REFRESH_SECRET,

    {
      expiresIn: "7d",
    }
  );
};

const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
};

const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);
};

const register = async (req, res) => {
  try {
    const username = req.body.username?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;

    console.log("Register request:", {
      username,
      email,
      hasPassword: Boolean(password),
    });

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const otp = createOtp();

    try {
      console.log("Sending verification email...");

      await sendVerifyOtpEmail(email, otp);

      console.log("Mail sent successfully");
    } catch (emailError) {
      console.error("Register OTP email failed:", {
        email,
        code: emailError.code,
        command: emailError.command,
        responseCode: emailError.responseCode,
        message: emailError.message,
      });

      return res.status(isEmailDeliveryError(emailError) ? 400 : 500).json({
        success: false,
        message: getEmailErrorMessage(emailError),
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const hashedOtp = await bcrypt.hash(otp, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      isVerified: false,
      verifyOTP: hashedOtp,
      verifyOTPExpire: getOtpExpireDate(VERIFY_OTP_EXPIRE_MINUTES),
    });

    res.status(201).json({
      success: true,
      message: "Register successful. Please verify your email.",
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email first",
      });
    }

    const accessToken = generateToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);

    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json({
      success: true,
      message: "Login successful",

      accessToken,

      token: accessToken,

      user: {
        id: user._id,

        username: user.username,

        email: user.email,

        avatar: user.avatar,

        bio: user.bio,

        role: user.role,

        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const accessToken = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      accessToken,
      token: accessToken,
    });
  } catch (error) {
    res.status(401).json({
      message: "Unauthorized",
    });
  }
};

const logout = (req, res) => {
  res.clearCookie("refreshToken", refreshTokenCookieOptions);

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};

const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(200).json({
        success: true,
        message: "Email is already verified",
      });
    }

    console.log("OTP frontend:", otp);
    console.log("OTP DB:", user.verifyOTP);
    console.log("isVerified before:", user.isVerified);

    if (!user.verifyOTP || !user.verifyOTPExpire) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.verifyOTPExpire < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    const isOtpValid = await isVerifyOtpValid(user.verifyOTP, otp);

    if (!isOtpValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    user.isVerified = true;
    user.verifyOTP = undefined;
    user.verifyOTPExpire = undefined;

    await user.save();

    console.log("isVerified after:", user.isVerified);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    const otp = createOtp();

    try {
      console.log("Sending verification email...");

      await sendVerifyOtpEmail(user.email, otp);

      console.log("Mail sent successfully");
    } catch (emailError) {
      console.error("Resend OTP email failed:", {
        email: user.email,
        code: emailError.code,
        command: emailError.command,
        responseCode: emailError.responseCode,
        message: emailError.message,
      });

      return res.status(isEmailDeliveryError(emailError) ? 400 : 500).json({
        success: false,
        message: getEmailErrorMessage(emailError),
      });
    }

    const hashedOtp = await bcrypt.hash(otp, 10);

    user.verifyOTP = hashedOtp;
    user.verifyOTPExpire = getOtpExpireDate(VERIFY_OTP_EXPIRE_MINUTES);

    await user.save();

    res.status(200).json({
      success: true,
      message: "Verification OTP has been sent to your email",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = createOtp();

    user.resetPasswordOtp = await bcrypt.hash(otp, 10);
    user.resetPasswordOtpExpires = getOtpExpireDate(10);

    await user.save();

    try {
      await sendEmail(
        user.email,
        "Password reset OTP",
        `Your password reset OTP is ${otp}. This OTP will expire in 10 minutes.`
      );
    } catch (emailError) {
      user.resetPasswordOtp = "";
      user.resetPasswordOtpExpires = null;
      await user.save();

      console.error("Forgot password OTP email failed:", {
        email: user.email,
        code: emailError.code,
        command: emailError.command,
        responseCode: emailError.responseCode,
        message: emailError.message,
      });

      return res.status(500).json({
        success: false,
        message: getEmailErrorMessage(emailError),
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP has been sent to your email",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({
      email,
    });

    if (!user || !user.resetPasswordOtp || !user.resetPasswordOtpExpires) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    if (user.resetPasswordOtpExpires < new Date()) {
      user.resetPasswordOtp = "";
      user.resetPasswordOtpExpires = null;
      await user.save();

      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    const isOtpValid = await bcrypt.compare(otp, user.resetPasswordOtp);

    if (!isOtpValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findOne({
      email,
    });

    if (
      !user ||
      !user.resetPasswordOtp ||
      !user.resetPasswordOtpExpires ||
      user.resetPasswordOtpExpires < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    const isOtpValid = await bcrypt.compare(otp, user.resetPasswordOtp);

    if (!isOtpValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordOtp = "";
    user.resetPasswordOtpExpires = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "-password -verifyOTP -verifyOTPExpire -resetPasswordOtp -resetPasswordOtpExpires"
    );

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getCreators = async (req, res) => {
  try {
    let currentUserId = null;

    const authHeader = req.headers?.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const decoded = jwt.verify(
          authHeader.split(" ")[1],
          process.env.JWT_SECRET
        );

        currentUserId = decoded.userId;
      } catch {
        currentUserId = null;
      }
    }

    const limit = Math.min(Math.max(Number(req.query.limit) || 6, 1), 12);

    const users = await User.find({
      role: { $ne: "admin" },
      $or: [
        {
          status: "active",
        },
        {
          status: {
            $exists: false,
          },
        },
      ],
    })
      .select("username avatar bio role followers createdAt")
      .sort({
        createdAt: -1,
      })
      .limit(limit);

    const creators = await Promise.all(
      users.map(async (user) => {
        const postsCount = await Post.countDocuments({
          $or: [
            {
              author: user._id,
            },
            {
              authorName: {
                $regex: `^${escapeRegex(user.username)}$`,
                $options: "i",
              },
            },
          ],
        });

        return {
          _id: user._id,
          username: user.username,
          avatar: user.avatar,
          bio: user.bio,
          role: user.role,
          postsCount,
          followersCount: user.followers?.length || 0,
          isFollowing: currentUserId
            ? user.followers?.some(
                (followerId) =>
                  followerId.toString() === currentUserId.toString()
              ) || false
            : false,
        };
      })
    );

    res.json({
      success: true,
      data: creators,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { username, avatar, bio, portfolio } = req.body;

    if (typeof username === "string") {
      const cleanUsername = username.trim();

      if (cleanUsername.length < 2 || cleanUsername.length > 40) {
        return res.status(400).json({
          success: false,
          message: "Username must be between 2 and 40 characters",
        });
      }

      user.username = cleanUsername;
    }

    if (typeof avatar === "string") {
      user.avatar = avatar.trim().slice(0, 300);
    }

    if (typeof bio === "string") {
      user.bio = bio.trim().slice(0, 280);
    }

    if (portfolio && typeof portfolio === "object") {
      const nextPortfolio = normalizePortfolioInput(portfolio);

      user.portfolio = {
        ...(user.portfolio?.toObject
          ? user.portfolio.toObject()
          : user.portfolio || {}),
        ...nextPortfolio,
      };
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select("-password");

    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getUserPortfolio = async (req, res) => {
  try {
    const targetUserId = req.params.id;

    if (!targetUserId || !targetUserId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    let currentUserId = null;

    const authHeader = req.headers?.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const decoded = jwt.verify(
          authHeader.split(" ")[1],
          process.env.JWT_SECRET
        );

        currentUserId = decoded.userId;
      } catch {
        currentUserId = null;
      }
    }

    const user = await User.findById(targetUserId).select(
      "username email avatar bio portfolio role status followers following createdAt"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const postFilter = {
      visible: {
        $ne: false,
      },
      status: {
        $ne: "draft",
      },
      $or: [
        {
          author: user._id,
        },
        {
          authorName: {
            $regex: `^${escapeRegex(user.username)}$`,
            $options: "i",
          },
        },
      ],
    };

    const posts = await Post.find(postFilter)
      .sort({
        createdAt: -1,
      })
      .lean();

    const featuredTags = [
      ...new Set(posts.flatMap((post) => post.tags || [])),
    ].slice(0, 8);

    const likesCount = posts.reduce(
      (total, post) =>
        total + (post.likes?.length || post.likedBy?.length || 0),
      0
    );

    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          portfolio: user.portfolio,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt,
          followersCount: user.followers?.length || 0,
          followingCount: user.following?.length || 0,
          isFollowing: currentUserId
            ? user.followers?.some(
                (followerId) =>
                  followerId.toString() === currentUserId.toString()
              ) || false
            : false,
          isSelf: currentUserId
            ? user._id.toString() === currentUserId.toString()
            : false,
        },
        posts,
        stats: {
          postsCount: posts.length,
          likesCount,
          followersCount: user.followers?.length || 0,
          followingCount: user.following?.length || 0,
        },
        featuredTags,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const toggleFollowUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;

    const currentUserId = req.user.userId;

    if (targetUserId.toString() === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    const targetUser = await User.findById(targetUserId);

    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const hasFollowed = targetUser.followers?.some(
      (followerId) => followerId.toString() === currentUserId.toString()
    );

    if (hasFollowed) {
      targetUser.followers = targetUser.followers.filter(
        (followerId) => followerId.toString() !== currentUserId.toString()
      );

      currentUser.following = currentUser.following.filter(
        (followingId) => followingId.toString() !== targetUserId.toString()
      );
    } else {
      targetUser.followers = [...(targetUser.followers || []), currentUserId];

      currentUser.following = [...(currentUser.following || []), targetUserId];
    }

    if (!hasFollowed) {
      await createNotification(req, {
        sender: currentUserId,
        receiver: targetUserId,
        type: "follow",
        message: "đã theo dõi bạn",
      });
    }

    await Promise.all([targetUser.save(), currentUser.save()]);

    const io = req.app.get("io");

    if (io) {
      io.emit("new_follow_realtime", {
        targetUserId: targetUser._id.toString(),
        currentUserId: currentUser._id.toString(),
        followersCount: targetUser.followers.length,
        followed: !hasFollowed,
      });
    }

    res.json({
      success: true,
      data: {
        followed: !hasFollowed,
        followersCount: targetUser.followers.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
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
};
