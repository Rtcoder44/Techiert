import React, { Suspense, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from "./context/authContext";
import { useDispatch } from "react-redux";
import { initializeCart } from "./redux/slices/cartSlice";
import "./index.css";
import { AuthProvider } from "./context/authContext";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";

// Auth pages
import Signup from "./pages/signup.page";
import Login from "./pages/login.page";
import ForgotPasswordPage from "./pages/forgotPassword.page";
import ResetPasswordPage from "./pages/resetPassword.page";

// Dashboard & Blog
import DashboardPage from "./pages/dashboard.page";
import BlogHome from "./pages/BlogHome";
import CreatePostPage from "./pages/createPostPage";
import ManageBlog from "./pages/manageBlog";
import ManageCategoryPage from "./pages/manageCategoryPage";
import CategoryPage from "./pages/categoryPage";
import SinglePostPage from "./pages/singlePostPage";
import SavedPosts from "./components/singlePostComponent/savedPost";
import ProfileSettings from "./pages/profileSettings";
import ManageUsers from "./pages/manageUsers";
import AnalyticsPage from "./pages/analyticsPage";
import SingleBlogAnalytics from "./pages/singleBlogAnalytics";

// Legal pages
import PrivacyPolicy from "./pages/legalPages/privacyPolicy";
import TermsOfService from "./pages/legalPages/termOfService";
import Contact from "./pages/legalPages/contact";
import About from "./pages/legalPages/aboutUsPage";
import NotFound from "./pages/NotFound";
import RefundPolicy from './pages/legalPages/refundPolicy';
import ShippingPolicy from './pages/legalPages/shippingPolicy';

// Product management
import ManageProduct from "./pages/manageProduct";
import AddProduct from "./pages/addProduct";

// Pages
import Home from "./pages/Home";
import Store from "./pages/Store";
import Cart from "./components/cart/Cart";
import SingleProduct from './pages/SingleProduct';
import CheckoutFlow from './components/checkout/CheckoutFlow';
import MyOrders from './pages/MyOrders';
import GuestOrders from './pages/GuestOrders';

// Spinner component
const Spinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="w-12 h-12 border-4 border-blue-300 border-t-transparent rounded-full animate-spin" />
  </div>
);

// ScrollTo component
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const AppContent = () => {
  const { user, loading } = useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!loading) {
      if (user) {
        dispatch(initializeCart());
      } else {
        dispatch(initializeCart());
      }
    }
  }, [user, loading, dispatch]);

  if (loading) return <Spinner />;

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ScrollToTop />
      <Suspense fallback={<Spinner />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          
          {/* Blog Routes */}
          <Route path="/blog" element={<BlogHome />} />
          <Route path="/blog/:slug" element={<SinglePostPage />} />
          <Route path="/blog/category/:slug" element={<CategoryPage />} />
          <Route path="/saved-posts" element={<SavedPosts />} />
          
          {/* Store Routes */}
          <Route path="/store" element={<Store />} />
          <Route path="/store/product/:handle" element={<SingleProduct />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/guest-orders" element={<GuestOrders />} />
          <Route path="/track-order" element={<GuestOrders />} />

          {/* Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/create-post"
            element={
              <PrivateRoute>
                <CreatePostPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/manage-blogs"
            element={
              <PrivateRoute>
                <ManageBlog />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/manage-categories"
            element={
              <AdminRoute>
                <ManageCategoryPage />
              </AdminRoute>
            }
          />
          <Route
            path="/dashboard/analytics"
            element={
              <AdminRoute>
                <AnalyticsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/dashboard/blog-analytics/:blogId"
            element={
              <AdminRoute>
                <SingleBlogAnalytics />
              </AdminRoute>
            }
          />
          <Route
            path="/dashboard/manage-products"
            element={
              <AdminRoute>
                <ManageProduct />
              </AdminRoute>
            }
          />
          <Route
            path="/dashboard/add-product"
            element={
              <AdminRoute>
                <AddProduct />
              </AdminRoute>
            }
          />
          <Route
            path="/dashboard/users"
            element={
              <AdminRoute>
                <ManageUsers />
              </AdminRoute>
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <PrivateRoute>
                <ProfileSettings />
              </PrivateRoute>
            }
          />

          {/* Legal Routes */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/termOfService" element={<TermsOfService />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/shipping-policy" element={<ShippingPolicy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          
          {/* Checkout Route */}
          <Route path="/checkout" element={<CheckoutFlow />} />
          
          {/* My Orders Route */}
          <Route path="/my-orders" element={<MyOrders />} />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
      <ToastContainer />
    </AuthProvider>
  );
};

export default App;
