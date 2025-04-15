import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const BlogFilters = ({ filters, setFilters }) => {
  const [categories, setCategories] = useState([]);

  // 🔹 Fetch all categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/categories`);
        if (response.data) setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // 🔹 Handle any filter change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1, // Reset to page 1 on filter change
    }));
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

      {/* 🔹 Category Dropdown */}
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

      {/* 🔹 Sort Options */}
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

      {/* 🔹 Status Filter */}
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
