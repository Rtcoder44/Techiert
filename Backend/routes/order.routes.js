const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth.middleware');
const {
  createOrder,
  getOrders,
  getOrderById,
  createGuestOrder,
  getGuestOrderByNumber,
  getShopifyOrders,
  getShopifyOrderByNumber,
  createRazorpayOrder,
  handleRazorpaySuccess
} = require('../controllers/order.controller');

// Routes for authenticated users
router.post('/orders', authMiddleware, createOrder);
router.get('/orders', authMiddleware, getOrders);
router.get('/orders/:id', authMiddleware, getOrderById);

// Routes for guest users
router.post('/guest-orders', createGuestOrder);
router.get('/guest-orders/:orderNumber', getGuestOrderByNumber);

// Shopify order routes
router.get('/shopify-orders', authMiddleware, getShopifyOrders);
router.get('/shopify-orders/track/:orderNumber', getShopifyOrderByNumber);

// Razorpay INR payment routes
router.post('/razorpay/create', createRazorpayOrder);
router.post('/razorpay/success', handleRazorpaySuccess);

module.exports = router; 