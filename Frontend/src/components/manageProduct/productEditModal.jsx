import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/authContext";
import { showNotification, showAuthError, showErrorMessage } from '../../utils/notification';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ProductEditModal = ({ product, onClose, onUpdate }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(product.price);
  const [stock, setStock] = useState(product.stock);
  const [category, setCategory] = useState(product.category._id || product.category);
  const [specifications, setSpecifications] = useState(() => {
    const specs = product.specifications || {};
    return Object.entries(specs).map(([key, value]) => ({ key, value }));
  });
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/product-categories`);
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleUpdate = async () => {
    try {
      if (!user || user.role !== "admin") {
        showAuthError("You are not authorized to update this product");
        return;
      }

      setLoading(true);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("stock", stock);
      formData.append("category", category);
      
      const specsForBackend = specifications.reduce((acc, spec) => {
        if (spec.key && spec.value) {
          acc[spec.key] = spec.value;
        }
        return acc;
      }, {});
      formData.append("specifications", JSON.stringify(specsForBackend));

      // Add new images if any
      for (const file of newImages) {
        formData.append("images", file);
      }

      await axios.put(
        `${API_BASE_URL}/api/products/${product._id}`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating product:", error);
      showErrorMessage(error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(files);
  };

  const handleRemoveImage = async (publicId) => {
    if (!window.confirm("Are you sure you want to remove this image?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/products/${product._id}/image/${publicId}`, {
        withCredentials: true,
      });

      const updatedImages = product.images.filter(img => img.public_id !== publicId);
      product.images = updatedImages;
      onUpdate();
    } catch (error) {
      console.error("Error removing image:", error);
      showErrorMessage(error);
    }
  };

  const handleAddSpecification = () => {
    setSpecifications([...specifications, { key: "", value: "" }]);
  };

  const handleRemoveSpecification = (index) => {
    const newSpecs = specifications.filter((_, i) => i !== index);
    setSpecifications(newSpecs);
  };

  const handleSpecificationChange = (index, field, value) => {
    const newSpecs = specifications.map((spec, i) => {
      if (i === index) {
        return { ...spec, [field]: value };
      }
      return spec;
    });
    setSpecifications(newSpecs);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-3xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-4">Edit Product</h2>

        {/* Title */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Title</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Description</label>
          <textarea
            className="w-full p-2 border rounded h-32"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Price and Stock */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-2">Price ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full p-2 border rounded"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Stock</label>
            <input
              type="number"
              min="0"
              className="w-full p-2 border rounded"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </div>
        </div>

        {/* Category */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Category</label>
          <select
            className="w-full p-2 border rounded"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Specifications */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Specifications</label>
          {specifications.map((spec, index) => (
            <div key={`spec-${index}`} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Key"
                className="w-1/3 p-2 border rounded"
                value={spec.key}
                onChange={(e) => handleSpecificationChange(index, "key", e.target.value)}
              />
              <input
                type="text"
                placeholder="Value"
                className="w-1/2 p-2 border rounded"
                value={spec.value}
                onChange={(e) => handleSpecificationChange(index, "value", e.target.value)}
              />
              <button
                onClick={() => handleRemoveSpecification(index)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={handleAddSpecification}
            className="mt-2 px-4 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            + Add Specification
          </button>
        </div>

        {/* Images */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Current Images</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {product.images?.map((image) => (
              <div key={`image-${image.public_id}`} className="relative">
                <img
                  src={image.url}
                  alt="Product"
                  className="w-full h-32 object-cover rounded"
                />
                <button
                  onClick={() => handleRemoveImage(image.public_id)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* New Images Upload */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Add New Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="px-4 py-2 bg-[#E7000B] text-white rounded hover:bg-red-700"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Product"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductEditModal; 