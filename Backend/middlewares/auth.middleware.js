const jwt = require("jsonwebtoken");
const Comment = require("../models/comments.model");

// ✅ Strict Authentication Middleware
exports.authMiddleware = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    console.log("❌ No token provided");
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token verified:", decoded);

    req.user = {
      _id: decoded._id,
      role: decoded.role,
      email: decoded.email
    };

    next();
  } catch (error) {
    console.error("❌ JWT Verification Failed:", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// ✅ Optional Authentication Middleware (for public routes)
exports.optionalAuthMiddleware = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("🟡 Optional Token decoded:", decoded);

      req.user = {
        _id: decoded._id,
        role: decoded.role,
        email: decoded.email
      };
    } catch (error) {
      console.log("⚠️ Optional token invalid or expired:", error.message);
    }
  }

  next();
};

// ✅ Admin Only Middleware
exports.adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    console.log("⛔ Admin Access Denied!");
    return res.status(403).json({ success: false, error: "Admin access required" });
  }
  next();
};

// ✅ Admin or Owner (Comment)
exports.isAdminOrOwner = async (req, res, next) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const comment = await Comment.findById(req.params.commentId);
  if (!comment) return res.status(404).json({ error: "Comment not found" });

  const isOwner = comment.userId.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: "Access denied" });
  }

  next();
};
