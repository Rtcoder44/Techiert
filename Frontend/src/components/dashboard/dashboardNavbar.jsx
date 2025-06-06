// DashboardNavbar.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { useSelector } from 'react-redux';
import TechiertLogo from "../techiert.logo";
import { FaSearch, FaTimes, FaBlog, FaStore, FaShoppingCart, FaClipboardList, FaBars } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DashboardNavbar = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();
  const { items } = useSelector(state => state.cart);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search query
  React.useEffect(() => {
    const handler = setTimeout(() => {
      const trimmed = searchQuery.trim();
      if (trimmed.length >= 3) {
        setDebouncedQuery(trimmed);
      } else {
        setDebouncedQuery("");
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch search results
  React.useEffect(() => {
    if (debouncedQuery === "") {
      setSearchResults([]);
      return;
    }

    axios
      .post(`${API_BASE_URL}/api/blogs/search`, {
        query: debouncedQuery,
        authorId: user?.id || undefined,
      })
      .then((response) => {
        setSearchResults(response.data.results || []);
      })
      .catch((error) => {
        console.error("Error searching blogs:", error);
      });
  }, [debouncedQuery, user?.id]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const navLinks = [
    {
      name: "Blog",
      path: "/blog",
      icon: <FaBlog className="text-xl" />,
    },
    {
      name: "Store",
      path: "/store",
      icon: <FaStore className="text-xl" />,
    },
    {
      name: "Cart",
      path: "/cart",
      icon: <FaShoppingCart className="text-xl" />,
      badge: items.length > 0 ? items.length : null
    }
  ];

  // Add My Orders for logged-in users
  if (user) {
    navLinks.push({
      name: "My Orders",
      path: "/my-orders",
      icon: <FaClipboardList className="text-xl" />
    });
  }

  return (
    <nav className="bg-[#1E293B] border-b border-slate-700/50 text-white shadow-lg sticky top-0 z-[999]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleSidebar} 
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
              aria-label="Toggle Sidebar"
            >
              <FaBars className="text-xl" />
            </button>
            <Link to="/dashboard" className="flex items-center">
              <TechiertLogo className="h-8 w-auto" />
            </Link>
          </div>

          {/* Center Section - Navigation Links */}
          <div className="hidden lg:flex items-center justify-center flex-1 px-4">
            <div className="flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 relative group"
                >
                  <span className="flex items-center gap-2">
                    {link.icon}
                    <span>{link.name}</span>
                  </span>
                  {link.badge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Section - Search Only */}
          <div className="flex items-center">
            <div className="hidden md:block relative">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search blogs..."
                  className="w-64 pl-10 pr-4 py-2 bg-slate-700/50 text-white placeholder-slate-400 rounded-lg border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-96 bg-slate-800 rounded-lg shadow-lg border border-slate-700 overflow-hidden"
                  >
                    {searchResults.map((result) => (
                      <Link
                        key={result._id}
                        to={`/blog/${result.slug}`}
                        onClick={() => setSearchQuery("")}
                        className="block px-4 py-3 hover:bg-slate-700/50 border-b border-slate-700/50 last:border-0"
                      >
                        <h3 className="font-medium text-white">{result.title}</h3>
                        <p className="text-sm text-slate-400 mt-1 line-clamp-2">{result.excerpt}</p>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-slate-700/50"
          >
            <div className="px-4 py-3 space-y-3">
              {/* Mobile Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search blogs..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-700/50 text-white placeholder-slate-400 rounded-lg border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>

              {/* Mobile Navigation */}
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:text-white hover:bg-slate-700/50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.icon}
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 right-4 p-2 rounded-lg bg-slate-700/50 text-white hover:bg-slate-600/50 transition-all duration-200"
      >
        {mobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>
    </nav>
  );
};

export default DashboardNavbar;
