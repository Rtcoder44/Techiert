import React from 'react';
import {
  FaFacebook,
  FaTwitter,
  FaPinterest,
  FaWhatsapp,
} from 'react-icons/fa';
import { IoCopy } from 'react-icons/io5';

const SocialShareButtons = ({ url, title, imageUrl }) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodeURIComponent(imageUrl)}&description=${encodedTitle}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard!');
    }, (err) => {
      console.error('Failed to copy: ', err);
    });
  };

  return (
    <div className="flex items-center gap-4 mt-6">
      <span className="font-semibold text-gray-700">Share on:</span>
      <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600">
        <FaFacebook size={24} />
      </a>
      <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-sky-500">
        <FaTwitter size={24} />
      </a>
      <a href={shareLinks.pinterest} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-red-600">
        <FaPinterest size={24} />
      </a>
      <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-green-500">
        <FaWhatsapp size={24} />
      </a>
      <button onClick={copyToClipboard} className="text-gray-500 hover:text-gray-800">
        <IoCopy size={24} />
      </button>
    </div>
  );
};

export default SocialShareButtons; 