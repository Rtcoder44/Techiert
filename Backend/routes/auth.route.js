const express = require("express");
const {
  signup,
  login,
  logout,
  getMe,
} = require("../controllers/auth.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/multer");

const router = express.Router();

// ✅ Auth Routes
router.post("/signup", upload.single("avatar"), signup);
router.post("/login", login);
router.post("/logout", authMiddleware, logout); // ✅ Protect logout route  
router.get("/me", authMiddleware, getMe); // ✅ Ensure only authenticated users can fetch their data  

module.exports = router;
