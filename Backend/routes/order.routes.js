const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth.middleware');
const {
  createOrder,
  getOrders,
  getOrderById,
  createGuestOrder,
  getGuestOrderByNumber
} = require('../controllers/order.controller');

// Routes for authenticated users
router.post('/orders', authMiddleware, createOrder);
router.get('/orders', authMiddleware, getOrders);
router.get('/orders/:id', authMiddleware, getOrderById);

// Routes for guest users
router.post('/guest-orders', createGuestOrder);
router.get('/guest-orders/:orderNumber', getGuestOrderByNumber);

module.exports = router; 