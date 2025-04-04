import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/dashboard/dashboardNavbar"; // Ensure this path is correct

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CategoryPage = () => {
  const { slug } = useParams();
  const [categoryName, setCategoryName] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryPosts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/api/categories/${slug}`);
        const blogs = Array.isArray(res.data) ? res.data : [];

        setPosts(blogs);

        // Extract category name from first post or format slug
        const catName = blogs[0]?.category?.name || slug.replace(/-/g, " ");
        setCategoryName(catName);
      } catch (error) {
        console.error("Failed to load posts by category:", error);
        setPosts([]);
        setCategoryName("Unknown Category");
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryPosts();
  }, [slug]);

  return (
    <div className="bg-[#F1F5F9] min-h-screen">
      {/* Navbar Component */}
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Category Title */}
        <h2 className="text-4xl font-bold text-[#1E293B] mb-8 capitalize">
          {categoryName}
        </h2>

        {/* Loading / No Posts */}
        {loading ? (
          <p className="text-gray-600 text-center text-lg">Loading...</p>
        ) : posts.length === 0 ? (
          <p className="text-gray-600 text-center text-lg">
            No posts found for this category.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div
                key={post._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1"
              >
                <Link to={`/blog/${post.slug}`}>
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    loading="lazy"
                    className="h-52 w-full object-cover"
                  />
                  <div className="p-5">
                    <h4 className="text-xl font-semibold text-[#1E293B] line-clamp-2">
                      {post.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
