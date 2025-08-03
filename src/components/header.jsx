import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig";
import NotificationCenter from "./NotificationCenter";
import Sidebar from "./Sidebar";
import { useAuth } from "../contexts/AuthContext";

const Header = () => {
  const [notifications, setNotifications] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();
  const { currentUser, userRole, isAuthenticated, logout } = useAuth();
  let sidebarTimer = null;

  // Mock notifications - in a real app, these would come from Firebase
  useEffect(() => {
    if (isAuthenticated) {
      // Simulate notifications for demonstration
      const mockNotifications = [
        {
          id: 1,
          type: "access_granted",
          message: "Sarah Doe was granted full access to your health records",
          timestamp: "2024-01-15 14:30",
          read: false
        },
        {
          id: 2,
          type: "record_updated",
          message: "New medical record added - Dr. Sharma consultation",
          timestamp: "2024-01-14 10:15",
          read: true
        }
      ];
      setNotifications(mockNotifications);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    }
    if (profileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileMenuOpen]);

  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleClearAll = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  // Sidebar open/close handlers
  const openSidebar = () => {
    if (sidebarTimer) clearTimeout(sidebarTimer);
    setSidebarOpen(true);
  };
  const closeSidebar = () => {
    sidebarTimer = setTimeout(() => setSidebarOpen(false), 150);
  };
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  // Profile menu handlers
  const handleProfileMenu = () => setProfileMenuOpen((prev) => !prev);
  const handleLogout = async () => {
    await logout();
    setProfileMenuOpen(false);
    navigate('/');
  };
  const handleSettings = () => {
    navigate('/settings');
    setProfileMenuOpen(false);
  };
  const handleProfile = () => {
    navigate('/profile');
    setProfileMenuOpen(false);
  };

  return (
    <header className="bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg sticky top-0 z-50">
      <nav className="w-full flex flex-wrap items-center justify-between py-2 px-6 min-h-[50px]">
        {/* Left section: hamburger + logo */}
        <div className="flex items-center space-x-3 h-full">
          {isAuthenticated && (
            <button
              className="focus:outline-none m-0 p-0 h-full flex items-center"
              onClick={toggleSidebar}
              onMouseEnter={openSidebar}
              aria-label="Open sidebar menu"
              style={{lineHeight: 0}}
            >
              <span className="material-icons text-white text-2xl leading-none">menu</span>
            </button>
          )}
          <span className="text-white text-xl font-bold tracking-wide">Swasthyalink</span>
        </div>
        {/* Right section: notifications, profile menu, login/register */}
        <div className="flex flex-1 items-center justify-end">
          {isAuthenticated ? (
            <>
              <Sidebar open={sidebarOpen} onClose={closeSidebar} />
              <div className="flex items-center gap-3">
                <NotificationCenter 
                  notifications={notifications}
                  onMarkAsRead={handleMarkAsRead}
                  onClearAll={handleClearAll}
                />
                {/* Profile menu */}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    className="focus:outline-none flex items-center"
                    onClick={handleProfileMenu}
                    aria-label="Open profile menu"
                  >
                    <span className="material-icons text-white text-2xl">account_circle</span>
                  </button>
                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg z-50 py-2">
                      <button onClick={handleProfile} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-indigo-100">Profile</button>
                      <button onClick={handleSettings} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-indigo-100">Settings</button>
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100">Logout</button>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center ml-auto gap-3">
              <Link to="/login" className="bg-white text-indigo-600 px-3 py-1.5 rounded-full shadow hover:bg-yellow-300 hover:text-indigo-800 transition-colors duration-200 text-sm">Login</Link>
              <Link to="/register" className="bg-yellow-300 text-indigo-800 px-3 py-1.5 rounded-full shadow hover:bg-white hover:text-indigo-600 transition-colors duration-200 text-sm">Register</Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
