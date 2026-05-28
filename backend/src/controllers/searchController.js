const Post = require("../models/Post");
const User = require("../models/User");

const searchAll = async (req, res) => {
  try {
    const keyword = req.query.q?.trim();

    if (!keyword) {
      return res.json({
        success: true,
        data: {
          posts: [],
          users: [],
        },
      });
    }

    const regex = new RegExp(keyword, "i");

    const posts = await Post.find({
      $or: [
        { title: regex },
        { content: regex },
        { tags: regex },
        { authorName: regex },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(20);

    const users = await User.find({
      username: regex,
    })
      .select("username avatar bio followers")
      .limit(10);

    res.json({
      success: true,
      data: {
        posts,
        users,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  searchAll,
};
