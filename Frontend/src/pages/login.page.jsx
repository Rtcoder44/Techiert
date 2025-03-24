import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/authContext"; // Import Auth Context
import "../styles/auth.css"; // Import styles

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Get login function from context
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

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
        "http://localhost:5000/api/auth/login",
        formData,
        { withCredentials: true } // ✅ FIX: Allow cookies
      );

      alert(response.data.message);
      await login(); // ✅ FIX: Fetch user data after login
      navigate("/dashboard");
    } catch (error) {
      setServerError(error.response?.data?.error || "Invalid Credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">Login to Your Account</h2>
        {serverError && <p className="error-text text-center">{serverError}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" name="email" value={formData.email} onChange={handleChange} className="auth-input" placeholder="Enter your email" />
          <input type="password" name="password" value={formData.password} onChange={handleChange} className="auth-input" placeholder="Enter your password" />
          <button type="submit" className="auth-button" disabled={loading}>{loading ? "Logging In..." : "Login"}</button>
        </form>

        <p className="auth-links">
          Forgot Password? <Link to="/forgot-password" className="link">Reset here</Link>
        </p>
        <p className="auth-links">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
