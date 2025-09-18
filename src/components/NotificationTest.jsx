import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  createNotification,
  createChatMessageNotification,
  createFamilyRequestNotification,
  createEmergencyAlertNotification,
  NOTIFICATION_TYPES 
} from '../services/notificationService';

const NotificationTest = () => {
  const { currentUser } = useAuth();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const testChatNotification = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setMessage('');
    
    try {
      const result = await createChatMessageNotification(
        currentUser.uid,
        {
          uid: 'test-sender',
          name: 'Test User',
          email: 'test@example.com'
        },
        'This is a test chat message notification',
        'test-conversation-123'
      );
      
      if (result.success) {
        setMessage('✅ Chat notification created successfully!');
      } else {
        setMessage('❌ Error: ' + result.error);
      }
    } catch (error) {
      setMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const testFamilyRequestNotification = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setMessage('');
    
    try {
      const result = await createFamilyRequestNotification(
        currentUser.uid,
        {
          uid: 'test-sender',
          name: 'Test Family Member',
          email: 'family@example.com'
        },
        'son'
      );
      
      if (result.success) {
        setMessage('✅ Family request notification created successfully!');
      } else {
        setMessage('❌ Error: ' + result.error);
      }
    } catch (error) {
      setMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const testEmergencyNotification = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setMessage('');
    
    try {
      const result = await createEmergencyAlertNotification(
        currentUser.uid,
        {
          uid: 'test-sender',
          name: 'Emergency Contact',
          email: 'emergency@example.com'
        },
        'This is a test emergency alert - please respond immediately!'
      );
      
      if (result.success) {
        setMessage('✅ Emergency notification created successfully!');
      } else {
        setMessage('❌ Error: ' + result.error);
      }
    } catch (error) {
      setMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Please log in to test notifications</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4">🔔 Notification Test</h3>
      
      <div className="space-y-3 mb-4">
        <button
          onClick={testChatNotification}
          disabled={loading}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Chat Notification
        </button>
        
        <button
          onClick={testFamilyRequestNotification}
          disabled={loading}
          className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test Family Request
        </button>
        
        <button
          onClick={testEmergencyNotification}
          disabled={loading}
          className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
        >
          Test Emergency Alert
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded text-sm ${
          message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p><strong>Note:</strong> If you see "permission-denied" errors, the Firestore API needs to be enabled.</p>
        <p><strong>User ID:</strong> {currentUser.uid}</p>
      </div>
    </div>
  );
};

export default NotificationTest;