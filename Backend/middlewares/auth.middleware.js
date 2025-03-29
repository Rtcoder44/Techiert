const jwt = require("jsonwebtoken");

exports.authMiddleware = (req, res, next) => {
  const token = req.cookies.token; 
  if (!token) {
      return res.status(401).json({ error: "No token provided" });
  }

  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("✅ Token verified:", decoded);

      // 🔥 Ensure `_id` is correctly assigned
      req.user = { 
          _id: decoded._id,  // ✅ Correcting `_id`
          role: decoded.role 
      };

      console.log("✅ Updated req.user:", req.user);
      next();
  } catch (error) {
      console.error("❌ JWT Verification Failed:", error);
      return res.status(401).json({ error: "Invalid token" });
  }
};

// ✅ Admin Middleware
exports.adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    console.log("⛔ Admin Access Denied!");
    return res.status(403).json({ success: false, error: "⛔ Admin Access Only!" });
  }
  next();
};
