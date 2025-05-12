const express = require('express');
const router = express.Router();
const { delCacheByPattern } = require('../utils/redisClient'); // Your Redis utils
const{authMiddleware,
    adminMiddleware,}= require("../middlewares/auth.middleware");

// Simple clear all cache endpoint
router.post('/clear-all', authMiddleware, async (req, res) => {
  try {
    // Clear unnecessary cache types
    await delCacheByPattern('blogs:*'); // Clear blog-related cache
    await delCacheByPattern('search:*'); // Clear search-related cache
    await delCacheByPattern('users:*');  // Clear user-related cache

    // Optionally, you can add more cache patterns if needed

    res.status(200).json({ message: 'All unnecessary cache cleared successfully!' });
  } catch (err) {
    console.error('❌ Error clearing cache:', err);
    res.status(500).json({ message: 'Error clearing cache.', error: err });
  }
});

module.exports = router;
