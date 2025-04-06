const express = require("express");
const { authMiddleware, adminMiddleware, isAdminOrOwner, optionalAuthMiddleware } = require("../middlewares/auth.middleware");
const blogController = require("../controllers/blog.controller");
const upload = require("../middlewares/multer");

const router = express.Router();

// ✅ Upload Route (for Tiptap images or cover images)
router.post("/upload", upload.single("coverImage"), async (req, res) => {
    try {
        if (!req.file || !req.file.path) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        res.status(200).json({ imageUrl: req.file.path }); // Can be a Cloudinary URL
    } catch (error) {
        console.error("❌ Image upload error:", error.message);
        res.status(500).json({ error: "Image upload failed" });
    }
});

// 📌 Public Routes
router.get("/", blogController.getAllBlogs);
router.get("/blog/:id",optionalAuthMiddleware, blogController.getBlogById); // 👈 updated to /blog/:id for clarity
router.get("/comments/:id", blogController.getCommentsForBlog);
router.get("/related/:id", blogController.getRelatedBlogs);


// 📌 Protected Routes (Authentication Required)
router.post("/", authMiddleware, upload.single("coverImage"), blogController.createBlog);
router.put("/:id", authMiddleware, upload.single("coverImage"), blogController.updateBlog);
router.delete("/:id", authMiddleware, blogController.deleteBlog);

// 📌 Draft Routes (Authentication Required)
router.post("/drafts/:_id?", authMiddleware, blogController.saveDraft);
router.post("/drafts/:id/publish", authMiddleware, blogController.publishDraft);
router.get("/drafts/latest", authMiddleware, blogController.getLatestDraft);
router.get("/drafts/all", authMiddleware, adminMiddleware, blogController.getAllDrafts);



// 📌 User Interactions (Like & Comment)
router.post("/:id/like", authMiddleware, blogController.likeBlog);
router.post("/:id/comment", authMiddleware, blogController.commentOnBlog);
router.put("/comments/:commentId", authMiddleware,isAdminOrOwner, blogController.updateComment);
router.delete("/comments/:commentId", authMiddleware, isAdminOrOwner, blogController.deleteComment);


module.exports = router;
