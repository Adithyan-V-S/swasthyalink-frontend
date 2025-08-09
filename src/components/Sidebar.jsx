import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
const Sidebar = ({ open, onClose }) => {
  const { userRole } = useAuth();

  // Show different menu items based on user role
  const getMenuItems = () => {
    const baseItems = [
      { to: "/", label: "Home" },
      { to: "/about", label: "About" },
    ];

    const roleSpecificItems = {
      admin: [
        { to: "/admindashboard", label: "Admin Dashboard" },
        { to: "/settings", label: "Settings" },
      ],
      doctor: [
        { to: "/doctordashboard", label: "Doctor Dashboard" },
        { to: "/settings", label: "Settings" },
      ],
      patient: [
        { to: "/patientdashboard", label: "Patient Dashboard" },
        { to: "/familydashboard", label: "Family Access" },
        { to: "/settings", label: "Settings" },
      ],
    };

    return [...baseItems, ...(roleSpecificItems[userRole] || [])];
  };

  const menuItems = getMenuItems();

  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40 transform transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      onMouseLeave={onClose}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b">
        <span className="text-xl font-bold text-indigo-700">Menu</span>
        <button onClick={onClose} className="text-gray-500 hover:text-red-500">
          <span className="material-icons">close</span>
        </button>
      </div>
      <ul className="flex flex-col gap-2 p-4 text-indigo-700 font-medium">
        {menuItems.map((item, index) => (
          <li key={index}>
            <Link 
              to={item.to} 
              className="hover:bg-indigo-100 rounded px-2 py-1 block" 
              onClick={onClose}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar; 