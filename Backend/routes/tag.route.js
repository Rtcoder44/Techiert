const express = require("express");
const { authMiddleware, adminMiddleware } = require("../middlewares/auth.middleware");
const tagController = require("../controllers/tag.controller");

const router = express.Router();

// 📌 Public Routes
router.get("/", tagController.getAllTags);

// 📌 Admin-Only Routes
router.post("/", authMiddleware, adminMiddleware, tagController.createTag);
router.put("/:id", authMiddleware, adminMiddleware, tagController.updateTag);
router.delete("/:id", authMiddleware, adminMiddleware, tagController.deleteTag);

module.exports = router;
