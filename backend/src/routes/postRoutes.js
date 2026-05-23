const express = require("express");
const {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLikePost,
  toggleSavePost,
} = require("../controllers/postController");
const { getCommentsByPost, createComment } = require("../controllers/commentController");

const router = express.Router();

router.route("/").get(getPosts).post(createPost);
router.route("/:postId/comments").get(getCommentsByPost).post(createComment);
router.route("/:id/like").post(toggleLikePost);
router.route("/:id/save").post(toggleSavePost);
router.route("/:id").get(getPostById).put(updatePost).patch(updatePost).delete(deletePost);

module.exports = router;
