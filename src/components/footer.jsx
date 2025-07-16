import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-6 mt-12 shadow-inner">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4">
        <div className="mb-4 md:mb-0 text-center md:text-left">
          <span className="font-semibold text-lg">Swasthyakink</span> &copy; {new Date().getFullYear()} All rights reserved.
        </div>
        <ul className="flex flex-wrap gap-4 justify-center md:justify-end">
          <li><a href="#home" className="hover:text-yellow-300 transition-colors duration-200">Home</a></li>
          <li><a href="#about" className="hover:text-yellow-300 transition-colors duration-200">About</a></li>
          <li><a href="#patientdashboard" className="hover:text-yellow-300 transition-colors duration-200">Patient Dashboard</a></li>
          <li><a href="#setting" className="hover:text-yellow-300 transition-colors duration-200">Setting</a></li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
