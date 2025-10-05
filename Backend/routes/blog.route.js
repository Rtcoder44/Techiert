const express = require("express");
const {
  authMiddleware,
  adminMiddleware,
  isAdminOrOwner,
  optionalAuthMiddleware,
} = require("../middlewares/auth.middleware");
const blogController = require("../controllers/blog.controller");
const upload = require("../middlewares/multer");
const searchController = require("../controllers/searchController");
const createRateLimiter = require("../utils/rateLimiter");
const sharp = require("sharp"); // Import sharp for image manipulation
const { setCache, getCache } = require("../utils/redisClient");
const { autoGenerateBlog, aiGenerateOutline, aiGenerateSection, aiAssembleArticle, aiHumanizeContent, aiScanContent, aiImproveContent, aiGenerateMeta } = require('../controllers/blog.controller');
const multer = require('../middlewares/multer');

const router = express.Router();

// 🛡️ Rate Limiters
const uploadLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: { error: "Too many uploads. Please wait a few minutes." },
});

const searchLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Too many search requests. Please slow down." },
});

const commentLimiter = createRateLimiter({
  windowMs: 2 * 60 * 1000,
  max: 3,
  message: { error: "Too many comments. Please wait before commenting again." },
});

const likeLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: "Too many likes. Please slow down." },
});

const draftLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: { error: "Too many draft operations. Try again later." },
});

// ✅ Editor Image Upload Route (separate from cover image)
router.post("/editor/upload", authMiddleware, uploadLimiter, upload.single("file"), async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({
        error: {
          message: "No file uploaded",
          remove: true
        }
      });
    }

    // Return a simpler format with the image data
    res.json({
      data: [{
        url: req.file.path,
        name: req.file.originalname || 'image'
      }]
    });
  } catch (error) {
    console.error("❌ Editor image upload error:", error.message);
    res.status(500).json({
      error: {
        message: error.message || "Image upload failed",
        remove: true
      }
    });
  }
});

// ✅ Cover Image Upload Route (existing route)
router.post("/upload", authMiddleware, uploadLimiter, upload.single("coverImage"), async (req, res) => {
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
router.get("/blog/:id", optionalAuthMiddleware, blogController.getBlogById);
router.get("/comments/:id", blogController.getCommentsForBlog);
router.get("/related/:id", blogController.getRelatedBlogs);
router.get("/latest", blogController.getLatestBlogs);
router.post("/search", searchLimiter, searchController.searchBlogs);

// 📌 Protected Routes (Authentication Required)
router.post("/", authMiddleware, upload.single("coverImage"), blogController.createBlog);
router.put("/:id", authMiddleware, upload.single("coverImage"), blogController.updateBlog);
router.delete("/:id", authMiddleware, blogController.deleteBlog);

// 📌 Draft Routes (Authentication Required)
router.post("/drafts/:_id?", authMiddleware, draftLimiter, blogController.saveDraft);
router.post("/drafts/:id/publish", authMiddleware, draftLimiter, blogController.publishDraft);
router.get("/drafts/latest", authMiddleware, draftLimiter, blogController.getLatestDraft);
router.get("/drafts/all", authMiddleware, adminMiddleware, blogController.getAllDrafts);

// 📌 User Interactions (Like & Comment)
router.post("/:id/like", authMiddleware, likeLimiter, blogController.likeBlog);
router.post("/:id/comment", authMiddleware, commentLimiter, blogController.commentOnBlog);
router.put("/comments/:commentId", authMiddleware, isAdminOrOwner, blogController.updateComment);
router.delete("/comments/:commentId", authMiddleware, isAdminOrOwner, blogController.deleteComment);

// 📌 Auto-Generate Route (Authentication Required)
router.post('/auto-generate', autoGenerateBlog);

// Upload in-content image
router.post('/upload-content-image', multer.single('contentImage'), blogController.uploadContentImage);

// New POST routes
router.post('/ai-outline', aiGenerateOutline);
router.post('/ai-section', aiGenerateSection);
router.post('/ai-assemble', aiAssembleArticle);
router.post('/ai-humanize', aiHumanizeContent);
router.post('/ai-scan', aiScanContent);
router.post('/ai-improve', aiImproveContent);

// AI Blog creation via JSON (no multer)
router.post("/ai-create", authMiddleware, blogController.createBlog);

// AI Meta generation
router.post('/ai-meta', aiGenerateMeta);

module.exports = router;
