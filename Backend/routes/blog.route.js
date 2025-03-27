const express = require("express");
const { authMiddleware, adminMiddleware } = require("../middlewares/auth.middleware");
const blogController = require("../controllers/blog.controller");
const upload = require("../middlewares/multer");

const router = express.Router();

// 📌 Public Routes
router.get("/", blogController.getAllBlogs);
router.get("/:id", blogController.getBlogById);

// 📌 Protected Routes (Admin or Author Only)
router.post("/", authMiddleware, adminMiddleware, upload.single("coverImage"), blogController.createBlog);
router.put("/:id", authMiddleware, adminMiddleware, upload.single("coverImage"), blogController.updateBlog);
router.delete("/:id", authMiddleware, adminMiddleware, blogController.deleteBlog);

// 📌 Draft Routes (Authenticated Users)
router.post("/drafts/:id?", authMiddleware, blogController.saveDraft);
router.post("/drafts/:id/publish", authMiddleware, blogController.publishDraft);
router.get("/drafts/latest", authMiddleware, blogController.getLatestDraft);
router.get("/drafts/all", authMiddleware, adminMiddleware, blogController.getAllDrafts);
// router.get("/drafts/user", authMiddleware, blogController.getUserDrafts);

// 📌 Image Upload for Blogs (Tiptap Integration)
router.post("/upload", authMiddleware,  upload.single("coverImage"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    res.status(201).json({ imageUrl: req.file.path }); // Return Cloudinary URL
});

// 📌 User Actions (Authenticated Users)
router.post("/:id/like", authMiddleware, blogController.likeBlog);
router.post("/:id/comment", authMiddleware, blogController.commentOnBlog);

module.exports = router;
