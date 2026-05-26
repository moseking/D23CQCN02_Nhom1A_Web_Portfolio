const User = require("../models/User");
const Post = require("../models/Post");

exports.search = async (req, res) => {
  try {
    const { query, type, tag } = req.query;

    let users = [];
    let posts = [];

    if (type === "user" || !type) {
      users = await User.find({
        $or: [
          { username: { $regex: query || "", $options: "i" } },
          { bio: { $regex: query || "", $options: "i" } },
        ],
      }).select("username avatar bio");
    }

    if (type === "post" || !type) {
      const postFilter = {};

      if (query) {
        postFilter.$or = [
          { title: { $regex: query, $options: "i" } },
          { content: { $regex: query, $options: "i" } },
          { authorName: { $regex: query, $options: "i" } },
          { tags: { $regex: query, $options: "i" } },
        ];
      }

      if (tag) {
        postFilter.tags = { $regex: tag, $options: "i" };
      }

      posts = await Post.find(postFilter)
        .populate("author", "username avatar")
        .sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      users,
      posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Search failed",
      error: error.message,
    });
  }
};
