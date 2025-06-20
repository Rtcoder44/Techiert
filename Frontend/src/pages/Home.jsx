import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaShoppingBag, FaBlog, FaArrowRight, FaTag } from 'react-icons/fa';
import { useCurrency } from '../context/currencyContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Home = () => {
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, productsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/posts?limit=3&featured=true`),
          axios.get(`${API_BASE_URL}/api/shopify/products?limit=4&featured=true`)
        ]);
        setFeaturedPosts(postsRes.data.posts);
        setFeaturedProducts(productsRes.data.products);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to Our Store
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Discover amazing products at great prices
            </p>
            <Link
              to="/store"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50"
            >
              Shop Now <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
            <Link
              to="/store"
              className="inline-flex items-center text-blue-600 hover:text-blue-700"
            >
              View All <FaArrowRight className="ml-2" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-lg shadow-md p-4">
                  <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))
            ) : (
              featuredProducts.map(product => (
                <motion.div
                  key={product.id}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <Link to={`/store/product/${product.id}`}>
                    <div className="relative pb-[75%]">
                      <img
                        src={product.image || '/default-product.jpg'}
                        alt={product.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {product.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-gray-900">
                          {formatPrice(product.price)}
                        </span>
                        <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                          <FaShoppingBag />
                        </button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Blog Posts Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Latest Blog Posts</h2>
            <Link
              to="/blog"
              className="inline-flex items-center text-blue-600 hover:text-blue-700"
            >
              View All <FaArrowRight className="ml-2" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-50 rounded-lg p-4">
                  <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))
            ) : (
              featuredPosts.map(post => (
                <motion.div
                  key={post._id}
                  whileHover={{ y: -5 }}
                  className="bg-gray-50 rounded-lg overflow-hidden"
                >
                  <Link to={`/blog/${post.slug}`}>
                    <div className="relative pb-[56.25%]">
                      <img
                        src={post.coverImage || '/default-blog.jpg'}
                        alt={post.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <FaTag className="text-blue-600" />
                        <span className="text-sm text-gray-600">
                          {post.category?.name || 'Uncategorized'}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-blue-600 hover:text-blue-700">
                          Read More →
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Add delivery/currency note at the bottom of the main div */}
      <div className="text-center text-sm text-blue-700 mt-8">
        <strong>Estimated delivery:</strong> 15–21 business days. All prices are shown in your local currency. For Indian customers, payments are processed in INR with automatic currency conversion.
      </div>
    </div>
  );
};

export default Home; 