import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext"; // Import useAuth
import Signup from "./pages/signup.page";
import Login from "./pages/login.page";
import ForgotPasswordPage from "./pages/forgotPassword.page";
import ResetPasswordPage from "./pages/resetPassword.page";
import DashboardPage from "./pages/dashboard.page";
import CreatePostPage from "./pages/createPostPage";
import ManageBlog from "./pages/manageBlog";
import "./index.css";

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

        {/* ✅ Dashboard Route */}
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;
