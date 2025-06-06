import React, { useState } from 'react';
import { useAuth } from '../../context/authContext'; // Import the AuthContext
import axios from 'axios'; // Import Axios

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ClearCacheButton = () => {
  const { user, loading } = useAuth(); // Access user and loading state from AuthContext
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Check if the user is an admin (based on the user object)
  const isAdmin = user?.role === 'admin'; // Adjust based on your actual role field

  // Handle the click event to clear cache
  const handleClearCache = async () => {
    if (!isAdmin) {
      setErrorMessage('You do not have permission to clear the cache.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null); // Reset error message

    try {
      const response = await axios.post(`${API_BASE_URL}/api/cache/clear-all`, {}, {
        withCredentials: true, // Ensure cookies are sent for authentication
      });

      if (response.status === 200) {
        alert(response.data.message); // Show success message
      } else {
        setErrorMessage('Failed to clear cache. Please try again.');
      }
    } catch (err) {
      console.error('Error clearing cache:', err);
      setErrorMessage('Error clearing cache. Please try again.');
    }

    // Clear client-side storage after the cache is cleared
    localStorage.clear();
    sessionStorage.clear();

    setIsLoading(false);
  };

  // If user data is loading, don't show the button yet
  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleClearCache}
        disabled={isLoading || !isAdmin} // Disable button if not admin or loading
        className={`${
          isLoading ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'
        } text-white font-semibold py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-300`}
      >
        {isLoading ? 'Clearing Cache...' : 'Clear All Cache'}
      </button>
      {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}
    </div>
  );
};

export default ClearCacheButton;
