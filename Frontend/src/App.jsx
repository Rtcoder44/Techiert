import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/authContext"; // Import useAuth
import Signup from "./pages/signup.page";
import Login from "./pages/login.page";
import ForgotPasswordPage from "./pages/forgotPassword.page";
import ResetPasswordPage from "./pages/resetPassword.page";
import DashboardPage from "./pages/dashboard.page";
import CreatePostPage from "./pages/createPostPage";
import ManageBlog from "./pages/manageBlog";
import "./index.css";
import ManageCategoryPage from "./pages/manageCategoryPage";
import CategoryPage from "./pages/CategoryPage";
import SinglePostPage from "./pages/singlePostPage";
import SavedPosts from "./components/singlePostComponent/savedPost";
import ProfileSettings from "./pages/profileSettings";
import ManageUsers from "./pages/manageUsers";
import AnalyticsPage from "./pages/analyticsPage";
// import PostAnalyticsPage from "./pages/postAnalyticsPage";
import SingleBlogAnalytics from "./pages/singleBlogAnalytics";


function App() {
  const { user, loading } = useAuth(); // Get user data from context

  if (loading) {
    return <div>Loading...</div>; // Show loading while fetching user data
  }

  return (
    <Router>
 
      <Routes>
        {/* ✅ Restrict Signup and Login if user is already logged in */}
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" replace />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />

        {/* ✅ Authentication Routes */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* ✅ Protected Route: Only Admins Can Access Create and Edit Post */}
        <Route 
          path="/dashboard/create-post" 
          element={user?.role === "admin" ? <CreatePostPage /> : <Navigate to="/dashboard" replace />} 
        />
   
        <Route 
          path="/dashboard/manage-blogs" 
          element={user?.role === "admin" ? <ManageBlog /> : <Navigate to="/dashboard" replace />} 
        />
        <Route 
          path="/dashboard/analytics/blog/:blogId" 
          element={user?.role === "admin" ? <SingleBlogAnalytics /> : <Navigate to="/dashboard" replace />} 
        />
        <Route 
          path="/dashboard/manage-category" 
          element={user?.role === "admin" ? <ManageCategoryPage/> : <Navigate to="/dashboard" replace />} 
        />
        <Route 
          path="/dashboard/manage-users" 
          element={user?.role === "admin" ? <ManageUsers/> : <Navigate to="/dashboard" replace />} 
        />
        <Route 
          path="/dashboard/analytics" 
          element={user?.role === "admin" ? <AnalyticsPage/> : <Navigate to="/dashboard" replace />} 
        />

        {/* ✅ Public Route */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/category/:slug" element={<CategoryPage />} />
        <Route path="/blog/:slug" element={<SinglePostPage />} />
        {/* User's Routes */}
        <Route path="/dashboard/saved-posts" element={<SavedPosts/>} />
        <Route path="/dashboard/profile-settings" element={<ProfileSettings />} />

      </Routes>
    </Router>
  );
}

export default App;
