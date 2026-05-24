const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    authorName: {
      type: String,
      required: [true, "Author is required"],
      trim: true,
      minlength: [2, "Author must be at least 2 characters"],
      maxlength: [80, "Author cannot exceed 80 characters"],
    },
    content: {
      type: String,
      required: [true, "Comment content is required"],
      trim: true,
      minlength: [1, "Comment cannot be empty"],
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    visible: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

commentSchema.index({ post: 1, createdAt: -1 });

module.exports = mongoose.model("Comment", commentSchema);
