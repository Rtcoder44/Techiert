import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const BlogFilters = ({ setBlogs }) => {
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    sort: "latest",
    status: "all", // ✅ Default: Show all (Published, Drafts, Private)
  });

  const [categories, setCategories] = useState([]); // ✅ State for categories

  // 🔹 Fetch categories from DB
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/categories`);
        if (response.data) {
          setCategories(response.data); // ✅ Store categories
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // 🔹 Fetch blogs automatically when filters change
  useEffect(() => {
    const fetchFilteredBlogs = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/blogs`, {
          params: {
            search: filters.search,
            category: filters.category,
            sort: filters.sort,
            status: filters.status, // ✅ Include status filter in API request
          },
        });

        if (response.data && response.data.blogs) {
          let sortedBlogs = response.data.blogs;

          // ✅ Frontend Sorting
          if (filters.sort === "latest") {
            sortedBlogs = sortedBlogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          } else if (filters.sort === "oldest") {
            sortedBlogs = sortedBlogs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          } else if (filters.sort === "popular") {
            sortedBlogs = sortedBlogs.sort((a, b) => (b.views || 0) - (a.views || 0));
          }

          setBlogs({ ...response.data, blogs: sortedBlogs });
        } else {
          setBlogs({ blogs: [], totalBlogs: 0, currentPage: 1, totalPages: 1 });
        }
      } catch (error) {
        console.error("Error fetching filtered blogs:", error);
      }
    };

    fetchFilteredBlogs();
  }, [filters]);

  const handleInputChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-wrap gap-4 items-center">
      {/* 🔹 Search Input */}
      <input
        type="text"
        name="search"
        value={filters.search}
        onChange={handleInputChange}
        placeholder="Search blogs..."
        className="border border-gray-300 p-2 rounded w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-[#E7000B]"
      />

      {/* 🔹 Category Dropdown (Fetched from DB) */}
      <select
        name="category"
        value={filters.category}
        onChange={handleInputChange}
        className="border border-gray-300 p-2 rounded w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-[#E7000B]"
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat._id} value={cat._id}>
            {cat.name}
          </option>
        ))}
      </select>

      {/* 🔹 Sorting Dropdown */}
      <select
        name="sort"
        value={filters.sort}
        onChange={handleInputChange}
        className="border border-gray-300 p-2 rounded w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-[#E7000B]"
      >
        <option value="latest">Latest</option>
        <option value="oldest">Oldest</option>
        <option value="popular">Most Popular</option>
      </select>

      {/* 🔹 Status Filter (Published, Drafts, Private) */}
      <select
        name="status"
        value={filters.status}
        onChange={handleInputChange}
        className="border border-gray-300 p-2 rounded w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-[#E7000B]"
      >
        <option value="all">All Blogs</option>
        <option value="published">Published</option>
        <option value="draft">Drafts</option>
        <option value="private">Private</option>
      </select>
    </div>
  );
};

export default BlogFilters;
