const Order = require('../models/order.model');
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const shopifyService = require('../services/shopify.service');
const razorpayService = require('../services/razorpay.service');

// Create order for authenticated user
exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ userId: req.user._id })
      .populate('items.productId');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Create order items from cart
    const items = cart.items.map(item => ({
      productId: item.productId._id,
      quantity: item.quantity,
      price: item.productId.price
    }));

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || 
        !shippingAddress.addressLine1 || !shippingAddress.city || 
        !shippingAddress.state || !shippingAddress.postalCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid shipping address'
      });
    }

    // Create order
    const order = await Order.create({
      userId: req.user._id,
      items,
      totalAmount,
      shippingAddress: {
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        addressLine1: shippingAddress.addressLine1,
        addressLine2: shippingAddress.addressLine2 || '',
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country || 'India'
      },
      status: 'confirmed'
    });

    // Clear the cart
    await Cart.findByIdAndUpdate(cart._id, { $set: { items: [], total: 0 } });

    // Populate order items with product details
    await order.populate('items.productId');

    res.status(201).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
};

// Create order for guest user
exports.createGuestOrder = async (req, res) => {
  try {
    const { items, shippingAddress, guestEmail } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No items provided'
      });
    }

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || 
        !shippingAddress.addressLine1 || !shippingAddress.city || 
        !shippingAddress.state || !shippingAddress.postalCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid shipping address'
      });
    }

    // Validate and get product details
    const productIds = items.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== items.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more products not found'
      });
    }

    // Create order items with validated product details
    const orderItems = items.map(item => {
      const product = products.find(p => p._id.toString() === item.productId);
      return {
        productId: product._id,
        quantity: item.quantity,
        price: product.price
      };
    });

    // Calculate total amount
    const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create order
    const order = await Order.create({
      items: orderItems,
      totalAmount,
      shippingAddress: {
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        addressLine1: shippingAddress.addressLine1,
        addressLine2: shippingAddress.addressLine2 || '',
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country || 'India'
      },
      guestEmail,
      status: 'confirmed'
    });

    // Populate order items with product details
    await order.populate('items.productId');

    res.status(201).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error creating guest order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating guest order',
      error: error.message
    });
  }
};

// Get all orders for authenticated user
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate('items.productId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// Get specific order by ID for authenticated user
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('items.productId');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};

// Get guest order by order number
exports.getGuestOrderByNumber = async (req, res) => {
  try {
    const order = await Order.findOne({
      orderNumber: req.params.orderNumber,
      userId: { $exists: false }
    }).populate('items.productId');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching guest order',
      error: error.message
    });
  }
};

// Fetch Shopify orders by user email
exports.getShopifyOrders = async (req, res) => {
  try {
    const email = req.user?.email;
    if (!email) {
      return res.status(400).json({ success: false, message: 'User email not found.' });
    }
    const orders = await shopifyService.fetchOrdersByEmail(email);
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fetch a single Shopify order by order number
exports.getShopifyOrderByNumber = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const order = await shopifyService.fetchOrderByNumber(orderNumber);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create Razorpay order for INR payment
exports.createRazorpayOrder = async (req, res) => {
  try {
    console.log('--- [Razorpay] Create Order Request ---');
    console.log('Request body:', req.body);
    console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID);
    console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '***SET***' : '***MISSING***');
    const { amount, receipt } = req.body;
    if (!amount || !receipt) {
      console.error('Missing amount or receipt in request');
      return res.status(400).json({ success: false, error: 'Missing amount or receipt' });
    }
    const order = await razorpayService.createOrder({ amount, receipt });
    console.log('Razorpay order created:', order);
    res.json({ success: true, order });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ success: false, error: 'Failed to create Razorpay order', details: error.message });
  }
};

// Handle Razorpay payment success and create Shopify order
exports.handleRazorpaySuccess = async (req, res) => {
  // Helper to extract numeric ID from Shopify GraphQL ID
  function extractShopifyNumericId(graphqlId) {
    if (typeof graphqlId !== 'string') return graphqlId;
    const match = graphqlId.match(/\/(\d+)$/);
    return match ? match[1] : graphqlId;
  }

  // Helper to format phone number for Shopify (international format)
  function formatPhoneForShopify(phone) {
    if (!phone) return '';
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    // If it's a 10-digit Indian number, add +91 prefix
    if (digits.length === 10) {
      return `+91-${digits}`;
    }
    // If it already has country code, format it properly
    if (digits.length === 12 && digits.startsWith('91')) {
      return `+${digits.slice(0, 2)}-${digits.slice(2)}`;
    }
    // If it's already in international format, return as is
    if (phone.startsWith('+')) {
      return phone;
    }
    // Default: add +91 prefix
    return `+91-${digits}`;
  }

  // Utility: Convert INR to USD (use same rate as frontend fallback)
  function convertINRtoUSD(amountINR) {
    const rate = 83.5; // Should match frontend fallback or be set in env/config
    if (!amountINR || isNaN(amountINR)) return 0;
    return (typeof amountINR === 'string' ? parseFloat(amountINR) : amountINR) / rate;
  }

  try {
    const { order_id, payment_id, signature, cart, customer, shippingAddress, note } = req.body;
    // 1. Verify payment signature
    const isValid = await razorpayService.verifySignature({ order_id, payment_id, signature });
    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Invalid payment signature' });
    }
    // 2. Create paid order in Shopify
    const lineItems = cart.map(item => ({
      variant_id: extractShopifyNumericId(item.variantId),
      quantity: item.quantity,
    }));

    // Format customer data for Shopify
    const formattedCustomer = {
      ...customer,
      phone: formatPhoneForShopify(customer.phone)
    };

    // Format shipping address data for Shopify
    const formattedShippingAddress = {
      ...shippingAddress,
      phone: formatPhoneForShopify(shippingAddress.phone)
    };

    // Debug logging
    console.log('--- [Shopify] Order Creation Data ---');
    console.log('Formatted Customer:', formattedCustomer);
    console.log('Formatted Shipping Address:', formattedShippingAddress);
    console.log('Line Items:', lineItems);

    // Validate required fields
    if (!formattedCustomer.email || !formattedCustomer.phone) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required customer information (email or phone)' 
      });
    }

    if (!formattedShippingAddress.address1 || !formattedShippingAddress.city || !formattedShippingAddress.province) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required shipping address information' 
      });
    }

    // Convert INR to USD for Shopify
    const amountINR = req.body.amount;
    const amountUSD = convertINRtoUSD(amountINR);

    const paymentDetails = { amount: amountINR, amount_usd: amountUSD, razorpayPaymentId: payment_id };
    const shopifyOrder = await shopifyService.createPaidOrder({
      lineItems,
      customer: formattedCustomer,
      shippingAddress: formattedShippingAddress,
      paymentDetails,
      note,
    });
    res.json({ success: true, shopifyOrder });
  } catch (error) {
    console.error('Error handling Razorpay payment success:', error);
    res.status(500).json({ success: false, error: 'Failed to process payment/order' });
  }
}; 