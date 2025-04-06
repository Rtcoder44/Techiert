import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const RelatedPosts = ({ currentPostId }) => {
  const [related, setRelated] = useState([]);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/blogs/related/${currentPostId}`);
        const posts = Array.isArray(res.data.relatedBlogs) ? res.data.relatedBlogs : [];
        setRelated(posts);
      } catch (err) {
        console.error("Error loading related posts", err);
      }
    };

    if (currentPostId) fetchRelated();
  }, [currentPostId]);

  return (
    <div className="mt-12">
      <h3 className="text-xl font-semibold text-[#1E293B] mb-4">Related Posts</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((post) => (
          <Link
            key={post._id}
            to={`/blog/${post.slug}`}
            className="bg-white shadow-md rounded-md overflow-hidden hover:shadow-lg transition"
          >
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h4 className="text-md font-semibold text-[#1E293B]">{post.title}</h4>
              <p className="text-sm text-gray-600 truncate">
                {post.excerpt || post.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedPosts;
