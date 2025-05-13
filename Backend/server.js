const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const { setCache, getCache } = require("./utils/redisClient");

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Allowed CORS origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://techiert.vercel.app",
  "https://techiert.com",
  "https://www.techiert.com"
];

// CORS config
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Allow non-browser tools like Postman
    const cleanedOrigin = origin.replace(/\/$/, '');
    if (allowedOrigins.includes(cleanedOrigin)) {
      return callback(null, true);
    }
    console.log(`❌ CORS Error: Origin ${origin} is not allowed`);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Pre-flight requests

// Routes
const authRoute = require("./routes/auth.route");
const blogRoute = require("./routes/blog.route");
const categoryRoutes = require("./routes/category.route");
const tagRoutes = require("./routes/tag.route");
const analyticsRoute = require("./routes/analytics.route");
const cacheController = require("./controllers/cache.controller");

app.use("/api/auth", authRoute);
app.use("/api/blogs", blogRoute);
app.use("/api/categories", categoryRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/analytics", analyticsRoute);
app.use("/api/cache", cacheController);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Blog model
const Blog = require("./models/blogs.model");

// Sitemap route
app.get("/sitemap.xml", async (req, res) => {
  try {
    const blogs = await Blog.find({}).select("slug createdAt");

    const sitemap = `
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://techiert.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${blogs.map(post => `
  <url>
    <loc>https://techiert.com/blog/${post.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  `).join('')}
</urlset>`.trim();

    res.header("Content-Type", "application/xml");
    res.send(sitemap);
  } catch (error) {
    console.error("❌ Error generating sitemap:", error);
    res.status(500).send("Error generating sitemap");
  }
});

// Robots.txt route
app.get("/robots.txt", (req, res) => {
  res.type("text/plain").send(`
User-agent: *
Disallow: /api/

Sitemap: https://techiert.com/sitemap.xml
  `.trim());
});

// Health check
app.get("/homepage", (req, res) => {
  res.send("🔥 Techiert Backend is Running!");
});

// Blog route with Redis caching
app.get("/api/blogs/:slug", async (req, res) => {
  const { slug } = req.params;
  const cacheKey = `blog:${slug}`;

  try {
    const cachedPost = await getCache(cacheKey);
    if (cachedPost) {
      console.log("✅ Cache hit");
      return res.json(JSON.parse(cachedPost));
    }

    const post = await Blog.findOne({ slug });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    await setCache(cacheKey, post, 3600); // Cache for 1 hour
    console.log("✅ Cache set");
    return res.json(post);
  } catch (err) {
    console.error("❌ Error fetching blog:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`🚀 Server is running on port ${port}`));
