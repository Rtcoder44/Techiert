const shopifyService = require('../services/shopify.service');
const Order = require('../models/order.model');

// Handle Shopify order webhook
const handleOrderWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-shopify-hmac-sha256'];
    const rawBody = req.body;

    // Verify webhook signature
    const isValid = shopifyService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const orderData = JSON.parse(rawBody.toString());
    const { id, email, total_price, line_items, shipping_address } = orderData;

    // Create or update order in database
    const order = await Order.findOneAndUpdate(
      { shopifyOrderId: id.toString() },
      {
        shopifyOrderId: id.toString(),
        email,
        totalAmount: parseFloat(total_price),
        items: line_items.map(item => ({
          productId: item.product_id,
          quantity: item.quantity,
          price: parseFloat(item.price)
        })),
        shippingAddress: {
          street: shipping_address.address1,
          city: shipping_address.city,
          state: shipping_address.province,
          country: shipping_address.country,
          zipCode: shipping_address.zip
        },
        status: 'processing'
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: 'Order processed successfully', order });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Error processing webhook' });
  }
};

// Export the controller functions
const shopifyController = {
  handleOrderWebhook
};

module.exports = shopifyController; 