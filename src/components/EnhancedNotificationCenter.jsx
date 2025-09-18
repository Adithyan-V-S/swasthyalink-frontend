import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
// Using real Firebase notification services
import {
  subscribeToNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationIcon,
  getNotificationColor,
  formatNotificationTime,
  NOTIFICATION_TYPES
} from '../services/notificationService';

const EnhancedNotificationCenter = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'unread', 'family', 'chat', 'emergency'
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToNotifications(currentUser.uid, (notifs) => {
      setNotifications(notifs);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.read && !n.deleted).length;

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.read;
    if (activeTab === 'family') return notification.type.includes('family');
    if (activeTab === 'chat') return notification.type === NOTIFICATION_TYPES.CHAT_MESSAGE;
    if (activeTab === 'emergency') return notification.type === NOTIFICATION_TYPES.EMERGENCY_ALERT;
    return true;
  });

  const handleNotificationClick = async (notification) => {
    // Mark as read if not already read
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case NOTIFICATION_TYPES.FAMILY_REQUEST:
        navigate('/familydashboard');
        // Set active tab to family requests
        localStorage.setItem('familyDashboardTab', '1');
        break;
      
      case NOTIFICATION_TYPES.FAMILY_REQUEST_ACCEPTED:
      case NOTIFICATION_TYPES.FAMILY_REQUEST_REJECTED:
        navigate('/familydashboard');
        // Set active tab to family network
        localStorage.setItem('familyDashboardTab', '2');
        break;
      
      case NOTIFICATION_TYPES.CHAT_MESSAGE:
        navigate('/familydashboard');
        // Set active tab to family chat and open conversation
        localStorage.setItem('familyDashboardTab', '3');
        if (notification.data?.conversationId) {
          localStorage.setItem('openConversationId', notification.data.conversationId);
        }
        break;
      
      case NOTIFICATION_TYPES.EMERGENCY_ALERT:
        navigate('/familydashboard');
        // Set active tab to overview for emergency
        localStorage.setItem('familyDashboardTab', '0');
        break;
      
      default:
        navigate('/familydashboard');
        break;
    }

    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    await markAllNotificationsAsRead(currentUser.uid);
    setLoading(false);
  };

  const handleDeleteNotification = async (notificationId, event) => {
    event.stopPropagation();
    await deleteNotification(notificationId);
  };

  const getTabCount = (tab) => {
    switch (tab) {
      case 'unread':
        return notifications.filter(n => !n.read).length;
      case 'family':
        return notifications.filter(n => n.type.includes('family')).length;
      case 'chat':
        return notifications.filter(n => n.type === NOTIFICATION_TYPES.CHAT_MESSAGE).length;
      case 'emergency':
        return notifications.filter(n => n.type === NOTIFICATION_TYPES.EMERGENCY_ALERT).length;
      default:
        return notifications.length;
    }
  };

  const renderNotification = (notification) => {
    const icon = getNotificationIcon(notification.type);
    const colorClasses = getNotificationColor(notification.priority);
    const timeAgo = formatNotificationTime(notification.timestamp);

    return (
      <div
        key={notification.id}
        onClick={() => handleNotificationClick(notification)}
        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
          !notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
        }`}
      >
        <div className="flex items-start space-x-3">
          <div className={`flex-shrink-0 p-2 rounded-full ${colorClasses}`}>
            <span className="material-icons text-sm">{icon}</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                {notification.title}
              </h4>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">{timeAgo}</span>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {notification.message}
            </p>
            
            {notification.priority === 'urgent' && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <span className="material-icons text-xs mr-1">priority_high</span>
                  Urgent
                </span>
              </div>
            )}
          </div>
          
          <button
            onClick={(e) => handleDeleteNotification(notification.id, e)}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
            title="Delete notification"
          >
            <span className="material-icons text-sm">close</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
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
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[600px] overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    disabled={loading}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-500 hover:text-gray-700 rounded"
                >
                  <span className="material-icons text-sm">close</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            {[
              { key: 'all', label: 'All', icon: 'notifications' },
              { key: 'unread', label: 'Unread', icon: 'mark_email_unread' },
              { key: 'family', label: 'Family', icon: 'people' },
              { key: 'chat', label: 'Chat', icon: 'chat' },
              { key: 'emergency', label: 'Emergency', icon: 'emergency' }
            ].map(tab => {
              const count = getTabCount(tab.key);
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 px-3 py-2 text-xs font-medium transition-colors relative ${
                    activeTab === tab.key
                      ? 'text-indigo-600 border-b-2 border-indigo-500 bg-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span className="material-icons text-sm">{tab.icon}</span>
                    <span>{tab.label}</span>
                    {count > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-1 min-w-[16px] h-4 flex items-center justify-center">
                        {count > 9 ? '9+' : count}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-gray-600 text-sm mt-2">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-2">
                  <span className="material-icons text-4xl">notifications_none</span>
                </div>
                <p className="text-gray-600 text-sm">
                  {activeTab === 'unread' ? 'No unread notifications' : 'No notifications'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map(renderNotification)}
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  navigate('/familydashboard');
                  setIsOpen(false);
                }}
                className="w-full text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                View all in dashboard
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedNotificationCenter;