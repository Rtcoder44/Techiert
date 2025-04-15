const Blog = require("../models/blogs.model");
const Comment = require("../models/comments.model");
const User = require("../models/users.model");
const Like = require("../models/likes.model");
const mongoose = require("mongoose");
const moment = require("moment");
const cheerio = require("cheerio");
const SearchQuery = require("../models/searchQuery.model");

// Function to get top referrers - assuming you store referral data somewhere
async function getTopReferrers() {
  return [
    { referrer: "Google", count: 120 },
    { referrer: "Facebook", count: 90 }
  ];
}

// Function to get top search queries - assuming you store search data
const getTopSearchQueries = async () => {
  const topQueries = await SearchQuery.aggregate([
    { $group: { _id: "$query", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  return topQueries.map((item) => ({
    query: item._id,
    count: item.count
  }));
};

// Function to get user growth (e.g., sign-ups over time)
async function getUserGrowth() {
  const lastMonth = moment().subtract(30, 'days').startOf('day').toDate();
  const newUsers = await User.countDocuments({ createdAt: { $gte: lastMonth } });
  return newUsers;
}

// GET GLOBAL ANALYTICS
exports.getAnalyticsData = async (req, res) => {
  try {
    // Fetch the necessary analytics data
    const [
      totalBlogs,
      viewsAgg,
      totalLikes,
      totalComments,
      totalUsers,
      publishedCount,
      draftCount,
      activeUsers,
      topReferrers,
      topSearchQueries,
      userGrowth
    ] = await Promise.all([
      Blog.countDocuments(),
      Blog.aggregate([{ $group: { _id: null, total: { $sum: "$views" } } }]),
      Like.countDocuments(),
      Comment.countDocuments(),
      User.countDocuments(),
      Blog.countDocuments({ status: "published" }),
      Blog.countDocuments({ status: "draft" }),
      User.countDocuments({ lastLogin: { $gte: moment().subtract(30, 'days').toDate() } }),
      getTopReferrers(),
      getTopSearchQueries(),
      getUserGrowth()
    ]);

    // Existing analytics calculations
    const mostViewedBlog = await Blog.findOne()
      .sort({ views: -1 })
      .limit(1)
      .populate("author", "name")
      .lean();

    const mostLiked = await Like.aggregate([
      { $group: { _id: "$blogId", likesCount: { $sum: 1 } } },
      { $sort: { likesCount: -1 } },
      { $limit: 1 }
    ]);

    let mostLikedBlog = null;
    if (mostLiked.length > 0) {
      mostLikedBlog = await Blog.findById(mostLiked[0]._id)
        .populate("author", "name")
        .lean();
      if (mostLikedBlog) {
        mostLikedBlog.likesCount = mostLiked[0].likesCount;
      }
    }

    // Data for the last 7 days
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const date = moment().subtract(i, "days").startOf("day");
      return {
        label: date.format("MMM DD"),
        start: date.toDate(),
        end: moment(date).endOf("day").toDate(),
      };
    }).reverse();

    const viewsLast7Days = await Promise.all(
      last7Days.map(async (day) => {
        const blogs = await Blog.aggregate([
          { $match: { createdAt: { $gte: day.start, $lte: day.end } } },
          { $group: { _id: null, views: { $sum: "$views" } } }
        ]);
        return {
          date: day.label,
          views: blogs[0]?.views || 0,
        };
      })
    );

    const startOfYear = moment().subtract(11, "months").startOf("month").toDate();
    const blogsPerMonthAgg = await Blog.aggregate([
      { $match: { createdAt: { $gte: startOfYear } } },
      { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const blogsPerMonth = Array.from({ length: 12 }).map((_, i) => {
      const month = moment().subtract(11 - i, "months");
      const found = blogsPerMonthAgg.find(
        (b) => b._id.year === month.year() && b._id.month === month.month() + 1
      );
      return { month: month.format("MMM YYYY"), blogs: found?.count || 0 };
    });

    // All blog data
    const allBlogs = await Blog.find()
      .select("title slug coverImage views author")
      .populate("author", "name")
      .lean();

    res.status(200).json({
      totalBlogs,
      totalViews: viewsAgg[0]?.total || 0,
      totalLikes,
      totalComments,
      totalUsers,
      activeUsers,
      publishedCount,
      draftCount,
      topReferrers,
      topSearchQueries,
      userGrowth,
      mostViewedBlog,
      mostLikedBlog,
      viewsLast7Days,
      blogsPerMonth,
      blogs: allBlogs,
    });
  } catch (error) {
    console.error("❌ Analytics Error:", error);
    res.status(500).json({ error: "Failed to fetch analytics." });
  }
};

// Blog Analytics Controller
exports.getSingleBlogAnalytics = async (req, res) => {
  try {
    const { blogId } = req.params;
    console.log("🔍 Fetching analytics for blog ID:", blogId);

    const blog = await Blog.findById(blogId)
      .populate("author", "name email")
      .lean();

    if (!blog) {
      console.warn("⚠️ Blog not found for ID:", blogId);
      return res.status(404).json({ error: "Blog not found" });
    }

    console.log("✅ Blog found:", blog.title);

    const [totalLikes, totalComments, totalSaved, uniqueLikers, uniqueCommenters] =
      await Promise.all([
        Like.countDocuments({ blogId }),
        Comment.countDocuments({ blogId }),
        User.countDocuments({ savedPosts: blog._id }),
        Like.distinct("userId", { blogId }),
        Comment.distinct("userId", { blogId }),
      ]);

    // Daily views chart data
    const viewsByDate = await Blog.aggregate([
      { $match: { _id: blog._id } },
      {
        $project: {
          views: 1,
          createdAt: 1,
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        },
      },
      {
        $group: {
          _id: "$date",
          count: { $sum: "$views" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 🧠 SEO & Content Analysis
    const $ = cheerio.load(blog.content || "");

    const wordCount = blog.content ? blog.content.split(/\s+/).length : 0;
    const headingCount = {
      h1: $("h1").length,
      h2: $("h2").length,
      h3: $("h3").length,
    };
    const imageCount = $("img").length;
    const imagesWithoutAlt = $("img").filter((_, el) => !$(el).attr("alt")).length;

    // Optional: meta tags (if you save meta info)
    const hasMetaTitle = !!blog.metaTitle;
    const hasMetaDescription = !!blog.metaDescription;
    const slugIncludesTitle = blog.slug?.toLowerCase().includes(blog.title?.split(" ")[0]?.toLowerCase());

    const seoChecklist = {
      wordCount,
      headingCount,
      imageCount,
      imagesWithoutAlt,
      hasMetaTitle,
      hasMetaDescription,
      slugIncludesTitle,
      suggestions: [],
    };

    // 🎯 Suggestions
    if (wordCount < 700) seoChecklist.suggestions.push("Content is too short for SEO (min 700 words).");
    if (headingCount.h2 < 2) seoChecklist.suggestions.push("Use more subheadings (H2 tags).");
    if (imageCount < 1) seoChecklist.suggestions.push("Add at least one image.");
    if (imagesWithoutAlt > 0) seoChecklist.suggestions.push("Some images are missing alt text.");
    if (!hasMetaTitle) seoChecklist.suggestions.push("Add a meta title.");
    if (!hasMetaDescription) seoChecklist.suggestions.push("Add a meta description.");
    if (!slugIncludesTitle) seoChecklist.suggestions.push("Slug should include a primary keyword or title.");

    res.status(200).json({
      success: true,
      blog: {
        _id: blog._id,
        title: blog.title,
        slug: blog.slug,
        coverImage: blog.coverImage,
        views: blog.views || 0,
        createdAt: blog.createdAt,
        author: blog.author,
      },
      totalLikes,
      totalComments,
      totalSaved,
      viewsByDate,
      seoChecklist,
    });
  } catch (error) {
    console.error("❌ Single Blog Analytics Error:", error);
    res.status(500).json({ error: "Failed to fetch single blog analytics." });
  }
};
