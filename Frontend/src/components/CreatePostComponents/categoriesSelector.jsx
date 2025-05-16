import React, { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CategoriesSelector = ({ selectedCategories, setSelectedCategories }) => {
  const [categories, setCategories] = useState([]);

  // Fetch categories from the backend
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/categories`) // Adjust the API URL if needed
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  // Load saved categories from localStorage
  useEffect(() => {
    const savedCategories = JSON.parse(localStorage.getItem("draftCategories")) || [];
    if (savedCategories.length > 0) {
      setSelectedCategories(savedCategories);
    }
  }, []);

  // Save selected categories to localStorage
  useEffect(() => {
    if (selectedCategories.length > 0) {
      localStorage.setItem("draftCategories", JSON.stringify(selectedCategories));
    }
  }, [selectedCategories]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories((prevCategories) =>
      prevCategories.includes(categoryId)
        ? prevCategories.filter((id) => id !== categoryId)
        : [...prevCategories, categoryId]
    );
  };

  return (
    <div>
      <h3 className="font-semibold mb-2">Select Categories:</h3>
      <div className="space-y-2">
        {categories.map((category) => (
          <label key={category._id} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedCategories.includes(category._id)}
              onChange={() => handleCategoryChange(category._id)}
              className="w-5 h-5 text-blue-500"
            />
            <span>{category.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default CategoriesSelector;
