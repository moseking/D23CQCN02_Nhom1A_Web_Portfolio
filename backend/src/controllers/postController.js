const mongoose = require("mongoose");
const Post = require("../models/Post");
const User = require("../models/User");
const createNotification = require("../utils/createNotification");
const deleteCloudinaryMedia = require("../utils/deleteCloudinaryMedia");
const cloudinary = require("../config/cloudinary");

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
      Post.find({
        ...filter,
        visible: true,
      })
        .populate("author", "username avatar bio")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments({...filter, visible: true,}),
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

const toCategorySlug = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getPostCategories = async (req, res, next) => {
  try {
    const tags = await Post.aggregate([
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
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    const categories = tags.map((tag) => ({
      _id: toCategorySlug(tag._id),
      name: tag._id,
      slug: toCategorySlug(tag._id),
      postsCount: tag.postsCount,
    }));

    res.json({
      success: true,
      categories,
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

const uploadFileToCloudinary = async (file) => {
  const base64File = `data:${file.mimetype};base64,${file.buffer.toString(
    "base64"
  )}`;

  const result = await cloudinary.uploader.upload(base64File, {
    folder: "web-portfolio/posts",
    resource_type: "auto",
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    type: result.resource_type,
  };
};

const parseArrayInput = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
};

const formatTag = (tag) => {
  return String(tag)
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word) => {
      if (!word) return "";

      if (word.includes("/")) {
        return word
          .split("/")
          .map((part) =>
            part
              ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
              : ""
          )
          .join("/");
      }

      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
};

const normalizeTags = (tags) => {
  return tags.map(formatTag).filter(Boolean);
};

const createPost = async (req, res, next) => {
  try {
    const { title, content, status } = req.body;

    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const uploadedMedia = req.files?.length
      ? await Promise.all(req.files.map((file) => uploadFileToCloudinary(file)))
      : [];

    const bodyMedia = parseArrayInput(req.body.media);
    const tags = normalizeTags(parseArrayInput(req.body.tags));

    const post = await Post.create({
      title: title?.trim(),
      content: content?.trim(),
      media: [...bodyMedia, ...uploadedMedia],
      tags,
      status: status || "published",

      author: req.user.userId,
      authorName: req.user.username || "Anonymous",
    });

    const populatedPost = await Post.findById(post._id)
      .populate("author", "username avatar bio")
      .lean();

    const io = req.app.get("io");

    if (io) {
      io.emit("new_post", {
        post: populatedPost,
      });
    }

    const author = await User.findById(req.user.userId).select("followers");

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
      data: populatedPost,
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
      post.authorName.trim().toLowerCase() ===
        req.user.username.trim().toLowerCase();

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "You can only update posts created by your account",
      });
    }

    const updateData = {};

    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.content !== undefined) updateData.content = req.body.content;
    if (req.body.media !== undefined) updateData.media = req.body.media;
    if (req.body.status !== undefined) updateData.status = req.body.status;

    if (req.body.tags !== undefined) {
      updateData.tags = normalizeTags(parseArrayInput(req.body.tags));
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("author", "username avatar bio")
      .lean();

    const io = req.app.get("io");

    if (io) {
      io.emit("post_updated", {
        post: updatedPost,
      });
    }

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
      post.authorName.trim().toLowerCase() ===
        req.user.username.trim().toLowerCase();

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "You can only delete posts created by your account",
      });
    }

    await deleteCloudinaryMedia(post.media);

    await post.deleteOne();

    const io = req.app.get("io");

    if (io) {
      io.emit("post_deleted", {
        postId: post._id.toString(),
      });
    }

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
    const userName = String(req.user.username).trim().toLowerCase();

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

      if (post.author && post.author.toString() !== userId.toString()) {
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

    const io = req.app.get("io");

    if (io) {
      io.emit("new_like", {
        postId: post._id.toString(),
        liked: !hasLiked,
        likesCount: post.likes.length,
        likes: post.likes,
      });
    }

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
      return res.status(400).json({
        success: false,
        message: "Invalid post id",
      });
    }

    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "You must login to save this post",
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const hasSaved = post.savedBy.some(
      (id) => id.toString() === userId.toString()
    );

    if (hasSaved) {
      post.savedBy = post.savedBy.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      post.savedBy.push(userId);

      if (post.author && post.author.toString() !== userId.toString()) {
        await createNotification(req, {
          sender: userId,
          receiver: post.author,
          post: post._id,
          type: "save",
          message: "đã lưu bài viết của bạn",
        });
      }
    }

    await post.save();

    const io = req.app.get("io");

    if (io) {
      io.emit("new_save", {
        postId: post._id.toString(),
        saved: !hasSaved,
        savesCount: post.savedBy.length,
        savedBy: post.savedBy,
      });
    }

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

const getSavedPosts = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "You must login to view saved posts",
      });
    }

    const posts = await Post.find({
      savedBy: userId,
    })
      .populate("author", "username avatar bio")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPosts,
  getPostCategories,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLikePost,
  toggleSavePost,
  getSavedPosts,
};
