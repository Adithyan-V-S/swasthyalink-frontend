import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  doc, 
  serverTimestamp,
  writeBatch,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

// Notification types
export const NOTIFICATION_TYPES = {
  FAMILY_REQUEST: 'family_request',
  FAMILY_REQUEST_ACCEPTED: 'family_request_accepted',
  FAMILY_REQUEST_REJECTED: 'family_request_rejected',
  CHAT_MESSAGE: 'chat_message',
  EMERGENCY_ALERT: 'emergency_alert',
  HEALTH_RECORD_SHARED: 'health_record_shared',
  APPOINTMENT_REMINDER: 'appointment_reminder',
  MEDICATION_REMINDER: 'medication_reminder',
  SYSTEM_ALERT: 'system_alert',
  DOCTOR_CONNECTION_REQUEST: 'doctor_connection_request',
  PRESCRIPTION_RECEIVED: 'prescription_received'
};

// Create a new notification (Firestore write)
export const createNotification = async ({
  recipientId,
  senderId,
  type,
  title,
  message,
  data = {},
  priority = 'normal' // 'low', 'normal', 'high', 'urgent'
}) => {
  try {
    const ref = await addDoc(collection(db, 'notifications'), {
      recipientId,
      senderId,
      type,
      title,
      message,
      data,
      priority,
      read: false,
      deleted: false,
      timestamp: serverTimestamp(),
    });
    return { success: true, id: ref.id };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error: error.message };
  }
};

// Cache for notifications to reduce Firebase calls
const notificationCache = new Map();
const CACHE_DURATION = 30000; // 30 seconds

// Local storage cache for persistence across page reloads
const getFromLocalStorage = (key) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    const parsed = JSON.parse(item);
    if (Date.now() - parsed.timestamp > CACHE_DURATION) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed.data;
  } catch (error) {
    console.warn('Error reading from localStorage:', error);
    return null;
  }
};

const setToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.warn('Error writing to localStorage:', error);
  }
};

// Subscribe to user's notifications (real-time)
export const subscribeToNotifications = (userId, callback) => {
  if (!userId) return null;

  // Check if this is a test user (mock authentication)
  const isTestUser = localStorage.getItem('testUser') !== null;

  if (isTestUser) {
    console.log('🧪 Using test user - returning empty notifications');
    // Return empty notifications for test users
    callback([]);
    return () => {}; // Return empty unsubscribe function
  }

  const q = query(
    collection(db, 'notifications'),
    where('recipientId', '==', userId),
    orderBy('timestamp', 'desc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const notifs = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
    callback(notifs);
  }, (error) => {
    console.error('subscribeToNotifications error:', error);
    callback([]);
  });

  return unsubscribe;
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  // Check if this is a test user (mock authentication)
  const isTestUser = localStorage.getItem('testUser') !== null;

  if (isTestUser) {
    console.log('🧪 Using test user - skipping Firestore operations for markNotificationAsRead');
    return { success: true };
  }

  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      read: true,
      readAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: error.message };
  }
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (userId) => {
  // Check if this is a test user (mock authentication)
  const isTestUser = localStorage.getItem('testUser') !== null;

  if (isTestUser) {
    console.log('🧪 Using test user - skipping Firestore operations for markAllNotificationsAsRead');
    return { success: true };
  }

  try {
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      where('read', '==', false)
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);

    snapshot.forEach((docSnapshot) => {
      batch.update(docSnapshot.ref, {
        read: true,
        readAt: serverTimestamp()
      });
    });

    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, error: error.message };
  }
};

// Delete notification
export const deleteNotification = async (notificationId) => {
  // Check if this is a test user (mock authentication)
  const isTestUser = localStorage.getItem('testUser') !== null;

  if (isTestUser) {
    console.log('🧪 Using test user - skipping Firestore operations for deleteNotification');
    return { success: true };
  }

  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      deleted: true,
      deletedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error deleting notification:', error);
    return { success: false, error: error.message };
  }
};

// Get unread notification count
export const getUnreadNotificationCount = async (userId) => {
  // Check if this is a test user (mock authentication)
  const isTestUser = localStorage.getItem('testUser') !== null;

  if (isTestUser) {
    console.log('🧪 Using test user - returning 0 unread notifications');
    return { success: true, count: 0 };
  }

  try {
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      where('read', '==', false)
    );

    const snapshot = await getDocs(q);
    return { success: true, count: snapshot.size };
  } catch (error) {
    console.error('Error getting unread count:', error);
    return { success: false, error: error.message, count: 0 };
  }
};

