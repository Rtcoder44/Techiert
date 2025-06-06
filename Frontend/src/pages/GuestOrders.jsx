import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/dashboardLayout';
import { FaBox, FaSpinner } from 'react-icons/fa';

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

  return (
    <div key={`${orderId}-${item.productId}-${index}`} className="flex items-center py-2">
      <div className="flex-1">
        <h4 className="font-medium">{item.product.title || 'Unnamed Product'}</h4>
        <p className="text-gray-600">
          Quantity: {item.quantity || 0} × ${item.product.price || 0}
        </p>
      </div>
      <p className="font-medium">
        ${((item.quantity || 0) * (item.product.price || 0)).toFixed(2)}
      </p>
    </div>
  );
};

const GuestOrders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

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
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-lg shadow-md p-6"
                >
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
                        ${(order.total || 0).toFixed(2)}
                      </span>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">Shipping Address</h4>
                      <AddressDisplay address={order.shippingAddress} />
                    </div>
                  </div>
                </div>
              ))}
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
        </div>
      </ErrorBoundary>
    </DashboardLayout>
  );
};

export default GuestOrders; 