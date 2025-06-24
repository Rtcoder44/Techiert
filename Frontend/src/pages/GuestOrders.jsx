import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/dashboardLayout';
import { FaBox, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import { useCurrency } from '../context/currencyContext';
import DeliveryStatusStepper from '../components/DeliveryStatusStepper';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">We're sorry, but there was an error loading your orders.</p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const OrderStatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
      {status === 'processing' ? (
        <span className="flex items-center">
          <FaSpinner className="animate-spin mr-2" />
          Processing
        </span>
      ) : (
        (status?.charAt(0).toUpperCase() + status?.slice(1)) || 'Unknown'
      )}
    </span>
  );
};

const AddressDisplay = ({ address }) => {
  if (!address) return <p className="text-gray-600">No address information available</p>;

  return (
    <div className="text-gray-600">
      <p>{address.fullName || address.name || 'N/A'}</p>
      <p>{address.phone || address.phoneNumber || 'N/A'}</p>
      <p>{address.addressLine1 || 'N/A'}</p>
      {address.addressLine2 && <p>{address.addressLine2}</p>}
      <p>
        {[
          address.city,
          address.state,
          address.postalCode
        ].filter(Boolean).join(', ') || 'N/A'}
      </p>
      <p>{address.country || 'N/A'}</p>
    </div>
  );
};

