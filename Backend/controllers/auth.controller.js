const User = require("../models/users.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Blog = require("../models/blogs.model");
const { google } = require("googleapis");
const nodemailer = require("nodemailer");
const Contact = require("../models/contacts.model");
const validator = require("validator");
const crypto = require("crypto");
const { setCache, getCache,deleteUserListCache } = require("../utils/redisClient"); // Assuming Redis utility functions


const isProduction = process.env.NODE_ENV === "production";

// ✅ Generate JWT Token
const generateToken = (user) => {
  const expiresIn = process.env.JWT_EXPIRATION || "7d"; // Fallback to "7d"
  if (!process.env.JWT_SECRET) {
    throw new Error("❌ JWT_SECRET is missing from environment variables.");
  }

  return jwt.sign(
    { _id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};


// ✅ User Signup with Redis Caching
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("🔍 Signup request received:", { name, email });

    // Check if the user is cached in Redis
    const cachedUser = await getCache(`user:${email.toLowerCase()}`);
    if (cachedUser) {
      console.log("❌ User already exists in Redis cache");
      return res.status(400).json({ error: "User already exists" });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Check if user exists in the database
    let user = await User.findOne({ email });
    if (user) {
      console.log("❌ User already exists in database");
      return res.status(400).json({ error: "User already exists" });
    }

    // Ensure a default avatar if not uploaded
    const avatarUrl = req.file ? req.file.path : "https://via.placeholder.com/200";

    // Create new user and hash the password
    user = new User({ name, email, password, avatar: avatarUrl });
    user.password = await bcrypt.hash(password, 10); // Hash password

    // Save the user to the database
    await user.save();

    // Cache the user in Redis with a TTL (e.g., 1 hour)
    await setCache(`user:${email.toLowerCase()}`, user, 3600); // Cache for 1 hour

    // Generate JWT token
    const token = generateToken(user);

    // Set the token as a cookie (HTTP-only, secure in production)
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction, // Only secure in production
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
        avatar: user.avatar,
      },
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

    // Check if the user is cached in Redis
    const cachedUser = await getCache(`user:${email.toLowerCase()}`);
    let user;

    if (cachedUser) {
      console.log("✅ User found in Redis cache.");
      user = cachedUser;
    } else {
      console.log("❌ User not found in Redis cache, querying database.");
      // User not found in Redis, fetch from DB
      user = await User.findOne({ email }).select("+password");
      
      if (!user) {
        console.log("❌ Invalid email");
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Cache the user data in Redis for future login attempts
      await setCache(`user:${email.toLowerCase()}`, user, 3600); // Cache for 1 hour
    }

    // Compare the password if the user is found
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Invalid password");
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Set the token as a cookie (HTTP-only, secure in production)
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction, // Only secure in production
      sameSite: isProduction ? "None" : "Lax", // "None" for cross-domain in production, "Lax" is fine for local dev
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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

    // Generate a unique cache key
    const cacheKey = `users:${page}:${pageSize}:${roleFilter || "all"}`;

    // Check if data is in Redis cache
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      console.log("✅ Returning cached user list from Redis.");
      return res.status(200).json(cachedData);
    }

    // If not cached, fetch from DB
    const totalUsers = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select("-password")
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .sort({ createdAt: -1 });

    const responseData = {
      users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / pageSize),
      currentPage: page,
    };

    // Store in Redis for future requests
    await setCache(cacheKey, responseData, 3600); // TTL: 1 hour

    console.log("✅ User list fetched from DB and cached.");
    res.status(200).json(responseData);
  } catch (error) {
    console.error("❌ Error in getAllUsers:", error);
    res.status(500).json({ message: "Server error while fetching users." });
  }
};



// Update User

exports.updateUser = async (req, res) => {
  try {
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Clear individual user cache and paginated user list cache
    await setCache(`user:${user._id}`, null); // Optional cleanup
    await deleteUserListCache(); // Invalidate paginated user list cache

    res.status(200).json(user);
  } catch (error) {
    console.error("❌ Error updating user:", error);
    res.status(500).json({ error: "Internal server error while updating user." });
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Clear individual user cache and paginated user list cache
    await setCache(`user:${user._id}`, null); // Optional cleanup
    await deleteUserListCache(); // Invalidate paginated user list cache

    res.status(200).json({ message: "User deleted successfully", user });
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    res.status(500).json({ error: "Internal server error while deleting user." });
  }
};


