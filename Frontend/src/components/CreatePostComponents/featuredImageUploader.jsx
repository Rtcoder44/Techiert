import React, { useState, useEffect } from "react";
import axios from "axios";

const CoverImageUploader = ({ coverImage, setCoverImage }) => {
  const [previewImage, setPreviewImage] = useState(coverImage || null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const savedImage = localStorage.getItem("draftCoverImage");
    if (savedImage) {
      console.log("📂 Loaded saved cover image from localStorage:", savedImage);
      setPreviewImage(savedImage);
      setCoverImage(savedImage);
    }
  }, []);

  useEffect(() => {
    if (previewImage) {
      console.log("💾 Saving cover image to localStorage:", previewImage);
      localStorage.setItem("draftCoverImage", previewImage);
    }
  }, [previewImage]);

  const handleImageSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      console.warn("⚠️ No file selected.");
      return;
    }

    console.log("📸 Selected file:", file.name, file.type, file.size, "bytes");

    setUploading(true);
    const tempPreview = URL.createObjectURL(file);
    setPreviewImage(tempPreview);
    console.log("🖼️ Temporary preview image:", tempPreview);

    const formData = new FormData();
    formData.append("coverImage", file);

    try {
      console.log("📤 Uploading image...");
      const response = await axios.post(
        "http://localhost:5000/api/blogs/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log("✅ Image Upload Response:", response.data);

      if (response.data.imageUrl) {
        setPreviewImage(response.data.imageUrl);
        setCoverImage(response.data.imageUrl); // ✅ Store uploaded URL
        console.log("🔄 Updated coverImage state:", response.data.imageUrl);
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

      {uploading && <p className="text-sm text-blue-500 mt-2">📤 Uploading image...</p>}

      {previewImage && (
        <div className="mt-3">
          <img 
            src={previewImage} 
            alt="Cover Image" 
            className="w-32 h-32 object-cover rounded-lg shadow-md" 
          />
        </div>
      )}
    </div>
  );
};

export default CoverImageUploader;
