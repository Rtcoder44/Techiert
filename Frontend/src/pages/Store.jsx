import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import DashboardLayout from '../components/dashboard/dashboardLayout';
import { useAuth } from '../context/authContext';
import { useCurrency } from '../context/currencyContext';
import { 
  addToGuestCart, 
  initializeCart,
} from '../redux/slices/cartSlice';
import { Helmet } from 'react-helmet-async';
import { FaFilter } from 'react-icons/fa';

// Import new components
import StoreHero from '../components/store/StoreHero';
import StoreFeatures from '../components/store/StoreFeatures';
import ProductGrid from '../components/store/ProductGrid';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const sortOptions = [
  { value: 'latest', label: 'Latest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'alpha', label: 'Alphabetical' },
];

const Store = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { isGuest } = useSelector(state => state.cart);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const { formatPrice } = useCurrency();
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || 'latest',
    page: parseInt(searchParams.get('page')) || 1,
    limit: 12
  });

  const [searchValue, setSearchValue] = useState(filters.search);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams(location.search);
        const category = params.get('category');
        const search = params.get('search');
        const sort = params.get('sort') || 'latest';
        const page = params.get('page') || 1;
        
        let url = `${API_BASE_URL}/api/products?`;
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (category) queryParams.append('category', category);
        if (sort) queryParams.append('sort', sort);
        if (page) queryParams.append('page', page);
        queryParams.append('limit', '12');
        
        url += queryParams.toString();
        const response = await axios.get(url);
        setProducts(response.data.products || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [location.search]);

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    navigate({ search: params.toString() }, { replace: true });
  }, [filters, navigate]);

  useEffect(() => {
    if (user) {
      dispatch(initializeCart());
    } else {
      dispatch(initializeCart());
    }
  }, [dispatch, user]);

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/product-categories`);
        setCategories(response.data.categories || []);
      } catch (err) {
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1
    }));
  };

  const handleAddToCart = (product) => {
    const price = parseFloat(product.price || 0);
    const images = product.images || [];
    const cartPayload = {
      productId: product._id,
      product: {
        title: product.title,
        price,
        images,
        affiliateUrl: product.affiliateUrl,
        productId: product._id
      },
      quantity: 1
    };
    if (isGuest) {
      dispatch(addToGuestCart(cartPayload));
    } else {
      dispatch({ type: 'cart/addToGuestCart', payload: cartPayload });
    }
  };

  const toggleWishlist = (productId) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Get selected category from URL
  const selectedCategory = new URLSearchParams(location.search).get('category') || '';
  const selectedSort = filters.sort;

  // Top filter bar UI
  const FilterBar = () => (
    <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-4 md:p-5 mb-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Category pills */}
        <div className="flex items-center gap-2 flex-wrap overflow-x-auto md:overflow-visible w-full">
          <button
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap border ${!selectedCategory ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}`}
            onClick={() => handleFilterChange('category', '')}
          >
            All
          </button>
          {(categoriesLoading ? [] : categories).map(cat => (
            <button
              key={cat._id}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap border ${selectedCategory === cat._id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}`}
              onClick={() => handleFilterChange('category', cat._id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 md:ml-4 ml-auto shrink-0">
          <label htmlFor="sort" className="text-sm text-gray-600">Sort by</label>
          <select
            id="sort"
            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedSort}
            onChange={e => handleFilterChange('sort', e.target.value)}
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  // Responsive sidebar toggle for mobile
  const SidebarToggle = () => (
    <button
      className="md:hidden flex items-center mb-4 px-4 py-2 bg-blue-600 text-white rounded shadow"
      onClick={() => setSidebarOpen(!sidebarOpen)}
    >
      <FaFilter className="mr-2" /> Filters
    </button>
  );

  return (
    <DashboardLayout>
      <Helmet>
        <title>Techiert Store - Shop the Latest Tech Products</title>
        <meta name="description" content="Discover and shop the latest technology products at Techiert. Find gadgets, electronics, and more with fast delivery and great prices." />
        <link rel="canonical" href="https://techiert.com/store" />
        <meta property="og:title" content="Techiert Store - Shop the Latest Tech Products" />
        <meta property="og:description" content="Discover and shop the latest technology products at Techiert. Find gadgets, electronics, and more with fast delivery and great prices." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://techiert.com/store" />
      </Helmet>
      <div className="min-h-screen bg-gray-50">
        <StoreHero searchValue={searchValue} onSearchChange={val => { setSearchValue(val); handleFilterChange('search', val); }} />
        <StoreFeatures />
        <div className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Top Filter Bar */}
            <FilterBar />
            {/* Product grid */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">All Products</h2>
              </div>
              <ProductGrid
                products={products}
                loading={loading}
                error={error}
                wishlist={wishlist}
                onToggleWishlist={toggleWishlist}
                onAddToCart={handleAddToCart}
                formatPrice={formatPrice}
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Store;
