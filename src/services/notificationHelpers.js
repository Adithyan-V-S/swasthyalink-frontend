import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { NOTIFICATION_TYPES } from './notificationService';

// Create a chat message notification
export const createChatNotification = async (recipientId, senderId, senderName, message, conversationId) => {
  try {
    const notification = {
      recipientId,
      type: NOTIFICATION_TYPES.CHAT_MESSAGE,
      title: `New message from ${senderName}`,
      message: message.length > 50 ? `${message.substring(0, 50)}...` : message,
      data: {
        senderId,
        senderName,
        conversationId,
        messagePreview: message
      },
      read: false,
      priority: 'normal',
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, 'notifications'), notification);
    console.log('Chat notification created successfully');
  } catch (error) {
    console.error('Error creating chat notification:', error);
  }
};

// Create a family request notification
export const createFamilyRequestNotification = async (recipientId, senderName, senderEmail) => {
  try {
    const notification = {
      recipientId,
      type: NOTIFICATION_TYPES.FAMILY_REQUEST,
      title: 'New Family Request',
      message: `${senderName} (${senderEmail}) wants to connect with you`,
      data: {
        senderName,
        senderEmail
      },
      read: false,
      priority: 'high',
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, 'notifications'), notification);
    console.log('Family request notification created successfully');
  } catch (error) {
    console.error('Error creating family request notification:', error);
  }
};

// Create a family request accepted notification
export const createFamilyRequestAcceptedNotification = async (recipientId, accepterName) => {
  try {
    const notification = {
      recipientId,
      type: NOTIFICATION_TYPES.FAMILY_REQUEST_ACCEPTED,
      title: 'Family Request Accepted',
      message: `${accepterName} accepted your family request`,
      data: {
        accepterName
      },
      read: false,
      priority: 'normal',
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, 'notifications'), notification);
    console.log('Family request accepted notification created successfully');
  } catch (error) {
    console.error('Error creating family request accepted notification:', error);
  }
};

// Create a family request rejected notification
export const createFamilyRequestRejectedNotification = async (recipientId, rejecterName) => {
  try {
    const notification = {
      recipientId,
      type: NOTIFICATION_TYPES.FAMILY_REQUEST_REJECTED,
      title: 'Family Request Declined',
      message: `${rejecterName} declined your family request`,
      data: {
        rejecterName
      },
      read: false,
      priority: 'normal',
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, 'notifications'), notification);
    console.log('Family request rejected notification created successfully');
  } catch (error) {
    console.error('Error creating family request rejected notification:', error);
  }
};

// Create an emergency alert notification
export const createEmergencyNotification = async (recipientId, senderName, emergencyType, location) => {
  try {
    const notification = {
      recipientId,
      type: NOTIFICATION_TYPES.EMERGENCY_ALERT,
      title: '🚨 Emergency Alert',
      message: `${senderName} has triggered an emergency alert${location ? ` at ${location}` : ''}`,
      data: {
        senderName,
        emergencyType,
        location,
        timestamp: new Date().toISOString()
      },
      read: false,
      priority: 'urgent',
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, 'notifications'), notification);
    console.log('Emergency notification created successfully');
  } catch (error) {
    console.error('Error creating emergency notification:', error);
  }
};

// Create a health record shared notification
export const createHealthRecordNotification = async (recipientId, sharerName, recordType) => {
  try {
    const notification = {
      recipientId,
      type: NOTIFICATION_TYPES.HEALTH_RECORD_SHARED,
      title: 'Health Record Shared',
      message: `${sharerName} shared a ${recordType} record with you`,
      data: {
        sharerName,
        recordType
      },
      read: false,
      priority: 'normal',
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, 'notifications'), notification);
    console.log('Health record notification created successfully');
  } catch (error) {
    console.error('Error creating health record notification:', error);
  }
};

// Batch create notifications for multiple recipients
export const createBatchNotifications = async (notifications) => {
  try {
    const promises = notifications.map(notification => 
      addDoc(collection(db, 'notifications'), {
        ...notification,
        createdAt: serverTimestamp()
      })
    );

    await Promise.all(promises);
    console.log(`${notifications.length} notifications created successfully`);
  } catch (error) {
    console.error('Error creating batch notifications:', error);
  }
};