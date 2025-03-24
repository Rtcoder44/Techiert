import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import TechiertLogo from "../techiert.logo"

const DashboardNavbar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState(null);
  let dropdownTimeout;

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    document.body.classList.toggle("overflow-hidden", mobileMenuOpen);
  };

  const toggleMobileDropdown = (menu) => {
    setActiveMobileDropdown(activeMobileDropdown === menu ? null : menu);
  };

  const handleDropdown = (menu) => {
    clearTimeout(dropdownTimeout);
    setActiveDropdown(menu);
  };

  const closeDropdownWithDelay = () => {
    dropdownTimeout = setTimeout(() => {
      setActiveDropdown(null);
    }, 300); // Delay to prevent instant closing
  };

  return (
    <nav className="bg-[#1E293B] text-white shadow-md px-6 py-4 flex justify-between items-center transition-all duration-300">
      {/* Left Section: Sidebar Toggle + Logo */}
      <div className="flex items-center space-x-4">
        {user && !isOpen && (
          <div className="cursor-pointer" onClick={toggleSidebar}>
            <img
              src={user?.avatar || "/default-avatar.png"}
              alt="User Avatar"
              className="w-13 h-13 rounded-full border-2 border-white object-cover"
            />
          </div>
        )}
        <Link to="/dashboard">
          <TechiertLogo/>
        </Link>
      </div>

      {/* Middle Section: Navbar Links & Search */}
      <div className="hidden md:flex items-center space-x-6">
        <ul className="flex space-x-6">
          <li><Link to="/" className="hover:text-[#6366F1] transition">Home</Link></li>
          
          {/* Tech News Dropdown */}
          <li
          >
            <Link to="/tech-news" className="hover:text-[#6366F1] transition">
              Tech News             </Link>
          </li>

          {/* Automobiles Dropdown */}
          <li
            className="relative"
            onMouseEnter={() => handleDropdown("automobiles")}
            onMouseLeave={closeDropdownWithDelay}
          >
            <Link to="/automobiles" className="hover:text-[#6366F1] transition">
              Automobiles ▼
            </Link>
            {activeDropdown === "automobiles" && (
              <ul className="absolute left-0 top-full bg-white text-black shadow-lg rounded-md w-48 transition-opacity duration-300 opacity-100">
                <li className="px-4 py-2 hover:bg-gray-200"><Link to="/automobiles/bike-reviews">Bike Reviews</Link></li>
                <li className="px-4 py-2 hover:bg-gray-200"><Link to="/automobiles/car-reviews">Car Reviews</Link></li>
                <li className="px-4 py-2 hover:bg-gray-200"><Link to="/automobiles/electric-vehicles">Electric Vehicles</Link></li>
              </ul>
            )}
          </li>

          {/* Tech Products Dropdown */}
          <li
            className="relative"
            onMouseEnter={() => handleDropdown("tech-products")}
            onMouseLeave={closeDropdownWithDelay}
          >
            <Link to="/tech-products" className="hover:text-[#6366F1] transition">
              Tech Products ▼
            </Link>
            {activeDropdown === "tech-products" && (
              <ul className="absolute left-0 top-full bg-white text-black shadow-lg rounded-md w-56 transition-opacity duration-300 opacity-100">
                <li className="px-4 py-2 hover:bg-gray-200"><Link to="/tech-products/mobile-reviews">Mobile Reviews</Link></li>
                <li className="px-4 py-2 hover:bg-gray-200"><Link to="/tech-products/laptops">Laptops</Link></li>
                <li className="px-4 py-2 hover:bg-gray-200"><Link to="/tech-products/tech-accessories">Tech Accessories</Link></li>
                <li className="px-4 py-2 hover:bg-gray-200"><Link to="/tech-products/gaming">Gaming</Link></li>
              </ul>
            )}
          </li>

          <li><Link to="/comparisons" className="hover:text-[#6366F1] transition">Comparisons</Link></li>
          <li><Link to="/how-to-guides" className="hover:text-[#6366F1] transition">How-To Guides</Link></li>
        </ul>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 rounded-full bg-[#F1F5F9] text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
          />
          <button className="absolute right-2 top-2 text-gray-600">
            🔍
          </button>
        </div>
        {!user && (
            <Link
              to="/login"
              className="bg-[#6366F1] text-white px-4 py-2 rounded hover:bg-[#5254d8] transition text-center"
            >
              Login
            </Link>
          )}
      </div>

     {/* Mobile Menu Button */}
     <div className="md:hidden">
        <button onClick={toggleMobileMenu} className="text-white text-2xl focus:outline-none">
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-16 right-0 bg-white w-full shadow-md p-4 flex flex-col space-y-2 md:hidden overflow-hidden">
          <Link to="/" className="text-gray-800 hover:bg-gray-200 px-4 py-2">Home</Link>

          {/* Tech News Dropdown */}
          <div className="relative">
            <button
              className="text-gray-800 hover:bg-gray-200 px-4 py-2 w-full text-left"
              onClick={() => toggleMobileDropdown("tech-news")}
            >
              Tech News {activeMobileDropdown === "tech-news" ? "▲" : "▼"}
            </button>
            {activeMobileDropdown === "tech-news" && (
              <div className="ml-4 flex flex-col space-y-1">
                <Link to="/tech-news" className="text-gray-700 hover:bg-gray-300 px-4 py-2">Latest News</Link>
              </div>
            )}
          </div>

          {/* Tech Products Dropdown */}
          <div className="relative">
            <button
              className="text-gray-800 hover:bg-gray-200 px-4 py-2 w-full text-left"
              onClick={() => toggleMobileDropdown("tech-products")}
            >
              Tech Products {activeMobileDropdown === "tech-products" ? "▲" : "▼"}
            </button>
            {activeMobileDropdown === "tech-products" && (
              <div className="ml-4 flex flex-col space-y-1">
                <Link to="/tech-product/mobile-reviews" className="text-gray-700 hover:bg-gray-300 px-4 py-2">Mobile Reviews</Link>
                <Link to="/tech-product/laptop-reviews" className="text-gray-700 hover:bg-gray-300 px-4 py-2">Laptop Reviews</Link>
                <Link to="/tech-product/gadgets" className="text-gray-700 hover:bg-gray-300 px-4 py-2">Gadgets</Link>
              </div>
            )}
          </div>

          {/* Automobiles Dropdown */}
          <div className="relative">
            <button
              className="text-gray-800 hover:bg-gray-200 px-4 py-2 w-full text-left"
              onClick={() => toggleMobileDropdown("automobiles")}
            >
              Automobiles {activeMobileDropdown === "automobiles" ? "▲" : "▼"}
            </button>
            {activeMobileDropdown === "automobiles" && (
              <div className="ml-4 flex flex-col space-y-1">
                <Link to="/automobiles/bike-reviews" className="text-gray-700 hover:bg-gray-300 px-4 py-2">Bike Reviews</Link>
                <Link to="/automobiles/car-reviews" className="text-gray-700 hover:bg-gray-300 px-4 py-2">Car Reviews</Link>
                <Link to="/automobiles/electric-vehicles" className="text-gray-700 hover:bg-gray-300 px-4 py-2">Electric Vehicles</Link>
              </div>
            )}
          </div>

          <Link to="/comparisons" className="text-gray-800 hover:bg-gray-200 px-4 py-2">Comparisons</Link>
          <Link to="/how-to-guides" className="text-gray-800 hover:bg-gray-200 px-4 py-2">How-To Guides</Link>

          {/* Login Button in Mobile Menu */}
          {!user && (
            <Link
              to="/login"
              className="bg-[#6366F1] text-white px-4 py-2 rounded hover:bg-[#5254d8] transition text-center"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default DashboardNavbar;
