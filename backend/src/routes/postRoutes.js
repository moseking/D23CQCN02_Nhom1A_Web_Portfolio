const express = require("express");

const { protect } = require("../middleware/authMiddleware");

const {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLikePost,
  toggleSavePost,
  getSavedPosts,
} = require("../controllers/postController");

const {
  getCommentsByPost,
  createComment,
  deleteComment,
} = require("../controllers/commentController");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router
  .route("/")
  .get(getPosts)
  .post(protect, upload.array("media", 5), createPost);

router.get("/saved", protect, getSavedPosts);

router
  .route("/:postId/comments")
  .get(getCommentsByPost)
  .post(protect, createComment);

router.delete("/:postId/comments/:commentId", protect, deleteComment);

router.route("/:id/like").post(protect, toggleLikePost);
router.route("/:id/save").post(protect, toggleSavePost);

router
  .route("/:id")
  .get(getPostById)
  .put(protect, updatePost)
  .patch(protect, updatePost)
  .delete(protect, deletePost);

module.exports = router;
