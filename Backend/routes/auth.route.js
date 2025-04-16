const express = require("express");
const rateLimit = require("express-rate-limit");

const {
  signup,
  login,
  logout,
  getMe,
  toggleSavePost,
  getSavedPosts,
  getProfile,
  updateProfile,
  changePassword,
  updateName,
  updateAvatar,
  getAllUsers,
  updateUser,
  deleteUser,
  forgotPassword,
  resetPassword,
  submitContactForm,
} = require("../controllers/auth.controller");
const { authMiddleware, adminMiddleware } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/multer");

const router = express.Router();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 contact requests
  message: { success: false, error: "Too many messages. Please try again later." },
});

// ✅ Auth Routes
router.post("/signup", upload.single("avatar"), signup);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.get("/me", authMiddleware, getMe);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/contact", contactLimiter, submitContactForm);

// ✅ Save Post
router.post("/save-post/:blogId", authMiddleware, toggleSavePost);
router.get("/saved-posts", authMiddleware, getSavedPosts);

// ✅ Profile Settings
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.put("/change-password", authMiddleware, changePassword);
router.put("/update-name", authMiddleware, updateName);
router.put("/update-avatar", authMiddleware,upload.single("avatar"), updateAvatar);

// user management
router.get("/users", authMiddleware, adminMiddleware, getAllUsers);
router.put("/users/:id", authMiddleware, adminMiddleware, updateUser);
router.delete("/users/:id", authMiddleware, adminMiddleware, deleteUser);

module.exports = router;
