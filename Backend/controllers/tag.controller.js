const Tag = require("../models/tags.model");

const createTag = async (req, res) => {
    try {
        if (req.user.role !== "admin") return res.status(403).json({ error: "Admin Access Only" });

        const { name } = req.body;
        if (!name) return res.status(400).json({ error: "Tag name is required" });

        const existingTag = await Tag.findOne({ name });
        if (existingTag) return res.status(400).json({ error: "Tag already exists" });

        const tag = new Tag({ name });
        await tag.save();

        res.status(201).json({ message: "Tag created successfully", tag });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllTags = async (req, res) => {
    try {
        const tags = await Tag.find();
        res.status(200).json(tags);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateTag = async (req, res) => {
    try {
        if (req.user.role !== "admin") return res.status(403).json({ error: "Admin Access Only" });

        const { id } = req.params;
        const { name } = req.body;

        const updatedTag = await Tag.findByIdAndUpdate(id, { name }, { new: true });
        if (!updatedTag) return res.status(404).json({ error: "Tag not found" });

        res.status(200).json({ message: "Tag updated successfully", tag: updatedTag });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteTag = async (req, res) => {
    try {
        if (req.user.role !== "admin") return res.status(403).json({ error: "Admin Access Only" });

        const { id } = req.params;
        const deletedTag = await Tag.findByIdAndDelete(id);
        if (!deletedTag) return res.status(404).json({ error: "Tag not found" });

        res.status(200).json({ message: "Tag deleted successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createTag,
    getAllTags,
    updateTag,
    deleteTag
};
