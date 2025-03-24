import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { FaTimes } from "react-icons/fa";

/*************  ✨ Codeium Command ⭐  *************/
/**
 * DashboardSidebar component renders a sidebar navigation menu for the dashboard.
 * 
 * @param {boolean} isOpen - Determines if the sidebar is open or not.
 * @param {Function} toggleSidebar - Function to toggle the sidebar open/closed state.
 * 
 * The component displays different menu items based on the user's role (admin or regular user).
 * It includes a user avatar, user information, navigation links, and a logout button.
 * The sidebar is only visible when the user is authenticated.
 */

/******  76bc96ff-aaa2-41ef-8e30-78a72a0cc428  *******/const DashboardSidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return (
      <aside className="min-h-screen bg-gray-900 text-white w-64 p-5 flex items-center justify-center">
        <p>Loading...</p>
      </aside>
    );
  }

  if (!user) return null;

  const menuItems =
    user?.role === "admin"
      ? [
          { name: "Dashboard", path: "/dashboard" },
          { name: "Manage Blog", path: "/dashboard/blog" },
          { name: "Manage Users", path: "/dashboard/users" },
          { name: "Analytics", path: "/dashboard/analytics" },
          { name: "Settings", path: "/dashboard/settings" },
          { name: "Add New Post", path: "/dashboard/create-post" },
        ]
      : [
          { name: "Dashboard", path: "/dashboard" },
          { name: "Saved Posts", path: "/dashboard/saved-posts" },
          { name: "My Comments", path: "/dashboard/comments" },
          { name: "Profile", path: "/dashboard/profile" },
        ];

  return (
    <aside
      className={`min-h-screen bg-gray-900 text-white w-64 p-5 transition-all duration-300 flex flex-col justify-between fixed top-0 left-0 ${
        isOpen ? "translate-x-0" : "-translate-x-64"
      }`}
    >
      <div>
        {/* Close Button */}
        <button className="absolute top-5 right-5 text-white text-2xl" onClick={toggleSidebar}>
          <FaTimes />
        </button>

        {/* Avatar & User Info */}
        <div className="flex items-center space-x-3 mb-6">
          <img
            src={user?.avatar || "/default-avatar.png"}
            alt="User Avatar"
            className="w-16 h-16 rounded-full border-2 border-white object-cover"
          />
          <div>
            <p className="text-lg font-bold">{user?.name}</p>
          </div>
        </div>

        {/* Menu Items */}
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className="block py-2 px-4 rounded hover:bg-gray-700 transition"
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Logout Button (Fixed at the Bottom) */}
      <button
        onClick={logout}
        className="w-full py-2 mt-4 bg-red-500 hover:bg-red-600 transition rounded text-center"
      >
        Logout
      </button>
    </aside>
  );
};

export default DashboardSidebar;
