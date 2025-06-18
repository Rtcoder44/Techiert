import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper function to get cart from localStorage
const getLocalCart = () => {
  try {
    return JSON.parse(localStorage.getItem('guestCart')) || { items: [], total: 0 };
  } catch {
    return { items: [], total: 0 };
  }
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
  if (item.product) {
    let images = [];
    if (Array.isArray(item.product.images)) {
      images = item.product.images.map(img => (img && (img.src || img.url)) ).filter(Boolean);
    } else if (item.product.image && (item.product.image.src || item.product.image.url)) {
      images = [item.product.image.src || item.product.image.url];
    }
    return {
      variantId: item.variantId || item.product.shopifyVariantId,
      quantity: item.quantity,
      product: {
        title: item.product.title || item.product.product?.title,
        price: item.product.price,
        images,
        shopifyVariantId: item.variantId || item.product.shopifyVariantId
      }
    };
  }
  let images = [];
  if (Array.isArray(item.images)) {
    images = item.images.map(img => (img && (img.src || img.url)) ).filter(Boolean);
  } else if (item.image && (item.image.src || item.image.url)) {
    images = [item.image.src || item.image.url];
  }
  return {
    variantId: item.variantId,
    quantity: item.quantity,
    product: {
      title: item.title || item.product?.title,
      price: item.price,
      images,
      shopifyVariantId: item.variantId
    }
  };
};

// Shopify-native checkout thunk
export const createShopifyCheckout = createAsyncThunk(
  'cart/createShopifyCheckout',
  async ({ items }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/shopify/checkout`, {
        items
      }, {
        withCredentials: true
      });
      return response.data; // { checkoutUrl }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
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
    checkoutError: null,
    userId: null
  },
  reducers: {
    initializeCart: (state) => {
      const localCart = getLocalCart();
      state.items = localCart.items.map(normalizeCartItem);
      state.total = calculateTotal(state.items);
      state.isGuest = true;
      state.initialized = true;
      state.loading = false;
    },
    addToGuestCart: (state, action) => {
      const { variantId, product, quantity } = action.payload;
      const existingItem = state.items.find(item => item.variantId === variantId);
      const images = Array.isArray(product.images)
        ? product.images.map(img => img.src || img.url)
        : [product.image?.src || product.image?.url];
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          variantId,
          quantity,
          product: {
            title: product.title,
            price: parseFloat(product.price),
            images,
            shopifyVariantId: variantId
          }
        });
      }
      state.total = calculateTotal(state.items);
      saveLocalCart({ items: state.items, total: state.total });
    },
    removeFromGuestCart: (state, action) => {
      const variantId = action.payload;
      state.items = state.items.filter(item => item.variantId !== variantId);
      state.total = calculateTotal(state.items);
      saveLocalCart({ items: state.items, total: state.total });
    },
    updateGuestCartItemQuantity: (state, action) => {
      const { variantId, quantity } = action.payload;
      const item = state.items.find(item => item.variantId === variantId);
      if (item) {
        item.quantity = Math.max(1, quantity);
        state.total = calculateTotal(state.items);
        saveLocalCart({ items: state.items, total: state.total });
      }
    },
    clearGuestCart: (state) => {
      state.items = [];
      state.total = 0;
      localStorage.removeItem('guestCart');
    },
    resetCart: (state) => {
      state.items = [];
      state.total = 0;
      state.isGuest = true;
      state.initialized = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('guestCart');
    },
    resetCheckoutError: (state) => {
      state.checkoutError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createShopifyCheckout.pending, (state) => {
        state.loading = true;
        state.checkoutError = null;
      })
      .addCase(createShopifyCheckout.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createShopifyCheckout.rejected, (state, action) => {
        state.checkoutError = action.payload?.message || 'Checkout failed';
        state.loading = false;
      });
  }
});

export const {
  initializeCart,
  addToGuestCart,
  removeFromGuestCart,
  updateGuestCartItemQuantity,
  clearGuestCart,
  resetCart,
  resetCheckoutError
} = cartSlice.actions;

export default cartSlice.reducer; 