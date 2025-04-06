const mongoose = require("mongoose");
const slugify = require("slugify");

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    slug: {
        type: String,
        unique: true
    },
    content: {
        type: String,
        required: true
    },
    coverImage: {
        type: String, // URL of featured image
        default: ""
    },
    category: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    }],
    tags: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag"
    }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }],
    views: {
        type: Number,
        default: 0
    },
   status: { 
    type: String, 
    enum: ["private", "published", "draft"], 
    default: "draft" 
},

    metaTitle: {
        type: String,
        required: true
    },
    metaDescription: {
        type: String,
        required: true
    },
    permalink: {
        type: String,
        required: true,
        unique: true
    },
    publishedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Generate slug before saving
blogSchema.pre("save", function (next) {
    if (this.isModified("title") || this.isNew) {
        this.slug = slugify(this.title, { lower: true, strict: true });
        this.permalink = `/blog/${this.slug}`;
    }
    next();
});

module.exports = mongoose.model("Blog", blogSchema);
