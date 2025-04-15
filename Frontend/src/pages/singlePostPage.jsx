import React, { useEffect, useState, lazy, Suspense } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaHeart, FaFacebook, FaTwitter, FaLinkedin } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import DOMPurify from "dompurify";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import SavePostButton from "../components/savePost";

// ✅ Lazy-loaded Components
const CommentsSection = lazy(() => import("../components/commentSection"));
const RelatedPosts = lazy(() => import("../components/relatedPost"));

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ✅ Skeleton Loader
const PostSkeleton = () => (
  <div className="max-w-4xl mx-auto p-6 animate-pulse">
    <div className="h-64 bg-gray-300 rounded-xl mb-4" />
    <div className="h-6 bg-gray-300 rounded w-3/4 mb-2" />
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
    </div>
  </div>
);

const SinglePostPage = () => {
  const { slug } = useParams();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/blogs/blog/${slug}`, {
          withCredentials: true,
        });

        const data = res.data;
        setPost(data);
        setLikeCount(data.likesCount || 0);
        setLiked(Boolean(data.isLikedByUser));
      } catch (error) {
        console.error("❌ Error fetching blog post:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, user]);

  const handleLike = async () => {
    if (!user) return alert("Please login to like the post.");

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/blogs/${post._id}/like`,
        {},
        { withCredentials: true }
      );

      setLiked(res.data.liked);
      setLikeCount(res.data.likesCount);
    } catch (error) {
      console.error("Error liking the post:", error.message);
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

        {/* 📝 Blog Content */}
        <div
          className="prose prose-lg max-w-full text-[#1E293B] prose-headings:text-[#E7000B] prose-img:rounded-lg prose-a:text-blue-600 prose-a:underline"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />

        {/* 🔁 Related Posts */}
        <Suspense fallback={<div className="text-gray-500 mt-6">Loading related posts...</div>}>
          {post && <RelatedPosts currentPostId={post._id} />}
        </Suspense>

        {/* 💬 Comments */}
        <div className="mt-10">
          <Suspense fallback={<div className="text-gray-500">Loading comments...</div>}>
            <CommentsSection postId={post._id} />
          </Suspense>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default SinglePostPage;
