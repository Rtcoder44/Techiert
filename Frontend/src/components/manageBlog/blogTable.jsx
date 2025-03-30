import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import BlogEditModal from "../manageBlog/blogEditModal"; // Import the BlogEditModal component

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const BlogTable = ({ blogs, setBlogs }) => {
  const { user } = useAuth(); // Get the logged-in user
  const [editingBlog, setEditingBlog] = useState(null);

  // Ensure we get the actual blog list
  const blogList = Array.isArray(blogs.blogs) ? blogs.blogs : [];

  const handleDelete = async (id) => {
    if (!user || user.role !== "admin") {
      alert("Unauthorized: Only an admin can delete blogs!");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this blog?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/blogs/${id}`, {
        withCredentials: true, // Ensure cookies are sent for authentication
      });

      setBlogs((prevBlogs) => ({
        ...prevBlogs,
        blogs: prevBlogs.blogs.filter((blog) => blog._id !== id),
      }));
    } catch (error) {
      console.error("Error deleting blog:", error);
      alert("Failed to delete the blog. Please try again.");
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
              <th className="border p-3">Title</th>
              <th className="border p-3">Category</th>
              <th className="border p-3">Tags</th>
              <th className="border p-3">Date</th>
              <th className="border p-3">SEO Details</th>
              <th className="border p-3">Status</th> {/* ✅ Added Status Column */}
              <th className="border p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogList.map((blog) => (
              <tr key={blog._id} className="border bg-white hover:bg-gray-100 transition duration-300">
                <td className="border p-3">{blog.title}</td>
                <td className="border p-3">{blog.category?.name || "Uncategorized"}</td>
                <td className="border p-3">
                  {blog.tags && blog.tags.length > 0
                    ? blog.tags.map((tag) => tag.name).join(", ")
                    : "No Tags"}
                </td>
                <td className="border p-3">{new Date(blog.createdAt).toLocaleDateString()}</td>
                <td className="border p-3">
                  <span className="px-3 py-1 bg-green-500 text-white rounded">
                    {blog.seoScore || "N/A"} / 100
                  </span>
                </td>
                {/* ✅ Status Column with Colored Badges */}
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
                <td className="border p-3 flex justify-center gap-2">
                  <button
                    onClick={() => setEditingBlog(blog)}
                    className="px-4 py-2 bg-[#E7000B] text-white rounded hover:bg-red-700 transition duration-300"
                  >
                    Edit
                  </button>
                  {user?.role === "admin" && (
                    <button
                      onClick={() => handleDelete(blog._id)}
                      className="px-4 py-2 bg-[#1E293B] text-white rounded hover:bg-gray-800 transition duration-300"
                    >
                      Delete
                    </button>
                  )}
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
          onUpdate={() => setBlogs((prevBlogs) => ({ ...prevBlogs }))} // Update after editing
        />
      )}
    </div>
  );
};

export default BlogTable;
