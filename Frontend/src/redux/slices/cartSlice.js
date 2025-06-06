import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper function to get cart from localStorage
const getLocalCart = () => {
  const cart = localStorage.getItem('guestCart');
  return cart ? JSON.parse(cart) : { items: [], total: 0 };
};

// Helper function to save cart to localStorage
const saveLocalCart = (cart) => {
  localStorage.setItem('guestCart', JSON.stringify(cart));
};

// Helper function to calculate total
const calculateTotal = (items) => {
  return items.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + (price * item.quantity);
  }, 0);
};

// Helper function to normalize cart item data
const normalizeCartItem = (item) => {
  // For guest cart items
  if (item.product) {
    return {
      productId: item.productId,
      quantity: item.quantity,
      product: {
        _id: item.product._id,
        title: item.product.title,
        price: item.product.price,
        images: item.product.images
      }
    };
  }
  // For user cart items from backend
  return {
    productId: item.productId,
    quantity: item.quantity,
    product: {
      _id: item.productId,
      title: item.title,
      price: item.price,
      images: [{ url: item.image }]
    }
  };
};

// Helper function to get guest addresses from localStorage
const getGuestAddresses = () => {
  const addresses = localStorage.getItem('guestAddresses');
  return addresses ? JSON.parse(addresses) : [];
};

// Helper function to save guest addresses to localStorage
const saveGuestAddress = (address) => {
  const addresses = getGuestAddresses();
  const newAddress = { ...address, id: 'ADDR-' + Math.random().toString(36).substr(2, 9).toUpperCase() };
  addresses.push(newAddress);
  localStorage.setItem('guestAddresses', JSON.stringify(addresses));
  return newAddress;
};

// Helper function to generate unique ID with timestamp
const generateUniqueId = (prefix) => {
  const timestamp = new Date().getTime().toString(36);
  const randomStr = Math.random().toString(36).substr(2, 5);
  return `${prefix}-${timestamp}-${randomStr}`.toUpperCase();
};

// Helper function to get guest orders
const getGuestOrders = () => {
  return JSON.parse(localStorage.getItem('guestOrders') || '[]');
};

// Helper function to update guest order status
export const updateGuestOrderStatus = (orderId, newStatus) => {
  const orders = getGuestOrders();
  const updatedOrders = orders.map(order => 
    order.id === orderId ? { ...order, status: newStatus } : order
  );
  localStorage.setItem('guestOrders', JSON.stringify(updatedOrders));
};

// Async thunks
export const fetchUserCart = createAsyncThunk(
  'cart/fetchUserCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/cart`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        // If unauthorized, return guest cart
        return { items: [], total: 0, isGuest: true };
      }
      return rejectWithValue(error.response.data);
    }
  }
);

