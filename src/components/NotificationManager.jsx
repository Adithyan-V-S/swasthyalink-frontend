import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  subscribeToNotifications,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  NOTIFICATION_TYPES 
} from '../services/notificationService';
import { clearTestNotifications, clearAllNotifications } from '../utils/clearTestData';

const NotificationManager = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToNotifications(currentUser.uid, (notifs) => {
      setNotifications(notifs);
      console.log('NotificationManager: Received notifications:', notifs);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser]);

  const createTestNotification = async (type = NOTIFICATION_TYPES.CHAT_MESSAGE) => {
    if (!currentUser) return;
    
    setLoading(true);
    setMessage('');
    
    try {
      const result = await createNotification({
        recipientId: currentUser.uid,
        senderId: 'system',
        type: type,
        title: `Test ${type} Notification`,
        message: `This is a test ${type} notification created at ${new Date().toLocaleTimeString()}`,
        data: { 
          conversationId: 'test-123',
          isTest: true 
        },
        priority: 'normal'
      });
      
      if (result.success) {
        setMessage('Test notification created successfully!');
      } else {
        setMessage('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error creating test notification:', error);
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearTestData = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setMessage('');
    
    try {
      const result = await clearTestNotifications(currentUser.uid);
      if (result.success) {
        setMessage(`Cleared ${result.cleared} test notifications`);
      } else {
        setMessage('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error clearing test data:', error);
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = async () => {
    if (!currentUser) return;
    if (!window.confirm('Are you sure you want to clear ALL notifications? This cannot be undone.')) return;
    
    setLoading(true);
    setMessage('');
    
    try {
      const result = await clearAllNotifications(currentUser.uid);
      if (result.success) {
        setMessage(`Cleared ${result.cleared} notifications`);
      } else {
        setMessage('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error clearing all data:', error);
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      await markAllNotificationsAsRead(currentUser.uid);
      setMessage('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return <div className="p-4 text-gray-500">Please log in to manage notifications</div>;
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Notification Management</h2>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800">Total Notifications</h3>
          <p className="text-2xl font-bold text-blue-600">{notifications.length}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="font-semibold text-red-800">Unread</h3>
          <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800">Read</h3>
          <p className="text-2xl font-bold text-green-600">{notifications.length - unreadCount}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => createTestNotification(NOTIFICATION_TYPES.CHAT_MESSAGE)}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Create Chat Notification
        </button>
        <button
          onClick={() => createTestNotification(NOTIFICATION_TYPES.FAMILY_REQUEST)}
          disabled={loading}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Create Family Request
        </button>
        <button
          onClick={() => createTestNotification(NOTIFICATION_TYPES.EMERGENCY_ALERT)}
          disabled={loading}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
        >
          Create Emergency Alert
        </button>
        <button
          onClick={markAllAsRead}
          disabled={loading || unreadCount === 0}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Mark All Read
        </button>
        <button
          onClick={clearTestData}
          disabled={loading}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:opacity-50"
        >
          Clear Test Data
        </button>
        <button
          onClick={clearAllData}
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
        >
          Clear All
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {message}
        </div>
      )}

      {/* Notifications List */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Notifications ({notifications.length})</h3>
        {notifications.length === 0 ? (
          <p className="text-gray-500">No notifications found</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border rounded-lg ${
                  notification.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{notification.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded ${
                        notification.type === NOTIFICATION_TYPES.EMERGENCY_ALERT ? 'bg-red-200 text-red-800' :
                        notification.type === NOTIFICATION_TYPES.CHAT_MESSAGE ? 'bg-blue-200 text-blue-800' :
                        notification.type === NOTIFICATION_TYPES.FAMILY_REQUEST ? 'bg-purple-200 text-purple-800' :
                        'bg-gray-200 text-gray-800'
                      }`}>
                        {notification.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>From: {notification.senderId}</span>
                      <span>{notification.timestamp?.toLocaleString()}</span>
                      <span>Priority: {notification.priority}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      notification.read ? 'bg-gray-200 text-gray-700' : 'bg-red-200 text-red-700'
                    }`}>
                      {notification.read ? 'Read' : 'Unread'}
                    </span>
                    {!notification.read && (
                      <button
                        onClick={() => markNotificationAsRead(notification.id)}
                        className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationManager;