const express = require('express');
const router = express.Router();

const {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory
} = require('../controllers/productCategory.controller');

const {
  authMiddleware,
  adminMiddleware
} = require('../middlewares/auth.middleware'); // adjust path if needed

// 🟢 Public Route - Get all categories
router.get('/', getAllCategories);

// 🔒 Admin Protected Routes
router.post('/', authMiddleware, adminMiddleware, createCategory);
router.put('/:id', authMiddleware, adminMiddleware, updateCategory);
router.delete('/:id', authMiddleware, adminMiddleware, deleteCategory);

module.exports = router;
