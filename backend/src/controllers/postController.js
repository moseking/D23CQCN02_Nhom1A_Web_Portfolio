const mongoose = require("mongoose");
const Post = require("../models/Post");

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
      return res.status(400).json({ success: false, message: "Invalid post id" });
    }

    const post = await Post.findById(req.params.id).lean();

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

const createPost = async (req, res, next) => {
  try {
    const post = await Post.create(req.body);
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

const updatePost = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid post id" });
    }

    const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid post id" });
    }

    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    res.json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const toggleLikePost = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid post id" });
    }

    const userName = String(req.body.userName || req.body.authorName || "nhuquynh")
      .trim()
      .toLowerCase();

    if (!userName) {
      return res.status(400).json({ success: false, message: "User name is required" });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const hasLiked = post.likedBy.includes(userName);
    post.likedBy = hasLiked
      ? post.likedBy.filter((item) => item !== userName)
      : [...post.likedBy, userName];

    await post.save();

    res.json({
      success: true,
      data: {
        liked: !hasLiked,
        likesCount: post.likedBy.length,
        likedBy: post.likedBy,
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
};
