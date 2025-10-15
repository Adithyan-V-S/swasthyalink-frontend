/**
 * Firebase Utilities for SwasthyaLink
 * Centralized Firestore operations with Firebase v9 modular syntax
 */

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
  getDocs,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

// Collection names
export const COLLECTIONS = {
  PRESCRIPTIONS: 'prescriptions',
  PATIENT_DOCTOR_RELATIONSHIPS: 'patient_doctor_relationships',
  USERS: 'users',
  NOTIFICATIONS: 'notifications'
};

/**
 * Save a prescription to Firestore
 * @param {Object} prescriptionData - Prescription data to save
 * @returns {Promise<Object>} Result object with success status and document ID
 */
export const savePrescription = async (prescriptionData) => {
  try {
    const prescriptionRef = await addDoc(collection(db, COLLECTIONS.PRESCRIPTIONS), {
      ...prescriptionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return {
      success: true,
      id: prescriptionRef.id,
      message: 'Prescription saved successfully!'
    };
  } catch (error) {
    console.error('Error saving prescription:', error);
    return {
      success: false,
      error: error.message || 'Failed to save prescription'
    };
  }
};

/**
 * Get prescriptions for a specific patient
 * @param {string} patientId - Patient's UID
 * @returns {Promise<Array>} Array of prescriptions
 */
export const getPatientPrescriptions = async (patientId) => {
  try {
    const prescriptionsQuery = query(
      collection(db, COLLECTIONS.PRESCRIPTIONS),
      where('patientId', '==', patientId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(prescriptionsQuery);
    const prescriptions = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      prescriptions.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      });
    });

    return prescriptions;
  } catch (error) {
    console.error('Error fetching patient prescriptions:', error);
    throw error;
  }
};

/**
 * Get prescriptions for a specific doctor
 * @param {string} doctorId - Doctor's UID
 * @returns {Promise<Array>} Array of prescriptions
 */
export const getDoctorPrescriptions = async (doctorId) => {
  try {
    const prescriptionsQuery = query(
      collection(db, COLLECTIONS.PRESCRIPTIONS),
      where('doctorId', '==', doctorId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(prescriptionsQuery);
    const prescriptions = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      prescriptions.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      });
    });

    return prescriptions;
  } catch (error) {
    console.error('Error fetching doctor prescriptions:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time prescription updates for a patient
 * @param {string} patientId - Patient's UID
 * @param {Function} callback - Callback function to handle updates
 * @returns {Function} Unsubscribe function
 */
export const subscribeToPatientPrescriptions = (patientId, callback) => {
  if (!patientId) return () => {};

  // Simplified query without orderBy to avoid index requirement
  const prescriptionsQuery = query(
    collection(db, COLLECTIONS.PRESCRIPTIONS),
    where('patientId', '==', patientId)
  );

  const unsubscribe = onSnapshot(prescriptionsQuery, (querySnapshot) => {
    const prescriptions = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      prescriptions.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      });
    });
    
    // Sort client-side to avoid Firestore index requirement
    prescriptions.sort((a, b) => {
      const dateA = a.createdAt || new Date(0);
      const dateB = b.createdAt || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
    
    callback(prescriptions);
  }, (error) => {
    console.error('Error in prescription subscription:', error);
    callback([]);
  });

  return unsubscribe;
};

/**
 * Subscribe to real-time prescription updates for a doctor
 * @param {string} doctorId - Doctor's UID
 * @param {Function} callback - Callback function to handle updates
 * @returns {Function} Unsubscribe function
 */
export const subscribeToDoctorPrescriptions = (doctorId, callback) => {
  if (!doctorId) return () => {};

  // Simplified query without orderBy to avoid index requirement
  const prescriptionsQuery = query(
    collection(db, COLLECTIONS.PRESCRIPTIONS),
    where('doctorId', '==', doctorId)
  );

  const unsubscribe = onSnapshot(prescriptionsQuery, (querySnapshot) => {
    const prescriptions = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      prescriptions.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      });
    });
    
    // Sort client-side to avoid Firestore index requirement
    prescriptions.sort((a, b) => {
      const dateA = a.createdAt || new Date(0);
      const dateB = b.createdAt || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
    
    callback(prescriptions);
  }, (error) => {
    console.error('Error in prescription subscription:', error);
    callback([]);
  });

  return unsubscribe;
};

/**
 * Get user data by UID
 * @param {string} uid - User's UID
 * @returns {Promise<Object|null>} User data or null if not found
 */
export const getUserData = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return 'Unknown';
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.warn('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Check if user is a test user
 * @returns {boolean} True if test user, false otherwise
 */
export const isTestUser = () => {
  return localStorage.getItem('testUser') !== null;
};


