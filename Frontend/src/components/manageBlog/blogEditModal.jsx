import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/authContext";
import { showNotification, showAuthError, showErrorMessage } from '../../utils/notification';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const BlogEditModal = ({ blog, onClose, onUpdate }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState(blog.title);
  const [content, setContent] = useState(blog.content);
  const [metaTitle, setMetaTitle] = useState(blog.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(blog.metaDescription || "");
  const [tags, setTags] = useState(blog.tags.map(tag => tag.name) || []);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(blog.category?._id || "");
  const [coverImage, setCoverImage] = useState(blog.coverImage || "");
  const [status, setStatus] = useState(blog.status || "draft");
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    console.log("Fetching categories...");
    axios.get(`${API_BASE_URL}/api/categories`)
      .then(response => {
        console.log("Categories fetched successfully:", response.data);
        setCategories(response.data);
      })
      .catch(error => console.error("Error fetching categories:", error));
  }, []);

  const handleUpdate = async () => {
    try {
      if (!user || user.role !== "admin") {
        showAuthError("You are not authorized to update this blog");
        return;
      }
  
      const updatedBlog = {
        title,
        content,
        metaTitle,
        metaDescription,
        tags,
        category: selectedCategory,
        coverImage,
        status,
      };
  
      console.log("Updating blog with data:", updatedBlog);
      await axios.put(`${API_BASE_URL}/api/blogs/${blog._id}`, updatedBlog, {
        withCredentials: true,
      });
  
      console.log("Blog updated successfully");
      onUpdate(); // Refresh blog list
      onClose(); // Close modal
    } catch (error) {
      console.error("Error updating blog:", error);
      showErrorMessage(error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append("coverImage", file);  // ✅ Field name must match backend
  
    try {
      const response = await axios.post(`${API_BASE_URL}/api/blogs/upload`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      setCoverImage(response.data.imageUrl);
    } catch (error) {
      console.error("Image upload failed:", error);
      showErrorMessage(error);
    }
  };
  
  const handleAddTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      console.log("Added tag:", tagInput.trim());
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    console.log("Removing tag:", tagToRemove);
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-3xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-4">Edit Blog</h2>
        
        <input
          type="text"
          className="w-full p-2 border rounded mb-3"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        
        <textarea
          className="w-full p-2 border rounded h-40 mb-3"
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        
        <input
          type="text"
          className="w-full p-2 border rounded mb-3"
          placeholder="Meta Title"
          value={metaTitle}
          onChange={(e) => setMetaTitle(e.target.value)}
        />
        
        <textarea
          className="w-full p-2 border rounded h-20 mb-3"
          placeholder="Meta Description"
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
        />

        {/* Tags Input */}
        <div className="mb-3">
          <label className="block text-gray-700 mb-2">Tags</label>
          <div className="flex flex-wrap gap-2 border p-2 rounded">
            {tags.map((tag, index) => (
              <div key={index} className="bg-gray-200 px-3 py-1 rounded flex items-center gap-1">
                {tag}
                <button
                  className="text-red-500 text-sm"
                  onClick={() => handleRemoveTag(tag)}
                >
                  ✕
                </button>
              </div>
            ))}
            <input
              type="text"
              className="flex-grow outline-none"
              placeholder="Type and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
            />
          </div>
        </div>

        {/* Category Dropdown */}
        <select
          className="w-full p-2 border rounded mb-3"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>

        {/* Status Dropdown */}
        <select
          className="w-full p-2 border rounded mb-3"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="private">Private</option>
        </select>

        {/* Image Upload Section */}
{coverImage ? (
  <div className="mb-3">
    <img src={coverImage} alt="Cover" className="w-full h-40 object-cover mb-2" />
    <button 
      onClick={() => setCoverImage("")} 
      className="px-3 py-1 bg-gray-400 text-white rounded"
    >
      Remove Image
    </button>
  </div>
) : (
  <input type="file" className="w-full mb-3" onChange={handleImageUpload} />
)}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded">Cancel</button>
          <button onClick={handleUpdate} className="px-4 py-2 bg-[#E7000B] text-white rounded">Update</button>
        </div>
      </div>
    </div>
  );
};

export default BlogEditModal;
