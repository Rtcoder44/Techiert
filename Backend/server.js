const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const { setCache, getCache } = require("./utils/redisClient");
const Blog = require("./models/blogs.model");

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

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`❌ CORS Error: Origin ${origin} is not allowed`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Import Routes
const authRoute = require("./routes/auth.route");
const blogRoute = require("./routes/blog.route");
const categoryRoutes = require("./routes/category.route");
const tagRoutes = require("./routes/tag.route");
const analyticsRoute = require("./routes/analytics.route");
const cacheController = require("./controllers/cache.controller");
const productRoutes = require("./routes/product.routes");
const productCategoryRoutes = require("./routes/productCategory.route");
const cartRoutes = require("./routes/cart.routes");
const addressRoutes = require("./routes/address.routes");
const orderRoutes = require("./routes/order.routes");

// Apply Routes
app.use("/api/auth", authRoute);
app.use("/api/blogs", blogRoute);
app.use("/api/categories", categoryRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/analytics", analyticsRoute);
app.use("/api/cache", cacheController);
app.use("/api", productRoutes);
app.use("/api/product-categories", productCategoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api", addressRoutes);
app.use("/api", orderRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Health Check
app.get("/homepage", (req, res) => {
  res.send("🔥 Techiert Backend is Running!");
});

// Redis-cached blog detail route
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

    await setCache(cacheKey, post, 3600);
    console.log("✅ Cache set");
    return res.json(post);
  } catch (err) {
    console.error("❌ Error fetching blog:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Sitemap
app.get("/sitemap.xml", async (req, res) => {
  try {
    const blogs = await Blog.find({}, "slug");
    const DOMAIN = "https://techiert.com";

    const blogUrls = blogs.map(
      (blog) => `
  <url>
    <loc>${DOMAIN}/blog/${blog.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    );

    const staticUrls = [
      { loc: `${DOMAIN}/`, changefreq: "daily", priority: 1.0 },
      { loc: `${DOMAIN}/privacy-policy`, changefreq: "yearly", priority: 0.3 },
      { loc: `${DOMAIN}/terms`, changefreq: "yearly", priority: 0.3 },
      { loc: `${DOMAIN}/about`, changefreq: "yearly", priority: 0.3 },
      { loc: `${DOMAIN}/contact`, changefreq: "monthly", priority: 0.5 },
    ];

    const staticXml = staticUrls
      .map(
        (url) => `
  <url>
    <loc>${url.loc}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
      )
      .join("\n");

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticXml}
${blogUrls.join("\n")}
</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(sitemap.trim());
  } catch (error) {
    console.error("❌ Error generating sitemap:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Start Server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`🚀 Server is running on port ${port}`));
