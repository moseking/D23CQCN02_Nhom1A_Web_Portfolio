const mongoose = require("mongoose");
const Comment = require("../models/Comment");
const Post = require("../models/Post");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const getCommentsByPost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    if (!isValidObjectId(postId)) {
      return res.status(400).json({ success: false, message: "Invalid post id" });
    }

    const comments = await Comment.find({ post: postId }).sort({ createdAt: -1 }).lean();

    res.json({ success: true, data: comments });
  } catch (error) {
    next(error);
  }
};

const createComment = async (req, res, next) => {
  try {
    const { postId } = req.params;

    if (!isValidObjectId(postId)) {
      return res.status(400).json({ success: false, message: "Invalid post id" });
    }

    const postExists = await Post.exists({ _id: postId });

    if (!postExists) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const comment = await Comment.create({
      post: postId,
      authorName: req.user.username,
      content: req.body.content,
    });

    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCommentsByPost,
  createComment,
};
