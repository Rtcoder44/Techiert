const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Enable CORS to allow frontend requests with cookies
app.use(
  cors({
    origin: "http://localhost:5173", // Update with your frontend URL
    credentials: true, // Allow cookies in cross-origin requests
  })
);

// Routes
const authRoute = require("./routes/auth.route");
const blogRoute = require("./routes/blog.route");
const categoryRoutes = require("./routes/category.route");
const tagRoutes = require("./routes/tag.route");

app.use("/api/auth", authRoute);
app.use("/api/blogs", blogRoute);
app.use("/api/categories", categoryRoutes);
app.use("/api/tags", tagRoutes);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ Error Connecting to MongoDB:", err));

app.get("/homepage", (req, res) => {
  res.send("🔥 Techiert Backend is Running!");
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`🚀 Server is running on port ${port}`));
