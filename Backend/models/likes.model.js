const mongoose = require("mongoose");

const LikeSchema = new mongoose.Schema({
  userId: {
     type: mongoose.Schema.Types.ObjectId,
     ref: "User", required: true 
    }, 
  blogId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "Blog" 
    }, 
  commentId: {
     type: mongoose.Schema.Types.ObjectId, 
     ref: "Comment"
    }, 
  createdAt: {
     type: Date,
     default: Date.now
    }
});

module.exports = mongoose.model("Like", LikeSchema);
