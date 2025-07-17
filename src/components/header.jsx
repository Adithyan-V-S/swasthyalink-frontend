import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg sticky top-0 z-50">
      <nav className="container mx-auto flex flex-wrap items-center justify-between py-4 px-6">
        <div className="flex items-center space-x-3">
          <span className="text-white text-2xl font-bold tracking-wide">Swasthyalink</span>
        </div>
        <ul className="flex flex-wrap gap-4 md:gap-8 text-white font-medium text-lg">
          <li>
            <Link to="/" className="hover:text-yellow-300 transition-colors duration-200">Home</Link>
          </li>
          <li>
            <Link to="/about" className="hover:text-yellow-300 transition-colors duration-200">About</Link>
          </li>
          <li>
            <Link to="/patientdashboard" className="hover:text-yellow-300 transition-colors duration-200">Patient Dashboard</Link>
          </li>
          <li>
            <Link to="/settings" className="hover:text-yellow-300 transition-colors duration-200">Setting</Link>
          </li>
          <li>
            <Link to="/login" className="bg-white text-indigo-600 px-4 py-1 rounded-full shadow hover:bg-yellow-300 hover:text-indigo-800 transition-colors duration-200">Login</Link>
          </li>
          <li>
            <Link to="/register" className="bg-yellow-300 text-indigo-800 px-4 py-1 rounded-full shadow hover:bg-white hover:text-indigo-600 transition-colors duration-200">Register</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
