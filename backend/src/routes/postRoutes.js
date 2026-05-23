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

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(getPosts).post(protect, createPost);

router
  .route("/:postId/comments")
  .get(getCommentsByPost)
  .post(protect, createComment);

router.route("/:id/like").post(protect, toggleLikePost);
router.route("/:id/save").post(protect, toggleSavePost);

router
  .route("/:id")
  .get(getPostById)
  .put(protect, updatePost)
  .patch(protect, updatePost)
  .delete(protect, deletePost);

module.exports = router;
