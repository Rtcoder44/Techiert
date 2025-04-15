import React, { useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const UpdateProfilePicture = ({ user, setUserData, setUser }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(user.avatar || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await axios.put(
        `${API_BASE_URL}/api/auth/update-avatar`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUserData(res.data.user);
      setUser && setUser(res.data.user);
      setMessage("Profile picture updated ✅");
    } catch (err) {
      console.error("Upload failed:", err);
      setMessage("Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <img
          src={preview}
          alt="Profile Preview"
          className="w-24 h-24 rounded-full object-cover border border-gray-300 shadow-md"
        />

        <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
          <label className="block w-full sm:w-auto cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <span className="block text-center text-sm font-semibold bg-red-50 text-red-700 px-4 py-2 rounded hover:bg-red-100 transition cursor-pointer border border-red-200">
              Choose File
            </span>
          </label>

          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className="bg-[#E7000B] text-white px-5 py-2 rounded hover:bg-red-700 transition-shadow shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Uploading..." : "Update"}
          </button>
        </div>
      </div>

      {message && (
        <p className="text-sm text-gray-600">{message}</p>
      )}
    </div>
  );
};

export default UpdateProfilePicture;
