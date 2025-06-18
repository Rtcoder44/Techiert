import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, loading, error, wishlist = [], onToggleWishlist, onAddToCart }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-red-500 text-center py-12">{error}</div>
    );
  }
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No products found
      </div>
    );
  }

  // If ProductCard exists, use it for rendering
  if (ProductCard) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isWishlisted={wishlist.includes(product.id)}
            onToggleWishlist={onToggleWishlist || (() => {})}
            onAddToCart={onAddToCart || (() => {})}
          />
        ))}
      </div>
    );
  }

  // Fallback rendering (should not be used if ProductCard is present)
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
      {products.map((product) => (
        <Link
          key={product.id}
          to={`/store/product/${product.handle}`}
          className="group bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
        >
          <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-64 object-cover object-center group-hover:opacity-75"
            />
          </div>
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {product.title}
            </h3>
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
              {product.description}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-lg font-medium text-gray-900">
                ${parseFloat(product.price).toFixed(2)}
              </p>
              <button
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View Details
              </button>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ProductGrid; 