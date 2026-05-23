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
const {
  getCommentsByPost,
  createComment,
} = require("../controllers/commentController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.route("/").get(getPosts).post(authMiddleware, createPost);

router
  .route("/:postId/comments")
  .get(getCommentsByPost)
  .post(authMiddleware, createComment);

router.route("/:id/like").post(authMiddleware, toggleLikePost);

router.route("/:id/save").post(authMiddleware, toggleSavePost);

router
  .route("/:id")
  .get(getPostById)
  .put(authMiddleware, updatePost)
  .patch(authMiddleware, updatePost)
  .delete(authMiddleware, deletePost);

module.exports = router;
