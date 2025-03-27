import React, { useState, useEffect } from "react";

const FeaturedImageUploader = ({ featuredImage, setFeaturedImage, setImageFile }) => {
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const savedImage = localStorage.getItem("draftFeaturedImage");
    if (savedImage) {
      setPreviewImage(savedImage);
    }
  }, []);

  useEffect(() => {
    if (previewImage) {
      localStorage.setItem("draftFeaturedImage", previewImage);
    }
  }, [previewImage]);

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setPreviewImage(URL.createObjectURL(file)); // ✅ Show instant preview
    setImageFile(file); // ✅ Store the file for later upload
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">Featured Image</label>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="mt-2 border border-gray-300 rounded-md p-2 w-full"
      />
      {previewImage && (
        <div className="mt-3">
          <img src={previewImage} alt="Featured" className="w-32 h-32 object-cover rounded-lg shadow-md" />
        </div>
      )}
    </div>
  );
};

export default FeaturedImageUploader;
