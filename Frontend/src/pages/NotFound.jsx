import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen bg-[#F9FAFB] px-6 py-12 gap-10">
      {/* Cartoon Animation */}
      <div className="w-full max-w-md">
        <lottie-player
          src="https://assets7.lottiefiles.com/packages/lf20_qp1q7mct.json"
          background="transparent"
          speed="1"
          loop
          autoplay
          style={{ width: "100%", height: "auto" }}
        ></lottie-player>
      </div>

      {/* Text Content */}
      <div className="text-center md:text-left">
        <h1 className="text-6xl font-bold text-blue-600">404</h1>
        <h2 className="mt-2 text-3xl font-semibold text-gray-800">Page Not Found</h2>
        <p className="mt-3 text-gray-600 text-lg">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 mt-6 px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 transition rounded-full shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
