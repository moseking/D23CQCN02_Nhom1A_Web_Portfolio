const express = require("express");

const { protect } = require("../middleware/authMiddleware");

const { adminOnly } = require("../middleware/adminMiddleware");

const {
  getDashboardStats,

  getUsers,
  changeUserRole,
  toggleBanUser,
  deleteUser,

  getPosts,
  togglePostVisibility,
  deletePost,

  getComments,
  toggleCommentVisibility,
  deleteComment,

  getCategories,
  createCategory,
  deleteCategory,
} = require("../controllers/adminController");

const router = express.Router();

router.use(protect, adminOnly);

router.get("/stats", getDashboardStats);

router.get("/users", getUsers);

router.patch("/users/:id/role", changeUserRole);

router.patch("/users/:id/ban", toggleBanUser);

router.delete("/users/:id", deleteUser);

router.get("/posts", getPosts);

router.patch("/posts/:id/visibility", togglePostVisibility);

router.delete("/posts/:id", deletePost);

router.get("/comments", getComments);

router.patch("/comments/:id/visibility", toggleCommentVisibility);

router.delete("/comments/:id", deleteComment);

router.get("/categories", getCategories);

router.post("/categories", createCategory);

router.delete("/categories/:slug", deleteCategory);

module.exports = router;
