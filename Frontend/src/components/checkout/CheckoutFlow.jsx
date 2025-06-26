import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../context/authContext';
import { useCurrency } from '../../context/currencyContext';
import { FaSpinner } from 'react-icons/fa';
import { createShopifyCheckout, resetCart } from '../../redux/slices/cartSlice';
import { showNotification } from '../../utils/notification';
import AddressForm from './AddressForm';

// Portal component for rendering at document body
const CheckoutPortal = ({ children, isOpen }) => {
  const [portalContainer, setPortalContainer] = useState(null);

  useEffect(() => {
    // Create portal container if it doesn't exist
    let container = document.getElementById('checkout-portal');
    if (!container) {
      container = document.createElement('div');
      container.id = 'checkout-portal';
      document.body.appendChild(container);
    }
    setPortalContainer(container);

    // Cleanup function
    return () => {
      if (container && container.childNodes.length === 0) {
        document.body.removeChild(container);
      }
    };
  }, []);

  if (!portalContainer) return null;

  return ReactDOM.createPortal(children, portalContainer);
};

const CheckoutFlow = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { currency, formatPrice, convertPrice } = useCurrency();
  const { items, total, loading } = useSelector(state => state.cart);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState('summary'); // summary | address | payment | confirmation
  const [address, setAddress] = useState(null);
  const [orderResult, setOrderResult] = useState(null);

  // Reset step when drawer opens/closes
  useEffect(() => {
    if (!isOpen) {
      setStep('summary');
      setAddress(null);
      setOrderResult(null);
    }
  }, [isOpen]);

  // Razorpay script loader
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // INR Checkout: Step 1 - Address
  const handleAddressSubmit = async (formData) => {
    setAddress(formData);
    setStep('payment');
  };

  const handlePaymentSuccess = (shopifyOrder) => {
    setOrderResult(shopifyOrder);
    setStep('confirmation');
    dispatch(resetCart()); // Clear the cart after successful payment
  };

  // INR Checkout: Step 2 - Payment
  const handleRazorpayPayment = async () => {
    setIsLoading(true);
    try {
      // 1. Create Razorpay order on backend
      const receipt = `order_${Date.now()}`;
      const amountINR = convertPrice(total); // already in INR
      const res = await fetch('/api/orders/razorpay/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountINR, receipt }),
      });
      const { order } = await res.json();
      if (!order) throw new Error('Failed to create Razorpay order');

      // 2. Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Failed to load Razorpay script');

      // 3. Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Techiert Store',
        description: 'Order Payment',
        order_id: order.id,
        handler: async function (response) {
          // 4. On payment success, notify backend
          setIsLoading(true);
          const paymentRes = await fetch('/api/orders/razorpay/success', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              order_id: order.id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              amount: amountINR,
              cart: items.map(item => ({
                variantId: item.variantId,
                quantity: item.quantity,
              })),
              customer: {
                first_name: address.name,
                email: user?.email || address.email || '',
                phone: address.phoneNumber,
              },
              shippingAddress: {
                address1: address.addressLine1,
                address2: address.addressLine2,
                city: address.city,
                province: address.state,
                zip: address.postalCode,
                country: address.country,
                phone: address.phoneNumber,
                name: address.name,
              },
              note: 'Paid via Razorpay (INR)',
            }),
          });
          const paymentData = await paymentRes.json();
          if (paymentData.success) {
            handlePaymentSuccess(paymentData.shopifyOrder);
          } else {
            showNotification.error('Payment succeeded but order creation failed. Contact support.');
          }
          setIsLoading(false);
        },
        prefill: {
          name: address.name,
          email: user?.email || address.email || '',
          contact: address.phoneNumber,
        },
        theme: { color: '#2563eb' },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      showNotification.error(error.message || 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Main render - always render but control visibility with CSS
  return (
    <CheckoutPortal isOpen={isOpen}>
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isOpen ? 'bg-opacity-50 opacity-100' : 'bg-opacity-0 opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      >
        <div 
          className={`fixed right-0 top-16 h-[calc(100vh-4rem)] w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto rounded-l-xl transition-transform duration-300 ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Always-Visible Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-[999] bg-white border border-gray-200 rounded-full p-3 shadow-lg focus:outline-none hover:bg-gray-100 hover:text-red-600 transition-all duration-150"
            aria-label="Close checkout drawer"
          >
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="p-6 pt-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Checkout</h2>
            </div>

            {/* INR Flow */}
            {currency.code === 'INR' ? (
              <>
                {step === 'summary' && (
                  <>
                    <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                    <div className="space-y-4 mb-6">
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
                          <p className="font-medium">{formatPrice(item.product.price * item.quantity)}</p>
                        </div>
                      ))}
                      <div className="border-t pt-4 mt-4">
                        <div className="flex justify-between items-center">
                          <p className="font-semibold">Total:</p>
                          <p className="text-xl font-bold text-blue-600">{formatPrice(total)}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setStep('address')}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Continue to Address
                    </button>
                  </>
                )}
                {step === 'address' && (
                  <AddressForm
                    onSubmit={handleAddressSubmit}
                    onCancel={() => setStep('summary')}
                    loading={isLoading}
                  />
                )}
                {step === 'payment' && (
                  <div className="flex flex-col items-center justify-center min-h-[200px]">
                    <button
                      onClick={handleRazorpayPayment}
                      disabled={isLoading}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <FaSpinner className="animate-spin mr-2" />
                          Processing Payment...
                        </span>
                      ) : (
                        'Pay with Razorpay'
                      )}
                    </button>
                  </div>
                )}
                {step === 'confirmation' && orderResult && (
                  <div className="text-center py-8 px-2 flex flex-col items-center justify-center">
                    <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mb-4">
                      <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-green-700 mb-2">Thank you for your purchase!</h3>
                    <p className="mb-2 text-gray-700">Your payment was successful and your order has been placed.</p>
                    <p className="mb-4 text-gray-600">Order ID: <span className="font-mono text-blue-600">{orderResult.id}</span></p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
                      {user ? (
                        <button
                          onClick={() => { setStep('summary'); setOrderResult(null); onClose(); navigate('/my-orders'); }}
                          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          View My Orders
                        </button>
                      ) : (
                        <button
                          onClick={() => { setStep('summary'); setOrderResult(null); onClose(); navigate('/guest-orders'); }}
                          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Track Your Order
                        </button>
                      )}
                      <button
                        onClick={() => { setStep('summary'); setOrderResult(null); onClose(); navigate('/store'); }}
                        className="bg-gray-200 text-blue-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                      >
                        Go to Store
                      </button>
                    </div>
                    <p className="mt-6 text-sm text-gray-500">If you have any questions, please contact our support team.</p>
                  </div>
                )}
              </>
            ) : (
              // USD/Other: Shopify checkout
              <button
                onClick={async () => {
                  if (items.length === 0) {
                    showNotification.info('Your cart is empty');
                    return;
                  }
                  setIsLoading(true);
                  try {
                    // You may need to update this to your actual Shopify checkout logic
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
                }}
                disabled={isLoading || loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isLoading || loading ? (
                  <span className="flex items-center justify-center">
                    <FaSpinner className="animate-spin mr-2" />
                    Processing...
                  </span>
                ) : (
                  'Proceed to Shopify Checkout'
                )}
              </button>
            )}
            <button
              onClick={() => navigate('/store')}
              className="w-full text-blue-600 hover:text-blue-700 mt-4"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </CheckoutPortal>
  );
};

export default CheckoutFlow; 