const bcrypt =
  require("bcryptjs");

const jwt =
  require("jsonwebtoken");

const User =
  require("../models/User");

const Post =
  require("../models/Post");

const createNotification =
  require("../utils/createNotification");

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

const normalizePortfolioInput = (
  portfolio = {}
) => {
  const allowedLayouts = [
    "showcase",
    "grid",
    "studio",
  ];

  const allowedThemes = [
    "",
    "aurora",
    "gallery",
    "noir",
    "mint",
  ];

  const nextPortfolio = {};

  if (
    Object.prototype.hasOwnProperty.call(
      portfolio,
      "title"
    )
  ) {
    nextPortfolio.title = String(
      portfolio.title || ""
    )
      .trim()
      .slice(0, 80);
  }

  if (
    Object.prototype.hasOwnProperty.call(
      portfolio,
      "location"
    )
  ) {
    nextPortfolio.location = String(
      portfolio.location || ""
    )
      .trim()
      .slice(0, 80);
  }

  if (
    Object.prototype.hasOwnProperty.call(
      portfolio,
      "website"
    )
  ) {
    nextPortfolio.website = String(
      portfolio.website || ""
    )
      .trim()
      .slice(0, 180);
  }

  if (
    allowedLayouts.includes(
      portfolio.layout
    )
  ) {
    nextPortfolio.layout =
      portfolio.layout;
  }

  if (
    allowedThemes.includes(
      portfolio.theme
    )
  ) {
    nextPortfolio.theme =
      portfolio.theme;
  }

  return nextPortfolio;
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

const updateMyProfile =
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.user.userId
        );

      if (!user) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "User not found",
          });
      }

      const {
        username,
        avatar,
        bio,
        portfolio,
      } = req.body;

      if (
        typeof username ===
        "string"
      ) {
        const cleanUsername =
          username.trim();

        if (
          cleanUsername.length < 2 ||
          cleanUsername.length > 40
        ) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                "Username must be between 2 and 40 characters",
            });
        }

        user.username =
          cleanUsername;
      }

      if (
        typeof avatar === "string"
      ) {
        user.avatar =
          avatar.trim().slice(0, 300);
      }

      if (typeof bio === "string") {
        user.bio =
          bio.trim().slice(0, 280);
      }

      if (
        portfolio &&
        typeof portfolio ===
          "object"
      ) {
        const nextPortfolio =
          normalizePortfolioInput(
            portfolio
          );

        user.portfolio = {
          ...(user.portfolio?.toObject
            ? user.portfolio.toObject()
            : user.portfolio || {}),
          ...nextPortfolio,
        };
      }

      await user.save();

      const updatedUser =
        await User.findById(
          user._id
        ).select(
          "-password"
        );

      res.json({
        success: true,
        data: updatedUser,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

const getUserPortfolio =
  async (req, res) => {
    try {
      const targetUserId =
        req.params.id;

      if (
        !targetUserId ||
        !targetUserId.match(
          /^[0-9a-fA-F]{24}$/
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid user id",
          });
      }

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

      const user =
        await User.findById(
          targetUserId
        ).select(
          "username email avatar bio portfolio role status followers following createdAt"
        );

      if (!user) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "User not found",
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
      };

      const posts =
        await Post.find(
          postFilter
        )
          .sort({
            createdAt: -1,
          })
          .lean();

      const featuredTags =
        [
          ...new Set(
            posts.flatMap(
              (post) =>
                post.tags || []
            )
          ),
        ].slice(0, 8);

      const likesCount =
        posts.reduce(
          (total, post) =>
            total +
            (post.likes?.length ||
              post.likedBy
                ?.length ||
              0),
          0
        );

      res.json({
        success: true,
        data: {
          user: {
            _id:
              user._id,
            username:
              user.username,
            email:
              user.email,
            avatar:
              user.avatar,
            bio:
              user.bio,
            portfolio:
              user.portfolio,
            role:
              user.role,
            status:
              user.status,
            createdAt:
              user.createdAt,
            followersCount:
              user.followers
                ?.length || 0,
            followingCount:
              user.following
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
            isSelf:
              currentUserId
                ? user._id
                    .toString() ===
                  currentUserId
                    .toString()
                : false,
          },
          posts,
          stats: {
            postsCount:
              posts.length,
            likesCount,
            followersCount:
              user.followers
                ?.length || 0,
            followingCount:
              user.following
                ?.length || 0,
          },
          featuredTags,
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

      if (!hasFollowed) {
        await createNotification(req, {
          sender:
            currentUserId,
          receiver:
            targetUserId,
          type: "follow",
          message:
            "đã theo dõi bạn",
        });
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
  updateMyProfile,
  getCreators,
  getUserPortfolio,
  toggleFollowUser,
};
