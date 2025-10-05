import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaTrash } from 'react-icons/fa';
import DashboardLayout from '../dashboard/dashboardLayout';
import { removeFromGuestCart, updateGuestCartItemQuantity } from '../../redux/slices/cartSlice';
import { useAuth } from '../../context/authContext';
import { showNotification } from '../../utils/notification';
import LoginGuestModal from '../checkout/LoginGuestModal';
import { useCurrency } from '../../context/currencyContext';
import CheckoutFlow from '../checkout/CheckoutFlow';

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { items, total, isGuest } = useSelector((state) => state.cart);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { formatPrice, currency } = useCurrency();
  const [showCheckout, setShowCheckout] = useState(false);

  // Defensive price calculation
  const getItemPrice = (item) => parseFloat(item.product.price || item.product.variantPrice || 0);
  const subtotal = items.reduce((acc, item) => acc + (getItemPrice(item) * item.quantity), 0);

  const handleQuantityChange = async (variantId, quantity) => {
    if (quantity < 1) return;
    if (isGuest) {
      dispatch(updateGuestCartItemQuantity({ variantId, quantity }));
    }
    // For logged-in users, do nothing (Shopify handles cart)
  };

  const handleRemoveItem = async (variantId) => {
    if (isGuest) {
      dispatch(removeFromGuestCart(variantId));
    }
    // For logged-in users, do nothing (Shopify handles cart)
  };

  const handleProceedToCheckout = async () => {
    if (items.length === 0) {
      showNotification.info('Your cart is empty');
      return;
    }
    if (!user && isGuest) {
      setShowLoginModal(true);
      return;
    }
    // For logged-in users, proceed to checkout flow
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
                      key={item.variantId}
                      className="flex items-center justify-between border-b pb-6 last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-center flex-1">
                        <img
                          src={(() => {
                            const first = (item.product.images && item.product.images.length > 0) ? item.product.images[0] : null;
                            if (!first) return '/default-product.jpg';
                            if (typeof first === 'string') return first;
                            return first.url || first.src || '/default-product.jpg';
                          })()}
                          alt={item.product.title}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div className="ml-4">
                          <h3 className="font-medium">{item.product.title}</h3>
                          <p className="text-gray-600">{formatPrice(getItemPrice(item))}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center border rounded-md">
                          <button
                            onClick={() => handleQuantityChange(item.variantId, item.quantity - 1)}
                            className="px-3 py-1 hover:bg-gray-100"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 border-x">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.variantId, item.quantity + 1)}
                            className="px-3 py-1 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.variantId)}
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
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total</span>
                      <span className="text-xl font-bold text-blue-600">
                        {formatPrice(subtotal)}
                      </span>
                    </div>
                  </div>
                  {/* Checkout disabled for affiliate flow */}
                  {items.length > 0 && (
                    <div className="space-y-2">
                      {items.map((item) => (
                        <a
                          key={item.variantId}
                          href={item.product?.affiliateUrl || '#'}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className={`w-full block text-center py-2 px-4 rounded-md ${item.product?.affiliateUrl ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
                        >
                          {item.product?.affiliateUrl ? 'Buy this item on Amazon' : 'Amazon link not available'}
                        </a>
                      ))}
                    </div>
                  )}
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

        <LoginGuestModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onContinueAsGuest={async () => {
            setShowLoginModal(false);
            setShowCheckout(true);
          }}
        />

        <CheckoutFlow isOpen={showCheckout} onClose={() => setShowCheckout(false)} />

        <div className="text-center text-sm text-blue-700 mt-8">
          <strong>Estimated delivery:</strong> 15–21 business days. All prices are shown in your local currency. For Indian customers, payments are processed in INR with automatic currency conversion.
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Cart; 