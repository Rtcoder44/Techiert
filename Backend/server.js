const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173", // Local dev URL
  "https://techiert.vercel.app", // ✅ Added production frontend URL
  "https://techiert-9jc62hwk3-ritik-guptas-projects-028e7d46.vercel.app", // Optional Vercel preview URL
];
// Enable CORS to allow frontend requests with cookies
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: "GET, POST, PUT, DELETE", // Allow all relevant methods
    credentials: true, // Enable cookies
  })
);

// Routes
const authRoute = require("./routes/auth.route");
const blogRoute = require("./routes/blog.route");
const categoryRoutes = require("./routes/category.route");
const tagRoutes = require("./routes/tag.route");
const analyticsRoute = require("./routes/analytics.route");

app.use("/api/auth", authRoute);
app.use("/api/blogs", blogRoute);
app.use("/api/categories", categoryRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/analytics", analyticsRoute);

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
    const blogs = await Blog.find({}).select("slug createdAt"); // Modify as needed

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

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`🚀 Server is running on port ${port}`));
