import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaStar, FaHeart, FaRegHeart, FaShoppingCart } from 'react-icons/fa';

const ProductCard = ({ product, isWishlisted, onToggleWishlist, onAddToCart, isFeatured = false }) => {
  console.log('Product Data:', product);
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (!product) {
    console.error('No product data provided to ProductCard');
    return null;
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 ${
        isFeatured ? 'border-2 border-blue-200' : ''
      }`}
    >
      <Link to={`/store/product/${product.slug}`} className="block relative">
        <div className="relative pb-[75%]">
          <img
            src={product.images?.[0]?.url || '/default-product.jpg'}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.discount > 0 && (
            <span className="bg-red-500 text-white px-2 py-1 rounded-md text-sm font-medium">
              {product.discount}% OFF
            </span>
          )}
          {product.isNew && (
            <span className="bg-green-500 text-white px-2 py-1 rounded-md text-sm font-medium">
              NEW
            </span>
          )}
          {isFeatured && (
            <span className="bg-blue-500 text-white px-2 py-1 rounded-md text-sm font-medium">
              Featured
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleWishlist(product._id);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
        >
          {isWishlisted ? (
            <FaHeart className="text-red-500" />
          ) : (
            <FaRegHeart className="text-gray-600" />
          )}
        </button>
      </Link>

      <div className="p-4">
        {/* Title and Category */}
        <div className="mb-2">
          <p className="text-sm text-blue-600 mb-1">{product.category?.name || 'Uncategorized'}</p>
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
            {product.title}
          </h3>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500">
            ({product.reviews?.length || 0})
          </span>
        </div>

        {/* Price and Cart */}
        <div className="flex items-center justify-between">
          <div>
            {product.discount > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900">
                  {formatPrice(product.price * (1 - product.discount / 100))}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.price)}
                </span>
              </div>
            ) : (
              <span className="text-xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          
          <button
            onClick={(e) => {
              e.preventDefault();
              onAddToCart(product);
            }}
            disabled={product.stock <= 0}
            className={`p-2 rounded-lg text-white transition-colors ${
              product.stock > 0
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
            title={product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          >
            <FaShoppingCart />
          </button>
        </div>

        {/* Stock Status */}
        {product.stock <= 0 ? (
          <p className="text-red-500 text-sm mt-2">Out of Stock</p>
        ) : product.stock <= 10 ? (
          <p className="text-yellow-500 text-sm mt-2">Low Stock: {product.stock} left</p>
        ) : (
          <p className="text-green-500 text-sm mt-2">In Stock: {product.stock} available</p>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard; 