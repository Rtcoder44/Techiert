import React, { useEffect, useState, lazy, Suspense, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaHeart, FaFacebook, FaTwitter, FaLinkedin } from "react-icons/fa";
import { useAuth } from "../context/authContext";
import DOMPurify from "dompurify";
import DashboardLayout from "../components/dashboard/dashboardLayout";
import SavePostButton from "../components/savePost";
import { Helmet } from "react-helmet-async";  // <-- import Helmet

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
          className={`h-4 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 rounded ${i === 1 ? "w-5/6" : i === 2 ? "w-2/3" : "w-full"
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
      // Handle error silently or with a toast
    }
  };

  if (loading) return <PostSkeleton />;
  if (!post) return <div className="text-center py-20 text-red-600">Post not found.</div>;

  const sanitizedContent = DOMPurify.sanitize(post.content || "");

  return (
    <DashboardLayout>
      <Helmet>
        <title>{post.title} - Techiert</title>
        <meta
          name="description"
          content={post.metaDescription?.slice(0, 155) || "Get the latest insights on technology, tutorials, and reviews on Techiert."}
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://techiert.com/blog/${post.slug}`} />

        {/* Keywords */}
        {post.tags?.length > 0 && (
          <meta name="keywords" content={post.tags.map((tag) => tag.name).join(", ")} />
        )}

        {/* Open Graph (Facebook, LinkedIn, etc.) */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${post.title} - Techiert`} />
        <meta property="og:description" content={post.metaDescription?.slice(0, 155) || "Read this insightful tech blog on Techiert."} />
        <meta property="og:url" content={`https://techiert.com/blog/${post.slug}`} />
        <meta property="og:image" content={post.coverImage || "https://techiert.com/default-og-image.jpg"} />
        <meta property="og:site_name" content="Techiert" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${post.title} - Techiert`} />
        <meta name="twitter:description" content={post.metaDescription?.slice(0, 155) || "Explore more tech blogs at Techiert."} />
        <meta name="twitter:image" content={post.coverImage || "https://techiert.com/default-twitter-image.jpg"} />
        <meta name="twitter:site" content="@techiert" /> {/* Replace with your Twitter handle if you have one */}

        {/* Schema.org structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "image": [post.coverImage || "https://techiert.com/default-og-image.jpg"],
            "author": {
              "@type": "Person",
              "name": post.author?.name || "Ritik Gupta"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Techiert",
              "logo": {
                "@type": "ImageObject",
                "url": "https://techiert.com/logo.png"
              }
            },
            "url": `https://techiert.com/blog/${post.slug}`,
            "datePublished": new Date(post.createdAt).toISOString(),
            "dateModified": new Date(post.updatedAt || post.createdAt).toISOString(),
            "description": post.metaDescription?.slice(0, 155) || "Latest technology insights, tutorials, and guides.",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://techiert.com/blog/${post.slug}`
            }
          })}
        </script>
      </Helmet>


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
              className={`transition duration-200 ${liked ? "text-red-600" : "text-gray-600 group-hover:text-red-500"
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

        {/* ✅ Post content with centered, responsive images */}
        <div
          className="prose prose-lg max-w-full text-[#1E293B]
             prose-headings:text-[#E7000B]
             prose-a:text-blue-600 prose-a:underline
             prose-img:mx-auto prose-img:my-6 prose-img:rounded-xl
             prose-img:max-w-[80%] prose-img:h-auto"
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
