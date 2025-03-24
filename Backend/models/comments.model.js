const mongoose = require("mongoose");


const commentSchema = new mongoose.Schema({
    blogId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Blog",
        required: true,
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    comment:{
        type:String,
        required:true
    },
    likes: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: "Like"
     }],
     createdAt: { 
        type: Date,
         default: Date.now
     }

})


module.exports = mongoose.model("Comment", commentSchema);