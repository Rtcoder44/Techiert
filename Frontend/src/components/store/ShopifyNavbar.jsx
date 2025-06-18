import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const ShopifyNavbar = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/shopify/collections`);
        setCollections(response.data && Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setCollections([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, []);

  if (loading || !collections || collections.length === 0) return null;

  return (
    <nav className="w-full bg-white shadow-sm border-b mb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ul className="flex flex-wrap gap-4 py-3">
          {collections.map((col) => (
            <li key={col.id}>
              <a
                href={`/store?collection=${col.id}`}
                className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-blue-600 hover:text-white transition-colors text-sm font-medium"
              >
                {col.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default ShopifyNavbar; 