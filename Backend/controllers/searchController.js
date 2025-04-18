const Blog = require("../models/blogs.model");
const Tag = require("../models/tags.model");
const Category = require("../models/categories.model");
const SearchQuery = require("../models/searchQuery.model");
const redisClient = require("../utils/redisClient");
const { default: validator } = require("validator");

// Helper to escape regex characters
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

exports.logSearchQuery = async (query, userId = null) => {
  try {
    const existing = await SearchQuery.findOne({ query });

    if (existing) {
      existing.count += 1;
      await existing.save();
    } else {
      await SearchQuery.create({ query, userId });
    }
  } catch (err) {
    console.error("Error logging search query:", err.message);
  }
};

exports.searchBlogs = async (req, res) => {
  try {
    const { query, authorId } = req.body;
    const userId = req.user?._id || null;

    if (!query || typeof query !== "string" || query.trim().length < 3) {
      return res.status(400).json({ error: "Search query is too short or invalid." });
    }

    const trimmedQuery = query.trim();
    const safeRegex = new RegExp(escapeRegex(trimmedQuery), "i");

    // Redis cache key
    const cacheKey = `search:${trimmedQuery.toLowerCase()}:${authorId || "all"}`;
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      console.log("⚡ Returning cached search results");
      return res.status(200).json({ results: JSON.parse(cached), cached: true });
    }

    const conditions = [
      { title: { $regex: safeRegex } },
      { content: { $regex: safeRegex } },
      { metaTitle: { $regex: safeRegex } },
      { metaDescription: { $regex: safeRegex } }
    ];

    const matchedTags = await Tag.find({ name: safeRegex });
    if (matchedTags.length > 0) {
      const tagIds = matchedTags.map(tag => tag._id);
      conditions.push({ tags: { $in: tagIds } });
    }

    const matchedCategory = await Category.findOne({ name: safeRegex });
    if (matchedCategory) {
      conditions.push({ category: matchedCategory._id });
    }

    if (authorId && validator.isMongoId(authorId.toString())) {
      conditions.push({ author: authorId });
    }

    const blogs = await Blog.find({ $or: conditions })
      .populate("tags", "name")
      .populate("category", "name")
      .populate("author", "name");

    // ✅ Cache the result for 5 minutes (300 seconds)
    await redisClient.set(cacheKey, JSON.stringify(blogs), "EX", 300);

    if (blogs.length > 0) {
      await exports.logSearchQuery(trimmedQuery, userId);
    }

    res.status(200).json({ results: blogs });
  } catch (err) {
    console.error("❌ Search Error:", err.message, err.stack);
    res.status(500).json({ error: "An error occurred during the search." });
  }
};