const OrderItem = ({ item, index, orderId }) => {
  if (!item?.product) return null;

  const { formatPrice } = useCurrency();

  return (
    <div key={`${orderId}-${item.productId}-${index}`} className="flex items-center py-2">
      <div className="flex-1">
        <h4 className="font-medium">{item.product.title || 'Unnamed Product'}</h4>
        <p className="text-gray-600">
          Quantity: {item.quantity || 0} × {formatPrice(item.product.price || 0)}
        </p>
      </div>
      <p className="font-medium">
        {formatPrice((item.quantity || 0) * (item.product.price || 0))}
      </p>
    </div>
  );
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const GuestOrders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [trackOrderNumber, setTrackOrderNumber] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [trackingError, setTrackingError] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const loadOrders = () => {
      try {
        const guestOrders = JSON.parse(localStorage.getItem('guestOrders') || '[]');
        setOrders(guestOrders.sort((a, b) => new Date(b.date) - new Date(a.date)));
        setError(null);
      } catch (err) {
        console.error('Error loading orders:', err);
        setError('Failed to load orders. Please try again.');
      }
    };

    loadOrders();
    const intervalId = setInterval(loadOrders, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const formatDate = (dateString) => {
    try {
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (err) {
      return 'Invalid Date';
    }
  };

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    setTrackingError(null);
    setTrackedOrder(null);
    setTrackingLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/orders/shopify-orders/track/${encodeURIComponent(trackOrderNumber)}`);
      setTrackedOrder(response.data.order);
    } catch (err) {
      setTrackingError('Order not found. Please check your order number.');
    } finally {
      setTrackingLoading(false);
    }
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <ErrorBoundary>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Guest Orders</h1>
            <p className="text-gray-600 mt-2">
              Track your orders placed as a guest. Create an account to access more features and save your order history.
            </p>
          </div>

          {/* Public Order Tracking Form */}
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-2">Track Your Order</h2>
            <form onSubmit={handleTrackOrder} className="flex flex-col sm:flex-row gap-4 items-center">
              <input
                type="text"
                placeholder="Enter your order number"
                value={trackOrderNumber}
                onChange={e => setTrackOrderNumber(e.target.value)}
                className="border rounded px-4 py-2 flex-1"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                disabled={trackingLoading}
              >
                {trackingLoading ? 'Tracking...' : 'Track Order'}
              </button>
            </form>
            {trackingError && <div className="text-red-500 mt-2">{trackingError}</div>}
            {trackedOrder && (() => {
              const isCancelled = !!trackedOrder.cancelled_at;
              let lastStatus = null;
              if (isCancelled) {
                lastStatus = trackedOrder.fulfillment_status || trackedOrder.financial_status || trackedOrder.status || 'ordered';
                if (lastStatus === 'cancelled') lastStatus = 'ordered';
              }
              return (
                <div className="mt-6 border-t pt-4">
                  <h3 className="text-lg font-semibold mb-2">Order #{trackedOrder.order_number || trackedOrder.id}</h3>
                  <DeliveryStatusStepper currentStatus={isCancelled ? 'cancelled' : (trackedOrder.fulfillment_status || trackedOrder.financial_status || trackedOrder.status)} lastStatus={lastStatus} />
                  <p className="text-gray-600 mb-2">Placed on {new Date(trackedOrder.created_at).toLocaleDateString()}</p>
                  <div className="mb-2">
                    <span className="font-medium">Status:</span> {trackedOrder.fulfillment_status || trackedOrder.financial_status || 'N/A'}
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">Total:</span> {formatPrice(trackedOrder.total_price)}
                  </div>
                  {trackedOrder.line_items && trackedOrder.line_items.length > 0 && (
                    <div className="mb-2">
                      <span className="font-medium">Items:</span>
                      <ul className="list-disc ml-6">
                        {trackedOrder.line_items.map((item, idx) => (
                          <li key={idx}>{item.title} x {item.quantity}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {trackedOrder.fulfillments && trackedOrder.fulfillments.length > 0 && (
                    <div className="mt-2">
                      <span className="font-medium">Tracking:</span>
                      {trackedOrder.fulfillments.map((fulfillment, idx) => (
                        <div key={idx} className="mb-1">
                          {fulfillment.tracking_number && (
                            <>
                              <span>Tracking Number: {fulfillment.tracking_number}</span>
                              {fulfillment.tracking_url && (
                                <a href={fulfillment.tracking_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline ml-2">Track Package</a>
                              )}
                            </>
                          )}
                          <div className="text-sm text-gray-600">Status: {fulfillment.status}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <FaBox className="mx-auto text-4xl text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Orders Found</h2>
              <p className="text-gray-600 mb-6">You haven't placed any orders as a guest yet.</p>
              <Link
                to="/store"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const isCancelled = !!order.cancelled_at;
                let lastStatus = null;
                if (isCancelled) {
                  lastStatus = order.fulfillment_status || order.status || order.financial_status || 'ordered';
                  if (lastStatus === 'cancelled') lastStatus = 'ordered';
                }
                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-lg shadow-md p-6"
                  >
                    <DeliveryStatusStepper currentStatus={isCancelled ? 'cancelled' : (order.fulfillment_status || order.status || order.financial_status)} lastStatus={lastStatus} />
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          Order #{order.id}
                        </h3>
                        <p className="text-gray-600">
                          Placed on {formatDate(order.date)}
                        </p>
                      </div>
                      <OrderStatusBadge status={order.status} />
                    </div>

                    <div className="border-t border-b py-4 mb-4">
                      {order.items?.map((item, index) => (
                        <OrderItem
                          key={`${order.id}-${item.productId}-${index}`}
                          item={item}
                          index={index}
                          orderId={order.id}
                        />
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total</span>
                        <span className="text-xl font-bold text-blue-600">
                          {formatPrice((order.total || 0).toFixed(2))}
                        </span>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-2">Shipping Address</h4>
                        <AddressDisplay address={order.shippingAddress} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              Want to keep track of all your orders in one place?
            </p>
            <Link
              to="/signup"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Create an Account →
            </Link>
          </div>

          <div className="text-center text-sm text-blue-700 mt-8">
            <strong>Estimated delivery:</strong> 15–21 business days. All prices are shown in your local currency. For Indian customers, payments are processed in INR with automatic currency conversion.
          </div>
        </div>
      </ErrorBoundary>
    </DashboardLayout>
  );
};

export default GuestOrders; 