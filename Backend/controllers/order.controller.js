const Order = require('../models/order.model');
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
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

// Handle Razorpay payment success and create order in database
exports.handleRazorpaySuccess = async (req, res) => {
  try {
    const { order_id, payment_id, signature, cart, customer, shippingAddress, note } = req.body;
    
    // 1. Verify payment signature
    const isValid = await razorpayService.verifySignature({ order_id, payment_id, signature });
    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Invalid payment signature' });
    }

    // 2. Validate required fields
    if (!customer.email || !customer.phone) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required customer information (email or phone)' 
      });
    }

    if (!shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.state) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required shipping address information' 
      });
    }

    // 3. Get product details from database
    const productIds = cart.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== cart.length) {
      return res.status(400).json({
        success: false,
        error: 'One or more products not found'
      });
    }

    // 4. Create order items with validated product details
    const orderItems = cart.map(item => {
      const product = products.find(p => p._id.toString() === item.productId);
      return {
        productId: product._id,
        quantity: item.quantity,
        price: product.price
      };
    });

    // 5. Calculate total amount
    const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // 6. Create order in database
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
      guestEmail: customer.email,
      status: 'confirmed',
      paymentDetails: {
        razorpayOrderId: order_id,
        razorpayPaymentId: payment_id,
        amount: req.body.amount
      },
      note: note || 'Paid via Razorpay'
    });

    // 7. Populate order items with product details
    await order.populate('items.productId');

    res.json({ success: true, order });
  } catch (error) {
    console.error('Error handling Razorpay payment success:', error);
    res.status(500).json({ success: false, error: 'Failed to process payment/order' });
  }
}; 