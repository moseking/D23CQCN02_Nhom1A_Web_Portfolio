const bcrypt =
  require("bcryptjs");

const jwt =
  require("jsonwebtoken");

const User =
  require("../models/User");

const Post =
  require("../models/Post");

const escapeRegex = (value) =>
  String(value || "").replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

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

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      const user =
        await User.create({
          username,
          email,
          password:
            hashedPassword,
        });

      const token =
        generateToken(
          user._id,
          user.role
        );

      res.status(201).json({
        message:
          "Register successful",

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

      const token =
        generateToken(
          user._id,
          user.role
        );

      res.status(200).json({
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

const getMe =
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.user.userId
        ).select(
          "-password"
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
  getMe,
  getCreators,
  toggleFollowUser,
};
