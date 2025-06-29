import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/authContext';
import { useCurrency } from '../context/currencyContext';
import DashboardLayout from '../components/dashboard/dashboardLayout';
import { FaBox, FaTruck, FaCheck, FaTimes } from 'react-icons/fa';
import DeliveryStatusStepper from '../components/DeliveryStatusStepper';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const OrderStatusIcon = ({ status }) => {
  switch (status) {
    case 'pending':
      return <FaBox className="text-yellow-500" />;
    case 'confirmed':
      return <FaCheck className="text-green-500" />;
    case 'shipped':
      return <FaTruck className="text-blue-500" />;
    case 'delivered':
      return <FaCheck className="text-green-500" />;
    case 'cancelled':
      return <FaTimes className="text-red-500" />;
    default:
      return null;
  }
};

const MyOrders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        if (user) {
          // Fetch Shopify orders for logged-in user
          const response = await axios.get(`${API_BASE_URL}/api/orders/shopify-orders`, {
            withCredentials: true
          });
          setOrders(response.data.orders || []);
        } else {
          // Get guest orders from localStorage
          const guestOrders = JSON.parse(localStorage.getItem('guestOrders') || '[]');
          setOrders(guestOrders);
        }
      } catch (err) {
        setError('Failed to fetch orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-8">My Orders</h1>

        {!user && (
          <div className="text-center mb-6">
            <p className="text-gray-700">Want to see your full order history and details?</p>
            <p className="text-gray-500 text-sm mt-1">Use the same email to login or signup as you used to purchase, to access your order history.</p>
            <Link to="/login" className="inline-block mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium">Login to view your orders</Link>
          </div>
        )}

        {error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold mb-4">No Orders Found</h2>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
            <button
              onClick={() => navigate('/store')}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6 stagger-container">
            {orders.map((order, index) => {
              const isCancelled = !!order.cancelled_at;
              // Determine last real status before cancellation
              let lastStatus = null;
              if (isCancelled) {
                lastStatus = order.fulfillment_status || order.status || order.financial_status || 'ordered';
                if (lastStatus === 'cancelled') lastStatus = 'ordered'; // fallback if no other info
              }
              return (
                <div
                  key={order.id || order.order_number || order._id || order.orderNumber}
                  className="bg-white rounded-lg shadow-md overflow-hidden animate-stagger-item"
                >
                  <div className="p-6">
                    {/* Delivery Stepper */}
                    <DeliveryStatusStepper currentStatus={isCancelled ? 'cancelled' : (order.fulfillment_status || order.status || order.financial_status)} lastStatus={lastStatus} />
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          Order #{order.order_number || order.orderNumber || order.id}
                        </h3>
                        <p className="text-gray-600">
                          Placed on {formatDate(order.created_at || order.createdAt || order.date)}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <OrderStatusIcon status={order.financial_status || order.status} />
                        <span className="ml-2 text-sm font-medium capitalize">
                          {order.fulfillment_status || order.status}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 -mx-6 px-6 py-4">
                      <div className="space-y-4">
                        {(order.line_items || order.items || []).map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center">
                              <img
                                src={item.image_url || item.product?.images?.[0] || item.productId?.images?.[0]?.url || '/default-product.jpg'}
                                alt={item.title || item.product?.title || item.productId?.title}
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div className="ml-4">
                                <h4 className="font-medium">{item.title || item.product?.title || item.productId?.title}</h4>
                                <p className="text-gray-600">
                                  Quantity: {item.quantity}
                                </p>
                              </div>
                            </div>
                            <p className="font-medium">
                              {formatPrice((item.price || item.price_set?.shop_money?.amount || 0) * item.quantity)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-gray-200 -mx-6 px-6 py-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-gray-600">Shipping Address:</p>
                          <p className="font-medium">
                            {order.shipping_address?.name || order.shippingAddress?.fullName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.shipping_address?.address1 || order.shippingAddress?.addressLine1}
                            {order.shipping_address?.address2 || order.shippingAddress?.addressLine2 ? `, ${order.shipping_address?.address2 || order.shippingAddress?.addressLine2}` : ''}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.shipping_address?.city || order.shippingAddress?.city}, {order.shipping_address?.province || order.shippingAddress?.state} {order.shipping_address?.zip || order.shippingAddress?.postalCode}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-600">Total Amount:</p>
                          <p className="text-xl font-bold text-blue-600">
                            {formatPrice(order.total_price || order.totalAmount)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Tracking Info */}
                    {order.fulfillments && order.fulfillments.length > 0 && (
                      <div className="border-t border-gray-200 -mx-6 px-6 py-4">
                        <h4 className="font-semibold mb-2">Tracking Information</h4>
                        {order.fulfillments.map((fulfillment, idx) => (
                          <div key={idx} className="mb-2">
                            {fulfillment.tracking_number && (
                              <p className="text-sm">
                                <span className="font-medium">Tracking Number:</span> {fulfillment.tracking_number}
                              </p>
                            )}
                            {fulfillment.tracking_company && (
                              <p className="text-sm">
                                <span className="font-medium">Carrier:</span> {fulfillment.tracking_company}
                              </p>
                            )}
                            {fulfillment.tracking_url && (
                              <a
                                href={fulfillment.tracking_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Track Package →
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center text-sm text-blue-700 mt-8">
          <strong>Estimated delivery:</strong> 15–21 business days. All prices are shown in your local currency. For Indian customers, payments are processed in INR with automatic currency conversion.
        </div>

        <div className="text-center mt-10">
          <Link to="/contact" className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200 font-medium">
            If you have any questions or issues with your order, our support team is here to help. Contact Us
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyOrders; 