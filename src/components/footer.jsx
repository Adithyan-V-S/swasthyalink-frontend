import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-6 shadow-inner">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4">
        <div className="mb-4 md:mb-0 text-center md:text-left">
          <span className="font-semibold text-lg">Swasthyakink</span> &copy; {new Date().getFullYear()} All rights reserved.
        </div>
        <ul className="flex flex-wrap gap-4 justify-center md:justify-end">
          <li><Link to="/" className="hover:text-yellow-300 transition-colors duration-200">Home</Link></li>
          <li><Link to="/about" className="hover:text-yellow-300 transition-colors duration-200">About</Link></li>
          <li><Link to="/familydashboard" className="hover:text-yellow-300 transition-colors duration-200">familydashboard</Link></li>
          <li><Link to="/patientdashboard" className="hover:text-yellow-300 transition-colors duration-200">patientdashboard</Link></li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
