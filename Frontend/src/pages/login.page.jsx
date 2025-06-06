import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/authContext"; 
import "../styles/auth.css"; 
import { FaEye, FaEyeSlash, FaExclamationCircle } from "react-icons/fa";
import { showNotification } from '../utils/notification';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); 
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateForm = () => {
    let newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setServerError("");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        formData,
        { withCredentials: true }
      );

      await login(formData);
      setLoading(false);
      navigate("/dashboard");

      showNotification.success(response.data.message);
    } catch (error) {
      setServerError(error.response?.data?.error || "Invalid Credentials");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">Welcome Back</h2>
        {serverError && (
          <div className="error-text text-center mb-4">
            <FaExclamationCircle />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="input-group">
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              className={`auth-input ${errors.email ? "error-input" : ""}`} 
              placeholder="Enter your email"
            />
            {errors.email && (
              <div className="error-text">
                <FaExclamationCircle />
                <span>{errors.email}</span>
              </div>
            )}
          </div>
          
          <div className="input-group">
            <input 
              type={showPassword ? "text" : "password"}
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              className={`auth-input ${errors.password ? "error-input" : ""}`} 
              placeholder="Enter your password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={togglePasswordVisibility}
              tabIndex="-1"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.password && (
              <div className="error-text">
                <FaExclamationCircle />
                <span>{errors.password}</span>
              </div>
            )}
          </div>
          
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? (
              <>
                <span className="loading-spinner mr-2"></span>
                <span>Logging in...</span>
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/forgot-password" className="hover:text-indigo-400">Forgot Password?</Link>
        </div>
        <div className="auth-links">
          Don't have an account? <Link to="/signup" className="hover:text-indigo-400">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
