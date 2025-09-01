import React, { useState, useRef } from "react";

const NotificationCenter = ({ notifications, onMarkAsRead, onClearAll, onItemClick }) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("unread");
  const timerRef = useRef(null);

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  const handleBellClick = () => setOpen((prev) => !prev);

  const handleTabChange = (tabName) => setTab(tabName);

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button className="relative focus:outline-none" onClick={handleBellClick}>
        <span className="material-icons text-blue-600">notifications</span>
        {unreadNotifications.length > 0 && (
          <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
          <div className="flex justify-between items-center px-4 py-2 border-b">
            <span className="font-semibold text-gray-700">Notifications</span>
            <button onClick={onClearAll} className="text-xs text-blue-500 hover:underline">Mark all as read</button>
          </div>
          <div className="flex border-b">
            <button
              className={`flex-1 py-2 text-sm font-semibold ${tab === "unread" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
              onClick={() => handleTabChange("unread")}
            >
              Unread
            </button>
            <button
              className={`flex-1 py-2 text-sm font-semibold ${tab === "read" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
              onClick={() => handleTabChange("read")}
            >
              Read
            </button>
          </div>
          <ul className="max-h-64 overflow-y-auto">
            {tab === "unread" ? (
              unreadNotifications.length === 0 ? (
                <li className="px-4 py-2 text-gray-500">No unread notifications</li>
              ) : (
                unreadNotifications.map(n => (
                  <li key={n.id} className="px-4 py-2 border-b last:border-b-0 bg-yellow-50">
                    <button
                      type="button"
                      onClick={() => onItemClick && onItemClick(n)}
                      className="w-full text-left"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm font-medium">{n.message}</div>
                          <div className="text-xs text-gray-400">{n.timestamp}</div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); onMarkAsRead(n.id); }} className="ml-2 text-xs text-blue-500 hover:underline">Mark as read</button>
                      </div>
                    </button>
                  </li>
                ))
              )
            ) : (
              readNotifications.length === 0 ? (
                <li className="px-4 py-2 text-gray-500">No read notifications</li>
              ) : (
                readNotifications.map(n => (
                  <li key={n.id} className="px-4 py-2 border-b last:border-b-0 bg-gray-100">
                    <button
                      type="button"
                      onClick={() => onItemClick && onItemClick(n)}
                      className="w-full text-left"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm font-medium">{n.message}</div>
                          <div className="text-xs text-gray-400">{n.timestamp}</div>
                        </div>
                      </div>
                    </button>
                  </li>
                ))
              )
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter; 