const express = require("express");
const{
    signup,
    login,
    logout,
    getMe,
    forgotPassword,
    resetPassword,} = require("../controllers/auth.controller");
const {authMiddleware} = require("../middlewares/auth.middleware");
const upload = require("../middlewares/multer")
const router = express.Router();

router.post("/signup",upload.single("avatar"), signup);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.get("/me", authMiddleware, getMe);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);


module.exports = router;