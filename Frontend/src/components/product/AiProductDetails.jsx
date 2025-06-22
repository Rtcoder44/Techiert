import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const AiProductDetails = ({ content }) => {
  return (
    <div className="prose prose-lg max-w-none mt-12 bg-gray-50 p-6 rounded-lg shadow-inner">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

export const AiDetailsSkeleton = () => {
  return (
    <div className="mt-12 bg-gray-50 p-6 rounded-lg shadow-inner animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
      <div className="h-8 bg-gray-200 rounded w-1/3 mt-8 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  )
}

export default AiProductDetails; 