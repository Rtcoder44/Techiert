import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaStar, FaHeart, FaRegHeart, FaShoppingCart } from 'react-icons/fa';
import { useCurrency } from '../../context/currencyContext';

const ProductCard = ({ product, isWishlisted, onToggleWishlist, onAddToCart, isFeatured = false }) => {
  const [selectedVariant, setSelectedVariant] = useState(product.variants && product.variants.length > 0 ? product.variants[0] : null);
  const { formatPrice, loading: currencyLoading } = useCurrency();

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 ${
        isFeatured ? 'border-2 border-blue-200' : ''
      }`}
    >
      <Link to={`/store/product/${product.handle}`} className="block relative">
        <div className="relative pb-[75%]">
          <img
            src={product.image || '/default-product.jpg'}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
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
            onToggleWishlist(product.id);
          }}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
        >
          {isWishlisted ? (
            <FaHeart className="text-red-500" />
          ) : (
            <FaRegHeart className="text-gray-400" />
          )}
        </button>
      </Link>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
          {product.title}
        </h3>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
          {product.description}
        </p>
        {/* Variant Selector */}
        {product.variants && product.variants.length > 1 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                className={`px-2 py-1 rounded border text-xs ${selectedVariant?.id === variant.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'}`}
                onClick={() => setSelectedVariant(variant)}
              >
                {variant.selectedOptions.map(opt => `${opt.value}`).join(' / ')}
              </button>
            ))}
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-gray-900">
            {currencyLoading
              ? '...'
              : formatPrice(selectedVariant ? Number(selectedVariant.price.amount) : Number(product.price))}
          </span>
          <button
            onClick={() => onAddToCart(product, selectedVariant)}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            <FaShoppingCart />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard; 