// Create family request notification
export const createFamilyRequestNotification = async (recipientId, senderInfo, relationship) => {
  return createNotification({
    recipientId,
    senderId: senderInfo.uid,
    type: NOTIFICATION_TYPES.FAMILY_REQUEST,
    title: 'New Family Request',
    message: `${senderInfo.name || senderInfo.email} wants to add you as their ${relationship}`,
    data: {
      senderInfo,
      relationship,
      actionRequired: true
    },
    priority: 'high'
  });
};

// Create family request accepted notification
export const createFamilyRequestAcceptedNotification = async (recipientId, accepterInfo, relationship) => {
  return createNotification({
    recipientId,
    senderId: accepterInfo.uid,
    type: NOTIFICATION_TYPES.FAMILY_REQUEST_ACCEPTED,
    title: 'Family Request Accepted',
    message: `${accepterInfo.name || accepterInfo.email} accepted your family request`,
    data: {
      accepterInfo,
      relationship
    },
    priority: 'normal'
  });
};

// Create chat message notification
export const createChatMessageNotification = async (recipientId, payload) => {
  // payload: { text, fromUid, conversationId, fromName? }
  if (!recipientId || !payload?.fromUid) {
    console.error('❌ Invalid parameters for chat notification:', { recipientId, payload });
    return { success: false, error: 'Invalid parameters' };
  }
  const title = `New message`;
  const message = payload.text?.slice(0, 140) || '';
  return createNotification({
    recipientId,
    senderId: payload.fromUid,
    type: NOTIFICATION_TYPES.CHAT_MESSAGE,
    title,
    message,
    data: {
      conversationId: payload.conversationId,
      messagePreview: message,
    },
    priority: 'normal'
  });
};



// Create family request rejected notification
export const createFamilyRequestRejectedNotification = async (recipientId, senderInfo, relationship) => {
  return createNotification({
    recipientId,
    senderId: senderInfo.uid,
    type: NOTIFICATION_TYPES.FAMILY_REQUEST_REJECTED,
    title: '❌ Family Request Declined',
    message: `${senderInfo.name || senderInfo.email} declined your family request`,
    data: {
      senderInfo,
      relationship,
      actionRequired: false
    },
    priority: 'normal'
  });
};

// Create emergency alert notification
export const createEmergencyAlertNotification = async (recipientId, senderInfo, alertMessage) => {
  return createNotification({
    recipientId,
    senderId: senderInfo.uid,
    type: NOTIFICATION_TYPES.EMERGENCY_ALERT,
    title: '🚨 Emergency Alert',
    message: alertMessage,
    data: {
      senderInfo,
      isEmergency: true
    },
    priority: 'urgent'
  });
};

// Get notification icon based on type
export const getNotificationIcon = (type) => {
  switch (type) {
    case NOTIFICATION_TYPES.FAMILY_REQUEST:
      return 'person_add';
    case NOTIFICATION_TYPES.FAMILY_REQUEST_ACCEPTED:
      return 'check_circle';
    case NOTIFICATION_TYPES.FAMILY_REQUEST_REJECTED:
      return 'cancel';
    case NOTIFICATION_TYPES.CHAT_MESSAGE:
      return 'chat';
    case NOTIFICATION_TYPES.EMERGENCY_ALERT:
      return 'emergency';
    case NOTIFICATION_TYPES.HEALTH_RECORD_SHARED:
      return 'health_and_safety';
    case NOTIFICATION_TYPES.APPOINTMENT_REMINDER:
      return 'event';
    case NOTIFICATION_TYPES.MEDICATION_REMINDER:
      return 'medication';
    case NOTIFICATION_TYPES.SYSTEM_ALERT:
      return 'info';
    default:
      return 'notifications';
  }
};

// Get notification color based on priority
export const getNotificationColor = (priority) => {
  switch (priority) {
    case 'urgent':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'high':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'normal':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'low':
      return 'text-gray-600 bg-gray-50 border-gray-200';
    default:
      return 'text-blue-600 bg-blue-50 border-blue-200';
  }
};

// Format notification time
export const formatNotificationTime = (timestamp) => {
  if (!timestamp) return 'Just now';
  
  try {
    const now = new Date();
    let notificationTime;
    
    if (timestamp instanceof Date) {
      notificationTime = timestamp;
    } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      notificationTime = new Date(timestamp);
    } else {
      return 'Just now';
    }
    
    // Check if the date is valid
    if (isNaN(notificationTime.getTime())) {
      return 'Just now';
    }
    
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return notificationTime.toLocaleDateString();
  } catch (error) {
    console.warn('Error formatting notification time:', error);
    return 'Just now';
  }
};