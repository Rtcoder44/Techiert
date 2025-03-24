const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: ""
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// ✅ Hash Password Before Saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password") || this.password.startsWith("$2b$")) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// ✅ Compare Passwords Securely
userSchema.methods.comparePassword = function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

// ✅ Helper Method: Check If User Is Admin
userSchema.methods.isAdmin = function () {
    return this.role === "admin";
};

module.exports = mongoose.model("User", userSchema);
