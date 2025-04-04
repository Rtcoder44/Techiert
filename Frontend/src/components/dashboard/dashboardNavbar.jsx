// DashboardNavbar.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import TechiertLogo from "../techiert.logo";
import axios from "axios";
import { FaChevronDown, FaSearch, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DashboardNavbar = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [hoveredDropdown, setHoveredDropdown] = useState(null);
  const [dropdownCategories, setDropdownCategories] = useState([]);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/categories`)
      .then((response) => {
        const allCategories = response.data;

        const parentCategoryNames = [
          "tech news",
          "tech products",
          "comparisons",
          "how-to guides",
        ];
        const dropdownCategoryNames = [
          "mobile reviews",
          "laptop reviews",
          "tech accessories",
          "gaming",
        ];

        const parentCategories = allCategories.filter((cat) =>
          parentCategoryNames.includes(cat.name.toLowerCase())
        );

        const dropdownCategories = allCategories.filter((cat) =>
          dropdownCategoryNames.includes(cat.name.toLowerCase())
        );

        setCategories(parentCategories);
        setDropdownCategories(dropdownCategories);
      })
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedQuery.trim() === "") {
      setSearchResults([]);
    } else {
      setSearchResults(
        categories.filter((category) =>
          category.name.toLowerCase().includes(debouncedQuery.toLowerCase())
        )
      );
    }
  }, [debouncedQuery, categories]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const structuredCategories = [
    { name: "Tech News", slug: "tech-news" },
    { name: "Comparisons", slug: "comparisons" },
    { name: "How-To Guides", slug: "how-to-guides" },
    {
      name: "Tech Products",
      slug: "tech-products",
      isDropdown: true,
      children: dropdownCategories.map((cat) => ({
        name: cat.name,
        slug: cat.slug,
      })),
    },
  ];

  return (
    <nav className="bg-[#1E293B] text-white shadow-md px-6 py-4 flex items-center justify-between w-full relative z-[999]">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        {user && (
          <button onClick={toggleSidebar} className="focus:outline-none">
            <img
              src={user?.avatar || "/default-avatar.png"}
              alt="User Avatar"
              className="w-8 h-8 rounded-full border-2 border-white"
            />
          </button>
        )}
        <Link to="/dashboard">
          <TechiertLogo className="w-20" />
        </Link>
      </div>

      {/* Desktop Navbar */}
      <div className="hidden md:flex items-center space-x-6">
        <ul className="flex space-x-6">
          {structuredCategories.map((category) => (
            <li
              key={category.name}
              className="relative group"
              onMouseEnter={() =>
                category.isDropdown && setHoveredDropdown(category.name)
              }
              onMouseLeave={() => setHoveredDropdown(null)}
            >
              {category.isDropdown ? (
                <>
                  <Link to={`/dashboard/category/${category.slug}`} className="flex items-center gap-1 hover:text-[#E7000B]">
                    {category.name} <FaChevronDown />
                  </Link>
                  <AnimatePresence>
                    {hoveredDropdown === category.name && (
                      <motion.ul
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.3 }}
                        className="absolute left-0 top-full bg-[#1E293B] text-white shadow-lg rounded-md w-56 z-[999]"
                      >
                        {category.children.map((child, index) => (
                          <li key={index} className="px-4 py-2 hover:bg-gray-700">
                            <Link to={`/dashboard/category/${child.slug}`}>
                              {child.name}
                            </Link>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link to={`/dashboard/category/${category.slug}`} className="hover:text-[#E7000B]">
                  {category.name}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>


      {/* Search Bar */}
      <div className="hidden md:block relative ml-4 w-72 z-[999]">
        <FaSearch className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          className="px-10 py-2 rounded-lg bg-gray-100 text-black w-full"
          value={searchQuery}
          onChange={handleSearch}
        />
        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.ul
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 top-full w-full bg-white text-black rounded-md shadow-lg z-[999]"
            >
              {searchResults.map((result, index) => (
                <li key={index} className="px-4 py-2 hover:bg-gray-200">
                  <Link to={`/dashboard/category/${result.slug}`} onClick={() => setSearchQuery("")}>
                    {result.name}
                  </Link>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Menu Toggle */}
      <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white text-2xl">
        ☰
      </button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 bg-[#1E293B] text-white flex flex-col items-center space-y-4 pt-20 z-[999] w-full h-screen"
          >
            <button onClick={() => setMobileMenuOpen(false)} className="absolute top-5 right-5 text-3xl">
              <FaTimes />
            </button>

            <div className="w-4/5 relative z-[999]">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                className="w-full px-10 py-2 rounded-lg bg-white text-black"
                value={searchQuery}
                onChange={handleSearch}
              />
              <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.ul
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 top-full w-full bg-white text-black rounded-md shadow-lg z-[999]"
            >
              {searchResults.map((result, index) => (
                <li key={index} className="px-4 py-2 hover:bg-gray-200">
                  <Link to={`/dashboard/category/${result.slug}`} onClick={() => setSearchQuery("")}>
                    {result.name}
                  </Link>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
            </div>

            <div className="w-full flex flex-col items-center space-y-3 mt-6">
              {structuredCategories.map((category) => (
                <Link key={category.name} to={`/dashboard/category/${category.slug}`} onClick={() => setMobileMenuOpen(false)}>
                  {category.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default DashboardNavbar;
