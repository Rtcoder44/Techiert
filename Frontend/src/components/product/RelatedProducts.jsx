import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const RelatedProducts = ({ productHandle, currentProductId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/shopify/products/related/${productHandle}`, {
          params: {
            limit: 4
          }
        });
        setProducts(response.data.products || []);
      } catch (error) {
        console.error('Error fetching related products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (productHandle) {
      fetchRelatedProducts();
    }
  }, [productHandle]);

  if (loading) {
    return (
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 aspect-w-1 aspect-h-1 rounded-lg"></div>
              <div className="mt-2 h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="mt-1 h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/store/product/${product.handle}`}
            className="group"
          >
            <div className="aspect-w-1 aspect-h-1 w-full rounded-lg overflow-hidden">
              <img
                src={product.images && product.images.length > 0 ? product.images[0] : '/default-product.jpg'}
                alt={product.title}
                className="w-full h-full object-center object-cover group-hover:opacity-75 transition-opacity"
                onError={(e) => {
                  e.target.src = '/default-product.jpg';
                }}
              />
            </div>
            <h3 className="mt-4 text-sm text-gray-700">{product.title}</h3>
            <div className="flex items-center mt-1">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, index) => (
                  <FaStar
                    key={index}
                    className={`h-4 w-4 ${
                      index < 4 ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-500">
                (0)
              </span>
            </div>
            <p className="mt-1 text-lg font-medium text-gray-900">
              ${parseFloat(product.price).toFixed(2)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts; 