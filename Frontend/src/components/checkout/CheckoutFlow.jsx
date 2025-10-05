import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';

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
  const [ignored, setIgnored] = useState(false);
  useEffect(() => { setIgnored(prev => !prev); }, [isOpen]);

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
              <h2 className="text-2xl font-bold">Checkout Disabled</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>
                Payments are currently disabled. We are switching to Amazon affiliate redirection.
              </p>
              <p>
                Please use the "Buy on Amazon" buttons on product pages to purchase.
              </p>
            </div>
            <button
              onClick={() => { onClose(); navigate('/store'); }}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors mt-6"
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