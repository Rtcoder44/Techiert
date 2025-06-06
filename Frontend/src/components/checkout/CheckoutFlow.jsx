import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../context/authContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSpinner } from 'react-icons/fa';
import { createOrder, createGuestOrder, resetOrderStatus, addGuestAddress } from '../../redux/slices/cartSlice';
import AddressForm from './AddressForm';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CheckoutFlow = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { 
    items, 
    total, 
    loading: cartLoading, 
    orderSuccess, 
    orderError, 
    isGuest,
    guestAddresses 
  } = useSelector(state => state.cart);
  
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestOrderId, setGuestOrderId] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (user) {
        fetchAddresses();
      } else {
        // Load guest addresses from redux state
        setAddresses(guestAddresses);
        if (guestAddresses.length > 0) {
          setSelectedAddress(guestAddresses[0]);
        } else {
          setShowNewAddressForm(true);
        }
      }
    }
  }, [isOpen, user, guestAddresses]);

  useEffect(() => {
    dispatch(resetOrderStatus());
  }, [dispatch]);

  useEffect(() => {
    if (orderSuccess) {
      if (isGuest) {
        navigate('/guest-orders');
      } else {
        navigate('/my-orders');
      }
      onClose();
    }
  }, [orderSuccess, navigate, onClose, isGuest]);

  const fetchAddresses = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/addresses`, {
        withCredentials: true
      });
      
      setAddresses(response.data.addresses || []);
      const defaultAddress = response.data.addresses?.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      } else if (response.data.addresses?.length > 0) {
        setSelectedAddress(response.data.addresses[0]);
      } else {
        setShowNewAddressForm(true);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setError('Failed to load addresses. Please try again.');
      setShowNewAddressForm(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressSubmit = async (address) => {
    try {
      if (!user) {
        // Save address for guest user
        dispatch(addGuestAddress(address));
        setShowNewAddressForm(false);
        setSelectedAddress(address);
      } else {
        // For logged-in users, save the address to server
        const response = await axios.post(
          `${API_BASE_URL}/api/addresses`,
          {
            ...address,
            fullName: address.name,
            phone: address.phoneNumber
          },
          { withCredentials: true }
        );
        
        if (response.data.address) {
          setAddresses(prev => [...prev, response.data.address]);
          setSelectedAddress(response.data.address);
          setShowNewAddressForm(false);
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save address. Please try again.');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setError('Please select a shipping address');
      return;
    }

    try {
      if (!user) {
        if (!guestEmail) {
          setError('Please provide your email address');
          return;
        }

        const orderResponse = await dispatch(createGuestOrder({
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
            product: item.product
          })),
          shippingAddress: {
            fullName: selectedAddress.name,
            phone: selectedAddress.phoneNumber,
            addressLine1: selectedAddress.addressLine1,
            addressLine2: selectedAddress.addressLine2,
            city: selectedAddress.city,
            state: selectedAddress.state,
            postalCode: selectedAddress.postalCode,
            country: selectedAddress.country
          },
          guestEmail
        })).unwrap();

        if (orderResponse?.order?.id) {
          setGuestOrderId(orderResponse.order.id);
        }
      } else {
        await dispatch(createOrder({
          shippingAddress: {
            fullName: selectedAddress.name,
            phone: selectedAddress.phoneNumber,
            addressLine1: selectedAddress.addressLine1,
            addressLine2: selectedAddress.addressLine2,
            city: selectedAddress.city,
            state: selectedAddress.state,
            postalCode: selectedAddress.postalCode,
            country: selectedAddress.country
          }
        })).unwrap();
      }
    } catch (error) {
      setError(error.message || 'Failed to process order. Please try again.');
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
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="inline-block w-full max-w-3xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
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
                        <div key={item.productId} className="flex justify-between items-center">
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

                  {/* Guest Email Input */}
                  {!user && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Shipping Address Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
                    
                    {error && (
                      <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
                        {error}
                      </div>
                    )}

                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <FaSpinner className="animate-spin text-blue-600 text-2xl" />
                      </div>
                    ) : (
                      <>
                        {/* Saved Addresses */}
                        {addresses.length > 0 && !showNewAddressForm && (
                          <div className="mb-6 space-y-4">
                            {addresses.map(address => (
                              <div
                                key={address.id || address._id}
                                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                  selectedAddress?.id === address.id || selectedAddress?._id === address._id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'hover:border-gray-400'
                                }`}
                                onClick={() => setSelectedAddress(address)}
                              >
                                <p className="font-medium">{address.name}</p>
                                <p className="text-gray-600">{address.phoneNumber}</p>
                                <p className="text-gray-600">
                                  {address.addressLine1}
                                  {address.addressLine2 && `, ${address.addressLine2}`}
                                </p>
                                <p className="text-gray-600">
                                  {address.city}, {address.state} {address.postalCode}
                                </p>
                                {address.isDefault && (
                                  <span className="text-sm text-blue-600 mt-2 inline-block">
                                    Default Address
                                  </span>
                                )}
                              </div>
                            ))}
                            
                            <button
                              onClick={() => setShowNewAddressForm(true)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              + Add New Address
                            </button>
                          </div>
                        )}

                        {/* Address Form */}
                        {(showNewAddressForm || addresses.length === 0) && (
                          <AddressForm
                            onSubmit={handleAddressSubmit}
                            onCancel={
                              addresses.length > 0
                                ? () => setShowNewAddressForm(false)
                                : undefined
                            }
                            loading={cartLoading}
                          />
                        )}

                        {/* Place Order Button */}
                        {selectedAddress && !showNewAddressForm && (
                          <button
                            onClick={handlePlaceOrder}
                            disabled={cartLoading}
                            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {cartLoading ? (
                              <span className="flex items-center justify-center">
                                <FaSpinner className="animate-spin mr-2" />
                                Processing...
                              </span>
                            ) : (
                              'Place Order'
                            )}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CheckoutFlow; 