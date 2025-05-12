import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import BlogTable from "../components/manageBlog/blogTable";
import BlogFilters from "../components/manageBlog/blogFilters";
import DashboardSidebar from "../components/dashboard/dashboardSidebar";
import axios from "axios";
import { FaBars } from "react-icons/fa";
import ClearCacheButton from "../components/manageBlog/clearAllCache"; // Import the ClearCacheButton component
import { useAuth } from "../context/authContext"; // Import the AuthContext to get user info

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

const ManageBlog = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth(); // Get user and loading state from AuthContext
  const [blogs, setBlogs] = useState({ blogs: [], totalBlogs: 0, currentPage: 1, totalPages: 1 });
  const [loadingBlogs, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    sort: "latest",
    status: "all",
    page: 1,
    limit: 10,
  });

  const fetchBlogs = useCallback(
    debounce(async (filters) => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/blogs`, { params: filters });
        setBlogs(data?.blogs ? data : { blogs: [], totalBlogs: 0, currentPage: 1, totalPages: 1 });
        setError(null);
      } catch {
        setError("Failed to load blogs. Please try again.");
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchBlogs(filters);
  }, [filters, fetchBlogs]);

  const handlePreviousPage = () => {
    if (filters.page > 1) {
      setFilters((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  };

  const handleNextPage = () => {
    if (filters.page < blogs.totalPages) {
      setFilters((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex">
      <DashboardSidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {!isSidebarOpen && (
        <button
          className="absolute top-5 left-6 bg-[#1E293B] text-white p-3 rounded-full shadow-md hover:bg-red-700 transition"
          onClick={() => setIsSidebarOpen(true)}
        >
          <FaBars className="text-xl" />
        </button>
      )}

      <div className={`flex-1 p-6 bg-[#F1F5F9] min-h-screen text-[#1E293B] transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-0"}`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl mb-6 ml-13 font-bold">Manage Blog</h1>
          <button
            className="px-6 py-3 bg-[#1E293B] text-white rounded-lg hover:bg-[#0F172A] transition"
            onClick={() => navigate("/dashboard/create-post")}
          >
            + Add New Post
          </button>
        </div>

        <BlogFilters filters={filters} setFilters={setFilters} />

        {loadingBlogs ? (
          <p className="text-lg text-gray-600">Loading...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <>
            <BlogTable blogs={blogs} setBlogs={setBlogs} />
            <div className="flex justify-center mt-6">
              <button
                className={`px-4 py-2 mx-2 rounded ${filters.page === 1 ? "bg-gray-400 cursor-not-allowed" : "bg-[#E7000B] text-white hover:bg-red-700"}`}
                disabled={filters.page === 1}
                onClick={handlePreviousPage}
              >
                Previous
              </button>

              <span className="px-4 py-2">Page {filters.page} of {blogs.totalPages}</span>

              <button
                className={`px-4 py-2 mx-2 rounded ${filters.page >= blogs.totalPages ? "bg-gray-400 cursor-not-allowed" : "bg-[#1E293B] text-white hover:bg-gray-800"}`}
                disabled={filters.page >= blogs.totalPages}
                onClick={handleNextPage}
              >
                Next
              </button>
              {/* Fixed bottom button */}
      <div className=" bottom-6 right-10 z-50">
        <ClearCacheButton />
      </div>
            </div>
          </>
        )}
      </div>

      
    </div>
  );
};

export default ManageBlog;
