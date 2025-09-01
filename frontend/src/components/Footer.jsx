import React from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 w-full">
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-12">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-700 pb-6">
          {/* Logo & About */}
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h2 className="text-2xl font-bold">Go Green 360</h2>
            <p className="mt-2 text-gray-400">
              Creating a sustainable future through responsible waste management.
            </p>
          </div>

          {/* Navigation  */}
          <div className="flex flex-wrap justify-center md:justify-start space-x-6">
            <a href="/" className="hover:text-gray-300">Home</a>
            <a href="/about" className="hover:text-gray-300">About Us</a>
            <a href="/articles" className="hover:text-gray-300">Articles</a>
            <a href="/help" className="hover:text-gray-300">Help</a>
            <a href="/#contact" className="hover:text-gray-300">Contact Us</a>
          </div>

          {/* Social Media  */}
          <div className="flex space-x-4 mt-6 md:mt-0">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <FaFacebook className="text-2xl hover:text-gray-400" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <FaTwitter className="text-2xl hover:text-gray-400" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FaInstagram className="text-2xl hover:text-gray-400" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <FaLinkedin className="text-2xl hover:text-gray-400" />
            </a>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="text-center text-gray-400 text-sm mt-6">
          &copy; {new Date().getFullYear()} Go Green 360. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
