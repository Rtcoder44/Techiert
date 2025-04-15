import React, { useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const EditName = ({ user, setUserData, setUser }) => {
  const [name, setName] = useState(user.name || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      const res = await axios.put(
        `${API_BASE_URL}/api/auth/update-name`,
        { name },
        { withCredentials: true }
      );
      setUserData(res.data.user);
      setUser && setUser(res.data.user);
      setMessage("Name updated successfully ✅");
    } catch (err) {
      console.error("Error updating name:", err);
      setMessage("Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleUpdateName}
      className="flex flex-col sm:flex-row items-center gap-4 mt-4"
    >
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
        className="w-full sm:max-w-sm border border-gray-300 px-4 py-2 rounded-md shadow-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E7000B] transition"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-[#E7000B] text-white px-5 py-2 rounded-md hover:bg-red-700 transition-shadow shadow disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Saving..." : "Save"}
      </button>
      {message && (
        <p className="text-sm text-gray-600 sm:ml-4 mt-2 sm:mt-0">{message}</p>
      )}
    </form>
  );
};

export default EditName;
