import React from "react";

const MetaDetails = ({ metaTitle, setMetaTitle, metaDescription, setMetaDescription, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 p-6 z-[9999]">
      
      {/* Modal Container */}
      <div className="w-full max-w-lg bg-gray-900 p-6 rounded-lg shadow-lg relative">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Meta Details</h2>
          <button 
            onClick={onClose} 
            className="px-3 py-1 text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Close
          </button>
        </div>

        {/* Meta Title Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Meta Title</label>
          <input
            type="text"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder="Enter meta title..."
            className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Meta Description Input */}
        <div>
          <label className="block text-sm font-medium mb-1">Meta Description</label>
          <textarea
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder="Enter meta description..."
            className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none h-24"
          />
        </div>
      </div>
    </div>
  );
};

export default MetaDetails;
