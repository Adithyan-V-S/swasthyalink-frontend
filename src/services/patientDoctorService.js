import { getAuth } from 'firebase/auth';
import { auth } from '../firebaseConfig';

const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api/patient-doctor`
  : 'https://swasthyalink-backend-v2.onrender.com/api/patient-doctor';

/**
 * Search for patients by query
 * @param {string} query - Search query (email, phone, or name)
 * @returns {Promise<Object>} Search results
 */
export const searchPatients = async (query) => {
  try {
    // Check if this is a test user
    const isTestUser = localStorage.getItem('testUser') !== null;
    
    if (isTestUser) {
      console.log('🧪 Using test user - returning mock search results');
      // Return mock data for test users
      return {
        success: true,
        patients: [
          {
            id: 'test-patient-1',
            name: 'Test Patient 1',
            email: 'patient1@example.com',
            phone: '+1234567890'
          },
          {
            id: 'test-patient-2', 
            name: 'Test Patient 2',
            email: 'patient2@example.com',
            phone: '+1234567891'
          }
        ]
      };
    }
    
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
    // Check if this is a test user
    const isTestUser = localStorage.getItem('testUser') !== null;
    
    if (isTestUser) {
      console.log('🧪 Using test user - simulating connection request');
      // Simulate successful connection request for test users
      return {
        success: true,
        message: 'Connection request sent successfully (test mode)',
        requestId: 'test-request-' + Date.now()
      };
    }
    
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
      let errorData = {};
      try { errorData = await response.json(); } catch (_) {}
      // Treat 409 (Conflict) as a soft failure so the UI can surface a friendly message
      if (response.status === 409) {
        console.warn('Connection already exists (409):', errorData);
        return { success: false, alreadyExists: true, error: errorData.error || 'Connection already exists' };
      }
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
    // Check if this is a test user
    const isTestUser = localStorage.getItem('testUser') !== null;
    
    if (isTestUser) {
      console.log('🧪 Using test user - simulating resend request');
      return {
        success: true,
        message: 'OTP resent successfully (test mode)'
      };
    }
    
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
    // Check if this is a test user
    const isTestUser = localStorage.getItem('testUser') !== null;
    
    if (isTestUser) {
      console.log('🧪 Using test user - returning mock pending requests');
      // Return mock data for test users
      return [
        {
          id: 'test-request-1',
          doctor: {
            name: 'Dr. Test Doctor',
            specialization: 'Cardiology',
            email: 'doctor@example.com'
          },
          connectionMethod: 'email',
          message: 'Dr. Test Doctor wants to connect with you',
          createdAt: new Date().toISOString(),
          status: 'pending'
        }
      ];
    }
    
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
    // Check if this is a test user
    const isTestUser = localStorage.getItem('testUser') !== null;
    
    if (isTestUser) {
      console.log('🧪 Using test user - simulating accept request');
      return {
        success: true,
        message: 'Connection request accepted successfully (test mode)'
      };
    }
    
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
    // Check if this is a test user
    const isTestUser = localStorage.getItem('testUser') !== null;
    
    if (isTestUser) {
      console.log('🧪 Using test user - returning mock connected doctors');
      // Return mock data for test users
      return [
        {
          id: 'test-doctor-1',
          name: 'Dr. Test Doctor',
          specialization: 'Cardiology',
          email: 'doctor@example.com',
          phone: '+1234567890',
          connectionDate: new Date().toISOString(),
          lastInteraction: new Date().toISOString()
        }
      ];
    }
    
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
    console.log('🔍 Raw connected doctors API response:', data);
    
    // Extract doctor data from nested structure
    const doctors = (data.doctors || []).map(relationship => ({
      id: relationship.id,
      name: relationship.doctor?.name || 'Unknown Doctor',
      specialization: relationship.doctor?.specialization || 'General',
      email: relationship.doctor?.email || 'No email',
      phone: relationship.doctor?.phone || 'No phone',
      permissions: relationship.permissions || {},
      connectedAt: relationship.createdAt,
      status: relationship.status
    }));
    
    console.log('🔍 Processed connected doctors:', doctors);
    return doctors;
  } catch (error) {
    console.error('Error fetching connected doctors:', error);
    throw error;
  }
};

/**
 * Get connected patients for the current doctor
 * @param {string} uid - Doctor's UID (optional, uses current user)
 * @returns {Promise<Array>} Array of connected patients
 */
export const getConnectedPatients = async (uid) => {
  try {
    // Check if this is a test user
    const isTestUser = localStorage.getItem('testUser') !== null;
    
    if (isTestUser) {
      console.log('🧪 Using test user - returning mock connected patients');
      // Return mock data for test users
      return [
        {
          id: 'test-patient-1',
          name: 'John Smith',
          email: 'john.smith@example.com',
          phone: '+1234567890',
          connectionDate: new Date().toISOString(),
          lastInteraction: new Date().toISOString()
        },
        {
          id: 'test-patient-2',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@example.com',
          phone: '+1234567891',
          connectionDate: new Date().toISOString(),
          lastInteraction: new Date().toISOString()
        }
      ];
    }
    
    const token = await auth.currentUser?.getIdToken();
    
    const response = await fetch(`${API_BASE}/doctor/patients`, {
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
    return data.patients || [];
  } catch (error) {
    console.error('Error fetching connected patients:', error);
    throw error;
  }
};
