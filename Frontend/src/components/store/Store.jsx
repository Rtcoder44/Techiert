import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CategoryNav from './CategoryNav';
import ProductGrid from './ProductGrid';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const Store = () => {
  const [products, setProducts] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const url = selectedCollection
          ? `${API_BASE_URL}/api/shopify/collections/${selectedCollection}/products`
          : `${API_BASE_URL}/api/shopify/products`;
        
        const response = await axios.get(url);
        setProducts(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCollection]);

  const handleCollectionSelect = (collectionId) => {
    setSelectedCollection(collectionId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Store</h1>
        
        <CategoryNav
          selectedCollection={selectedCollection}
          onCollectionSelect={handleCollectionSelect}
        />

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-12">
            {error}
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </div>
  );
};

export default Store; 