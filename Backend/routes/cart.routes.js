const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth.middleware');
const {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart,
  syncGuestCart
} = require('../controllers/cart.controller');

// All routes require authentication
router.use(authMiddleware);

// Get user's cart
router.get('/', getCart);

// Add item to cart
router.post('/add', addToCart);

// Remove item from cart
router.delete('/item/:variantId', removeFromCart);

// Update item quantity
router.put('/item/:variantId', updateCartItem);

// Clear cart
router.delete('/', clearCart);

// Sync guest cart with user cart
router.post('/sync', syncGuestCart);

module.exports = router; 