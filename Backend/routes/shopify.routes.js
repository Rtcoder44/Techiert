const express = require('express');
const router = express.Router();
const shopifyService = require('../services/shopify.service');
const { authMiddleware } = require('../middlewares/auth.middleware');
const Order = require('../models/order.model');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Shopify routes are working' });
});

// Get all collections
router.get('/collections', async (req, res) => {
  try {
    const collections = await shopifyService.fetchCollections();
    res.json(collections);
  } catch (error) {
    console.error('Error in /collections route:', error);
    if (error.message.includes('Missing required Shopify environment variables')) {
      return res.status(503).json({
        error: 'Shopify service is not configured',
        message: 'Please check your environment variables'
      });
    }
    res.status(500).json({ 
      error: 'Failed to fetch collections',
      message: error.message 
    });
  }
});

// Get products by collection
router.get('/collections/:collectionId/products', async (req, res) => {
  try {
    const { collectionId } = req.params;
    const products = await shopifyService.fetchProducts({ collectionId });
    res.json(products);
  } catch (error) {
    console.error('Error in /collections/:collectionId/products route:', error);
    if (error.message.includes('Missing required Shopify environment variables')) {
      return res.status(503).json({
        error: 'Shopify service is not configured',
        message: 'Please check your environment variables'
      });
    }
    res.status(500).json({ 
      error: 'Failed to fetch collection products',
      message: error.message 
    });
  }
});

// Get all products
router.get('/products', async (req, res) => {
  try {
    const { search, sort, page, limit } = req.query;
    const products = await shopifyService.fetchProducts({
      search,
      sort,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 12
    });
    res.json({ success: true, products });
  } catch (error) {
    console.error('Error in /products route:', error);
    if (error.message.includes('Missing required Shopify environment variables')) {
      return res.status(503).json({
        error: 'Shopify service is not configured',
        message: 'Please check your environment variables'
      });
    }
    res.status(500).json({ 
      error: 'Failed to fetch products',
      message: error.message 
    });
  }
});

// Get single product
router.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await shopifyService.fetchProduct(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error in /products/:id route:', error);
    if (error.message.includes('Missing required Shopify environment variables')) {
      return res.status(503).json({
        error: 'Shopify service is not configured',
        message: 'Please check your environment variables'
      });
    }
    res.status(500).json({ 
      error: 'Failed to fetch product',
      message: error.message 
    });
  }
});

// Get product by handle (slug)
router.get('/products/handle/:handle', async (req, res) => {
  try {
    const product = await shopifyService.fetchProductByHandle(req.params.handle);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create checkout
router.post('/checkout', async (req, res) => {
  try {
    const { items, shippingAddress, email } = req.body;
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid items array' });
    }
    // Pass shippingAddress and email for future use, even if not used now
    const checkout = await shopifyService.createCheckout(items, shippingAddress, email);
    res.json(checkout);
  } catch (error) {
    console.error('Error in /checkout route:', error);
    if (error.message.includes('Missing required Shopify environment variables')) {
      return res.status(503).json({
        error: 'Shopify service is not configured',
        message: 'Please check your environment variables'
      });
    }
    res.status(500).json({ 
      error: 'Failed to create checkout',
      message: error.message 
    });
  }
});

// Handle webhooks
router.post('/webhooks/orders', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-shopify-hmac-sha256'];
    const isValid = shopifyService.verifyWebhookSignature(req.body, signature);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const orderData = JSON.parse(req.body.toString());
    const order = await Order.findOneAndUpdate(
      { shopifyOrderId: orderData.id },
      {
        shopifyOrderId: orderData.id,
        status: orderData.financial_status,
        total: orderData.total_price,
        items: orderData.line_items.map(item => ({
          productId: item.product_id,
          variantId: item.variant_id,
          title: item.title,
          quantity: item.quantity,
          price: item.price
        }))
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: 'Webhook processed successfully', order });
  } catch (error) {
    console.error('Error in /webhooks/orders route:', error);
    if (error.message.includes('Missing required Shopify environment variables')) {
      return res.status(503).json({
        error: 'Shopify service is not configured',
        message: 'Please check your environment variables'
      });
    }
    res.status(500).json({ 
      error: 'Failed to process webhook',
      message: error.message 
    });
  }
});

module.exports = router; 