import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const CategoryNav = () => {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/shopify/collections`);
        setCollections(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching collections:', err);
        setError('Failed to load collections');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollections();
  }, []);

  const handleCollectionSelect = (collectionId) => {
    setSelectedCollection(collectionId);
    // You can add a callback here to notify the parent component
    // about the selected collection if needed
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return null;
  }

  if (!collections || collections.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 p-4 bg-white shadow-sm">
      <button
        onClick={() => handleCollectionSelect(null)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
          ${selectedCollection === null
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
      >
        All Products
      </button>
      
      {collections.map((collection) => (
        <button
          key={collection.id}
          onClick={() => handleCollectionSelect(collection.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
            ${selectedCollection === collection.id
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          {collection.title}
        </button>
      ))}
    </div>
  );
};

export default CategoryNav; 