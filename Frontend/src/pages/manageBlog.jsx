import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BlogTable from "../components/manageBlog/blogTable";
import BlogFilters from "../components/manageBlog/blogFilters";
import DashboardSidebar from "../components/dashboard/dashboardSidebar";
import axios from "axios";
import { FaBars } from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ManageBlog = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState({ blogs: [], totalBlogs: 0, currentPage: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ✅ Filters + Pagination State (All in One)
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    sort: "latest",
    status: "all",
    page: 1,
    limit: 10,
  });

  // ✅ Fetch Blogs on Filters Change
  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${API_BASE_URL}/api/blogs`, {
          params: filters,
        });

        if (response.data && response.data.blogs) {
          setBlogs(response.data);
        } else {
          setBlogs({ blogs: [], totalBlogs: 0, currentPage: 1, totalPages: 1 });
        }
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
        setError("Failed to load blogs. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [filters]);

  // ✅ Pagination Handlers
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

  return (
    <div className="flex">
      {/* ✅ Sidebar */}
      <DashboardSidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* ✅ Sidebar Toggle Button */}
      {!isSidebarOpen && (
        <button
          className="absolute top-5 left-6 bg-[#1E293B] text-white p-3 rounded-full shadow-md hover:bg-red-700 transition"
          onClick={() => setIsSidebarOpen(true)}
        >
          <FaBars className="text-xl" />
        </button>
      )}

      {/* ✅ Main Content Area */}
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

        {/* ✅ Blog Filters */}
        <BlogFilters filters={filters} setFilters={setFilters} />

        {/* ✅ Blog Table or Loading/Error */}
        {loading ? (
          <p className="text-lg text-gray-600">Loading...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <>
            <BlogTable blogs={blogs} setBlogs={setBlogs} />

            {/* ✅ Pagination Controls */}
            <div className="flex justify-center mt-6">
              <button
                className={`px-4 py-2 mx-2 rounded ${
                  filters.page === 1 ? "bg-gray-400 cursor-not-allowed" : "bg-[#E7000B] text-white hover:bg-red-700"
                }`}
                disabled={filters.page === 1}
                onClick={handlePreviousPage}
              >
                Previous
              </button>

              <span className="px-4 py-2">Page {filters.page} of {blogs.totalPages}</span>

              <button
                className={`px-4 py-2 mx-2 rounded ${
                  filters.page >= blogs.totalPages ? "bg-gray-400 cursor-not-allowed" : "bg-[#1E293B] text-white hover:bg-gray-800"
                }`}
                disabled={filters.page >= blogs.totalPages}
                onClick={handleNextPage}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ManageBlog;
