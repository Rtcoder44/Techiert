import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const LatestBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLatestBlogs = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/blogs/latest`);
      setBlogs(response.data.blogs || []);
    } catch (error) {
      console.error("❌ Error fetching latest blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestBlogs();
  }, []);

  if (loading) return <p className="text-sm text-gray-400">Loading...</p>;

  return (
    <ul className="space-y-2 text-sm text-gray-300">
      {blogs.length === 0 ? (
        <li>No latest blogs found.</li>
      ) : (
        blogs.map(blog => (
          <li key={blog._id}>
            <Link
              to={`/blog/${blog.slug}`}
              className="hover:text-white transition duration-200"
            >
              {blog.title.length > 50
                ? blog.title.slice(0, 50) + "..."
                : blog.title}
            </Link>
          </li>
        ))
      )}
    </ul>
  );
};

export default LatestBlogs;
