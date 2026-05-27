const mongoose = require("mongoose");
const Post = require("../models/Post");
const User = require("../models/User");
const createNotification = require("../utils/createNotification");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const buildPostFilter = (query) => {
  const filter = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.author) {
    if (!isValidObjectId(query.author)) {
      const error = new Error("Invalid author id");
      error.statusCode = 400;
      throw error;
    }
    filter.author = query.author;
  }

  if (query.tag) {
    filter.tags = String(query.tag).trim().toLowerCase();
  }

  if (query.search) {
    filter.$text = { $search: String(query.search).trim() };
  }

  return filter;
};

const getPosts = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;
    const filter = buildPostFilter(req.query);

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate("author", "username avatar bio")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getPostById = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid post id" });
    }

    const post = await Post.findById(req.params.id)
      .populate("author", "username avatar bio")
      .lean();

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

/* const createPost = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;

    const post = await Post.create({
      ...req.body,
      author: userId || req.body.author || null,
      authorName: req.body.authorName || req.user?.username || "Anonymous",
    });

    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
}; */
const createPost = async (req, res, next) => {
  try {
    const {
      title,
      content,
      media,
      tags,
      status,
    } = req.body;

    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const post =
      await Post.create({
        title: title?.trim(),
        content: content?.trim(),
        media: Array.isArray(media) ? media : [],
        tags: Array.isArray(tags) ? tags : [],
        status: status || "published",

        author:
          req.user.userId,

        authorName:
          req.user.username || "Anonymous",
      });

    const author =
      await User.findById(
        req.user.userId
      ).select("followers");

    if (author?.followers?.length) {
      await Promise.all(
        author.followers.map((receiver) =>
          createNotification(req, {
            sender: req.user.userId,
            receiver,
            post: post._id,
            type: "new_post",
            message: "đã đăng một bài viết mới",
          })
        )
      );
    }

    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

const updatePost = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid post id" });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    const isOwner =
      post.author?.toString() === req.user.userId.toString() ||
      post.authorName.trim().toLowerCase() === req.user.username.trim().toLowerCase();

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "You can only update posts created by your account",
      });
    }

    const updateData = {
      title: req.body.title,
      content: req.body.content,
      media: req.body.media,
      tags: req.body.tags,
      status: req.body.status,
    };

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: updatedPost });
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid post id" });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    const isOwner =
      post.author?.toString() === req.user.userId.toString() ||
      post.authorName.trim().toLowerCase() === req.user.username.trim().toLowerCase();

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "You can only delete posts created by your account",
      });
    }

    await post.deleteOne();

    res.json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const toggleLikePost = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post id",
      });
    }

    const userId = req.user?.userId;
    const userName = String(req.user.username)
      .trim()
      .toLowerCase();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "You must login to like this post",
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const hasLiked = post.likes.some(
      (id) => id.toString() === userId.toString()
    );

    if (hasLiked) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      post.likes.push(userId);

      if (post.author) {
        await createNotification(req, {
          sender: userId,
          receiver: post.author,
          post: post._id,
          type: "like",
          message: "đã thích bài viết của bạn",
        });
      }
    }

    await post.save();

    res.json({
      success: true,
      data: {
        liked: !hasLiked,
        likesCount: post.likes.length,
        likes: post.likes,
      },
    });
  } catch (error) {
    next(error);
  }
};

const toggleSavePost = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid post id" });
    }

    const userName = String(req.user.username)
      .trim()
      .toLowerCase();

    if (!userName) {
      return res
        .status(400)
        .json({ success: false, message: "User name is required" });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    const hasSaved = post.savedBy.includes(userName);
    post.savedBy = hasSaved
      ? post.savedBy.filter((item) => item !== userName)
      : [...post.savedBy, userName];

    if (!hasSaved && post.author) {
      await createNotification(req, {
        sender: req.user.userId,
        receiver: post.author,
        post: post._id,
        type: "save",
        message: "đã lưu bài viết của bạn",
      });
    }

    await post.save();

    res.json({
      success: true,
      data: {
        saved: !hasSaved,
        savesCount: post.savedBy.length,
        savedBy: post.savedBy,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLikePost,
  toggleSavePost,
};
