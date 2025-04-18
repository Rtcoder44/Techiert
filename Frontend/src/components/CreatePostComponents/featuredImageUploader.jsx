import React, { useState, useEffect } from "react";
import axios from "axios";

const CoverImageUploader = ({ coverImage, setCoverImage, postTitle }) => {
  const [previewImage, setPreviewImage] = useState(coverImage || null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // Track upload progress

  // Load saved cover image from localStorage
  useEffect(() => {
    const savedImage = localStorage.getItem("draftCoverImage");
    if (savedImage) {
      setPreviewImage(savedImage);
      setCoverImage(savedImage);
    }
  }, [setCoverImage]);

  // Save cover image to localStorage when previewImage changes
  useEffect(() => {
    if (previewImage) {
      localStorage.setItem("draftCoverImage", previewImage);
    }
  }, [previewImage]);

  // Handle image selection and upload
  const handleImageSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result); // Set preview image
    };
    reader.readAsDataURL(file); // Preview the selected image

    const formData = new FormData();
    formData.append("coverImage", file);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/blogs/upload`, // Use the environment variable for the API URL
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(progress); // Update the progress
            }
          },
        }
      );

      if (response.data.imageUrl) {
        setPreviewImage(response.data.imageUrl);
        setCoverImage(response.data.imageUrl); // Update state with uploaded URL
      } else {
        alert("❌ Image upload failed.");
        setPreviewImage(null);
      }
    } catch (error) {
      console.error("❌ Image upload error:", error.response?.data || error.message);
      alert("🚨 Failed to upload image.");
      setPreviewImage(null);
    } finally {
      setUploading(false);
      setUploadProgress(0); // Reset progress after upload completes
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">Cover Image</label>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="mt-2 border border-gray-300 rounded-md p-2 w-full"
        disabled={uploading}
      />

      {uploading && (
        <div>
          <p className="text-sm text-blue-500 mt-2">📤 Uploading image...</p>
          <div className="w-full bg-gray-200 h-2 mt-2 rounded-full">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {previewImage && (
        <div className="mt-3">
          <img
            src={previewImage}
            alt={postTitle || "Cover Image Preview"} // Use postTitle as alt text or fallback to "Cover Image Preview"
            className="w-32 h-32 object-cover rounded-lg shadow-md"
          />
        </div>
      )}
    </div>
  );
};

export default CoverImageUploader;
