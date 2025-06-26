// DashboardNavbar.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { useSelector } from 'react-redux';
import axios from "axios";
import TechiertLogo from "../techiert.logo";
import { FaSearch, FaTimes, FaBlog, FaStore, FaShoppingCart, FaClipboardList, FaBars } from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DashboardNavbar = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();
  const { items } = useSelector(state => state.cart);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search query
  React.useEffect(() => {
    const handler = setTimeout(() => {
      const trimmed = searchQuery.trim();
      if (trimmed.length >= 3) {
        setDebouncedQuery(trimmed);
      } else {
        setDebouncedQuery("");
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch search results
  React.useEffect(() => {
    if (debouncedQuery === "") {
      setSearchResults([]);
      setShowSearchResults(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    axios
      .post(`${API_BASE_URL}/api/blogs/search`, {
        query: debouncedQuery,
        authorId: user?.id || undefined,
      })
      .then((response) => {
        setSearchResults(response.data.results || []);
        setShowSearchResults(true);
      })
      .catch((error) => {
        console.error("Error searching blogs:", error);
        setSearchResults([]);
      })
      .finally(() => {
        setIsSearching(false);
      });
  }, [debouncedQuery, user?.id]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchFocus = () => {
    if (searchResults.length > 0) {
      setShowSearchResults(true);
    }
  };

  const handleSearchBlur = () => {
    // Delay hiding results to allow clicking on them
    setTimeout(() => {
      setShowSearchResults(false);
    }, 200);
  };

  const handleResultClick = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
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

          {/* Right Section - Search */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block relative">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search blogs..."
                  className="w-64 pl-10 pr-4 py-2 bg-slate-700/50 text-white placeholder-slate-400 rounded-lg border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={searchQuery}
                  onChange={handleSearch}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  </div>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute right-0 mt-2 w-96 bg-slate-800 rounded-lg shadow-lg border border-slate-700 overflow-hidden z-50">
                  {searchResults.map((result) => (
                    <Link
                      key={result._id}
                      to={`/blog/${result.slug}`}
                      onClick={handleResultClick}
                      className="block px-4 py-3 hover:bg-slate-700/50 border-b border-slate-700/50 last:border-0 transition-colors"
                    >
                      <h3 className="font-medium text-white">{result.title}</h3>
                      <p className="text-sm text-slate-400 mt-1 line-clamp-2">{result.excerpt}</p>
                    </Link>
                  ))}
                </div>
              )}

              {/* No Results */}
              {showSearchResults && searchResults.length === 0 && debouncedQuery && !isSearching && (
                <div className="absolute right-0 mt-2 w-96 bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-4 z-50">
                  <p className="text-slate-400 text-center">No blogs found for "{debouncedQuery}"</p>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-700/50 text-white hover:bg-slate-600/50 transition-all duration-200"
            >
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-700/50">
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
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                </div>
              )}
            </div>

            {/* Mobile Search Results */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="bg-slate-700/50 rounded-lg p-2 space-y-2 max-h-60 overflow-y-auto">
                {searchResults.map((result) => (
                  <Link
                    key={result._id}
                    to={`/blog/${result.slug}`}
                    onClick={() => {
                      handleResultClick();
                      setMobileMenuOpen(false);
                    }}
                    className="block p-2 hover:bg-slate-600/50 rounded transition-colors"
                  >
                    <h3 className="font-medium text-white text-sm">{result.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{result.excerpt}</p>
                  </Link>
                ))}
              </div>
            )}

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
        </div>
      )}
    </nav>
  );
};

export default DashboardNavbar;
