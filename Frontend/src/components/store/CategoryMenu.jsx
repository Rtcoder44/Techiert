import React, { useState, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CategoryMenu = ({ onSelectCategory }) => {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/product-categories`);
        setCategories(res.data || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center space-x-6 h-16 px-4 overflow-x-auto scrollbar-hide no-scrollbar">
          {loading ? (
            <div className="text-gray-400">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="text-gray-400">No categories available</div>
          ) : (
            categories.map((category) => {
              const hasChildren = category.children && category.children.length > 0;

              return (
                <div
                  key={category._id}
                  className="relative h-full"
                  onMouseEnter={() => hasChildren && setHoveredCategory(category._id)}
                  onMouseLeave={() => hasChildren && setHoveredCategory(null)}
                >
                  <button
                    className={`h-full flex items-center gap-1 text-gray-700 hover:text-blue-600 font-semibold px-3 py-2 rounded-md transition-colors ${
                      hoveredCategory === category._id ? 'text-blue-600 bg-blue-50' : ''
                    }`}
                    onClick={() => onSelectCategory(category._id)}
                  >
                    {category.name}
                    {hasChildren && (
                      <FaChevronDown
                        className={`ml-1 transition-transform duration-200 ${
                          hoveredCategory === category._id ? 'rotate-180' : ''
                        }`}
                        size={12}
                      />
                    )}
                  </button>

                  {/* Dropdown only if children exist and category is hovered */}
                  {hoveredCategory === category._id && hasChildren && (
                    <div className="absolute top-full left-0 w-48 bg-white shadow-lg rounded-md py-2 z-50 border border-gray-200">
                      {category.children.map((child) => (
                        <button
                          key={child._id}
                          onClick={() => onSelectCategory(child._id)}
                          className="block px-4 py-2 text-left text-gray-700 hover:bg-blue-50 w-full"
                        >
                          {child.name}
                        </button>
                      ))}

                      {/* Optionally a "View All" button */}
                      <button
                        onClick={() => onSelectCategory(category._id)}
                        className="mt-1 px-4 py-2 text-left text-blue-600 hover:bg-blue-100 w-full font-semibold border-t border-gray-100"
                      >
                        View All {category.name}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryMenu;
