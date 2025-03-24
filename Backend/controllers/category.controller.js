const Category = require("../models/categories.model");

const createCategory = async (req, res) => {
    try {
        if (req.user.role !== "admin") return res.status(403).json({ error: "Admin Access Only" });

        const { name } = req.body;
        if (!name) return res.status(400).json({ error: "Category name is required" });

        const existingCategory = await Category.findOne({ name });
        if (existingCategory) return res.status(400).json({ error: "Category already exists" });

        const category = new Category({ name });
        await category.save();

        res.status(201).json({ message: "Category created successfully", category });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateCategory = async (req, res) => {
    try {
        if (req.user.role !== "admin") return res.status(403).json({ error: "Admin Access Only" });

        const { id } = req.params;
        const { name } = req.body;

        const updatedCategory = await Category.findByIdAndUpdate(id, { name }, { new: true });
        if (!updatedCategory) return res.status(404).json({ error: "Category not found" });

        res.status(200).json({ message: "Category updated successfully", category: updatedCategory });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteCategory = async (req, res) => {
    try {
        if (req.user.role !== "admin") return res.status(403).json({ error: "Admin Access Only" });

        const { id } = req.params;
        const deletedCategory = await Category.findByIdAndDelete(id);
        if (!deletedCategory) return res.status(404).json({ error: "Category not found" });

        res.status(200).json({ message: "Category deleted successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory
};
