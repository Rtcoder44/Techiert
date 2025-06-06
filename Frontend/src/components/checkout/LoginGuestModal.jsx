import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const LoginGuestModal = ({ isOpen, onClose, onContinueAsGuest }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    // Store current cart in localStorage before redirecting
    onClose();
    navigate('/login', { state: { returnUrl: '/cart' } });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <h2 className="text-2xl font-bold mb-4">Continue Shopping</h2>
            <p className="text-gray-600 mb-6">
              Sign in to your account to access your saved addresses and track your orders easily, or continue as a guest.
            </p>

            <div className="space-y-4">
              <button
                onClick={handleLogin}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={onContinueAsGuest}
                className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Continue as Guest
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default LoginGuestModal; 