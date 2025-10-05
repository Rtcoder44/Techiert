import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/dashboard/dashboardLayout";
import axios from "axios";
import SummaryCard from "../components/AnalyticsComponents/summeryCard";
import { 
  FaBlog, 
  FaStore, 
  FaChartLine, 
  FaBox, 
  FaTags, 
  FaEdit, 
  FaUsers, 
  FaClipboardList, 
  FaShoppingCart,
  FaBookmark,
  FaCog
} from "react-icons/fa";
import { useAuth } from "../context/authContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBlogs: 0,
    totalProducts: 0,
    totalViews: 0,
    totalSales: 0,
  });
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Adjusted endpoints to match backend
        const analyticsReq = user?.role === 'admin'
          ? axios.get(`${API_BASE_URL}/api/analytics`, { withCredentials: true })
          : Promise.resolve({ data: { totalBlogs: 0, totalProducts: 0, totalViews: 0, totalSales: 0 } });

        const blogsReq = axios.get(`${API_BASE_URL}/api/blogs/latest`);
        const productsReq = axios.get(`${API_BASE_URL}/api/products`, { params: { sort: 'latest', page: 1, limit: 5 } });
        const ordersReq = user ? axios.get(`${API_BASE_URL}/api/orders`, { withCredentials: true }) : Promise.resolve({ data: { orders: [] } });

        const [statsRes, blogsRes, productsRes, ordersRes] = await Promise.all([
          analyticsReq, blogsReq, productsReq, ordersReq
        ]);

        setStats(statsRes.data || { totalBlogs: 0, totalProducts: 0, totalViews: 0, totalSales: 0 });
        setRecentBlogs(blogsRes.data.blogs || blogsRes.data || []);
        setRecentProducts(productsRes.data.products || []);
        setRecentOrders(ordersRes.data.orders || []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Define features based on user role
  const getFeatures = () => {
    const commonFeatures = [
      {
        title: "Browse Blog",
        icon: <FaBlog className="text-4xl text-blue-500" />,
        description: "Read our latest tech blog posts",
        link: "/blog",
        linkText: "Go to Blog"
      },
      {
        title: "Shop Store",
        icon: <FaStore className="text-4xl text-green-500" />,
        description: "Browse our tech product store",
        link: "/store",
        linkText: "Go to Store"
      },
      {
        title: "Shopping Cart",
        icon: <FaShoppingCart className="text-4xl text-yellow-500" />,
        description: "View your shopping cart",
        link: "/cart",
        linkText: "View Cart"
      },
      {
        title: "My Orders",
        icon: <FaClipboardList className="text-4xl text-purple-500" />,
        description: "Track your orders",
        link: "/my-orders",
        linkText: "View Orders"
      },
      {
        title: "Track Order",
        icon: <FaBox className="text-4xl text-orange-500" />,
        description: "Track your order by order number",
        link: "/track-order",
        linkText: "Track Order"
      }
    ];

    // Add features for logged-in users
    if (user) {
      commonFeatures.push(
        {
          title: "Saved Posts",
          icon: <FaBookmark className="text-4xl text-indigo-500" />,
          description: "Access your saved blog posts",
          link: "/saved-posts",
          linkText: "View Saved"
        },
        {
          title: "Settings",
          icon: <FaCog className="text-4xl text-gray-500" />,
          description: "Manage your account settings",
          link: "/dashboard/settings",
          linkText: "View Settings"
        }
      );
    }

    if (user?.role === "admin") {
      return [
        ...commonFeatures,
        {
          title: "Create Blog Post",
          icon: <FaEdit className="text-4xl text-indigo-500" />,
          description: "Write a new blog post",
          link: "/dashboard/create-post",
          linkText: "Create Post"
        },
        {
          title: "Manage Blogs",
          icon: <FaBlog className="text-4xl text-red-500" />,
          description: "Manage your blog posts",
          link: "/dashboard/manage-blogs",
          linkText: "Manage Blogs"
        },
        {
          title: "Add Product",
          icon: <FaBox className="text-4xl text-orange-500" />,
          description: "Add new store products",
          link: "/dashboard/add-product",
          linkText: "Add Product"
        },
        {
          title: "Manage Products",
          icon: <FaStore className="text-4xl text-emerald-500" />,
          description: "Manage store products",
          link: "/dashboard/manage-products",
          linkText: "Manage Products"
        },
        {
          title: "Category Management",
          icon: <FaTags className="text-4xl text-pink-500" />,
          description: "Manage blog and product categories",
          link: "/dashboard/manage-categories",
          linkText: "Manage Categories"
        },
        {
          title: "Analytics",
          icon: <FaChartLine className="text-4xl text-cyan-500" />,
          description: "View detailed analytics",
          link: "/dashboard/analytics",
          linkText: "View Analytics"
        },
        {
          title: "User Management",
          icon: <FaUsers className="text-4xl text-teal-500" />,
          description: "Manage user accounts",
          link: "/dashboard/users",
          linkText: "Manage Users"
        }
      ];
    }

    return commonFeatures;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-10 space-y-4 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-[#1E293B] to-blue-800 rounded-xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Welcome{user ? `, ${user.name}` : " to Techiert"}
          </h1>
          <p className="text-gray-200">
            {user?.role === "admin" 
              ? "Manage your tech blog and store all in one place"
              : "Explore our tech blog and store"}
          </p>
        </div>

        {/* Stats Overview (Admin Only) */}
        {user?.role === "admin" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SummaryCard label="Total Blogs" value={stats.totalBlogs} color="border-blue-500" />
            <SummaryCard label="Total Products" value={stats.totalProducts} color="border-green-500" />
            <SummaryCard label="Total Views" value={stats.totalViews} color="border-purple-500" />
            <SummaryCard label="Total Sales" value={stats.totalSales} color="border-orange-500" />
          </div>
        )}

        {/* Quick Access Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {getFeatures().map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center space-y-4">
                {feature.icon}
                <h3 className="text-xl font-semibold text-[#1E293B]">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
                <Link
                  to={feature.link}
                  className="mt-4 px-6 py-2 bg-[#1E293B] text-white rounded-lg hover:bg-[#0F172A] transition-colors"
                >
                  {feature.linkText}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Blog Posts */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-semibold text-[#1E293B] mb-4">Recent Blog Posts</h2>
            <div className="space-y-4">
              {recentBlogs.slice(0, 5).map((blog) => (
                <Link
                  key={blog._id}
                  to={`/blog/${blog.slug}`}
                  className="block p-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-medium text-[#1E293B]">{blog.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{blog.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Products or Orders */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-semibold text-[#1E293B] mb-4">
              {user?.role === "admin" ? "Recent Products" : "Recent Orders"}
            </h2>
            <div className="space-y-4">
              {user?.role === "admin" ? (
                recentProducts.slice(0, 5).map((product) => (
                  <Link
                    key={product._id}
                    to={`/store/product/${product.slug}`}
                    className="block p-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-medium text-[#1E293B]">{product.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">${product.price}</p>
                  </Link>
                ))
              ) : (
                recentOrders.slice(0, 5).map((order) => (
                  <Link
                    key={order._id}
                    to={`/orders/${order._id}`}
                    className="block p-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-medium text-[#1E293B]">Order #{order._id.slice(-6)}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Status: {order.status} • Total: ${order.total}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
