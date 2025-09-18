import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  subscribeToNotifications, 
  markNotificationAsRead, 
  NOTIFICATION_TYPES 
} from '../services/notificationService';
import { useNavigate } from 'react-router-dom';

const FamilyNotificationSystem = ({ onNotificationClick }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToNotifications(currentUser.uid, (notificationList) => {
      setNotifications(notificationList);
      setUnreadCount(notificationList.filter(n => !n.read).length);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser]);

  const markAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(
        unreadNotifications.map(notification => 
          markNotificationAsRead(notification.id)
        )
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    setShowDropdown(false);

    // Navigate based on notification type
    switch (notification.type) {
      case NOTIFICATION_TYPES.FAMILY_REQUEST:
        localStorage.setItem('familyDashboardTab', '1');
        if (onNotificationClick) {
          onNotificationClick({ type: 'family_request', tab: 1 });
        }
        break;
      
      case NOTIFICATION_TYPES.FAMILY_REQUEST_ACCEPTED:
      case NOTIFICATION_TYPES.FAMILY_REQUEST_REJECTED:
        localStorage.setItem('familyDashboardTab', '2');
        if (onNotificationClick) {
          onNotificationClick({ type: 'family_network', tab: 2 });
        }
        break;
      
      case NOTIFICATION_TYPES.CHAT_MESSAGE:
        localStorage.setItem('familyDashboardTab', '3');
        if (notification.data?.conversationId) {
          localStorage.setItem('openConversationId', notification.data.conversationId);
        }
        if (onNotificationClick) {
          onNotificationClick({ type: 'chat', tab: 3 });
        }
        break;
      
      case NOTIFICATION_TYPES.EMERGENCY_ALERT:
        localStorage.setItem('familyDashboardTab', '0');
        if (onNotificationClick) {
          onNotificationClick({ type: 'emergency', tab: 0 });
        }
        break;
      
      default:
        if (onNotificationClick) {
          onNotificationClick(notification);
        }
        break;
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
      case NOTIFICATION_TYPES.FAMILY_REQUEST:
        return <span className="material-icons text-blue-600">person_add</span>;
      case NOTIFICATION_TYPES.FAMILY_REQUEST_ACCEPTED:
        return <span className="material-icons text-green-600">check_circle</span>;
      case NOTIFICATION_TYPES.FAMILY_REQUEST_REJECTED:
        return <span className="material-icons text-red-600">cancel</span>;
      case NOTIFICATION_TYPES.CHAT_MESSAGE:
        return <span className="material-icons text-indigo-600">chat</span>;
      case NOTIFICATION_TYPES.EMERGENCY_ALERT:
        return <span className="material-icons text-red-600">warning</span>;
      case NOTIFICATION_TYPES.HEALTH_RECORD_SHARED:
        return <span className="material-icons text-purple-600">medical_services</span>;
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
                  <span className="text-xs text-gray-500">
                    Real-time
                  </span>
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
                        !notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${
                              !notification.read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {formatTimestamp(notification.createdAt?.toDate?.() || notification.createdAt)}
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