const Tag = require("../models/tags.model");
const Blog = require("../models/blogs.model"); // Import Blog model
const slugify = require("slugify");

// ✅ Create a new tag (Admin Only)
const createTag = async (req, res) => {
    try {
        if (req.user.role !== "admin") return res.status(403).json({ error: "Admin Access Only" });

        const { name } = req.body;
        if (!name) return res.status(400).json({ error: "Tag name is required" });

        // 🔹 Normalize name and slug
        const tagName = name.trim().toLowerCase();
        const slug = slugify(tagName, { lower: true, strict: true });

        // 🔹 Check if tag already exists
        const existingTag = await Tag.findOne({ slug });
        if (existingTag) return res.status(400).json({ error: "Tag already exists" });

        const tag = new Tag({ name: tagName, slug });
        await tag.save();

        res.status(201).json({ message: "Tag created successfully", tag });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Get all tags
const getAllTags = async (req, res) => {
    try {
        const tags = await Tag.find({}, "_id name slug");
        res.status(200).json(tags);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Update tag (Admin Only)
const updateTag = async (req, res) => {
    try {
        if (req.user.role !== "admin") return res.status(403).json({ error: "Admin Access Only" });

        const { id } = req.params;
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: "Tag name is required" });

        const slug = slugify(name.trim().toLowerCase(), { lower: true, strict: true });

        const updatedTag = await Tag.findByIdAndUpdate(id, { name, slug }, { new: true });
        if (!updatedTag) return res.status(404).json({ error: "Tag not found" });

        res.status(200).json({ message: "Tag updated successfully", tag: updatedTag });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Delete tag (Admin Only, Check if blogs exist)
const deleteTag = async (req, res) => {
    try {
        if (req.user.role !== "admin") return res.status(403).json({ error: "Admin Access Only" });

        const { id } = req.params;

        // 🔹 Check if any blog is using this tag
        const blogsUsingTag = await Blog.findOne({ tags: id });
        if (blogsUsingTag) {
            return res.status(400).json({ error: "Cannot delete. Tag is in use." });
        }

        const deletedTag = await Tag.findByIdAndDelete(id);
        if (!deletedTag) return res.status(404).json({ error: "Tag not found" });

        res.status(200).json({ message: "Tag deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createTag, getAllTags, updateTag, deleteTag };
