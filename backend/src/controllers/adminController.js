const User =
  require("../models/User");

const Post =
  require("../models/Post");

const Comment =
  require("../models/Comment");

const Notification =
  require("../models/Notification");

const toCategorySlug = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const escapeRegex = (value) =>
  String(value || "").replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );



const getDashboardStats =
  async (req, res) => {
    try {
      const totalUsers =
        await User.countDocuments();

      const totalPosts =
        await Post.countDocuments();

      const totalComments =
        await Comment.countDocuments();

      res.json({
        totalUsers,
        totalPosts,
        totalComments,
      });
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };



const getUsers =
  async (req, res) => {
    try {
      const users =
        await User.find()
          .select(
            "-password -verifyOTP -verifyOTPExpire -resetPasswordOtp -resetPasswordOtpExpires"
          )
          .sort({
            createdAt: -1,
          });

      const usersWithPostCount =
        await Promise.all(
          users.map(
            async (user) => {
              const postsCount =
                await Post.countDocuments(
                  {
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
                  }
                );

              return {
                ...user.toObject(),

                postsCount,
              };
            }
          )
        );

      res.json({
        users:
          usersWithPostCount,
      });
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };



const changeUserRole =
  async (req, res) => {
    try {
      const { role } =
        req.body;

      const user =
        await User.findByIdAndUpdate(
          req.params.id,
          { role },
          { new: true }
        ).select(
          "-password -verifyOTP -verifyOTPExpire -resetPasswordOtp -resetPasswordOtpExpires"
        );

      res.json(user);
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };



const toggleBanUser =
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.params.id
        );

      if (!user) {
        return res
          .status(404)
          .json({
            message:
              "User not found",
          });
      }

      const isBanning =
        user.status ===
        "active";

      user.status =
        isBanning
          ? "banned"
          : "active";

      await user.save();

      const postOwnerFilter = {
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

      if (isBanning) {
        await Post.updateMany(
          {
            ...postOwnerFilter,
            visible: true,
          },
          {
            $set: {
              visible: false,
              hiddenByBan: true,
            },
          }
        );
      } else {
        await Post.updateMany(
          {
            ...postOwnerFilter,
            hiddenByBan: true,
          },
          {
            $set: {
              visible: true,
              hiddenByBan: false,
            },
          }
        );
      }

      const safeUser =
        await User.findById(
          user._id
        ).select(
          "-password -verifyOTP -verifyOTPExpire -resetPasswordOtp -resetPasswordOtpExpires"
        );

      res.json(safeUser);
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };



const deleteUser =
  async (req, res) => {
    try {
      await User.findByIdAndDelete(
        req.params.id
      );

      await Post.deleteMany({
        author:
          req.params.id,
      });

      await Comment.deleteMany({
        author:
          req.params.id,
      });

      res.json({
        message:
          "User deleted",
      });
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };



const getPosts =
  async (req, res) => {
    try {
      const posts =
        await Post.find()
          .populate(
            "author",
            "username"
          )
          .sort({
            createdAt: -1,
          });

      res.json({
        posts,
      });
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };



const togglePostVisibility =
  async (req, res) => {
    try {
      const post =
        await Post.findById(
          req.params.id
        );

      if (!post) {
        return res
          .status(404)
          .json({
            message:
              "Post not found",
          });
      }

      post.visible =
        !post.visible;

      post.hiddenByBan =
        false;

      await post.save();

      res.json(post);
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };



const deletePost =
  async (req, res) => {
    try {
      const post =
        await Post.findByIdAndDelete(
        req.params.id
      );

      if (!post) {
        return res
          .status(404)
          .json({
            message:
              "Post not found",
          });
      }

      await Comment.deleteMany({
        post:
          req.params.id,
      });

      await Notification.deleteMany({
        post:
          req.params.id,
      });

      res.json({
        message:
          "Post deleted",
      });
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };



const getComments =
  async (req, res) => {
    try {
      const comments =
        await Comment.find()
          .sort({
            createdAt: -1,
          });

      res.json({
        comments,
      });
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };



const toggleCommentVisibility =
  async (req, res) => {
    try {
      const comment =
        await Comment.findById(
          req.params.id
        );

      if (!comment) {
        return res
          .status(404)
          .json({
            message:
              "Comment not found",
          });
      }

      comment.visible =
        !comment.visible;

      await comment.save();

      res.json(comment);
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };



const deleteComment =
  async (req, res) => {
    try {
      await Comment.findByIdAndDelete(
        req.params.id
      );

      res.json({
        message:
          "Comment deleted",
      });
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };

const getCategories =
  async (req, res) => {
    try {
      const tags =
        await Post.aggregate([
          {
            $unwind:
              "$tags",
          },
          {
            $group: {
              _id: "$tags",
              postsCount: {
                $sum: 1,
              },
            },
          },
          {
            $sort: {
              _id: 1,
            },
          },
        ]);

      const categories =
        tags.map((tag) => ({
          _id:
            toCategorySlug(
              tag._id
            ),

          name:
            tag._id,

          slug:
            toCategorySlug(
              tag._id
            ),

          postsCount:
            tag.postsCount,
        }));

      res.json({
        categories,
      });
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };



module.exports = {
  getDashboardStats,

  getUsers,
  changeUserRole,
  toggleBanUser,
  deleteUser,

  getPosts,
  togglePostVisibility,
  deletePost,

  getComments,
  toggleCommentVisibility,
  deleteComment,

  getCategories,
};
