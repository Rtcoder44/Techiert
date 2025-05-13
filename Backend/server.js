const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const { setCache, getCache } = require("./utils/redisClient"); // Importing Redis utility functions

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "https://techiert.vercel.app",
  "https://techiert.com",
  "https://www.techiert.com/"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`CORS Error: Origin ${origin} is not allowed`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow cookies and other credentials
}));

app.options('*', cors()); // Handle pre-flight requests
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
  .catch((err) => console.error("❌ Error Connecting to MongoDB:", err));

// Example Blog model (ensure your Blog model exists in your app)
const Blog = require("./models/blogs.model");

// Dynamic Sitemap Route
app.get("/sitemap.xml", async (req, res) => {
  try {
    // Fetch all blog posts from the database
    const blogs = await Blog.find({}).select("slug createdAt");

    // Construct the sitemap XML content
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
      </urlset>
    `;
    
    // Set the content type to XML and send the sitemap
    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.status(500).send("Error generating sitemap");
  }
});

// Health Check Route
app.get("/homepage", (req, res) => {
  res.send("🔥 Techiert Backend is Running!");
});

// Blog Route with Redis Caching
app.get("/api/blogs/:slug", async (req, res) => {
  const { slug } = req.params;
  const cacheKey = `blog:${slug}`; // Cache key for the specific blog post

  try {
    // Check if the blog post is already cached in Redis
    const cachedPost = await getCache(cacheKey);
    if (cachedPost) {
      console.log("✅ Serving blog post from cache");
      return res.json(JSON.parse(cachedPost)); // Return cached data
    }

    // If not cached, fetch from MongoDB
    const post = await Blog.findOne({ slug });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Cache the blog post in Redis for future requests (expires in 1 hour)
    await setCache(cacheKey, post, 3600); // 1 hour expiration

    console.log("✅ Serving blog post from database");
    return res.json(post); // Return the fresh data from DB
  } catch (err) {
    console.error("❌ Error fetching blog post:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`🚀 Server is running on port ${port}`));
