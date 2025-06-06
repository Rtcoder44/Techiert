import React, { useState, useEffect } from 'react';
import { FaStar, FaUserCircle } from 'react-icons/fa';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    }
  });

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/api/products/${productId}/reviews`
        );
        setReviews(response.data.reviews);
        
        // Calculate stats
        const total = response.data.reviews.length;
        const avg = total > 0
          ? response.data.reviews.reduce((sum, r) => sum + r.rating, 0) / total
          : 0;
        
        // Calculate distribution
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        response.data.reviews.forEach(review => {
          distribution[review.rating]++;
        });

        setStats({
          averageRating: avg,
          totalReviews: total,
          ratingDistribution: distribution
        });
      } catch (err) {
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg">
          <div className="text-5xl font-bold text-gray-900">
            {stats.averageRating.toFixed(1)}
          </div>
          <div className="flex text-yellow-400 my-2">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className={i < Math.round(stats.averageRating) ? 'text-yellow-400' : 'text-gray-300'}
              />
            ))}
          </div>
          <div className="text-gray-500">
            Based on {stats.totalReviews} reviews
          </div>
        </div>

        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center">
              <div className="w-12 text-sm text-gray-600">
                {rating} stars
              </div>
              <div className="flex-1 mx-4">
                <div className="h-2 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-yellow-400"
                    style={{
                      width: `${stats.totalReviews > 0
                        ? (stats.ratingDistribution[rating] / stats.totalReviews) * 100
                        : 0}%`
                    }}
                  />
                </div>
              </div>
              <div className="w-12 text-sm text-gray-600">
                {stats.ratingDistribution[rating]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No reviews yet. Be the first to review this product!
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="border-b pb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {review.user.avatar ? (
                    <img
                      src={review.user.avatar}
                      alt={review.user.name}
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <FaUserCircle className="h-10 w-10 text-gray-400" />
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">
                      {review.user.name}
                    </h4>
                    <time className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </time>
                  </div>
                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={
                          i < review.rating
                            ? 'text-yellow-400 h-4 w-4'
                            : 'text-gray-300 h-4 w-4'
                        }
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-gray-600">{review.review}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviews; 