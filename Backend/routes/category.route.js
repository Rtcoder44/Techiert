const express = require("express");
const { authMiddleware, adminMiddleware } = require("../middlewares/auth.middleware");
const categoryController = require("../controllers/category.controller");

const router = express.Router();

// 📌 Public Routes
router.get("/", categoryController.getAllCategories);
router.get("/with-blogs", categoryController.getAllCategoriesWithBlogs); // 🔼 move above
router.get("/:slug", categoryController.getBlogsByCategorySlug);          // 🔽 keep below
 // ✅ New Route



// 📌 Admin-Only Routes
router.post("/", authMiddleware, adminMiddleware, categoryController.createCategory);
router.put("/:id", authMiddleware, adminMiddleware, categoryController.updateCategory);
router.delete("/:id", authMiddleware, adminMiddleware, categoryController.deleteCategory);

module.exports = router;
