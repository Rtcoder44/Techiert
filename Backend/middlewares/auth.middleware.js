const jwt = require("jsonwebtoken");

// ✅ User Authentication Middleware
exports.authMiddleware = (req, res, next) => {
  const token = req.cookies.token; // Get token from cookies

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid Token" });
  }
};

// ✅ Admin Authentication Middleware
exports.adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "⛔ Admin Access Only!" });
  }
  next();
};
