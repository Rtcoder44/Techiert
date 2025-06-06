import React from "react";
import { FaSearch, FaFilter } from "react-icons/fa";

const ProductFilters = ({ filters, setFilters }) => {
  // Handle any filter change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1, // Reset to page 1 on filter change
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "",
      sort: "latest",
      stock: "all",
      page: 1,
      limit: 10,
    });
  };

  return (
    <div className="p-4 border-b">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleInputChange}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E293B] focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex flex-wrap md:flex-nowrap gap-4">
          {/* Category Dropdown */}
          <div className="w-full md:w-48">
            <select
              name="category"
              value={filters.category}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E293B] focus:border-transparent appearance-none bg-white"
            >
              <option value="">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Fashion">Fashion</option>
              <option value="Home">Home</option>
              <option value="Beauty">Beauty</option>
              <option value="Sports">Sports</option>
              <option value="Books">Books</option>
              <option value="Others">Others</option>
            </select>
          </div>

          {/* Sort Options */}
          <div className="w-full md:w-48">
            <select
              name="sort"
              value={filters.sort}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E293B] focus:border-transparent appearance-none bg-white"
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="stock-low">Stock: Low to High</option>
              <option value="stock-high">Stock: High to Low</option>
            </select>
          </div>

          {/* Stock Filter */}
          <div className="w-full md:w-48">
            <select
              name="stock"
              value={filters.stock}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E293B] focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Stock</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock (≤10)</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          <button
            onClick={clearFilters}
            className="w-full md:w-auto px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2"
          >
            <FaFilter className="text-sm" />
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters; 