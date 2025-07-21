import React from "react";
import { Link } from "react-router-dom";

const Sidebar = ({ open, onClose }) => {
  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      onMouseLeave={onClose}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b">
        <span className="text-xl font-bold text-indigo-700">Menu</span>
        <button onClick={onClose} className="text-gray-500 hover:text-red-500">
          <span className="material-icons">close</span>
        </button>
      </div>
      <ul className="flex flex-col gap-2 p-4 text-indigo-700 font-medium">
        <li>
          <Link to="/" className="hover:bg-indigo-100 rounded px-2 py-1 block" onClick={onClose}>Home</Link>
        </li>
        <li>
          <Link to="/about" className="hover:bg-indigo-100 rounded px-2 py-1 block" onClick={onClose}>About</Link>
        </li>
        <li>
          <Link to="/patientdashboard" className="hover:bg-indigo-100 rounded px-2 py-1 block" onClick={onClose}>Patient Dashboard</Link>
        </li>
        <li>
          <Link to="/familydashboard" className="hover:bg-indigo-100 rounded px-2 py-1 block" onClick={onClose}>Family Access</Link>
        </li>
        <li>
          <Link to="/settings" className="hover:bg-indigo-100 rounded px-2 py-1 block" onClick={onClose}>Setting</Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar; 