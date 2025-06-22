const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const compression = require('compression');
require("dotenv").config();


const { setCache, getCache } = require("./utils/redisClient");
const Blog = require("./models/blogs.model");

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(compression());

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
const productRoutes = require("./routes/product.routes");
const productCategoryRoutes = require("./routes/productCategory.route");
const cartRoutes = require("./routes/cart.routes");
const addressRoutes = require("./routes/address.routes");
const orderRoutes = require("./routes/order.routes");
const shopifyRoutes = require('./routes/shopify.routes');
const geminiRoutes = require('./routes/gemini.routes');
const sitemapRoutes = require('./routes/sitemap.routes');

// Apply Routes
app.use("/api/auth", authRoute);
app.use("/api/blogs", blogRoute);
app.use("/api/categories", categoryRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/analytics", analyticsRoute);
app.use("/api/products", productRoutes);
app.use("/api/product-categories", productCategoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/orders", orderRoutes);
app.use('/api/shopify', shopifyRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/', sitemapRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Start Server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`🚀 Server is running on port ${port}`));

// Error handling middleware
app.use((err, req, res, next) => {
  // ... existing code ...
});
