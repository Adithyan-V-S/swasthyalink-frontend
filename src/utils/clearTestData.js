import { 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc,
  doc 
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

// Clear test notifications
export const clearTestNotifications = async (userId) => {
  try {
    console.log('Clearing test notifications for user:', userId);
    
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('recipientId', '==', userId)
    );
    
    const snapshot = await getDocs(q);
    const deletePromises = [];
    
    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      // Delete notifications that look like test data
      if (
        data.senderId === 'system' || 
        data.senderId === 'test-user' ||
        data.message?.includes('test') ||
        data.title?.includes('Test')
      ) {
        deletePromises.push(deleteDoc(doc(db, 'notifications', docSnapshot.id)));
      }
    });
    
    await Promise.all(deletePromises);
    console.log(`Cleared ${deletePromises.length} test notifications`);
    
    return { success: true, cleared: deletePromises.length };
  } catch (error) {
    console.error('Error clearing test notifications:', error);
    return { success: false, error: error.message };
  }
};

// Clear all notifications for a user (use with caution)
export const clearAllNotifications = async (userId) => {
  try {
    console.log('Clearing all notifications for user:', userId);
    
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('recipientId', '==', userId)
    );
    
    const snapshot = await getDocs(q);
    const deletePromises = [];
    
    snapshot.forEach((docSnapshot) => {
      deletePromises.push(deleteDoc(doc(db, 'notifications', docSnapshot.id)));
    });
    
    await Promise.all(deletePromises);
    console.log(`Cleared ${deletePromises.length} notifications`);
    
    return { success: true, cleared: deletePromises.length };
  } catch (error) {
    console.error('Error clearing notifications:', error);
    return { success: false, error: error.message };
  }
};