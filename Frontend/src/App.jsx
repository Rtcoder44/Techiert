import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./context/authContext";
import "./index.css";

// Auth pages
import Signup from "./pages/signup.page";
import Login from "./pages/login.page";
import ForgotPasswordPage from "./pages/forgotPassword.page";
import ResetPasswordPage from "./pages/resetPassword.page";

// Dashboard & Blog
import DashboardPage from "./pages/dashboard.page";
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

// Spinner component
const Spinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="w-12 h-12 border-4 border-blue-300 border-t-transparent rounded-full animate-spin" />
  </div>
);

function App() {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;

  return (
    <Router>
      <Suspense fallback={<Spinner />}>
      
        <Routes>
        <Route path="*" element={<NotFound />} />
          {/* ✅ Public Auth Routes */}
          <Route
            path="/signup"
            element={!user ? <Signup /> : <Navigate to="/dashboard" replace />}
          />
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/dashboard" replace />}
          />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* ✅ Admin-only Routes */}
          <Route
            path="/dashboard/create-post"
            element={
              user?.role === "admin" ? (
                <CreatePostPage />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/dashboard/manage-blogs"
            element={
              user?.role === "admin" ? (
                <ManageBlog />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/dashboard/analytics/blog/:blogId"
            element={
              user?.role === "admin" ? (
                <SingleBlogAnalytics />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/dashboard/manage-category"
            element={
              user?.role === "admin" ? (
                <ManageCategoryPage />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/dashboard/manage-users"
            element={
              user?.role === "admin" ? (
                <ManageUsers />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/dashboard/analytics"
            element={
              user?.role === "admin" ? (
                <AnalyticsPage />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />

          {/* ✅ Public Content Routes */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/category/:slug" element={<CategoryPage />} />
          <Route path="/blog/:slug" element={<SinglePostPage />} />

          {/* ✅ User Routes */}
          <Route path="/dashboard/saved-posts" element={<SavedPosts />} />
          <Route path="/dashboard/profile-settings" element={<ProfileSettings />} />

          {/* ✅ Legal Pages */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
