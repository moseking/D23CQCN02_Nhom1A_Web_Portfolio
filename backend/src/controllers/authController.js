const bcrypt =
  require("bcryptjs");

const jwt =
  require("jsonwebtoken");

const User =
  require("../models/User");

const Post =
  require("../models/Post");

const sendEmail =
  require("../utils/sendEmail");

const escapeRegex = (value) =>
  String(value || "").replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

const VERIFY_OTP_EXPIRE_MINUTES = 5;

const generateToken = (
  userId,
  role
) => {
  return jwt.sign(
    {
      userId,
      role,
    },

    process.env.JWT_SECRET,

    {
      expiresIn: "7d",
    }
  );
};

const createOtp = () =>
  Math.floor(
    100000 +
      Math.random() * 900000
  ).toString();

const getOtpExpireDate = (
  minutes
) =>
  new Date(
    Date.now() +
      minutes * 60 * 1000
  );

const buildVerifyEmailContent = (
  otp
) => {
  const text =
    `Your verification code is: ${otp}\n` +
    `This code will expire in ${VERIFY_OTP_EXPIRE_MINUTES} minutes.`;

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
      <h2 style="margin: 0 0 12px;">Verify your email</h2>
      <p style="margin: 0 0 12px;">Your verification code is:</p>
      <div style="font-size: 28px; font-weight: 700; letter-spacing: 4px; margin: 16px 0;">
        ${otp}
      </div>
      <p style="margin: 0;">This code will expire in ${VERIFY_OTP_EXPIRE_MINUTES} minutes.</p>
    </div>
  `;

  return { text, html };
};

const sendVerifyOtpEmail =
  async (email, otp) => {
    const { text, html } =
      buildVerifyEmailContent(
        otp
      );

    await sendEmail(
      email,
      "Verify your email",
      text,
      html
    );
  };

const isEmailDeliveryError = (
  error
) =>
  [
    "EAUTH",
    "EENVELOPE",
    "ECONNECTION",
    "ETIMEDOUT",
    "ESOCKET",
    "EMAIL_REJECTED",
  ].includes(error?.code) ||
  error?.responseCode >= 400 ||
  /recipient|mailbox|address|auth|timeout|connection|invalid/i.test(
    error?.message || ""
  );

const isVerifyOtpValid =
  async (savedOtp, otp) => {
    if (
      String(savedOtp).startsWith(
        "$2"
      )
    ) {
      return bcrypt.compare(
        String(otp),
        String(savedOtp)
      );
    }

    return (
      String(savedOtp) ===
      String(otp)
    );
  };

const register =
  async (req, res) => {
    try {
      const {
        username,
        email,
        password,
      } = req.body;

      if (
        !username ||
        !email ||
        !password
      ) {
        return res
          .status(400)
          .json({
            message:
              "Please fill all fields",
          });
      }

      const existingUser =
        await User.findOne({
          email,
        });

      if (existingUser) {
        return res
          .status(400)
          .json({
            message:
              "Email already exists",
          });
      }

      const otp = createOtp();

      try {
        console.log(
          "Sending verification email..."
        );

        await sendVerifyOtpEmail(
          email,
          otp
        );

        console.log(
          "Mail sent successfully"
        );
      } catch (emailError) {
        console.log(emailError);

        if (
          isEmailDeliveryError(
            emailError
          )
        ) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                "Email does not exist or cannot receive verification mail",
            });
        }

        return res
          .status(500)
          .json({
            success: false,
            message:
              "Email does not exist or cannot receive verification mail",
          });
      }

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      const hashedOtp =
        await bcrypt.hash(
          otp,
          10
        );

      const user =
        await User.create({
          username,
          email,
          password:
            hashedPassword,
          isVerified: false,
          verifyOTP:
            hashedOtp,
          verifyOTPExpire:
            getOtpExpireDate(
              VERIFY_OTP_EXPIRE_MINUTES
            ),
        });

      res.status(201).json({
        success: true,
        message:
          "Register successful. Please verify your email.",
        email: user.email,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

const login =
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

      if (
        !email ||
        !password
      ) {
        return res
          .status(400)
          .json({
            message:
              "Please fill all fields",
          });
      }

      const user =
        await User.findOne({
          email,
        });

      if (!user) {
        return res
          .status(400)
          .json({
            message:
              "Invalid email or password",
          });
      }

      const isMatch =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!isMatch) {
        return res
          .status(400)
          .json({
            message:
              "Invalid email or password",
          });
      }

      if (!user.isVerified) {
        return res
          .status(401)
          .json({
            success: false,
            message:
              "Please verify your email first",
          });
      }

      const token =
        generateToken(
          user._id,
          user.role
        );

      res.status(200).json({
        success: true,
        message:
          "Login successful",

        token,

        user: {
          id: user._id,

          username:
            user.username,

          email: user.email,

          avatar:
            user.avatar,

          bio: user.bio,

          role: user.role,

          status:
            user.status,
        },
      });
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };

const verifyEmail =
  async (req, res) => {
    try {
      const { email, otp } =
        req.body;

      if (!email || !otp) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Email and OTP are required",
          });
      }

      const user =
        await User.findOne({
          email,
        });

      if (!user) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "User not found",
          });
      }

      if (user.isVerified) {
        return res
          .status(200)
          .json({
            success: true,
            message:
              "Email is already verified",
          });
      }

      console.log(
        "OTP frontend:",
        otp
      );
      console.log(
        "OTP DB:",
        user.verifyOTP
      );
      console.log(
        "isVerified before:",
        user.isVerified
      );

      if (
        !user.verifyOTP ||
        !user.verifyOTPExpire
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid OTP",
          });
      }

      if (
        user.verifyOTPExpire <
        new Date()
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "OTP expired",
          });
      }

      const isOtpValid =
        await isVerifyOtpValid(
          user.verifyOTP,
          otp
        );

      if (!isOtpValid) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid OTP",
          });
      }

      user.isVerified = true;
      user.verifyOTP = undefined;
      user.verifyOTPExpire =
        undefined;

      await user.save();

      console.log(
        "isVerified after:",
        user.isVerified
      );

      res.status(200).json({
        success: true,
        message:
          "Email verified successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

const resendOtp =
  async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Email is required",
          });
      }

      const user =
        await User.findOne({
          email,
        });

      if (!user) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "User not found",
          });
      }

      if (user.isVerified) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Email is already verified",
          });
      }

      const otp = createOtp();

      try {
        console.log(
          "Sending verification email..."
        );

        await sendVerifyOtpEmail(
          user.email,
          otp
        );

        console.log(
          "Mail sent successfully"
        );
      } catch (emailError) {
        console.log(emailError);

        return res
          .status(500)
          .json({
            success: false,
            message:
              "Email does not exist or cannot receive verification mail",
          });
      }

      const hashedOtp =
        await bcrypt.hash(
          otp,
          10
        );

      user.verifyOTP =
        hashedOtp;
      user.verifyOTPExpire =
        getOtpExpireDate(
          VERIFY_OTP_EXPIRE_MINUTES
        );

      await user.save();

      res.status(200).json({
        success: true,
        message:
          "Verification OTP has been sent to your email",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

const forgotPassword =
  async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Email is required",
          });
      }

      const user =
        await User.findOne({
          email,
        });

      if (!user) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "User not found",
          });
      }

      const otp = createOtp();

      user.resetPasswordOtp =
        await bcrypt.hash(
          otp,
          10
        );
      user.resetPasswordOtpExpires =
        getOtpExpireDate(
          10
        );

      await user.save();

      try {
        await sendEmail(
          user.email,
          "Password reset OTP",
          `Your password reset OTP is ${otp}. This OTP will expire in 10 minutes.`
        );
      } catch (emailError) {
        user.resetPasswordOtp = "";
        user.resetPasswordOtpExpires =
          null;
        await user.save();

        return res
          .status(500)
          .json({
            success: false,
            message:
              "Could not send OTP email. Please check email configuration.",
            error:
              emailError.message,
          });
      }

      res.status(200).json({
        success: true,
        message:
          "OTP has been sent to your email",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

const verifyResetOtp =
  async (req, res) => {
    try {
      const { email, otp } =
        req.body;

      if (!email || !otp) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Email and OTP are required",
          });
      }

      const user =
        await User.findOne({
          email,
        });

      if (
        !user ||
        !user.resetPasswordOtp ||
        !user.resetPasswordOtpExpires
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid or expired OTP",
          });
      }

      if (
        user.resetPasswordOtpExpires <
        new Date()
      ) {
        user.resetPasswordOtp = "";
        user.resetPasswordOtpExpires =
          null;
        await user.save();

        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid or expired OTP",
          });
      }

      const isOtpValid =
        await bcrypt.compare(
          otp,
          user.resetPasswordOtp
        );

      if (!isOtpValid) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid or expired OTP",
          });
      }

      res.status(200).json({
        success: true,
        message:
          "OTP verified successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

const resetPassword =
  async (req, res) => {
    try {
      const {
        email,
        otp,
        password,
      } = req.body;

      if (
        !email ||
        !otp ||
        !password
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Email, OTP and password are required",
          });
      }

      if (password.length < 6) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Password must be at least 6 characters",
          });
      }

      const user =
        await User.findOne({
          email,
        });

      if (
        !user ||
        !user.resetPasswordOtp ||
        !user.resetPasswordOtpExpires ||
        user.resetPasswordOtpExpires <
          new Date()
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid or expired OTP",
          });
      }

      const isOtpValid =
        await bcrypt.compare(
          otp,
          user.resetPasswordOtp
        );

      if (!isOtpValid) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid or expired OTP",
          });
      }

      user.password =
        await bcrypt.hash(
          password,
          10
        );
      user.resetPasswordOtp = "";
      user.resetPasswordOtpExpires =
        null;

      await user.save();

      res.status(200).json({
        success: true,
        message:
          "Password reset successful",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

const getMe =
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.user.userId
        ).select(
          "-password -verifyOTP -verifyOTPExpire -resetPasswordOtp -resetPasswordOtpExpires"
        );

      res.status(200).json(
        user
      );
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };

const getCreators =
  async (req, res) => {
    try {
      let currentUserId =
        null;

      const authHeader =
        req.headers
          ?.authorization;

      if (
        authHeader &&
        authHeader.startsWith(
          "Bearer "
        )
      ) {
        try {
          const decoded =
            jwt.verify(
              authHeader.split(
                " "
              )[1],
              process.env
                .JWT_SECRET
            );

          currentUserId =
            decoded.userId;
        } catch {
          currentUserId =
            null;
        }
      }

      const limit =
        Math.min(
          Math.max(
            Number(req.query.limit) || 6,
            1
          ),
          12
        );

      const users =
        await User.find({
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
          .select(
            "username avatar bio role followers createdAt"
          )
          .sort({
            createdAt: -1,
          })
          .limit(limit);

      const creators =
        await Promise.all(
          users.map(async (user) => {
            const postsCount =
              await Post.countDocuments({
                $or: [
                  {
                    author:
                      user._id,
                  },
                  {
                    authorName: {
                      $regex:
                        `^${escapeRegex(
                          user.username
                        )}$`,
                      $options:
                        "i",
                    },
                  },
                ],
              });

            return {
              _id:
                user._id,
              username:
                user.username,
              avatar:
                user.avatar,
              bio:
                user.bio,
              role:
                user.role,
              postsCount,
              followersCount:
                user.followers
                  ?.length || 0,
              isFollowing:
                currentUserId
                  ? user.followers
                      ?.some(
                        (followerId) =>
                          followerId
                            .toString() ===
                          currentUserId
                            .toString()
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
        message:
          error.message,
      });
    }
  };

const toggleFollowUser =
  async (req, res) => {
    try {
      const targetUserId =
        req.params.id;

      const currentUserId =
        req.user.userId;

      if (
        targetUserId.toString() ===
        currentUserId.toString()
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "You cannot follow yourself",
          });
      }

      const targetUser =
        await User.findById(
          targetUserId
        );

      const currentUser =
        await User.findById(
          currentUserId
        );

      if (
        !targetUser ||
        !currentUser
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "User not found",
          });
      }

      const hasFollowed =
        targetUser.followers
          ?.some(
            (followerId) =>
              followerId
                .toString() ===
              currentUserId
                .toString()
          );

      if (hasFollowed) {
        targetUser.followers =
          targetUser.followers
            .filter(
              (followerId) =>
                followerId
                  .toString() !==
                currentUserId
                  .toString()
            );

        currentUser.following =
          currentUser.following
            .filter(
              (followingId) =>
                followingId
                  .toString() !==
                targetUserId
                  .toString()
            );
      } else {
        targetUser.followers =
          [
            ...(targetUser.followers || []),
            currentUserId,
          ];

        currentUser.following =
          [
            ...(currentUser.following || []),
            targetUserId,
          ];
      }

      await Promise.all([
        targetUser.save(),
        currentUser.save(),
      ]);

      res.json({
        success: true,
        data: {
          followed:
            !hasFollowed,
          followersCount:
            targetUser.followers
              .length,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

module.exports = {
  register,
  login,
  verifyEmail,
  resendOtp,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  getMe,
  getCreators,
  toggleFollowUser,
};
