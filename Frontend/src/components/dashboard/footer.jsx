import React, { useState } from "react";
import { Link } from "react-router-dom";
import TechiertLogo from "../techiert.logo";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
} from "react-icons/fa";
import LatestBlogs from "./latestBlogs";

const Footer = () => {
  const [showMobileLinks, setShowMobileLinks] = useState(false);

  return (
    <footer className="bg-[#1E293B] text-white py-10 px-6 mt-10">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Logo + About */}
          <div className="text-center sm:text-left">
            <Link to="/dashboard">
              <TechiertLogo className="w-24 mb-4 mx-auto sm:mx-0" />
            </Link>
            <p className="text-sm text-gray-400">
              Techiert is your go-to platform for tech news, reviews,
              comparisons and guides – now powered by MERN!
            </p>
            <div className="flex justify-center sm:justify-start space-x-4 text-gray-300 mt-4">
              <a
                href="https://www.facebook.com/profile.php?id=61575027223908"
                className="hover:text-white"
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaFacebookF />
              </a>
              <a
                href="https://x.com/RtRitik70"
                className="hover:text-white"
                aria-label="Twitter"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaTwitter />
              </a>
              <a
                href="https://www.linkedin.com/in/ritik-gupta-1529191b1/"
                className="hover:text-white"
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaLinkedinIn />
              </a>
              <a
                href="https://www.instagram.com/techiert/"
                className="hover:text-white"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram />
              </a>
            </div>

            {/* Mobile Toggle */}
            <div className="sm:hidden mt-4">
              <button
                onClick={() => setShowMobileLinks(!showMobileLinks)}
                className="text-sm text-gray-400 hover:text-white border border-gray-600 px-4 py-1 rounded-full transition duration-300"
              >
                {showMobileLinks ? "Hide Links ▲" : "Show Links ▼"}
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className={`${showMobileLinks ? "block" : "hidden"} sm:block text-center sm:text-left`}>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/dashboard/category/tech-news" className="hover:text-white">Tech News</Link></li>
              <li><Link to="/dashboard/category/comparisons" className="hover:text-white">Comparisons</Link></li>
              <li><Link to="/dashboard/category/how-to-guides" className="hover:text-white">How-To Guides</Link></li>
              <li><Link to="/dashboard/category/tech-products" className="hover:text-white">Tech Products</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className={`${showMobileLinks ? "block" : "hidden"} sm:block text-center sm:text-left`}>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/termOfService" className="hover:text-white">Terms of Service</Link></li>
              <li><Link to="/refund-policy" className="hover:text-white">Refund & Return Policy</Link></li>
              <li><Link to="/shipping-policy" className="hover:text-white">Shipping & Delivery Policy</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
              <li><Link to="/about" className="hover:text-white">About Us</Link></li>
            </ul>
          </div>

          {/* Latest Blogs */}
          <div className={`${showMobileLinks ? "block" : "hidden"} sm:block text-center sm:text-left`}>
            <h3 className="text-lg font-semibold mb-4">Latest Posts</h3>
            <LatestBlogs />
          </div>
        </div>

        {/* Footer bottom */}
        <div className="text-center text-sm text-gray-500 mt-8 border-t pt-4">
          &copy; {new Date().getFullYear()} Techiert. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
