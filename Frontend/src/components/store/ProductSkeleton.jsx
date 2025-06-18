import React from 'react';

const ProductSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
    <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
  </div>
);

export default ProductSkeleton; 