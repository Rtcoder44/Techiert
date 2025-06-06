import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/authContext";
import BlogEditModal from "../manageBlog/blogEditModal";
import { showNotification, showAuthError, showErrorMessage } from '../../utils/notification';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const BlogTable = ({ blogs, setBlogs }) => {
  const { user } = useAuth();
  const [editingBlog, setEditingBlog] = useState(null);

  const blogList = Array.isArray(blogs.blogs) ? blogs.blogs : [];

  const handleDelete = async (id) => {
    if (!user || user.role !== "admin") {
      showAuthError("Only an admin can delete blogs!");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this blog?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/blogs/${id}`, {
        withCredentials: true,
      });

      setBlogs((prevBlogs) => ({
        ...prevBlogs,
        blogs: prevBlogs.blogs.filter((blog) => blog._id !== id),
      }));
    } catch (error) {
      console.error("Error deleting blog:", error);
      showErrorMessage(error);
    }
  };

  return (
    <div className="overflow-x-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Manage Blogs</h2>
      {blogList.length === 0 ? (
        <p className="text-gray-600">No blogs available.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300 shadow-lg">
          <thead>
            <tr className="bg-[#1E293B] text-white text-left">
              <th className="border p-3 w-1/4">Title</th>
              <th className="border p-3 w-1/5">Category</th>
              <th className="border p-3 w-1/6">Date</th>
              <th className="border p-3 w-1/6">Status</th>
              <th className="border p-3 w-1/4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogList.map((blog) => (
              <tr key={blog._id} className="border bg-white hover:bg-gray-100 transition duration-300">
                {/* Title */}
                <td className="border p-3 truncate max-w-[200px]">
                  <span className="block truncate">{blog.title}</span>
                </td>

                {/* Category */}
                <td className="border p-3 truncate max-w-[180px]">
                  <span className="block truncate">
                    {Array.isArray(blog.category) && blog.category.length > 0
                      ? blog.category.map((cat) => cat.name).join(", ")
                      : "Uncategorized"}
                  </span>
                </td>

                {/* Date */}
                <td className="border p-3">{new Date(blog.createdAt).toLocaleDateString()}</td>

                {/* Status */}
                <td className="border p-3">
                  <span
                    className={`px-3 py-1 text-white rounded ${
                      blog.status === "published"
                        ? "bg-green-500"
                        : blog.status === "draft"
                        ? "bg-yellow-500"
                        : "bg-gray-500"
                    }`}
                  >
                    {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                  </span>
                </td>

                {/* Actions with Analyze Link */}
                <td className="border p-3 flex flex-col sm:flex-row justify-center items-center gap-2">
                  <button
                    onClick={() => setEditingBlog(blog)}
                    className="px-4 py-1 bg-[#E7000B] text-white rounded hover:bg-red-700 transition duration-300 text-sm"
                  >
                    Edit
                  </button>

                  {user?.role === "admin" && (
                    <button
                      onClick={() => handleDelete(blog._id)}
                      className="px-4 py-1 bg-[#1E293B] text-white rounded hover:bg-gray-800 transition duration-300 text-sm"
                    >
                      Delete
                    </button>
                  )}

                  <Link
                    to={`/dashboard/analytics/blog/${blog._id}`}
                    className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300 text-sm"
                  >
                    📊 Analyze
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editingBlog && (
        <BlogEditModal
          blog={editingBlog}
          onClose={() => setEditingBlog(null)}
          onUpdate={() => setBlogs((prevBlogs) => ({ ...prevBlogs }))}
        />
      )}
    </div>
  );
};

export default BlogTable;
