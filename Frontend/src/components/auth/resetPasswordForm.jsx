import { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../../styles/auth.css"; // Ensuring the CSS is applied properly

const ResetPasswordForm = () => {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
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
        `http://localhost:5000/api/auth/reset-password/${token}`,
        { newPassword }
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
        <h2 className="auth-title">Reset Password</h2>

        {message && <p className="auth-success">{message}</p>}
        {error && <p className="error-text">{error}</p>}

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

          <button type="submit" className="auth-button" disabled={loading}>
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
