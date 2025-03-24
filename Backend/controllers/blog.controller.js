const Blog = require("../models/blogs.model");
const User = require("../models/users.model");
const Comment = require("../models/comments.model");
const slugify = require("slugify");

// Create a new blog post (Admin & Author Only)
exports.createBlog = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized. Please log in to create a blog." });
        }

        const { title, category, content } = req.body;
        if (!title || !category || !content) {
            return res.status(400).json({ error: "All fields (title, category, content) are required." });
        }

        const slug = slugify(title, { lower: true });
        
        const newBlog = new Blog({
            title,
            category,
            content,
            slug,
            author: req.user._id,
        });

        // Handle File Upload (if image exists)
        if (req.file) {
            newBlog.coverImage = `/uploads/${req.file.filename}`;
        }

        await newBlog.save();

        res.status(201).json({ message: "Blog published successfully", blog: newBlog });

    } catch (error) {
        console.error("Error creating blog:", error);
        res.status(500).json({ error: "Internal server error. Please try again later." });
    }
};

// Get all blogs
exports.getAllBlogs = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "", category, tags } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { content: { $regex: search, $options: "i" } },
            ];
        }

        if (category) query.category = category;
        if (tags) query.tags = { $in: tags.split(",") };

        const totalBlogs = await Blog.countDocuments(query);
        const blogs = await Blog.find(query)
            .populate("author", "name")
            .populate("category", "name")
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .sort({ createdAt: -1 });

        res.status(200).json({
            totalBlogs,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalBlogs / limit),
            blogs,
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single blog post by ID or Slug
exports.getBlogById = async (req, res) => {
    try {
        const { id } = req.params;

        const blog = await Blog.findOneAndUpdate(
            { $or: [{ _id: id }, { slug: id }] },
            { $inc: { views: 1 } },
            { new: true }
        )
            .populate("author", "name")
            .populate("category", "name")
            .lean();

        if (!blog) return res.status(404).json({ error: "Blog not found" });

        res.status(200).json(blog);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

// Update a Blog Post (Admin or Author Only)
exports.updateBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ error: "Blog not found" });

        if (req.user.role !== "admin" && req.user._id.toString() !== blog.author.toString()) {
            return res.status(403).json({ error: "You can only update your own blogs" });
        }

        if (req.body.slug) {
            const existingBlog = await Blog.findOne({ slug: req.body.slug });
            if (existingBlog && existingBlog._id.toString() !== req.params.id) {
                return res.status(400).json({ error: "Slug already in use" });
            }
        }

        const updatedData = { ...req.body };
        if (req.file) updatedData.coverImage = req.file.path;

        const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, updatedData, { new: true });

        res.status(200).json({ message: "Blog Updated Successfully", blog: updatedBlog });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a Blog Post (Admin or Author Only)
exports.deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ error: "Blog not found" });

        if (req.user.role !== "admin" && req.user._id.toString() !== blog.author.toString()) {
            return res.status(403).json({ error: "You can only delete your own blogs" });
        }

        await Blog.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Blog Deleted Successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Like or Unlike a Blog Post (User Only)
exports.likeBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ error: "Blog not found" });

        const hasLiked = blog.likes.includes(req.user.id);

        if (hasLiked) {
            blog.likes.pull(req.user.id);
            await blog.save();
            return res.status(200).json({ message: "Blog Unliked", likes: blog.likes.length });
        }

        blog.likes.push(req.user.id);
        await blog.save();
        res.status(200).json({ message: "Blog Liked", likes: blog.likes.length });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Save or Update Draft
exports.saveDraft = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, category, tags, coverImage } = req.body;
        const author = req.user.id;

        const blogData = { title, content, category, tags, coverImage, author, status: "draft", updatedAt: Date.now() };

        const blog = id
            ? await Blog.findOneAndUpdate({ _id: id, author, status: "draft" }, blogData, { new: true, upsert: true })
            : await new Blog(blogData).save();

        res.status(200).json({ message: "Draft saved", blog });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get latest draft
exports.getLatestDraft = async (req, res) => {
    try {
        const latestDraft = await Blog.findOne({ status: "draft", author: req.user._id }).sort({ updatedAt: -1 });

        if (!latestDraft) return res.status(404).json({ message: "No draft found" });

        res.json(latestDraft);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};


exports.commentOnBlog = async (req, res) => {
    try {
        const { blogId } = req.params;
        const { commentText } = req.body;

        // Check if user is logged in
        if (!req.user) {
            return res.status(401).json({ error: "You must be logged in to comment" });
        }

        // Check if the blog exists
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ error: "Blog not found" });
        }

        // Create a new comment
        const newComment = new Comment({
            text: commentText,
            user: req.user._id,
            blog: blogId
        });

        await newComment.save();

        // Push comment ID to blog's comments array
        blog.comments.push(newComment._id);
        await blog.save();

        // Populate comment with user details
        await newComment.populate("user", "name");

        res.status(201).json({ message: "Comment added successfully", comment: newComment });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
