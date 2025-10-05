import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaHeart, FaRegHeart, FaShoppingCart } from 'react-icons/fa';
import { useCurrency } from '../../context/currencyContext';

const ProductCard = ({ product, isWishlisted, onToggleWishlist, onAddToCart, isFeatured = false }) => {
  const [selectedVariant, setSelectedVariant] = useState(product.variants && product.variants.length > 0 ? product.variants[0] : null);
  const { formatPrice } = useCurrency();

  const priceToFormat = selectedVariant ? (selectedVariant.price?.amount || selectedVariant.price) : product.price;
  const imageUrl = Array.isArray(product.images) && product.images.length > 0
    ? (product.images[0].url || product.images[0].src || product.images[0])
    : '/default-product.jpg';
  const productKey = product._id || product.id || product.slug || product.handle;
  const productSlug = product.slug || product.handle;

  return (
    <div
      className={`group bg-white rounded-2xl shadow-sm overflow-hidden ring-1 ring-gray-100 hover:ring-blue-200 hover:shadow-xl transition-all duration-300 ${
        isFeatured ? 'border-2 border-blue-200' : ''
      }`}
    >
      <Link to={`/store/product/${productSlug}`} className="block relative">
        <div className="relative pb-[75%] bg-gray-50">
          <img
            src={imageUrl}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
            onToggleWishlist(productKey);
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
        <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-1">
          {product.title}
        </h3>
        <p className="text-gray-600 text-xs mb-3 line-clamp-2 min-h-[32px]">
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
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(priceToFormat)}
          </span>
          <button
            onClick={() => onAddToCart(product, selectedVariant)}
            className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-sm"
          >
            <FaShoppingCart />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 