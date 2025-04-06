const Category = require("../models/categories.model");
const Blog = require("../models/blogs.model"); // Import Blog model
const slugify = require("slugify");

// ✅ Create a new category (Admin Only)
const createCategory = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Admin Access Only" });
        }

        const { name } = req.body;
        if (!name) return res.status(400).json({ error: "Category name is required" });

        // 🔹 Normalize name and slug
        const categoryName = name.trim().toLowerCase();
        const slug = slugify(categoryName, { lower: true, strict: true });

        // 🔹 Check if category already exists
        const existingCategory = await Category.findOne({ slug });
        if (existingCategory) {
            return res.status(400).json({ error: "Category already exists" });
        }

        const category = new Category({ name: categoryName, slug });
        await category.save();

        res.status(201).json({ message: "Category created successfully", category });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Get all categories
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({}, "_id name slug");
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Update category (Admin Only)
const updateCategory = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Admin Access Only" });
        }

        const { id } = req.params;
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: "Category name is required" });

        const slug = slugify(name.trim().toLowerCase(), { lower: true, strict: true });

        const updatedCategory = await Category.findByIdAndUpdate(id, { name, slug }, { new: true });
        if (!updatedCategory) return res.status(404).json({ error: "Category not found" });

        res.status(200).json({ message: "Category updated successfully", category: updatedCategory });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Delete category (Admin Only, Check if blogs exist)
const deleteCategory = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Admin Access Only" });
        }

        const { id } = req.params;

        // 🔹 Check if any blog is using this category
        const blogsUsingCategory = await Blog.findOne({ category: id });
        if (blogsUsingCategory) {
            return res.status(400).json({ error: "Cannot delete. Category is in use." });
        }

        const deletedCategory = await Category.findByIdAndDelete(id);
        if (!deletedCategory) return res.status(404).json({ error: "Category not found" });

        res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🔹 Get blogs by category slug
const getBlogsByCategorySlug = async (req, res) => {
    try {
      const { slug } = req.params;
  
      // Find the category with the given slug
      const category = await Category.findOne({ slug });
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
  
      // Find blogs that belong to this category
      const blogs = await Blog.find({ category: category._id })
        .populate("category", "name slug")
        .populate("author", "name");
  
      res.status(200).json(blogs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  // ✅ Get all categories with their blogs
  const getAllCategoriesWithBlogs = async (req, res) => {
    try {
      const categories = await Category.find({}, "_id name slug");
  
      const categoriesWithBlogs = await Promise.all(
        categories.map(async (category) => {
          if (process.env.NODE_ENV !== "production") {
            console.log("📂 Checking category:", category.name);
          }
  
          const blogs = await Blog.find({ category: category._id, status: "published" })
            .populate("author", "name")
            .populate("category", "name slug")
            .populate("tags", "name slug")
            .sort({ createdAt: -1 });
  
          if (process.env.NODE_ENV !== "production") {
            console.log(`📝 Found ${blogs.length} blogs for category: ${category.name}`);
          }
  
          return {
            ...category._doc,
            blogs,
          };
        })
      );
  
      const filtered = categoriesWithBlogs.filter((cat) => cat.blogs.length > 0);
  
      res.status(200).json(filtered);
    } catch (error) {
      console.error("❌ Error fetching categories with blogs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  module.exports = { createCategory, getAllCategories, updateCategory, deleteCategory, getBlogsByCategorySlug, getAllCategoriesWithBlogs};  