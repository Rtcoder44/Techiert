const ProductCategory = require('../models/productCategory.model');
const slugify = require('slugify');

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    const slug = slugify(name, { lower: true });

    // Check for duplicate
    const existing = await ProductCategory.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: 'Category already exists.' });
    }

    const category = await ProductCategory.create({ name, slug });
    res.status(201).json({ message: 'Category created successfully.', category });
  } catch (error) {
    console.error('Create Category Error:', error);
    res.status(500).json({ message: 'Server error while creating category.' });
  }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await ProductCategory.find().sort({ createdAt: -1 });
    res.status(200).json({ categories });
  } catch (error) {
    console.error('Fetch Categories Error:', error);
    res.status(500).json({ message: 'Server error while fetching categories.' });
  }
};

// Update a category by ID
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const slug = slugify(name, { lower: true });

    const category = await ProductCategory.findByIdAndUpdate(
      id,
      { name, slug },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    res.status(200).json({ message: 'Category updated successfully.', category });
  } catch (error) {
    console.error('Update Category Error:', error);
    res.status(500).json({ message: 'Server error while updating category.' });
  }
};

// Delete a category by ID
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await ProductCategory.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    res.status(200).json({ message: 'Category deleted successfully.' });
  } catch (error) {
    console.error('Delete Category Error:', error);
    res.status(500).json({ message: 'Server error while deleting category.' });
  }
};