// ✅ User Logout
exports.logout = (req, res) => {
  console.log("🔍 Logout request received");

  // Clear the cookie (effectively logging out the user)
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,                             // Must match the `res.cookie` secure option
    sameSite: isProduction ? "None" : "Lax",          // Must match how it was originally set
  });

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

    const cacheKey = `user:${req.user._id}`;

    // Check Redis cache first
    const cachedUser = await getCache(cacheKey);
    if (cachedUser && Array.isArray(cachedUser.savedPosts)) {
      console.log("✅ Found user data in Redis cache");
      return res.status(200).json({ success: true, data: cachedUser });
    }

    // Fetch from DB with populated savedPosts
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("savedPosts", "_id title slug");

    if (!user) {
      console.log("❌ User not found");
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Convert to plain object before caching to avoid Mongoose serialization issues
    const userObject = user.toObject();

    // Cache for 1 hour
    await setCache(cacheKey, userObject, 3600);

    console.log("✅ Authenticated user fetched and cached:", userObject);
    return res.status(200).json({ success: true, data: userObject });

  } catch (error) {
    console.error("❌ Error in getMe:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};


// ✅ Get profile data for settings page
exports.getProfile = async (req, res) => {
  try {
    // Fetch the user profile from the database
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

    // Fetch the user from the database
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update profile fields
    if (name) user.name = name;
    if (avatar) user.avatar = avatar;

    // Save the updated user data
    const updatedUser = await user.save();

    // Return the updated user data
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


exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ error: "User not found" });

    // Generate raw and hashed tokens
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    // Set token and expiration
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Choose frontend URL based on environment
    const frontendUrl = process.env.NODE_ENV === "production"
      ? "https://techiert.vercel.app"
      : process.env.CLIENT_URL;

    const resetUrl = `${frontendUrl}/reset-password/${rawToken}`;

    // Email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      },
    });

    const mailOptions = {
      from: `"Techiert" <${process.env.EMAIL}>`,
      to: user.email,
      subject: "Reset Your Password",
      html: `
        <p>Hello ${user.name || "User"},</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="color:#1D4ED8;">Reset Password</a>
        <p>This link will expire in 15 minutes.</p>
        <p>If the link doesn't work, copy and paste this into your browser:</p>
        <p>${resetUrl}</p>
        <hr />
        <p>— The Techiert Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "✅ Password reset link sent to your email" });

  } catch (error) {
    console.error("❌ Error sending reset email:", error);
    res.status(500).json({ error: "Something went wrong. Try again later." });
  }
};


 
 // ✅ Reset Password
 
 exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ error: "Invalid or expired token" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    // Optional: Send confirmation email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      },
    });

    const mailOptions = {
      from: `"Techiert" <${process.env.EMAIL}>`,
      to: user.email,
      subject: "Password Changed Successfully",
      html: `
        <p>Hello ${user.name || "User"},</p>
        <p>Your password was successfully changed.</p>
        <p>If you did not perform this action, please contact support immediately.</p>
        <hr />
        <p>— The Techiert Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "✅ Password reset successful" });
  } catch (error) {
    console.error("❌ Reset password error:", error);
    res.status(500).json({ error: "Internal server error" });
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
exports.toggleSavePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { blogId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const blogIdStr = blogId.toString();
    const alreadySaved = user.savedPosts.some(
      (id) => id.toString() === blogIdStr
    );

    if (alreadySaved) {
      user.savedPosts.pull(blogIdStr);
    } else {
      user.savedPosts.push(blogIdStr);
    }

    await user.save();

    // ❌ Invalidate cached user
    await delCache(`user:${userId}`);

    return res.status(200).json({ saved: !alreadySaved });
  } catch (error) {
    console.error("Toggle save post error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
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

//contact us form 

// OAuth2 config
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

async function sendContactEmail({ name, email, message }) {
  const accessToken = await oAuth2Client.getAccessToken();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      accessToken: accessToken.token,
    },
  });

  // Email to Admin
  const adminMailOptions = {
    from: `"${name}" <${email}>`,
    to: process.env.EMAIL,
    subject: "New Contact Form Submission",
    html: `
      <h3>New Message from Contact Form</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  };

  // Thank-you Email to User
  const userMailOptions = {
    from: `"Techiert Team" <${process.env.EMAIL}>`,
    to: email,
    subject: "Thanks for contacting Techiert!",
    html: `
      <p>Hi ${name},</p>
      <p>Thanks for reaching out to us. We'll get back to you as soon as possible.</p>
      <p><strong>Your Message:</strong></p>
      <blockquote>${message}</blockquote>
      <br>
      <p>Regards,<br>Techiert Team</p>
    `,
  };

  await transporter.sendMail(adminMailOptions);
  await transporter.sendMail(userMailOptions);
}

// 📨 Main form handler
exports.submitContactForm = async (req, res) => {
  try {
    let { name, email, message } = req.body;

    // Validate fields
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: "All fields are required." });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, error: "Invalid email address." });
    }

    // Sanitize input
    name = validator.escape(name.trim());
    email = validator.normalizeEmail(email);
    message = validator.escape(message.trim());

    // Save to DB
    const contactMessage = new Contact({ name, email, message });
    await contactMessage.save();

    // Async email send
    sendContactEmail({ name, email, message }).catch((emailErr) =>
      console.error("❌ Email sending failed:", emailErr)
    );

    res.status(200).json({
      success: true,
      message: "Message received! We'll get back to you shortly.",
    });
  } catch (error) {
    console.error("❌ Error in submitContactForm:", error);
    res.status(500).json({
      success: false,
      error: "Something went wrong. Please try again later.",
    });
  }
};
