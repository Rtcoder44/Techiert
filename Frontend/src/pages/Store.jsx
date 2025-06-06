import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { FaSearch, FaFilter, FaTruck, FaShieldAlt, FaCreditCard, FaHeadset, FaSort, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/dashboard/dashboardLayout';
import ProductCard from '../components/store/ProductCard';
import { useAuth } from '../context/authContext';
import { 
  addToGuestCart, 
  addToUserCart,
  initializeCart,
  fetchUserCart
} from '../redux/slices/cartSlice';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Store = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { isGuest } = useSelector(state => state.cart);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [productLoading, setProductLoading] = useState({});
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [categoryProducts, setCategoryProducts] = useState({});
  const [sortOptions] = useState([
    { value: 'latest', label: 'Latest' },
    { value: 'priceHigh', label: 'Price: High to Low' },
    { value: 'priceLow', label: 'Price: Low to High' },
    { value: 'nameAZ', label: 'Name: A to Z' },
    { value: 'nameZA', label: 'Name: Z to A' },
    { value: 'rating', label: 'Highest Rated' }
  ]);

  const searchParams = new URLSearchParams(location.search);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'latest',
    page: parseInt(searchParams.get('page')) || 1,
    limit: 12
  });

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setCategoryLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/product-categories`);
      if (Array.isArray(response.data)) {
        setCategories(response.data);
        
        // If there's a category filter in the URL, validate it
        if (filters.category) {
          const validCategory = response.data.find(cat => cat._id === filters.category);
          if (!validCategory) {
            // Reset category filter if invalid
            setFilters(prev => ({ ...prev, category: '' }));
          }
        }
      } else {
        setError('Invalid categories data received');
      }
    } catch (err) {
      setError('Failed to load categories. Please try again later.');
    } finally {
      setCategoryLoading(false);
    }
  }, [filters.category]);

  // Fetch products by category
  const fetchProductsByCategory = useCallback(async (categoryId) => {
    try {
      if (!categoryId || !categories.find(cat => cat._id === categoryId)) {
        return;
      }

      setProductLoading(prev => ({ ...prev, [categoryId]: true }));
      const response = await axios.get(`${API_BASE_URL}/api/products`, {
        params: { 
          category: categoryId, 
          limit: 5,
          sort: 'latest'
        },
        withCredentials: true
      });
      
      if (response.data.success && Array.isArray(response.data.products)) {
        setCategoryProducts(prev => ({
          ...prev,
          [categoryId]: response.data.products
        }));
      } else {
        setError('Failed to load products for this category.');
      }
    } catch (err) {
      setError('Failed to load products for this category.');
    } finally {
      setProductLoading(prev => ({ ...prev, [categoryId]: false }));
    }
  }, [categories]);

  // Fetch all products when no category is selected
  const fetchAllProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/products`, {
        params: { 
          ...filters,
          limit: filters.limit || 12
        },
        withCredentials: true
      });
      
      if (response.data.success && Array.isArray(response.data.products)) {
        setProducts(response.data.products);
        setError(null);
      } else {
        setError('Failed to load products. Please try again later.');
      }
    } catch (err) {
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (filters.category) {
      // Validate category before fetching
      if (categories.find(cat => cat._id === filters.category)) {
        fetchProductsByCategory(filters.category);
      } else {
        setFilters(prev => ({ ...prev, category: '' }));
      }
    } else {
      fetchAllProducts();
    }
  }, [filters.category, categories, fetchProductsByCategory, fetchAllProducts]);

  useEffect(() => {
    if (!filters.category && categories.length > 0) {
      categories.forEach(category => {
        fetchProductsByCategory(category._id);
      });
    }
  }, [categories, filters.category, fetchProductsByCategory]);

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    navigate({ search: params.toString() }, { replace: true });
  }, [filters, navigate]);

  useEffect(() => {
    if (user) {
      dispatch(fetchUserCart());
    } else {
      dispatch(initializeCart());
    }
  }, [dispatch, user]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1
    }));
  };

  const toggleWishlist = (productId) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleAddToCart = async (product) => {
    if (isGuest) {
      dispatch(addToGuestCart({ product, quantity: 1 }));
    } else {
      dispatch(addToUserCart({ productId: product._id, quantity: 1 }));
    }
  };

  // Loading Skeleton Component
  const ProductSkeleton = () => (
    <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
      <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section with Product Collage Background */}
        <div className="relative h-[500px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-indigo-600/90">
            <div className="absolute inset-0" style={{
              backgroundImage: "url('/store-hero-collage.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              mixBlendMode: 'overlay'
            }}></div>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
            <div className="text-white max-w-3xl">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-5xl font-bold mb-6"
              >
                Your Tech Shopping Destination
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl mb-8"
              >
                Discover the latest in technology and electronics
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="max-w-xl relative"
              >
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-full text-gray-900 focus:ring-2 focus:ring-blue-400 focus:outline-none text-lg"
                />
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Category Navigation Bar */}
        <div className="sticky top-0 z-50 bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-8 py-4 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => handleFilterChange('category', '')}
                className={`whitespace-nowrap px-4 py-2 rounded-full ${
                  !filters.category ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All Products
              </button>
              {categoryLoading ? (
                Array(5).fill(0).map((_, index) => (
                  <div key={index} className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                ))
              ) : categories.length === 0 ? (
                <div className="text-gray-500">No categories found</div>
              ) : (
                categories.map(category => (
                  <button
                    key={category._id}
                    onClick={() => handleFilterChange('category', category._id)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full ${
                      filters.category === category._id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {category.name}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border-t border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
              >
                <FaFilter />
                <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
              </button>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <FaSort className="text-gray-500" />
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="border-0 bg-transparent focus:ring-0 text-gray-700 pr-8"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Filters Display */}
              <div className="flex flex-wrap items-center gap-2">
                {filters.minPrice && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    Min: ${filters.minPrice}
                    <button
                      onClick={() => handleFilterChange('minPrice', '')}
                      className="ml-1 hover:text-blue-600"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.maxPrice && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    Max: ${filters.maxPrice}
                    <button
                      onClick={() => handleFilterChange('maxPrice', '')}
                      className="ml-1 hover:text-blue-600"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.inStock && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {filters.inStock === 'true' ? 'In Stock' : 'Out of Stock'}
                    <button
                      onClick={() => handleFilterChange('inStock', '')}
                      className="ml-1 hover:text-blue-600"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>

            {/* Expanded Filter Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 mt-4 border-t">
                    {/* Price Range */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price Range
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={filters.minPrice}
                          onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                          min="0"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                          type="number"
                          placeholder="Max"
                          value={filters.maxPrice}
                          onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                          min="0"
                        />
                      </div>
                    </div>

                    {/* Stock Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock Status
                      </label>
                      <select
                        value={filters.inStock || ''}
                        onChange={(e) => handleFilterChange('inStock', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        <option value="">All</option>
                        <option value="true">In Stock</option>
                        <option value="false">Out of Stock</option>
                      </select>
                    </div>

                    {/* Clear Filters */}
                    <div className="flex items-end">
                      <button
                        onClick={() => {
                          setFilters({
                            search: '',
                            category: filters.category,
                            minPrice: '',
                            maxPrice: '',
                            sort: 'latest',
                            inStock: '',
                            page: 1,
                            limit: 12
                          });
                        }}
                        className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white py-8 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="flex items-center justify-center">
                <FaTruck className="text-3xl text-blue-600 mr-4" />
                <div>
                  <h3 className="font-semibold">Free Shipping</h3>
                  <p className="text-sm text-gray-600">On orders over $100</p>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <FaShieldAlt className="text-3xl text-blue-600 mr-4" />
                <div>
                  <h3 className="font-semibold">Secure Payment</h3>
                  <p className="text-sm text-gray-600">100% secure payment</p>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <FaCreditCard className="text-3xl text-blue-600 mr-4" />
                <div>
                  <h3 className="font-semibold">Money Back</h3>
                  <p className="text-sm text-gray-600">30 days guarantee</p>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <FaHeadset className="text-3xl text-blue-600 mr-4" />
                <div>
                  <h3 className="font-semibold">24/7 Support</h3>
                  <p className="text-sm text-gray-600">Dedicated support</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Display */}
        <div className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {filters.category ? (
              // Show filtered products when category is selected
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold">
                    {categories.find(c => c._id === filters.category)?.name || 'Products'}
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {loading ? (
                    // Product loading skeletons
                    Array(10).fill(0).map((_, index) => (
                      <ProductSkeleton key={index} />
                    ))
                  ) : error ? (
                    <div className="col-span-full text-center py-12 text-red-600">{error}</div>
                  ) : products.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <p className="text-gray-500">No products found in this category</p>
                    </div>
                  ) : (
                    products.map(product => (
                      <ProductCard
                        key={product._id}
                        product={product}
                        isWishlisted={wishlist.includes(product._id)}
                        onToggleWishlist={toggleWishlist}
                        onAddToCart={() => handleAddToCart(product)}
                      />
                    ))
                  )}
                </div>
              </div>
            ) : (
              // Show products by category when no category is selected
              categoryLoading ? (
                // Category sections loading skeleton
                Array(3).fill(0).map((_, index) => (
                  <div key={index} className="mb-16">
                    <div className="h-8 w-48 bg-gray-200 rounded mb-8 animate-pulse"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                      {Array(5).fill(0).map((_, idx) => (
                        <ProductSkeleton key={idx} />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                categories.map(category => {
                  const categoryProds = categoryProducts[category._id] || [];
                  const isLoading = productLoading[category._id];

                  if (isLoading || categoryProds.length > 0) {
                    return (
                      <div key={category._id} className="mb-16">
                        <div className="flex justify-between items-center mb-8">
                          <h2 className="text-2xl font-bold">{category.name}</h2>
                          <button
                            onClick={() => handleFilterChange('category', category._id)}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            See All →
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                          {isLoading ? (
                            Array(5).fill(0).map((_, index) => (
                              <ProductSkeleton key={index} />
                            ))
                          ) : (
                            categoryProds.map(product => (
                              <ProductCard
                                key={product._id}
                                product={product}
                                isWishlisted={wishlist.includes(product._id)}
                                onToggleWishlist={toggleWishlist}
                                onAddToCart={() => handleAddToCart(product)}
                              />
                            ))
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })
              )
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Store;
