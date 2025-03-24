const express = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const tagController = require("../controllers/tag.controller");

const router = express.Router();

// Public Routes
router.get("/", tagController.getAllTags);

// Protected Routes (Only Admins can create, update, delete)
router.post("/", authMiddleware, tagController.createTag);
router.put("/:id", authMiddleware, tagController.updateTag);
router.delete("/:id", authMiddleware, tagController.deleteTag);

module.exports = router;
