import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/dashboard/dashboardNavbar";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CategoryPage = () => {
  const { slug } = useParams();
  const [categoryName, setCategoryName] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategoryPosts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/categories/${slug}`);
      const blogs = Array.isArray(data) ? data : [];
      setPosts(blogs);

      const name = blogs[0]?.category?.name || slug.replace(/-/g, " ");
      setCategoryName(name);
    } catch {
      setPosts([]);
      setCategoryName("Unknown Category");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchCategoryPosts();
  }, [fetchCategoryPosts]);

  return (
    <div className="bg-[#F1F5F9] min-h-screen">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-4xl font-bold text-[#1E293B] mb-8 capitalize">
          {categoryName}
        </h2>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin border-t-transparent"></div>
          </div>
        ) : posts.length === 0 ? (
          <p className="text-gray-600 text-center text-lg">
            No posts found for this category.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {posts.map(({ _id, slug, title, coverImage, excerpt }) => (
              <div
                key={_id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1"
              >
                <Link to={`/blog/${slug}`}>
                  <img
                    src={coverImage}
                    alt={title}
                    loading="lazy"
                    className="h-52 w-full object-cover"
                  />
                  <div className="p-5">
                    <h4 className="text-xl font-semibold text-[#1E293B] line-clamp-2">
                      {title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                      {excerpt}
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
