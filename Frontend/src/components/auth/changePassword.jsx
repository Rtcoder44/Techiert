import React, { useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      return setError("New passwords do not match.");
    }

    try {
      setLoading(true);
      const { data } = await axios.put(
        `${API_BASE_URL}/api/auth/change-password`,
        { currentPassword, newPassword },
        { withCredentials: true }
      );
      setMessage(data.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const renderPasswordInput = (value, setValue, fieldKey, placeholder) => (
    <div className="relative w-full">
      <input
        type={showPassword[fieldKey] ? "text" : "password"}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        required
        className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500 transition pr-10 text-gray-900 placeholder-gray-500"
      />
      <span
        onClick={() => toggleVisibility(fieldKey)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 text-sm"
      >
        {showPassword[fieldKey] ? "🙈" : "👁️"}
      </span>
    </div>
  );

  return (
    <form className="space-y-4 max-w-md" onSubmit={handleChangePassword}>
      {message && <p className="text-green-600 font-medium">{message}</p>}
      {error && <p className="text-red-600 font-medium">{error}</p>}

      {renderPasswordInput(currentPassword, setCurrentPassword, "current", "Current Password")}
      {renderPasswordInput(newPassword, setNewPassword, "new", "New Password")}
      {renderPasswordInput(confirmPassword, setConfirmPassword, "confirm", "Confirm New Password")}

      <button
        type="submit"
        className="bg-[#E7000B] text-white px-5 py-2 rounded hover:bg-red-700 transition shadow disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Updating..." : "Change Password"}
      </button>
    </form>
  );
};

export default ChangePassword;
