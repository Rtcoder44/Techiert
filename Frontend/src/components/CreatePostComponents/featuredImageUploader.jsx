import React, { useState, useEffect } from "react";
import axios from "axios";
import { showNotification, showErrorMessage } from '../../utils/notification';

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

  // Function to resize and compress image
  const optimizeImage = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onloadend = () => {
        img.src = reader.result;
      };
      reader.readAsDataURL(file);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Resize the image to a maximum width of 1000px, maintaining the aspect ratio
        const maxWidth = 1000;
        const maxHeight = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Compress image quality (0.7 = 70% quality)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Image compression failed"));
            }
          },
          "image/jpeg",
          0.7 // Compression quality (0-1 range)
        );
      };

      img.onerror = reject;
    });
  };

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

    try {
      // Optimize image before uploading
      const optimizedImageBlob = await optimizeImage(file);

      // Prepare the optimized image for upload
      const formData = new FormData();
      formData.append("coverImage", optimizedImageBlob, file.name); // Append optimized image

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/blogs/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true, // ✅ Include credentials (cookies)
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(progress);
            }
          },
        }
      );

      if (response.data.imageUrl) {
        setPreviewImage(response.data.imageUrl);
        setCoverImage(response.data.imageUrl); // Update state with uploaded URL
      } else {
        showErrorMessage("Image upload failed");
        setPreviewImage(null);
      }
    } catch (error) {
      console.error("❌ Image upload error:", error.response?.data || error.message);
      showErrorMessage(error);
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
