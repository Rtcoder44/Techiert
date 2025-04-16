import { useState } from "react";
import axios from "axios";
import "../../styles/auth.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/auth/forgot-password`,
        { email }
      );
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">Forgot Password</h2>

        {message && <p className="auth-success">{message}</p>}
        {error && <p className="error-text">{error}</p>}

        <form className="auth-form space-y-4" onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              className={`auth-input ${error ? "error-input" : ""}`}
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading || email.trim() === ""}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="auth-links">
          <a href="/login">Back to Login</a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
