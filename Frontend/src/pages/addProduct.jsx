import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "../components/dashboard/dashboardSidebar";
import { FaBars } from "react-icons/fa";
import { useAuth } from "../context/authContext";
import axios from "axios";
import { showNotification, showAuthError, showErrorMessage } from '../utils/notification';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AddProduct = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [specifications, setSpecifications] = useState([{ key: "", value: "" }]);
  
  // New state to store categories fetched from API
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    category: "", // start empty until fetched
  });

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/product-categories`);
        setCategories(res.data);
        if (res.data.length > 0) {
          setFormData((prev) => ({ ...prev, category: res.data[0]._id || res.data[0].name || "" }));
        }
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);

    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(previews);
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

  const addSpecification = () => {
    setSpecifications([...specifications, { key: "", value: "" }]);
  };

  const removeSpecification = (index) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || user.role !== "admin") {
      showAuthError("Only admins can add products");
      return;
    }

    try {
      setLoading(true);

      const formDataWithImages = new FormData();
      formDataWithImages.append("title", formData.title);
      formDataWithImages.append("description", formData.description);
      formDataWithImages.append("price", formData.price);
      formDataWithImages.append("stock", formData.stock);
      formDataWithImages.append("category", formData.category);
      formDataWithImages.append("specifications", JSON.stringify(specifications.filter(spec => spec.key && spec.value)));

      images.forEach((image) => {
        formDataWithImages.append("images", image);
      });

      await axios.post(
        `${API_BASE_URL}/api/products`,
        formDataWithImages,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      showNotification.success("Product added successfully!");
      navigate("/dashboard/manage-products");
    } catch (error) {
      console.error("Error adding product:", error);
      showErrorMessage(error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    return () => {
      previewImages.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewImages]);

  if (!user || user.role !== "admin") {
    return (
      <div className="flex justify-center items-center h-screen bg-[#F1F5F9]">
        <p className="text-xl text-red-600 font-semibold">🚫 Access Denied: Admins only.</p>
      </div>
    );
  }

  return (
    <div className="flex">
      <DashboardSidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {!isSidebarOpen && (
        <button
          className="absolute top-5 left-6 bg-[#1E293B] text-white p-3 rounded-full shadow-md hover:bg-red-700 transition"
          onClick={() => setIsSidebarOpen(true)}
        >
          <FaBars className="text-xl" />
        </button>
      )}

      <div className={`flex-1 p-6 bg-[#F1F5F9] min-h-screen text-[#1E293B] transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-0"}`}>
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold mb-8">Add New Product</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Product Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter product title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="4"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter product description"
              />
            </div>

            {/* Price and Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Price ($)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Stock</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.length === 0 ? (
                  <option value="">Loading categories...</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat._id || cat.name} value={cat._id || cat.name}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Specifications */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Specifications</label>
              {specifications.map((spec, index) => (
                <div key={index} className="flex gap-4 mb-2">
                  <input
                    type="text"
                    placeholder="Key (e.g., Color)"
                    value={spec.key}
                    onChange={(e) => handleSpecificationChange(index, "key", e.target.value)}
                    className="flex-1 p-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g., Red)"
                    value={spec.value}
                    onChange={(e) => handleSpecificationChange(index, "value", e.target.value)}
                    className="flex-1 p-2 border rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpecification(index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSpecification}
                className="mt-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                + Add Specification
              </button>
            </div>

            {/* Images */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Product Images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {previewImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {previewImages.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate("/dashboard/manage-products")}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-[#1E293B] text-white rounded-lg hover:bg-[#0F172A] transition"
                disabled={loading}
              >
                {loading ? "Adding Product..." : "Add Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
