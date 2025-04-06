import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/dashboard/dashboardLayout";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Dashboard = () => {
  const [postsByParentCategory, setPostsByParentCategory] = useState({});
  const [latestPost, setLatestPost] = useState(null);

  const majorCategories = ["Tech Products", "Tech News", "Comparisons", "How-to Guides"];

  const fetchBlogsByCategory = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/categories/with-blogs`);
      const data = Array.isArray(res.data) ? res.data : [];

      const grouped = {};
      let newestPost = null;

      for (const cat of data) {
        if (majorCategories.includes(cat.name)) {
          const sortedBlogs = cat.blogs.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          grouped[cat.name] = sortedBlogs;

          if (!newestPost || new Date(sortedBlogs[0].createdAt) > new Date(newestPost.createdAt)) {
            newestPost = sortedBlogs[0];
          }
        }
      }

      setPostsByParentCategory(grouped);
      setLatestPost(newestPost);
    } catch (err) {
      console.error("Error fetching blogs by category", err);
    }
  }, []);

  useEffect(() => {
    fetchBlogsByCategory();
  }, [fetchBlogsByCategory]);

  return (
    <DashboardLayout>
      {/* Hero Section */}
      {latestPost && (
        <div className="relative w-full h-96 rounded-xl overflow-hidden shadow-md mb-10 z-10">
          <img
            src={latestPost.coverImage}
            alt={latestPost.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Link to={`/blog/${latestPost.slug}`}>
              <h2 className="text-white text-4xl font-bold px-6 text-center hover:underline">
                {latestPost.title}
              </h2>
            </Link>
          </div>
        </div>
      )}

      {/* Posts by Parent Category */}
      <div className="space-y-12">
        {Object.entries(postsByParentCategory).map(([parentCategory, posts]) => (
          <div key={parentCategory}>
            <h3 className="text-2xl font-semibold text-[#1E293B] mb-4">{parentCategory}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.slice(0, 6).map((post) => (
                <div
                  key={post._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                >
                  <Link to={`/blog/${post.slug}`}>
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="h-48 w-full object-cover"
                      loading="lazy"
                    />
                    <div className="p-4">
                      <h4 className="text-lg font-semibold text-[#1E293B]">{post.title}</h4>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{post.excerpt}</p>

                      {/* Show only child categories as badges */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {post.category?.length ? post.category
                          .filter(cat => cat.parent) // Show only child categories as badges
                          .map(cat => (
                            <span key={cat._id} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs">
                              {cat.name}
                            </span>
                          )) : (
                          <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-md text-xs">
                            Uncategorized
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
