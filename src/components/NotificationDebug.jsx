import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  createNotification, 
  subscribeToNotifications,
  NOTIFICATION_TYPES 
} from '../services/notificationService';

const NotificationDebug = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToNotifications(currentUser.uid, (notifs) => {
      setNotifications(notifs);
      console.log('Notifications received:', notifs);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser]);

  const createTestNotification = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setMessage('');
    
    try {
      await createNotification({
        recipientId: currentUser.uid,
        senderId: 'system',
        type: NOTIFICATION_TYPES.CHAT_MESSAGE,
        title: 'Test Notification',
        message: 'This is a test notification created at ' + new Date().toLocaleTimeString(),
        data: { conversationId: 'test-123' },
        priority: 'normal'
      });
      setMessage('Test notification created successfully!');
    } catch (error) {
      console.error('Error creating test notification:', error);
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return <div className="p-4 text-gray-500">Please log in to test notifications</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Notification Debug Panel</h2>
      
      <div className="mb-6">
        <button
          onClick={createTestNotification}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Test Notification'}
        </button>
        {message && (
          <p className={`mt-2 text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Current Notifications ({notifications.length})</h3>
        {notifications.length === 0 ? (
          <p className="text-gray-500">No notifications found</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 border rounded ${
                  notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{notification.title}</h4>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Type: {notification.type} | 
                      {notification.timestamp?.toLocaleString()}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    notification.read ? 'bg-gray-200' : 'bg-blue-200'
                  }`}>
                    {notification.read ? 'Read' : 'Unread'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDebug;