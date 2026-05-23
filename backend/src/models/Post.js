const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["image", "video"],
      default: "image",
    },
    publicId: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
      minlength: [10, "Content must be at least 10 characters"],
      maxlength: [5000, "Content cannot exceed 5000 characters"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    authorName: {
      type: String,
      required: [true, "Author is required"],
      trim: true,
      minlength: [2, "Author must be at least 2 characters"],
      maxlength: [80, "Author cannot exceed 80 characters"],
    },
    media: {
      type: [mediaSchema],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
      set: (tags) =>
        Array.isArray(tags)
          ? [...new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))]
          : [],
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    likedBy: {
      type: [String],
      default: [],
      set: (users) =>
        Array.isArray(users)
          ? [...new Set(users.map((user) => user.trim().toLowerCase()).filter(Boolean))]
          : [],
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
  },
  { timestamps: true }
);

postSchema.index({ title: "text", content: "text", tags: "text" });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Post", postSchema);
