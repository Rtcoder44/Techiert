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

// Import new components
import StoreHero from '../components/store/StoreHero';
import StoreFeatures from '../components/store/StoreFeatures';
import ProductGrid from '../components/store/ProductGrid';
import ShopifyNavbar from '../components/store/ShopifyNavbar';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
        const collectionId = params.get('collection');
        const search = params.get('search');
        const url = collectionId
          ? `${API_BASE_URL}/api/shopify/collections/${collectionId}/products${search ? `?search=${encodeURIComponent(search)}` : ''}`
          : `${API_BASE_URL}/api/shopify/products${search ? `?search=${encodeURIComponent(search)}` : ''}`;
        const response = await axios.get(url);
        setProducts(response.data.products || response.data); // support both formats
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

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1
    }));
  };

  const handleAddToCart = (product, selectedVariant) => {
    const variant = selectedVariant || (product.variants && product.variants[0]);
    if (!variant) return;
    const variantId = variant.id;
    const price = parseFloat(
      (variant.price && variant.price.amount) ||
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
        <ShopifyNavbar />
        <StoreFeatures />
        <div className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">All Products</h2>
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
    </DashboardLayout>
  );
};

export default Store;
