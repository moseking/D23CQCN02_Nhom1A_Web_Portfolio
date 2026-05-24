const mongoose = require("mongoose");
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const createNotification = require("../utils/createNotification");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const getCommentsByPost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    if (!isValidObjectId(postId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post id",
      });
    }

    const comments = await Comment.find({ post: postId })
      .populate("author", "username avatar")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};

const createComment = async (req, res, next) => {
  try {
    const { postId } = req.params;

    if (!isValidObjectId(postId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post id",
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const userId = req.user?._id || req.user?.id;

    const comment = await Comment.create({
      post: postId,
      authorName: req.user.username,
      content: req.body.content,
    });

    if (userId && post.author) {
      await createNotification(req, {
        sender: userId,
        receiver: post.author,
        post: post._id,
        type: "comment",
        message: "đã bình luận bài viết của bạn",
      });
    }

    res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCommentsByPost,
  createComment,
};
