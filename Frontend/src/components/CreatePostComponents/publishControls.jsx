import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/authContext"; // ✅ Import Auth Context

const PublishControls = ({ 
  postId, // ✅ This will store the draft ID if updating
  postTitle, editorContent, metaTitle, metaDescription, category, tags, coverImage, 
  postStatus, setPostStatus, onPublish 
}) => {
  const { user } = useAuth();
  const [publishing, setPublishing] = useState(false);

  const handlePublish = async () => {
    console.log("📤 coverImage before sending:", coverImage);
    
    if (!postTitle || !editorContent) {
        alert("⚠️ Title and content are required.");
        return;
    }

    if (!user) {
        alert("❌ User session expired. Please log in again.");
        return;
    }

    try {
        setPublishing(true);

        if (!coverImage) {
            alert("⚠️ Please upload a cover image.");
            setPublishing(false);
            return;
        }

        console.log("✅ Cover Image is set:", coverImage);

        // Convert tags (names) to ObjectIds if necessary
        const formattedTags = Array.isArray(tags) ? tags.map(tag => tag._id || tag) : [];

        const blogData = {
            title: postTitle,
            content: editorContent,
            coverImage,
            category,
            tags: formattedTags, // ✅ Now sending correct format
            metaTitle,
            metaDescription,
            status: postStatus, // ✅ Draft or Published
            author: user._id,
        };

        console.log("📤 Final blogData before sending:", JSON.stringify(blogData, null, 2));

        // 📌 Determine the correct API endpoint
        let apiUrl = "http://localhost:5000/api/blogs"; // Default for publishing

        if (postStatus === "draft") {
            apiUrl = postId 
                ? `http://localhost:5000/api/blogs/drafts/${postId}` // ✅ Updating existing draft
                : "http://localhost:5000/api/blogs/drafts"; // ✅ Creating a new draft
        }

        const response = await axios.post(apiUrl, blogData, {
            headers: { "Content-Type": "application/json" },
            withCredentials: true
        });

        console.log("✅ Server Response:", response.data);

        if (response.status === 201 || response.status === 200) {
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
