import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getFamilyRequests } from '../services/familyService';

const FamilyNotificationSystem = ({ onNotificationClick }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadNotifications();
      
      // Set up periodic refresh
      const interval = setInterval(loadNotifications, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const loadNotifications = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const response = await getFamilyRequests(currentUser.email);
      
      if (response.success) {
        const pendingReceived = response.requests.received.filter(req => req.status === 'pending');
        const recentAccepted = response.requests.sent
          .filter(req => req.status === 'accepted')
          .filter(req => {
            const requestDate = new Date(req.updatedAt || req.createdAt);
            const dayAgo = new Date();
            dayAgo.setDate(dayAgo.getDate() - 1);
            return requestDate > dayAgo;
          });

        const allNotifications = [
          ...pendingReceived.map(req => ({
            id: req.id,
            type: 'family_request',
            title: 'New Family Request',
            message: `${req.fromName} wants to add you as their ${req.relationship}`,
            timestamp: req.createdAt,
            isRead: false,
            data: req
          })),
          ...recentAccepted.map(req => ({
            id: `accepted_${req.id}`,
            type: 'request_accepted',
            title: 'Request Accepted',
            message: `${req.toName} accepted your family request`,
            timestamp: req.updatedAt || req.createdAt,
            isRead: false,
            data: req
          }))
        ];

        // Sort by timestamp (newest first)
        allNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        setNotifications(allNotifications);
        setUnreadCount(allNotifications.filter(n => !n.isRead).length);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    setShowDropdown(false);
    
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'family_request':
        return <span className="material-icons text-blue-600">person_add</span>;
      case 'request_accepted':
        return <span className="material-icons text-green-600">check_circle</span>;
      default:
        return <span className="material-icons text-gray-600">notifications</span>;
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Notifications"
      >
        <span className="material-icons">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-20 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Notifications</h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={loadNotifications}
                    disabled={loading}
                    className="p-1 text-gray-500 hover:text-gray-700 rounded"
                  >
                    <span className={`material-icons text-sm ${loading ? 'animate-spin' : ''}`}>
                      refresh
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-gray-400 mb-2">
                    <span className="material-icons text-4xl">notifications_none</span>
                  </div>
                  <p className="text-gray-600 text-sm">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.isRead ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${
                              !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    if (onNotificationClick) {
                      onNotificationClick({ type: 'view_all' });
                    }
                  }}
                  className="w-full text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FamilyNotificationSystem;