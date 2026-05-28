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

    const userId = req.user?.userId;

    const comment = await Comment.create({
      post: postId,
      author: userId,
      authorName: req.user.username,
      content: req.body.content,
    });

    if (userId && post.author && post.author.toString() !== userId.toString()) {
      await createNotification(req, {
        sender: userId,
        receiver: post.author,
        post: post._id,
        type: "comment",
        message: "đã bình luận bài viết của bạn",
      });
    }

    const populatedComment = await Comment.findById(comment._id)
      .populate("author", "username avatar")
      .lean();

    const io = req.app.get("io");

    if (io) {
      io.emit("new_comment", {
        postId: post._id.toString(),
        comment: populatedComment,
      });
    }

    res.status(201).json({
      success: true,
      data: populatedComment,
    });
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;

    if (!isValidObjectId(postId) || !isValidObjectId(commentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post or comment id",
      });
    }

    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "You must login to delete comment",
      });
    }

    const comment = await Comment.findOne({
      _id: commentId,
      post: postId,
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    const isOwner =
      comment.author?.toString() === userId.toString() ||
      comment.authorName?.trim().toLowerCase() ===
        req.user.username?.trim().toLowerCase();

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own comment",
      });
    }

    await comment.deleteOne();

    const io = req.app.get("io");

    if (io) {
      io.emit("comment_deleted", {
        postId: postId.toString(),
        commentId: commentId.toString(),
      });
    }

    res.json({
      success: true,
      message: "Comment deleted successfully",
      data: {
        commentId,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCommentsByPost,
  createComment,
  deleteComment,
};
