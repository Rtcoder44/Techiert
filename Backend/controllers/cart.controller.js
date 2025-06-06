const Cart = require('../models/cart.model');
const Product = require('../models/product.model');

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id })
      .populate('items.productId', 'title images price');

    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    res.status(200).json({
      items: cart.items.map(item => ({
        productId: item.productId._id,
        quantity: item.quantity,
        product: {
          _id: item.productId._id,
          title: item.productId.title,
          price: item.price,
          images: item.productId.images
        }
      })),
      total: cart.total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart', error: error.message });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Validate product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }

    // Check if product already in cart
    const existingItem = cart.items.find(item => 
      item.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        productId,
        quantity,
        price: product.price
      });
    }

    await cart.save();

    // Return updated cart with populated items
    const updatedCart = await Cart.findById(cart._id)
      .populate('items.productId', 'title images price');

    res.status(200).json({
      items: updatedCart.items.map(item => ({
        productId: item.productId._id,
        quantity: item.quantity,
        product: {
          _id: item.productId._id,
          title: item.productId.title,
          price: item.price,
          images: item.productId.images
        }
      })),
      total: updatedCart.total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding to cart', error: error.message });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => 
      item.productId.toString() !== productId
    );

    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate('items.productId', 'title images price');

    res.status(200).json({
      items: updatedCart.items.map(item => ({
        productId: item.productId._id,
        quantity: item.quantity,
        product: {
          _id: item.productId._id,
          title: item.productId.title,
          price: item.price,
          images: item.productId.images
        }
      })),
      total: updatedCart.total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error removing from cart', error: error.message });
  }
};

// Update item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.find(item => 
      item.productId.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    item.quantity = quantity;
    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate('items.productId', 'title images price');

    res.status(200).json({
      items: updatedCart.items.map(item => ({
        productId: item.productId._id,
        quantity: item.quantity,
        product: {
          _id: item.productId._id,
          title: item.productId.title,
          price: item.price,
          images: item.productId.images
        }
      })),
      total: updatedCart.total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating cart item', error: error.message });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      items: [],
      total: 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing cart', error: error.message });
  }
};

// Sync guest cart with user cart
exports.syncGuestCart = async (req, res) => {
  try {
    const { items } = req.body;

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }

    // Get all product details
    const productIds = items.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    // Merge guest cart items with existing cart
    for (const guestItem of items) {
      const product = products.find(p => p._id.toString() === guestItem.productId);
      if (!product) continue;

      const existingItem = cart.items.find(item => 
        item.productId.toString() === guestItem.productId
      );

      if (existingItem) {
        existingItem.quantity += guestItem.quantity;
      } else {
        cart.items.push({
          productId: guestItem.productId,
          quantity: guestItem.quantity,
          price: product.price
        });
      }
    }

    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate('items.productId', 'title images price');

    res.status(200).json({
      items: updatedCart.items.map(item => ({
        productId: item.productId._id,
        quantity: item.quantity,
        product: {
          _id: item.productId._id,
          title: item.productId.title,
          price: item.price,
          images: item.productId.images
        }
      })),
      total: updatedCart.total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error syncing cart', error: error.message });
  }
}; 