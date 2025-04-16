import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/auth.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ResetPasswordForm = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/auth/reset-password/${token}`,
        { newPassword }
      );
      setMessage(data.message);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">Reset Password</h2>

        {message && <p className="auth-success">{message}</p>}
        {error && <p className="error-text">{error}</p>}

        {error === "Invalid or expired token" && (
          <div className="mt-2">
            <a href="/forgot-password" className="text-blue-500 underline">
              Request a new reset link
            </a>
          </div>
        )}

        <form className="auth-form space-y-4" onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="password"
              className={`auth-input ${error ? "error-input" : ""}`}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading || newPassword.trim() === ""}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="auth-links">
          <a href="/login">Back to Login</a>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
