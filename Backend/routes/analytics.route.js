const express = require("express");
const router = express.Router();

const {
  getAnalyticsData,
  getSingleBlogAnalytics
// 👈 Add the new controller function
} = require("../controllers/analytics.controller");

const {
  authMiddleware,
  adminMiddleware,
  isAdminOrOwner,
  optionalAuthMiddleware,
} = require("../middlewares/auth.middleware");

// Main dashboard analytics (admin only)
router.get("/", authMiddleware, adminMiddleware, getAnalyticsData);
router.get("/blog/:blogId", authMiddleware, adminMiddleware, getSingleBlogAnalytics);



module.exports = router;
