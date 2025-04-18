import React, { useEffect, useState, lazy, Suspense, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaHeart, FaFacebook, FaTwitter, FaLinkedin } from "react-icons/fa";
import { useAuth } from "../context/authContext";
import DOMPurify from "dompurify";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import SavePostButton from "../components/savePost";

const CommentsSection = lazy(() => import("../components/commentSection"));
const RelatedPosts = lazy(() => import("../components/relatedPost"));

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const PostSkeleton = () => (
  <div className="max-w-4xl mx-auto p-6 animate-pulse space-y-4">
    <div className="h-64 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 rounded-xl mb-6" />
    <div className="h-6 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 rounded w-3/4" />
    <div className="h-4 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 rounded w-1/2" />
    <div className="space-y-2">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 rounded ${
            i === 1 ? "w-5/6" : i === 2 ? "w-2/3" : "w-full"
          }`}
        />
      ))}
    </div>
  </div>
);

const Spinner = () => (
  <div className="flex justify-center items-center py-6">
    <div className="w-10 h-10 border-4 border-blue-300 border-t-transparent rounded-full animate-spin" />
  </div>
);

const SinglePostPage = () => {
  const { slug } = useParams();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchPost = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/blogs/blog/${slug}`, {
        withCredentials: true,
      });

      setPost(data);
      setLikeCount(data.likesCount || 0);
      setLiked(Boolean(data.isLikedByUser));
    } catch (_) {
      setPost(null);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleLike = async () => {
    if (!user) return alert("Please login to like the post.");

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/blogs/${post._id}/like`,
        {},
        { withCredentials: true }
      );

      setLiked(data.liked);
      setLikeCount(data.likesCount);
    } catch (_) {
      // Handle error silently or use toast
    }
  };

  if (loading) return <PostSkeleton />;
  if (!post) return <div className="text-center py-20 text-red-600">Post not found.</div>;

  const sanitizedContent = DOMPurify.sanitize(post.content || "");

  return (
    <DashboardLayout>
      <main className="flex-1 p-6 max-w-4xl mx-auto text-[#1E293B]">
        {post.coverImage && (
          <img
            src={post.coverImage}
            alt={post.title}
            className="rounded-xl w-full max-h-[500px] object-cover mb-6"
            loading="lazy"
          />
        )}

        <h1 className="text-3xl md:text-4xl font-bold mb-2 leading-snug">{post.title}</h1>

        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <span>By {post.author?.name || "Unknown Author"}</span>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>

        {/* ❤️ Like + 📌 Save + 🔗 Share */}
        <div className="flex items-center gap-6 my-4 flex-wrap">
          <button
            onClick={handleLike}
            className="flex items-center gap-2 hover:scale-105 transition group"
          >
            <FaHeart
              className={`transition duration-200 ${
                liked ? "text-red-600" : "text-gray-600 group-hover:text-red-500"
              }`}
            />
            <span className={`${liked ? "text-red-600" : "text-gray-600"}`}>
              {liked ? "Liked" : "Like"} ({likeCount})
            </span>
          </button>

          <SavePostButton postId={post._id} />

          <div className="flex gap-3">
            <a
              href={`https://facebook.com/sharer/sharer.php?u=${window.location.href}`}
              target="_blank"
              rel="noreferrer"
            >
              <FaFacebook className="hover:text-blue-600" />
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${window.location.href}`}
              target="_blank"
              rel="noreferrer"
            >
              <FaTwitter className="hover:text-sky-500" />
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`}
              target="_blank"
              rel="noreferrer"
            >
              <FaLinkedin className="hover:text-blue-700" />
            </a>
          </div>
        </div>

        <div
          className="prose prose-lg max-w-full text-[#1E293B] prose-headings:text-[#E7000B] prose-img:rounded-lg prose-a:text-blue-600 prose-a:underline"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />

        <Suspense fallback={<Spinner />}>
          <RelatedPosts currentPostId={post._id} />
        </Suspense>

        <div className="mt-10">
          <Suspense fallback={<Spinner />}>
            <CommentsSection postId={post._id} />
          </Suspense>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default SinglePostPage;
