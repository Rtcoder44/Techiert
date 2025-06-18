import React from 'react';
import { motion } from 'framer-motion';
import { FaSearch } from 'react-icons/fa';

const StoreHero = ({ searchValue, onSearchChange }) => {
  return (
    <div className="relative h-[500px] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-indigo-600/90">
        <div className="absolute inset-0" style={{
          backgroundImage: "url('/store-hero-collage.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          mixBlendMode: 'overlay'
        }}></div>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="text-white max-w-3xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl font-bold mb-6"
          >
            Your Tech Shopping Destination
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl mb-8"
          >
            Discover the latest in technology and electronics
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="max-w-xl relative"
          >
            <input
              type="text"
              placeholder="Search for products..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-full text-gray-900 focus:ring-2 focus:ring-blue-400 focus:outline-none text-lg"
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StoreHero; 