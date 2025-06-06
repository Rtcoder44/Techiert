const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/multer');
const {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductBySlug,
  getProductReviews,
  addReview,
  updateReview,
  deleteReview,
  toggleLike
} = require('../controllers/product.controller');

// Public routes
router.get('/products', getAllProducts);
router.get('/products/:slug', getProductBySlug);

// Admin only routes
router.post('/products', authMiddleware, adminMiddleware, upload.array('images', 5), createProduct);
router.put('/products/:id', authMiddleware, adminMiddleware, upload.array('images', 5), updateProduct);
router.delete('/products/:id', authMiddleware, adminMiddleware, deleteProduct);

// Review routes
router.get('/products/:id/reviews', getProductReviews);
router.post('/products/:id/reviews', authMiddleware, addReview);
router.put('/products/:id/reviews', authMiddleware, updateReview);
router.delete('/products/:id/reviews', authMiddleware, deleteReview);

// Like routes
router.post('/products/:slug/like', authMiddleware, toggleLike);

module.exports = router; 