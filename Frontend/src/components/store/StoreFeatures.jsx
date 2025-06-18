import React from 'react';
import { FaTruck, FaShieldAlt, FaCreditCard, FaHeadset } from 'react-icons/fa';

const StoreFeatures = () => {
  const features = [
    {
      icon: <FaTruck className="text-3xl text-blue-600" />,
      title: "Free Shipping",
      description: "On orders over $100"
    },
    {
      icon: <FaShieldAlt className="text-3xl text-blue-600" />,
      title: "Secure Payment",
      description: "100% secure payment"
    },
    {
      icon: <FaCreditCard className="text-3xl text-blue-600" />,
      title: "Money Back",
      description: "30 days guarantee"
    },
    {
      icon: <FaHeadset className="text-3xl text-blue-600" />,
      title: "24/7 Support",
      description: "Dedicated support"
    }
  ];

  return (
    <div className="bg-white py-8 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center justify-center">
              {feature.icon}
              <div className="ml-4">
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoreFeatures; 