export const syncGuestCartWithUser = createAsyncThunk(
  'cart/syncGuestCartWithUser',
  async (guestCart, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/cart/sync`,
        { items: guestCart.items },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addToUserCart = createAsyncThunk(
  'cart/addToUserCart',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/cart/add`,
        { productId, quantity },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const removeFromUserCart = createAsyncThunk(
  'cart/removeFromUserCart',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/cart/item/${productId}`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const clearUserCart = createAsyncThunk(
  'cart/clearUserCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/cart`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/cart/item/${productId}`,
        { quantity },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Add new thunks for order creation
export const createOrder = createAsyncThunk(
  'cart/createOrder',
  async ({ shippingAddress }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/orders`,
        { shippingAddress },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createGuestOrder = createAsyncThunk(
  'cart/createGuestOrder',
  async ({ items, shippingAddress, guestEmail }, { rejectWithValue }) => {
    try {
      // Generate a unique order ID with timestamp
      const orderId = generateUniqueId('GUEST');
      
      // Normalize shipping address
      const normalizedAddress = {
        fullName: shippingAddress.name || shippingAddress.fullName,
        phone: shippingAddress.phoneNumber || shippingAddress.phone,
        addressLine1: shippingAddress.addressLine1,
        addressLine2: shippingAddress.addressLine2 || '',
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country || 'India'
      };
      
      // Create the order object
      const order = {
        id: orderId,
        items,
        shippingAddress: normalizedAddress,
        guestEmail,
        total: items.reduce((sum, item) => sum + (item.quantity * item.product.price), 0),
        status: 'processing',
        date: new Date().toISOString(),
        paymentStatus: 'pending',
        deliveryStatus: 'preparing'
      };

      // Store guest order in localStorage
      const guestOrders = getGuestOrders();
      guestOrders.push(order);
      localStorage.setItem('guestOrders', JSON.stringify(guestOrders));

      // Simulate order processing
      setTimeout(() => {
        updateGuestOrderStatus(orderId, 'confirmed');
      }, 2000);

      return { order };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create guest order' });
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    error: null,
    isGuest: true,
    initialized: false,
    orderSuccess: false,
    orderError: null,
    guestAddresses: []
  },
  reducers: {
    initializeCart: (state) => {
      const localCart = getLocalCart();
      state.items = localCart.items.map(normalizeCartItem);
      state.total = calculateTotal(state.items);
      state.isGuest = true;
      state.initialized = true;
      state.loading = false;
      state.guestAddresses = getGuestAddresses();
    },
    addToGuestCart: (state, action) => {
      const { product, quantity } = action.payload;
      const existingItem = state.items.find(item => item.productId === product._id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push(normalizeCartItem({
          productId: product._id,
          product: product,
          quantity
        }));
      }

      state.total = calculateTotal(state.items);
      saveLocalCart({ items: state.items, total: state.total });
    },
    removeFromGuestCart: (state, action) => {
      state.items = state.items.filter(item => item.productId !== action.payload);
      state.total = calculateTotal(state.items);
      saveLocalCart({ items: state.items, total: state.total });
    },
    updateGuestCartItemQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(item => item.productId === productId);
      if (item) {
        item.quantity = quantity;
        state.total = calculateTotal(state.items);
        saveLocalCart({ items: state.items, total: state.total });
      }
    },
    clearGuestCart: (state) => {
      state.items = [];
      state.total = 0;
      localStorage.removeItem('guestCart');
    },
    setIsGuest: (state, action) => {
      state.isGuest = action.payload;
    },
    resetCart: (state) => {
      state.items = [];
      state.total = 0;
      state.isGuest = true;
      state.initialized = false;
      state.loading = false;
      state.error = null;
    },
    resetOrderStatus: (state) => {
      state.orderSuccess = false;
      state.orderError = null;
    },
    addGuestAddress: (state, action) => {
      const newAddress = saveGuestAddress(action.payload);
      state.guestAddresses = getGuestAddresses();
      return newAddress;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch user cart
      .addCase(fetchUserCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items.map(normalizeCartItem);
        state.total = action.payload.total || 0;
        state.isGuest = action.payload.isGuest || false;
        state.initialized = true;
        state.error = null;
      })
      .addCase(fetchUserCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch cart';
        state.items = [];
        state.total = 0;
        state.isGuest = true;
        state.initialized = true;
      })
      // Sync guest cart
      .addCase(syncGuestCartWithUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncGuestCartWithUser.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items.map(normalizeCartItem);
        state.total = action.payload.total;
        state.isGuest = false;
        state.initialized = true;
        state.error = null;
        localStorage.removeItem('guestCart');
      })
      .addCase(syncGuestCartWithUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to sync cart';
      })
      // Add to user cart
      .addCase(addToUserCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToUserCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items.map(normalizeCartItem);
        state.total = action.payload.total;
        state.error = null;
      })
      .addCase(addToUserCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to add item to cart';
      })
      // Remove from user cart
      .addCase(removeFromUserCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromUserCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.error = null;
      })
      .addCase(removeFromUserCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to remove item from cart';
      })
      // Clear user cart
      .addCase(clearUserCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearUserCart.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
        state.total = 0;
        state.error = null;
      })
      .addCase(clearUserCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to clear cart';
      })
      // Update cart item
      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items.map(normalizeCartItem);
        state.total = action.payload.total;
        state.error = null;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update cart item';
      })
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.orderError = null;
      })
      .addCase(createOrder.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
        state.total = 0;
        state.orderSuccess = true;
        state.orderError = null;
        localStorage.removeItem('guestCart');
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.orderError = action.payload?.message || 'Failed to create order';
      })
      // Create guest order
      .addCase(createGuestOrder.pending, (state) => {
        state.loading = true;
        state.orderError = null;
      })
      .addCase(createGuestOrder.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
        state.total = 0;
        state.orderSuccess = true;
        state.orderError = null;
        localStorage.removeItem('guestCart');
      })
      .addCase(createGuestOrder.rejected, (state, action) => {
        state.loading = false;
        state.orderError = action.payload?.message || 'Failed to create guest order';
      });
  }
});

export const {
  initializeCart,
  addToGuestCart,
  removeFromGuestCart,
  updateGuestCartItemQuantity,
  clearGuestCart,
  setIsGuest,
  resetCart,
  resetOrderStatus,
  addGuestAddress
} = cartSlice.actions;

export default cartSlice.reducer; 