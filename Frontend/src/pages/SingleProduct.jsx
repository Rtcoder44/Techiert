import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../context/authContext';
import axios from 'axios';
import { FaStar, FaHeart, FaRegHeart, FaShoppingCart, FaTruck, FaShieldAlt, FaUndo } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/dashboard/dashboardLayout';
import { addToGuestCart } from '../redux/slices/cartSlice';
import ReviewForm from '../components/product/ReviewForm';
import ProductReviews from '../components/product/ProductReviews';
import RelatedProducts from '../components/product/RelatedProducts';
import { Helmet } from 'react-helmet-async';
import { useCurrency } from '../context/currencyContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SingleProduct = () => {
  const { handle } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { isGuest } = useSelector(state => state.cart);
  const { formatPrice } = useCurrency();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/shopify/products/handle/${handle}`);
        const prod = response.data.product;
        setProduct(prod);
        setSelectedVariant(prod.variants && prod.variants.length > 0 ? prod.variants[0] : null);
        setLikes(prod.likes?.length || 0);
        setIsLiked(user ? prod.likes?.includes(user._id) : false);
      } catch (err) {
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [handle]);

  const handleQuantityChange = (value) => {
    const newQuantity = Math.max(1, Math.min(product.stock, quantity + value));
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    const variantId = selectedVariant.id;
    const price = parseFloat(
      (selectedVariant.price && selectedVariant.price.amount) ||
      product.price ||
      0
    );
    const images = product.images || (product.image ? [product.image] : []);
    const cartPayload = {
      variantId,
      product: {
        title: product.title,
        price,
        images,
        shopifyVariantId: variantId
      },
      quantity
    };
    if (isGuest) {
      dispatch(addToGuestCart(cartPayload));
    } else {
      dispatch({ type: 'cart/addToGuestCart', payload: cartPayload });
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

  const price = parseFloat(
    selectedVariant?.price?.amount ||
    (product.variants && product.variants[0]?.price?.amount) ||
    product.price ||
    0
  );

  // SEO tags
  const metaTitle = `${product.title} | Techiert Store`;
  const metaDescription = product.description?.slice(0, 160) || 'Shop the best tech products at Techiert.';
  const metaKeywords = product.tags ? product.tags.join(', ') : '';
  const productImage = product.images && product.images.length > 0 ? product.images[0] : '/default-product.jpg';
  const canonicalUrl = `https://techiert.com/store/product/${product.handle}`;

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={metaKeywords} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={productImage} />
        <meta property="og:type" content="product" />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Image Gallery */}
            <div>
              <div className="border-4 border-blue-200 rounded-lg overflow-hidden mb-4">
                <img
                  src={product.images[selectedImage] || '/default-product.jpg'}
                  alt={product.title}
                  className="w-full h-auto object-contain bg-white"
                  style={{ maxHeight: 400 }}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {product.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className={`w-20 h-20 object-cover rounded cursor-pointer border-2 ${selectedImage === idx ? 'border-blue-500' : 'border-gray-200'}`}
                    onClick={() => setSelectedImage(idx)}
                  />
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-3xl font-bold mb-2 text-gray-900">{product.title}</h1>
              <div className="text-lg text-gray-700 mb-4">{product.description}</div>

              <div className="mb-2 flex items-center gap-4">
                <span className="text-3xl font-bold text-blue-600">
                  {formatPrice(price)}
                </span>
                <span className={`text-base font-semibold ${selectedVariant?.availableForSale ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedVariant?.availableForSale ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              <div className="flex flex-col gap-2 mt-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FaTruck className="text-blue-500" />
                  <span>Fast & Tracked Shipping (7–12 Days)</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaShieldAlt className="text-blue-500" />
                  <span>Secure Checkout via PayPal</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaUndo className="text-blue-500" />
                  <span>Easy 7-Day Return Policy</span>
                </div>
              </div>

              <div className="mt-4 text-sm text-blue-700">
                <strong>Estimated delivery:</strong> 15–21 business days. All prices are shown in your local currency. For Indian customers, payments are processed in INR with automatic currency conversion.
              </div>

              <p className="text-sm text-red-500 mt-2">🔥 Limited stock available – order now!</p>

              {/* Variant Selector */}
              {product.variants && product.variants.length > 1 && (
                <div className="mb-6">
                  <label className="block mb-1 font-medium">Choose Variant:</label>
                  <div className="flex gap-2 flex-wrap">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        className={`px-4 py-2 rounded border transition-colors ${selectedVariant?.id === variant.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'}`}
                        onClick={() => setSelectedVariant(variant)}
                      >
                        {variant.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-8">
                <span className="text-gray-700">Quantity:</span>
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-4 py-2">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart / Buy Now */}
              <div className="flex gap-4 mb-8">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-lg font-semibold shadow"
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-lg font-semibold shadow"
                >
                  Buy Now
                </button>
              </div>

              {/* Product Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Features:</h3>
                  <div className="flex gap-2 flex-wrap">
                    {product.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-gray-200 rounded-full text-sm">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Details Tabs */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
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
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reviews Section */}
          {product._id && (
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
                      window.location.reload();
                    }}
                  />
                )}
              </AnimatePresence>

              <ProductReviews productId={product._id} />
            </div>
          )}

          {/* Related Products */}
          <RelatedProducts
            categoryId={product.category?._id}
            currentProductId={product._id}
          />
        </div>
      </DashboardLayout>
    </>
  );
};

export default SingleProduct; 