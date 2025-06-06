// components/SavePostButton.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaBookmark } from "react-icons/fa";
import { useAuth } from "../context/authContext";
import { showAuthError } from '../utils/notification';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SavePostButton = ({ postId }) => {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch saved status using populated savedPosts from /me
  useEffect(() => {
    const fetchSavedStatus = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/auth/me`, {
          withCredentials: true,
        });

        const savedPosts = res.data?.data?.savedPosts || [];
        const isPostSaved = savedPosts.some((post) => post._id === postId);
        setIsSaved(isPostSaved);
      } catch (error) {
        console.error("Failed to fetch user saved posts:", error.message);
      }
    };

    if (user) {
      fetchSavedStatus();
    }
  }, [user, postId]);

  // ✅ Toggle save/unsave
  const handleToggleSave = async () => {
    if (!user) {
      showAuthError("Please login to save posts");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/auth/save-post/${postId}`,
        {},
        { withCredentials: true }
      );

      setIsSaved(res.data.saved);
    } catch (error) {
      console.error("Error toggling saved post:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleSave}
      className="flex items-center gap-2 hover:scale-105 transition group"
      disabled={loading}
    >
      <FaBookmark
        className={`transition duration-200 ${
          isSaved ? "text-yellow-500" : "text-gray-600 group-hover:text-yellow-500"
        }`}
      />
      <span className={`${isSaved ? "text-yellow-500" : "text-gray-600"}`}>
        {isSaved ? "Saved" : "Save"}
      </span>
    </button>
  );
};

export default SavePostButton;
