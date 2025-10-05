const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const compression = require('compression');
const helmet = require('helmet');
const path = require('path');
require("dotenv").config();


const { setCache, getCache } = require("./utils/redisClient");
const Blog = require("./models/blogs.model");

// Canonical domain redirect (www to non-www)
const canonicalRedirect = (req, res, next) => {
  if (req.headers.host && req.headers.host.startsWith('www.')) {
    return res.redirect(301, 'https://' + req.headers.host.replace(/^www\./, '') + req.url);
  }
  next();
};

const app = express();
app.use(canonicalRedirect);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(compression());
app.use(helmet());

const allowedOrigins = [
  'http://localhost:5173', // local frontend
  'https://your-production-frontend.com', // your production frontend (replace with your real domain)
  // Add more allowed origins as needed
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Allow public GET requests. If an Origin is present and recognized, echo it back to support credentials.
  if (req.method === 'GET' && !req.path.startsWith('/api/auth') && !req.path.startsWith('/api/admin')) {
    if (origin && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
    } else {
      res.header('Access-Control-Allow-Origin', '*');
    }
    res.header('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    return next();
  }

  // For API/auth/admin routes (needs credentials), allow only specific origins
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  }
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

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
app.use('/api/gemini', geminiRoutes);
app.use('/', sitemapRoutes);

// Serve static files from the frontend build (if deployed together)
app.use(express.static(path.join(__dirname, '../Frontend/dist')));

// Serve index.html for all non-API, non-static routes (React SPA support)
app.get(/^\/(?!api|sitemap\.xml|robots\.xml|favicon\.ico|static|assets).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/dist/index.html'));
});

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
