const express = require('express');
const router = express.Router();
// Simple ping for debugging route registration
router.get('/_ping', (req, res) => {
  res.json({ ok: true, route: 'products' });
});
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

// Public routes (mounted at /api/products)
router.get('/', getAllProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProduct);

// Admin only routes
router.post('/', authMiddleware, adminMiddleware, upload.array('images', 5), createProduct);
router.put('/:id', authMiddleware, adminMiddleware, upload.array('images', 5), updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProduct);

// Review routes
router.get('/:id/reviews', getProductReviews);
router.post('/:id/reviews', authMiddleware, addReview);
router.put('/:id/reviews', authMiddleware, updateReview);
router.delete('/:id/reviews', authMiddleware, deleteReview);

// Like routes
router.post('/slug/:slug/like', authMiddleware, toggleLike);

module.exports = router; 