import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaTrash } from 'react-icons/fa';
import DashboardLayout from '../dashboard/dashboardLayout';
import { removeFromGuestCart, updateGuestCartItemQuantity, removeFromUserCart, updateCartItem } from '../../redux/slices/cartSlice';
import CheckoutFlow from '../checkout/CheckoutFlow';
import LoginGuestModal from '../checkout/LoginGuestModal';
import { useAuth } from '../../context/authContext';
import { showNotification } from '../../utils/notification';

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { items, total, isGuest } = useSelector((state) => state.cart);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleQuantityChange = async (productId, quantity) => {
    if (quantity < 1) return;

    try {
      if (isGuest) {
        dispatch(updateGuestCartItemQuantity({ productId, quantity }));
      } else {
        dispatch(updateCartItem({ productId, quantity }));
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      if (isGuest) {
        dispatch(removeFromGuestCart(productId));
      } else {
        dispatch(removeFromUserCart(productId));
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleProceedToCheckout = () => {
    if (items.length === 0) {
      showNotification.info('Your cart is empty');
      return;
    }

    if (!user) {
      setShowLoginModal(true);
    } else {
      setShowCheckout(true);
    }
  };

  const handleContinueAsGuest = () => {
    setShowLoginModal(false);
    setShowCheckout(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some items to your cart to continue shopping.</p>
            <button
              onClick={() => navigate('/store')}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 space-y-6">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between border-b pb-6 last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-center flex-1">
                        <img
                          src={item.product.images[0]?.url || '/default-product.jpg'}
                          alt={item.product.title}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div className="ml-4">
                          <h3 className="font-medium">{item.product.title}</h3>
                          <p className="text-gray-600">${item.product.price.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center border rounded-md">
                          <button
                            onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                            className="px-3 py-1 hover:bg-gray-100"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 border-x">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                            className="px-3 py-1 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.productId)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total</span>
                      <span className="text-xl font-bold text-blue-600">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleProceedToCheckout}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Proceed to Checkout
                  </button>

                  <button
                    onClick={() => navigate('/store')}
                    className="w-full text-blue-600 hover:text-blue-700"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Login/Guest Modal */}
      <LoginGuestModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onContinueAsGuest={handleContinueAsGuest}
      />

      {/* Checkout Modal */}
      <CheckoutFlow
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
      />
    </DashboardLayout>
  );
};

export default Cart; 