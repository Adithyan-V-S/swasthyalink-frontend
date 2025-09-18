import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';

// Test Firestore connection
export const testFirestoreConnection = async () => {
  try {
    console.log('🔍 Testing Firestore connection...');
    
    // Try to read from a collection
    const testCollection = collection(db, 'test');
    const snapshot = await getDocs(testCollection);
    
    console.log('✅ Firestore connection successful');
    console.log('📊 Test collection documents:', snapshot.size);
    
    return { success: true, docCount: snapshot.size };
  } catch (error) {
    console.error('❌ Firestore connection failed:', error);
    return { success: false, error: error.message };
  }
};

// Test writing to Firestore
export const testFirestoreWrite = async () => {
  try {
    console.log('✍️ Testing Firestore write...');
    
    const testDoc = {
      message: 'Test document',
      timestamp: serverTimestamp(),
      testId: Date.now()
    };
    
    const docRef = await addDoc(collection(db, 'test'), testDoc);
    console.log('✅ Document written with ID:', docRef.id);
    
    return { success: true, docId: docRef.id };
  } catch (error) {
    console.error('❌ Firestore write failed:', error);
    return { success: false, error: error.message };
  }
};

// Check notifications collection
export const checkNotificationsCollection = async (userId) => {
  try {
    console.log('🔔 Checking notifications for user:', userId);
    
    const notificationsRef = collection(db, 'notifications');
    const snapshot = await getDocs(notificationsRef);
    
    const userNotifications = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.recipientId === userId) {
        userNotifications.push({ id: doc.id, ...data });
      }
    });
    
    console.log('📬 User notifications found:', userNotifications.length);
    console.log('📋 Notifications:', userNotifications);
    
    return { success: true, notifications: userNotifications };
  } catch (error) {
    console.error('❌ Failed to check notifications:', error);
    return { success: false, error: error.message };
  }
};