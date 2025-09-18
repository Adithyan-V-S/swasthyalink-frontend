import { db, auth } from '../firebaseConfig';
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  updateDoc, 
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { 
  createFamilyRequestNotification,
  createFamilyRequestAcceptedNotification,
  createFamilyRequestRejectedNotification 
} from './notificationService';
import { getFamilyNetwork as getFirebaseFamilyNetwork } from './firebaseFamilyService';

// Send a family request (QUOTA PROTECTION - DISABLED)
export const sendFamilyRequest = async ({ fromEmail, toEmail, toName, relationship }) => {
  // EMERGENCY: Disable Firebase operations to prevent quota usage
  console.warn('🚨 QUOTA EXCEEDED - Family request creation disabled to prevent Firebase writes');
  console.log('📝 Would have sent family request:', { fromEmail, toEmail, toName, relationship });
  
  // Return mock success
  return {
    success: true,
    message: 'Family request sent successfully (mock mode)',
    disabled: true
  };
};

// Accept a family request (QUOTA PROTECTION - DISABLED)
export const acceptFamilyRequest = async (requestId) => {
  // EMERGENCY: Disable Firebase operations to prevent quota usage
  console.warn('🚨 QUOTA EXCEEDED - Family request acceptance disabled to prevent Firebase writes');
  console.log('📝 Would have accepted family request:', requestId);
  
  // Return mock success
  return {
    success: true,
    message: 'Family request accepted successfully (mock mode)',
    disabled: true
  };
};

// Reject a family request (QUOTA PROTECTION - DISABLED)
export const rejectFamilyRequest = async (requestId) => {
  // EMERGENCY: Disable Firebase operations to prevent quota usage
  console.warn('🚨 QUOTA EXCEEDED - Family request rejection disabled to prevent Firebase writes');
  console.log('📝 Would have rejected family request:', requestId);
  
  // Return mock success
  return {
    success: true,
    message: 'Family request rejected successfully (mock mode)',
    disabled: true
  };
};

import { getFamilyRequests as getFirebaseFamilyRequests } from './firebaseFamilyService';

// Get family requests (delegates to Firestore service, adapts shape)
export const getFamilyRequests = async (userIdentifier) => {
  try {
    // userIdentifier can be UID (preferred). Enhanced UI will now pass UID.
    const requests = await getFirebaseFamilyRequests(userIdentifier);
    return {
      success: true,
      requests
    };
  } catch (error) {
    console.error('Error fetching family requests from Firestore:', error);
    return { success: false, error: error.message };
  }
};

// Get family network (delegates to real Firestore service, adapts shape)
export const getFamilyNetwork = async (userUid) => {
  try {
    const members = await getFirebaseFamilyNetwork(userUid); // returns array of members
    return {
      success: true,
      network: {
        userUid,
        members: members || []
      }
    };
  } catch (error) {
    console.error('Error fetching family network from Firestore:', error);
    return { success: false, error: error.message };
  }
};

// Remove family member (QUOTA PROTECTION - DISABLED)
export const removeFamilyMember = async (userUid, memberUid) => {
  // EMERGENCY: Disable Firebase operations to prevent quota usage
  console.warn('🚨 QUOTA EXCEEDED - Family member removal disabled to prevent Firebase writes');
  console.log('📝 Would have removed family member:', { userUid, memberUid });
  
  // Return mock success
  return {
    success: true,
    message: 'Family member removed successfully (mock mode)',
    disabled: true
  };
};

// Update member access level (QUOTA PROTECTION - DISABLED)
export const updateMemberAccessLevel = async (userUid, memberUid, accessLevel) => {
  // EMERGENCY: Disable Firebase operations to prevent quota usage
  console.warn('🚨 QUOTA EXCEEDED - Access level update disabled to prevent Firebase writes');
  console.log('📝 Would have updated access level:', { userUid, memberUid, accessLevel });
  
  // Return mock success
  return {
    success: true,
    message: 'Access level updated successfully (mock mode)',
    disabled: true
  };
};

// Backward-compatibility alias for UI components expecting this name
export const updateFamilyMemberAccess = updateMemberAccessLevel;

// New function to search users via backend API
export const searchUsers = async (query) => {
  try {
    const response = await fetch(`/api/users/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch search results');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in searchUsers:', error);
    return { success: false, results: [] };
  }
};

// New function to update family request relationship
export const updateFamilyRequestRelationship = async ({ requestId, newRelationship }) => {
  try {
    const response = await fetch(`/api/family/request/${requestId}/update-relationship`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ newRelationship })
    });
    if (!response.ok) {
      throw new Error('Failed to update family request relationship');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in updateFamilyRequestRelationship:', error);
    return { success: false, error: error.message };
  }
};
