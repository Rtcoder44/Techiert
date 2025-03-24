const express = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const blogController = require("../controllers/blog.controller");
const upload = require("../middlewares/multer");

const router = express.Router();

// 📌 Public Routes
router.get("/", blogController.getAllBlogs);
router.get("/:id", blogController.getBlogById);

// 📌 Protected Routes (Admin Only)
router.post("/", authMiddleware, upload.single("coverImage"), blogController.createBlog);
router.put("/:id", authMiddleware, upload.single("coverImage"), blogController.updateBlog);
router.delete("/:id", authMiddleware, blogController.deleteBlog);
router.post("/drafts/:id?", authMiddleware, blogController.saveDraft);
// 📌 Fetch the latest draft
router.get("/drafts/latest", authMiddleware, blogController.getLatestDraft);



// 📌 Image Upload Route for Blogs (Used in Tiptap)
router.post("/upload", authMiddleware, upload.single("coverImage"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    res.status(201).json({ imageUrl: req.file.path }); // Return Cloudinary URL
});

// 📌 User Actions
router.post("/:id/like", authMiddleware, blogController.likeBlog);
router.post("/:id/comment", authMiddleware, blogController.commentOnBlog);

module.exports = router;
