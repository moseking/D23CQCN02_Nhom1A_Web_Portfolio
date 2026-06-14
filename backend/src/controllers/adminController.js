const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const Category = require("../models/Category");

const toCategorySlug = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const escapeRegex = (value) =>
  String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const totalPosts = await Post.countDocuments();

    const totalComments = await Comment.countDocuments();

    res.json({
      totalUsers,
      totalPosts,
      totalComments,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select(
        "-password -verifyOTP -verifyOTPExpire -resetPasswordOtp -resetPasswordOtpExpires"
      )
      .sort({
        createdAt: -1,
      });

    const usersWithPostCount = await Promise.all(
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
          ...user.toObject(),

          postsCount,
        };
      })
    );

    res.json({
      users: usersWithPostCount,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select(
      "-password -verifyOTP -verifyOTPExpire -resetPasswordOtp -resetPasswordOtpExpires"
    );

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const toggleBanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isBanning = user.status === "active";

    user.status = isBanning ? "banned" : "active";

    await user.save();

    const postOwnerFilter = {
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

    const safeUser = await User.findById(user._id).select(
      "-password -verifyOTP -verifyOTPExpire -resetPasswordOtp -resetPasswordOtpExpires"
    );

    res.json(safeUser);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    await Post.deleteMany({
      author: req.params.id,
    });

    await Comment.deleteMany({
      author: req.params.id,
    });

    res.json({
      message: "User deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate("author", "username").sort({
      createdAt: -1,
    });

    res.json({
      posts,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const togglePostVisibility = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    post.visible = !post.visible;

    post.hiddenByBan = false;

    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate("author", "username avatar bio")
      .lean();

    const io = req.app.get("io");

    if (io) {
      io.emit("post_visibility_changed", {
        postId: post._id.toString(),
        visible: post.visible,
        post: populatedPost,
      });
    }

    res.json(populatedPost || post);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    await Comment.deleteMany({
      post: req.params.id,
    });

    await Notification.deleteMany({
      post: req.params.id,
    });

    res.json({
      message: "Post deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getComments = async (req, res) => {
  try {
    const comments = await Comment.find().sort({
      createdAt: -1,
    });

    res.json({
      comments,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const toggleCommentVisibility = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    comment.visible = !comment.visible;

    await comment.save();

    const populatedComment = await Comment.findById(comment._id)
      .populate("author", "username avatar")
      .lean();

    const io = req.app.get("io");

    if (io) {
      io.emit("comment_visibility_changed", {
        commentId: comment._id.toString(),
        postId: comment.post.toString(),
        visible: comment.visible,
        comment: populatedComment,
      });
    }

    res.json(populatedComment || comment);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    const io = req.app.get("io");

    if (io) {
      io.emit("comment_deleted", {
        commentId: comment._id.toString(),
        postId: comment.post.toString(),
      });
    }

    res.json({
      message: "Comment deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const tags = await Post.aggregate([
      {
        $match: {
          visible: {
            $ne: false,
          },
          status: {
            $ne: "draft",
          },
        },
      },
      {
        $unwind: "$tags",
      },
      {
        $group: {
          _id: "$tags",
          postsCount: {
            $sum: 1,
          },
        },
      },
    ]);

    const savedCategories = await Category.find().sort({ name: 1 }).lean();

    const countBySlug = new Map(
      tags.map((tag) => [toCategorySlug(tag._id), tag.postsCount])
    );

    const merged = new Map();

    savedCategories.forEach((category) => {
      merged.set(category.slug, {
        _id: category._id,
        name: category.name,
        slug: category.slug,
        postsCount: countBySlug.get(category.slug) || 0,
      });
    });

    tags.forEach((tag) => {
      const slug = toCategorySlug(tag._id);

      if (!merged.has(slug)) {
        merged.set(slug, {
          _id: slug,
          name: tag._id,
          slug,
          postsCount: tag.postsCount,
        });
      }
    });

    res.json({
      categories: Array.from(merged.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      ),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const slug = toCategorySlug(req.body.slug || name);

    if (!name || !slug) {
      return res.status(400).json({
        message: "Category name is required",
      });
    }

    const existed = await Category.findOne({ slug });

    if (existed) {
      return res.status(400).json({
        message: "Category already exists",
      });
    }

    const category = await Category.create({
      name,
      slug,
    });

    res.status(201).json({
      category: {
        _id: category._id,
        name: category.name,
        slug: category.slug,
        postsCount: 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const slug = toCategorySlug(req.params.slug);

    const category = await Category.findOne({ slug });

    const possibleTagNames = [
      category?.name,
      category?.name?.toLowerCase(),
      category?.slug,
      req.params.slug,
      String(req.params.slug || "").toLowerCase(),
    ].filter(Boolean);

    const usedPostsCount = await Post.countDocuments({
      tags: {
        $in: possibleTagNames,
      },
    });

    if (usedPostsCount > 0) {
      return res.status(409).json({
        message: `Không thể xoá tag này vì đang có ${usedPostsCount} bài viết sử dụng.`,
      });
    }

    const deletedCategory = await Category.findOneAndDelete({ slug });

    if (!deletedCategory) {
      return res.status(404).json({
        message: "Tag not found",
      });
    }

    res.json({
      message: "Category deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
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
  createCategory,
  deleteCategory,
};
