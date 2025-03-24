const User = require("../models/users.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const isProduction = process.env.NODE_ENV === "production";

// ✅ Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ✅ User Signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });

    if (user) return res.status(400).json({ error: "User already exists" });
    const avatarUrl = req.file ? req.file.path : "https://via.placeholder.com/200";

    user = new User({ name, email, password,avatar: avatarUrl });
    await user.save();

    // Set HTTP-only cookie
    res.cookie("token", generateToken(user), {
      httpOnly: true,
      secure: isProduction, // ✅ Only secure in production
      sameSite: isProduction ? "Strict" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.json({ message: "✅ User Created Successfully!", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ User Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user) return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid Credentials" });

    res.cookie("token", generateToken(user), {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "Strict" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "✅ Login Successful!",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar, // ✅ Ensure avatar is included
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ✅ User Logout
exports.logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "✅ Logged Out Successfully!" });
};

// ✅ Get Authenticated User
exports.getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authorized" });
    }

    // Fetch the user details from the database (excluding password)
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user); // ✅ Return full user details including avatar
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ✅ Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ error: "User not found" });

    // Generate a password reset token
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken: process.env.GOOGLE_ACCESS_TOKEN,
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Reset Your Password",
      html: `<p>Click the link below to reset your password:</p>
             <a href="${process.env.CLIENT_URL}/reset-password/${resetToken}">Reset Password</a>
             <p>This link will expire in 15 minutes.</p>`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "✅ Password reset link sent to your email" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Reset Password

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    // Verify the reset token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(400).json({ error: "User not found" });

    // ✅ Always hash the new password before saving
    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();
    

    res.json({ message: "✅ Password reset successful" });

  } catch (error) {
   
    res.status(500).json({ error: error.message });
  }
};
