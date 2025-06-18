import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../context/authContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSpinner } from 'react-icons/fa';
import { createShopifyCheckout } from '../../redux/slices/cartSlice';
import { showNotification } from '../../utils/notification';

const CheckoutFlow = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { items, total, loading } = useSelector(state => state.cart);
  const [isLoading, setIsLoading] = useState(false);

  const handleProceedToCheckout = async () => {
    if (items.length === 0) {
      showNotification.info('Your cart is empty');
      return;
    }

    try {
      setIsLoading(true);
      const result = await dispatch(createShopifyCheckout({ items: items.map(item => ({ variantId: item.variantId, quantity: item.quantity })) })).unwrap();
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        showNotification.error('No checkout URL returned');
      }
    } catch (error) {
      showNotification.error('Failed to initiate checkout');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto"
          >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Checkout</h2>
                    <button 
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <span className="sr-only">Close</span>
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Order Summary */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                    <div className="space-y-4">
                      {items.map((item) => (
                    <div key={item.variantId} className="flex justify-between items-center">
                          <div className="flex items-center">
                            <img
                              src={item.product.images[0]?.url || '/default-product.jpg'}
                              alt={item.product.title}
                              className="w-16 h-16 object-cover rounded"
                            />
                            <div className="ml-4">
                              <h4 className="font-medium">{item.product.title}</h4>
                              <p className="text-gray-600">Quantity: {item.quantity}</p>
                            </div>
                          </div>
                          <p className="font-medium">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                      <div className="border-t pt-4 mt-4">
                        <div className="flex justify-between items-center">
                          <p className="font-semibold">Total:</p>
                          <p className="text-xl font-bold text-blue-600">${total.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                            
                            <button
                onClick={handleProceedToCheckout}
                disabled={isLoading || loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                          >
                {isLoading || loading ? (
                              <span className="flex items-center justify-center">
                                <FaSpinner className="animate-spin mr-2" />
                                Processing...
                              </span>
                            ) : (
                          'Proceed to Checkout'
                            )}
                          </button>

              <button
                onClick={() => navigate('/store')}
                className="w-full text-blue-600 hover:text-blue-700 mt-4"
              >
                Continue Shopping
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CheckoutFlow; 