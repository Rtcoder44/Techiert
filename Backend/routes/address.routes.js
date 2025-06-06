const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth.middleware');
const {
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} = require('../controllers/address.controller');

// All routes require authentication
router.use(authMiddleware);

// Routes
router.post('/addresses', addAddress);
router.get('/addresses', getAddresses);
router.put('/addresses/:id', updateAddress);
router.delete('/addresses/:id', deleteAddress);
router.put('/addresses/:id/default', setDefaultAddress);

module.exports = router; 