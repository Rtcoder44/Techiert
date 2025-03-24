import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/signup.page";
import Login from "./pages/login.page";
import ForgotPasswordPage from "./pages/forgotPassword.page";
import ResetPasswordPage from "./pages/resetPassword.page";
import DashboardPage from "./pages/dashboard.page";
import "./index.css";
import CreatePost from "./pages/createPost";

function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ Authentication Routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/dashboard/create-post" element={<CreatePost/>}/>

        {/* ✅ Dashboard Route */}
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;
