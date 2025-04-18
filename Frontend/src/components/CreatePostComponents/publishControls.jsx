import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext"; // ✅ Import Auth Context

const PublishControls = ({
  postId, // ✅ This will store the draft ID if updating
  postTitle, editorContent, metaTitle, metaDescription, category, tags, coverImage,
  postStatus, setPostStatus, onPublish
}) => {
  const { user } = useAuth();
  const [publishing, setPublishing] = useState(false);

  const handlePublish = async () => {
    // Check if title and content are provided
    if (!postTitle || !editorContent) {
      alert("⚠️ Title and content are required.");
      return;
    }

    // Check if the user is logged in
    if (!user) {
      alert("❌ User session expired. Please log in again.");
      return;
    }

    // Check if cover image is provided
    if (!coverImage) {
      alert("⚠️ Please upload a cover image.");
      return;
    }

    try {
      setPublishing(true);

      // Format tags if necessary
      const formattedTags = Array.isArray(tags) ? tags.map(tag => tag._id || tag) : [];

      const blogData = {
        title: postTitle,
        content: editorContent,
        coverImage,
        category,
        tags: formattedTags,
        metaTitle,
        metaDescription,
        status: postStatus, // Draft or Published
        author: user._id,
      };

      // Use the environment variable for API base URL
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/blogs`;

      // Determine the correct endpoint for publishing or draft
      const endpoint =
        postStatus === "draft"
          ? postId
            ? `/drafts/${postId}` // Updating existing draft
            : "/drafts" // Creating a new draft
          : ""; // Default for published posts

      const response = await axios.post(apiUrl + endpoint, blogData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true
      });

      if (response.status === 200 || response.status === 201) {
        alert(`✅ Post ${postStatus} successfully!`);
        onPublish(response.data);
      } else {
        throw new Error("Unexpected response from the server.");
      }
    } catch (error) {
      console.error("❌ Publishing failed:", error.response?.data || error.message);
      alert(`🚨 Publishing failed: ${error.response?.data?.error || "Something went wrong"}`);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
      <label className="block text-white mb-2">Post Status</label>
      <select
        value={postStatus}
        onChange={(e) => setPostStatus(e.target.value)}
        className="w-full p-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-blue-500"
      >
        <option value="draft">Draft</option>
        <option value="private">Private</option>
        <option value="published">Public</option>
      </select>

      {publishing && <p className="text-sm text-yellow-400 mt-2">⏳ Publishing post...</p>}

      <button
        onClick={handlePublish}
        className="mt-4 w-full px-4 py-2 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-600"
        disabled={publishing}
      >
        {publishing ? "📢 Publishing..." : "🚀 Publish Post"}
      </button>
    </div>
  );
};

export default PublishControls;
