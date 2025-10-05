import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, loading, error, wishlist = [], onToggleWishlist, onAddToCart }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
            <div className="w-full pb-[75%] bg-gray-200" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-5/6" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-5 bg-gray-200 rounded w-20" />
                <div className="h-9 bg-gray-200 rounded-full w-9" />
              </div>
            </div>
          </div>
        ))}
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
      <div className="text-center py-20 bg-white rounded-2xl ring-1 ring-gray-100">
        <p className="text-gray-600">No products found</p>
        <p className="text-gray-400 text-sm">Try changing filters or search term</p>
      </div>
    );
  }

  // If ProductCard exists, use it for rendering
  if (ProductCard) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
        {products.map((product) => (
          <ProductCard
            key={product._id || product.id || product.slug || product.handle}
            product={product}
            isWishlisted={wishlist.includes(product._id || product.id)}
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