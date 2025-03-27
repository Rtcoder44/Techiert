import React, { useState } from "react";
import { X } from "lucide-react"; // Import cross icon

const TagsSelector = ({ tags, setTags }) => {
  const [inputValue, setInputValue] = useState("");

  // Handle adding a tag
  const handleAddTag = () => {
    if (inputValue.trim() && !tags.includes(inputValue.trim())) {
      setTags([...tags, inputValue.trim()]);
      setInputValue(""); // Clear input field
    }
  };

  // Handle removing a tag
  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
      <label className="block text-white mb-2">Tags</label>
      
      {/* Input Field */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddTag()} // Add tag on Enter key press
          placeholder="Enter tags"
          className="flex-1 p-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 text-white"
        />
        <button 
          onClick={handleAddTag} 
          className="px-3 py-1 text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Add
        </button>
      </div>

      {/* Tags Display */}
      <div className="flex flex-wrap gap-2 mt-3">
        {tags.map((tag, index) => (
          <div key={index} className="flex items-center bg-gray-700 text-white px-3 py-1 rounded-full">
            <span>{tag}</span>
            <button 
              onClick={() => handleRemoveTag(tag)}
              className="ml-2 text-red-400 hover:text-red-600"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagsSelector;
