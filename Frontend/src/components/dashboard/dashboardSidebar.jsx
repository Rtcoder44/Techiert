import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  FaTimes, 
  FaHome, 
  FaBox, 
  FaShoppingBag, 
  FaChartLine, 
  FaList, 
  FaUsers, 
  FaCog, 
  FaChevronDown, 
  FaSignOutAlt,
  FaBlog,
  FaEdit,
  FaTags,
  FaShoppingCart,
  FaClipboardList,
  FaBookmark
} from "react-icons/fa";
import { useAuth } from "../../context/authContext";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DashboardSidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [categories, setCategories] = useState([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/categories`)
      .then((response) => {
        setCategories(response.data);
      })
      .catch((error) => {
        console.error("❌ Error fetching categories:", error);
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
      });
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/blog');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Define menu items based on user role
  const getMenuItems = () => {
    // Common items for all users (including non-logged in)
    const commonItems = [
      {
        title: "Navigation",
        items: [
          {
            name: "Overview",
            path: "/dashboard",
            icon: <FaHome className="text-xl" />,
          },
          {
            name: "Blog",
            path: "/blog",
            icon: <FaBlog className="text-xl" />,
          },
          {
            name: "Store",
            path: "/store",
            icon: <FaShoppingBag className="text-xl" />,
          },
          {
            name: "Cart",
            path: "/cart",
            icon: <FaShoppingCart className="text-xl" />,
          },
          {
            name: "Track Order",
            path: "/track-order",
            icon: <FaBox className="text-xl" />,
          }
        ],
      },
      {
        title: "Blog Categories",
        items: [
          {
            name: "Categories",
            isDropdown: true,
            icon: <FaList className="text-xl" />,
            categories: categories,
          },
        ],
      }
    ];

    // Add features for logged-in users
    if (user) {
      commonItems[0].items.push({
        name: "My Orders",
        path: "/my-orders",
        icon: <FaClipboardList className="text-xl" />,
      });

      commonItems.push({
        title: "Personal",
        items: [
          {
            name: "Saved Posts",
            path: "/saved-posts",
            icon: <FaBookmark className="text-xl" />,
          },
          {
            name: "Settings",
            path: "/dashboard/settings",
            icon: <FaCog className="text-xl" />,
          }
        ],
      });
    }

    // Admin-only menu items
    if (user?.role === "admin") {
      commonItems.push(
        {
          title: "Blog Management",
          items: [
            {
              name: "Create Blog",
              path: "/dashboard/create-post",
              icon: <FaEdit className="text-xl" />,
            },
            {
              name: "Manage Blogs",
              path: "/dashboard/manage-blogs",
              icon: <FaBlog className="text-xl" />,
            },
            {
              name: "Category Management",
              path: "/dashboard/manage-categories",
              icon: <FaTags className="text-xl" />,
            }
          ],
        },
        {
          title: "Store Management",
          items: [
            {
              name: "Add Product",
              path: "/dashboard/add-product",
              icon: <FaBox className="text-xl" />,
            },
            {
              name: "Manage Products",
              path: "/dashboard/manage-products",
              icon: <FaShoppingBag className="text-xl" />,
            }
          ],
        },
        {
          title: "Administration",
          items: [
            {
              name: "Analytics",
              path: "/dashboard/analytics",
              icon: <FaChartLine className="text-xl" />,
            },
            {
              name: "User Management",
              path: "/dashboard/users",
              icon: <FaUsers className="text-xl" />,
            }
          ],
        }
      );
    }

    return commonItems;
  };

  const menuItems = getMenuItems();

  return (
    <div
      className={`fixed top-0 left-0 h-screen w-64 bg-[#1E293B] border-r border-slate-700/50 shadow-xl z-40 flex flex-col transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-700/50">
        <h2 className="text-lg font-semibold text-white">Dashboard</h2>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
        >
          <FaTimes className="text-xl" />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-4 space-y-8">
          {menuItems.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item, itemIndex) => {
                  if (item.isDropdown) {
                    return (
                      <div key={itemIndex}>
                        <button
                          onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                          className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                            isActive(item.path)
                              ? "bg-slate-700 text-white"
                              : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{item.icon}</span>
                            <span>{item.name}</span>
                          </div>
                          <div
                            className={`transition-transform duration-200 ${
                              isCategoryOpen ? 'rotate-180' : 'rotate-0'
                            }`}
                          >
                            <FaChevronDown className="text-sm opacity-75" />
                          </div>
                        </button>
                        <div className={`overflow-hidden transition-all duration-200 ${
                          isCategoryOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}>
                          <div className="mt-1">
                            {categories.map((category) => (
                              <Link
                                key={category._id}
                                to={`/blog/category/${category.slug}`}
                                className={`flex items-center pl-11 pr-3 py-2 text-sm transition-colors ${
                                  isActive(`/blog/category/${category.slug}`)
                                    ? "bg-slate-700 text-white"
                                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                                }`}
                              >
                                {category.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={itemIndex}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors relative ${
                        isActive(item.path)
                          ? "bg-slate-700 text-white"
                          : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.name}</span>
                      {isActive(item.path) && (
                        <div className="absolute left-0 w-1 h-full bg-blue-500 rounded-r" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700/50">
        {user ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <img
                src={user.avatar || "/default-avatar.png"}
                alt={user.name}
                className="w-10 h-10 rounded-full border-2 border-slate-600"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full gap-2 px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors group"
            >
              <FaSignOutAlt className="text-lg transition-transform duration-200 group-hover:translate-x-1" />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center justify-center w-full px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Login
          </Link>
        )}
      </div>
    </div>
  );
};

export default DashboardSidebar;
