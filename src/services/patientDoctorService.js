import { getAuth } from 'firebase/auth';
import { auth } from '../firebaseConfig';

const API_BASE = 'http://localhost:3001/api/patient-doctor';

/**
 * Search for patients by query
 * @param {string} query - Search query (email, phone, or name)
 * @returns {Promise<Object>} Search results
 */
export const searchPatients = async (query) => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.error('No authenticated user found');
      throw new Error('User not authenticated. Please sign in again.');
    }
    
    console.log('Getting ID token for user:', currentUser.uid);
    console.log('User object type:', typeof currentUser);
    console.log('User has getIdToken method:', typeof currentUser.getIdToken);
    
    if (typeof currentUser.getIdToken !== 'function') {
      console.error('currentUser is not a valid Firebase User object');
      throw new Error('Invalid user object. Please sign in again.');
    }
    
    const token = await currentUser.getIdToken();
    console.log('Token obtained successfully, length:', token.length);
    
    const response = await fetch(`${API_BASE}/search/patients?query=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Search API error:', errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Search results:', data);
    return data;
  } catch (error) {
    console.error('Error searching patients:', error);
    throw error;
  }
};

/**
 * Create a connection request from doctor to patient
 * @param {Object} requestData - Request data including patientId/email/phone and connectionMethod
 * @returns {Promise<Object>} Result of the request creation
 */
export const createConnectionRequest = async (requestData) => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.error('No authenticated user found');
      throw new Error('User not authenticated. Please sign in again.');
    }
    
    console.log('Getting ID token for user:', currentUser.uid);
    console.log('User object type:', typeof currentUser);
    console.log('User has getIdToken method:', typeof currentUser.getIdToken);
    
    if (typeof currentUser.getIdToken !== 'function') {
      console.error('currentUser is not a valid Firebase User object');
      throw new Error('Invalid user object. Please sign in again.');
    }
    
    const token = await currentUser.getIdToken();
    console.log('Token obtained successfully, length:', token.length);
    console.log('Sending connection request:', requestData);
    
    const response = await fetch(`${API_BASE}/connection-request`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Connection request API error:', errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Connection request result:', data);
    return data;
  } catch (error) {
    console.error('Error creating connection request:', error);
    throw error;
  }
};

/**
 * Resend OTP for a connection request
 * @param {string} requestId - The ID of the request to resend OTP for
 * @returns {Promise<Object>} Result of the resend operation
 */
export const resendRequest = async (requestId) => {
  try {
    const token = await auth.currentUser?.getIdToken();
    
    const response = await fetch(`${API_BASE}/resend/${requestId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error resending OTP:', error);
    throw error;
  }
};

/**
 * Get pending doctor connection requests for the current patient
 * @param {string} uid - Patient's UID (optional, uses current user)
 * @returns {Promise<Array>} Array of pending requests
 */
export const getPendingRequests = async (uid) => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const token = await user.getIdToken();
    
    const response = await fetch(`${API_BASE}/requests`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.requests || [];
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    throw error;
  }
};

/**
 * Accept a doctor connection request with OTP verification
 * @param {string} requestId - The ID of the request to accept
 * @param {string} otp - The OTP code entered by the patient
 * @returns {Promise<Object>} Result of the acceptance
 */
export const acceptRequest = async (requestId, otp) => {
  try {
    const token = await auth.currentUser?.getIdToken();
    
    const response = await fetch(`${API_BASE}/accept/${requestId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ otp }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error accepting request:', error);
    throw error;
  }
};

/**
 * Get connected doctors for the current patient
 * @param {string} uid - Patient's UID (optional, uses current user)
 * @returns {Promise<Array>} Array of connected doctors
 */
export const getConnectedDoctors = async (uid) => {
  try {
    const token = await auth.currentUser?.getIdToken();
    
    const response = await fetch(`${API_BASE}/patient/doctors`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching connected doctors:', error);
    throw error;
  }
};
