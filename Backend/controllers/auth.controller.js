const User = require("../models/users.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Blog = require("../models/blogs.model");

const isProduction = process.env.NODE_ENV === "production";

// ✅ Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { _id: user._id, role: user.role },  // ✅ Ensuring `_id` is correctly used
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ✅ User Signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("🔍 Signup request received:", { name, email });

    let user = await User.findOne({ email });
    if (user) {
      console.log("❌ User already exists");
      return res.status(400).json({ error: "User already exists" });
    }

    const avatarUrl = req.file ? req.file.path : "https://via.placeholder.com/200";

    user = new User({ name, email, password, avatar: avatarUrl });
    await user.save();

    const token = generateToken(user);

    // ✅ Set HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction, 
      sameSite: isProduction ? "Strict" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    console.log("✅ User Created Successfully:", user);

    res.status(201).json({
      success: true,
      message: "User Created Successfully!",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error("❌ Signup Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ User Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("🔍 Login attempt:", { email });

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      console.log("❌ Invalid email");
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Invalid password");
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true, 
      secure: isProduction,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    console.log("✅ Login Successful:", { _id: user._id, role: user.role });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// user management 
//get user
// Get all users with pagination and optional role-based filtering
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const roleFilter = req.query.role;

    const filter = roleFilter ? { role: roleFilter } : {};

    const totalUsers = await User.countDocuments(filter);

    const users = await User.find(filter)
      .select("-password")
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .sort({ createdAt: -1 });

    res.status(200).json({
      users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / pageSize),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error while fetching users." });
  }
};


// Update User

exports.updateUser = async (req, res) => {
  const{role} = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, {role}, {new: true});
  res.status(200).json(user);
};

// Delete User

exports.deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  res.status(200).json(user);
}


// ✅ User Logout
exports.logout = (req, res) => {
  console.log("🔍 Logout request received");

  res.clearCookie("token");
  console.log("✅ User logged out");
  res.json({ success: true, message: "Logged out successfully!" });
};

// ✅ Get Authenticated User
exports.getMe = async (req, res) => {
  try {
    console.log("🔍 Fetching authenticated user:", req.user);

    if (!req.user || !req.user._id) {
      console.log("❌ Not authorized");
      return res.status(401).json({ success: false, error: "Not authorized" });
    }

    // ✅ Populate savedPosts to access post IDs/titles in frontend
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("savedPosts", "_id title slug"); // Add other fields if needed

    if (!user) {
      console.log("❌ User not found");
      return res.status(404).json({ success: false, error: "User not found" });
    }

    console.log("✅ Authenticated user fetched:", user);
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("❌ Error in getMe:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};


// ✅ Get profile data for settings page
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("❌ Error in getProfile:", err.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ✅ Update profile (name or avatar)
exports.updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
    });
  } catch (err) {
    console.error("❌ Error updating profile:", err.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Change password controller (for logged-in users)
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user._id; // Provided by authMiddleware
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Both current and new password are required." });
    }

    const user = await User.findById(userId).select("+password");
    if (!user) return res.status(404).json({ error: "User not found." });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ error: "Current password is incorrect." });

    user.password = newPassword; // Will be hashed by pre-save middleware
    await user.save();

    res.status(200).json({ message: "Password changed successfully." });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: "Server error. Try again later." });
  }
};
// Update user name (for logged-in users)
// Update user name (for logged-in users)
exports.updateName = async (req, res) => {
  try {
    const userId = req.user._id; // Make sure your middleware sets this
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: "Name is required." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    user.name = name;
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshToken;

    res.status(200).json({
      message: "Name updated successfully",
      user: userObj,
    });
  } catch (err) {
    console.error("Update name error:", err);
    res.status(500).json({ error: "Server error. Try again later." });
  }
};

// controllers/userController.js
exports.updateAvatar = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const imageUrl = req.file.path; // ✅ Cloudinary gives full URL

    const user = await User.findByIdAndUpdate(
      userId,
      { avatar: imageUrl },
      { new: true }
    ).select("-password");

    res.status(200).json({
      message: "Avatar updated successfully",
      user,
    });
  } catch (err) {
    console.error("Avatar update error:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
};




// save post 
// controllers/auth.controller.js
exports.toggleSavePost  = async (req, res) => {
  try {
    const userId = req.user._id;
    const { blogId } = req.params;

    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    const alreadySaved = user.savedPosts.includes(blogId);

    if (alreadySaved) {
      user.savedPosts.pull(blogId);
    } else {
      user.savedPosts.push(blogId);
    }

    await user.save();

    res.status(200).json({ saved: !alreadySaved });
  } catch (error) {
    console.error("Toggle save post error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getSavedPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate({
      path: "savedPosts",
      populate: { path: "author category tags" },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ savedPosts: user.savedPosts });
  } catch (error) {
    console.error("Error fetching saved posts:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};


