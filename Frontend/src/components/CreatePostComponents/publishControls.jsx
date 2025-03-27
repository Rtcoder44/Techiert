import React, { useState } from "react";
import axios from "axios";

const PublishControls = ({ 
  postTitle, editorContent, metaTitle, metaDescription, category, tags, imageFile, 
  postStatus, setPostStatus, onPublish 
}) => {
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const handlePublish = async () => {
    if (!postTitle || !editorContent || !metaTitle || !metaDescription || !category) {
      alert("Please fill in all required fields before publishing.");
      return;
    }

    setPublishing(true);
    let imageUrl = null;

    if (imageFile) {
      setUploading(true);
      const formData = new FormData();
      formData.append("coverImage", imageFile);

      try {
        const response = await axios.post(
          "http://localhost:5000/api/blogs/upload", 
          formData, 
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            withCredentials: true,
          }
        );
        imageUrl = response.data.imageUrl;
      } catch (error) {
        console.error("Image upload failed:", error.response?.data || error.message);
        alert("Image upload failed. The post will be published without an image.");
      } finally {
        setUploading(false);
      }
    }

    // Blog data to send
    const blogData = {
      title: postTitle,
      content: editorContent,
      coverImage: imageUrl, // Uploaded image URL
      category,
      tags,
      metaTitle,
      metaDescription,
      status: postStatus, 
    };

    onPublish(blogData); // Call parent function to publish post
    setPublishing(false);
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

      {uploading && <p className="text-sm text-blue-400 mt-2">Uploading image...</p>}

      <button 
        onClick={handlePublish}
        className="mt-4 w-full px-4 py-2 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-600"
        disabled={uploading || publishing} // Disable button while uploading or publishing
      >
        {publishing ? "Publishing..." : "Publish Post"}
      </button>
    </div>
  );
};

export default PublishControls;
