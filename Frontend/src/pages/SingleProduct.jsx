import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../context/authContext';
import axios from 'axios';
import { FaStar, FaHeart, FaRegHeart, FaShoppingCart, FaTruck, FaShieldAlt, FaUndo } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/dashboard/dashboardLayout';
import { addToGuestCart, addToUserCart } from '../redux/slices/cartSlice';
import ReviewForm from '../components/product/ReviewForm';
import ProductReviews from '../components/product/ProductReviews';
import RelatedProducts from '../components/product/RelatedProducts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SingleProduct = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { isGuest } = useSelector(state => state.cart);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/products/${slug}`);
        setProduct(response.data.product);
        setLikes(response.data.product.likes?.length || 0);
        setIsLiked(user ? response.data.product.likes?.includes(user._id) : false);
      } catch (err) {
        setError('Failed to load product details');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug, user]);

  const handleQuantityChange = (value) => {
    const newQuantity = Math.max(1, Math.min(product.stock, quantity + value));
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    if (isGuest) {
      dispatch(addToGuestCart({ product, quantity }));
    } else {
      dispatch(addToUserCart({ productId: product._id, quantity }));
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const handleLikeToggle = async () => {
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/products/${product.slug}/like`,
        {},
        { withCredentials: true }
      );
      setIsLiked(response.data.liked);
      setLikes(response.data.likes);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !product) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            {error || 'Product not found'}
          </h2>
          <button
            onClick={() => navigate('/store')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return to Store
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-w-1 aspect-h-1 w-full rounded-lg overflow-hidden">
              <img
                src={product.images[selectedImage].url}
                alt={product.title}
                className="w-full h-full object-center object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-w-1 aspect-h-1 rounded-lg overflow-hidden ${
                    selectedImage === index ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <img
                    src={image.url}
                    alt={`${product.title} - ${index + 1}`}
                    className="w-full h-full object-center object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
              <button
                onClick={handleLikeToggle}
                className="text-2xl text-red-500 hover:scale-110 transition-transform"
              >
                {isLiked ? <FaHeart /> : <FaRegHeart />}
                <span className="text-sm ml-1">{likes}</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, index) => (
                  <FaStar
                    key={index}
                    className={index < Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300'}
                  />
                ))}
              </div>
              <span className="text-gray-600">
                ({product.reviews?.length || 0} reviews)
              </span>
            </div>

            <div className="text-3xl font-bold text-gray-900">
              ${product.price.toFixed(2)}
              {product.discount > 0 && (
                <span className="ml-2 text-lg text-gray-500 line-through">
                  ${(product.price * (1 + product.discount / 100)).toFixed(2)}
                </span>
              )}
            </div>

            <p className="text-gray-700">{product.description}</p>

            {/* Stock Status */}
            <div className="mt-4">
              <p className={`text-lg font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? (
                  <>
                    In Stock ({product.stock} available)
                    {product.stock < 10 && (
                      <span className="text-orange-500 ml-2">Low Stock!</span>
                    )}
                  </>
                ) : (
                  'Out of Stock'
                )}
              </p>
            </div>

            <div className="border-t border-b py-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center">
                  <FaTruck className="mr-2" />
                  Free Shipping
                </div>
                <div className="flex items-center">
                  <FaShieldAlt className="mr-2" />
                  1 Year Warranty
                </div>
                <div className="flex items-center">
                  <FaUndo className="mr-2" />
                  30 Days Return
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Quantity:</span>
                <div className="flex items-center border rounded-md">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="px-3 py-1 border-r hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-4 py-1">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="px-3 py-1 border-l hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
                <span className="text-gray-600">
                  {product.stock} units available
                </span>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                >
                  <FaShoppingCart className="mr-2" />
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="flex-1 px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button className="border-blue-500 text-blue-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                Product Details
              </button>
            </nav>
          </div>

          <div className="py-8">
            <div className="prose max-w-none">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Specifications
              </h3>
              <div className="mt-4 border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(product.specifications || {}).map(([key, value], index) => (
                      <tr 
                        key={key}
                        className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                      >
                        <td className="px-4 py-3 whitespace-nowrap w-1/3">
                          <div className="flex items-center">
                            <div className="h-1.5 w-1.5 bg-blue-600 rounded-full mr-2"></div>
                            <span className="font-medium text-gray-900 text-sm">{key}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 w-2/3">
                          {value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {Object.keys(product.specifications || {}).length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No specifications available for this product.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
            {user && !showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Write a Review
              </button>
            )}
          </div>

          <AnimatePresence>
            {showReviewForm && (
              <ReviewForm
                productId={product._id}
                onClose={() => setShowReviewForm(false)}
                onSubmitSuccess={() => {
                  setShowReviewForm(false);
                  // Refresh product data to show new review
                  window.location.reload();
                }}
              />
            )}
          </AnimatePresence>

          <ProductReviews productId={product._id} />
        </div>

        {/* Related Products */}
        <RelatedProducts
          categoryId={product.category?._id}
          currentProductId={product._id}
        />
      </div>
    </DashboardLayout>
  );
};

export default SingleProduct; 