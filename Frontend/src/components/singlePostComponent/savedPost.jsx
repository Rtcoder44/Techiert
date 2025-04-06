import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import DashboardLayout from "../dashboard/dashboardLayout";
import { FaRegFolderOpen } from "react-icons/fa6";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ✅ Basic Skeleton Loader
const SkeletonCard = () => (
  <div className="bg-white shadow p-4 rounded-xl animate-pulse">
    <div className="w-full h-40 bg-gray-300 rounded-md mb-3"></div>
    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
  </div>
);

const SavedPosts = () => {
  const { user } = useAuth();
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/auth/saved-posts`, {
          withCredentials: true,
        });

        setSavedPosts(res.data.savedPosts);
      } catch (error) {
        console.error("Failed to fetch saved posts:", error.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchSavedPosts();
    }
  }, [user]);

  return (
    <DashboardLayout>
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
          <FaRegFolderOpen className="text-primary" />
          Your Saved Posts
        </h2>

        {!user ? (
          <p className="text-center text-gray-600">Please log in to see saved posts.</p>
        ) : loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : savedPosts.length === 0 ? (
          <p className="text-gray-600">No posts saved yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedPosts.map((post) => (
              <Link
                to={`/blog/${post.slug}`}
                key={post._id}
                className="bg-white shadow p-4 rounded-xl hover:shadow-lg transition"
              >
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-40 object-cover rounded-md mb-3"
                  loading="lazy"
                />
                <h3 className="text-lg font-semibold text-gray-800">{post.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{post.category?.name}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SavedPosts;
