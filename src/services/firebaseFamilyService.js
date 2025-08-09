import { db } from '../firebaseConfig';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  deleteDoc
} from 'firebase/firestore';

// Collection references
const usersCollection = collection(db, 'users');
const familyRequestsCollection = collection(db, 'familyRequests');
const familyNetworksCollection = collection(db, 'familyNetworks');

/**
 * Search for users in Firestore
 * @param {string} searchTerm - Email or name to search for
 * @param {string} currentUserUid - Current user's UID to exclude from results
 * @returns {Promise<Array>} - Array of matching users
 */
export const searchFirestoreUsers = async (searchTerm, currentUserUid) => {
  try {
    const results = [];
    
    // Search by email (case insensitive)
    const emailQuery = query(
      usersCollection,
      where('email', '>=', searchTerm.toLowerCase()),
      where('email', '<=', searchTerm.toLowerCase() + '\uf8ff')
    );
    
    const emailSnapshot = await getDocs(emailQuery);
    emailSnapshot.forEach(doc => {
      if (doc.id !== currentUserUid) {
        results.push({
          id: doc.id,
          ...doc.data()
        });
      }
    });
    
    // If no results by email, search by displayName
    if (results.length === 0) {
      const nameQuery = query(
        usersCollection,
        where('displayName', '>=', searchTerm),
        where('displayName', '<=', searchTerm + '\uf8ff')
      );
      
      const nameSnapshot = await getDocs(nameQuery);
      nameSnapshot.forEach(doc => {
        if (doc.id !== currentUserUid) {
          results.push({
            id: doc.id,
            ...doc.data()
          });
        }
      });
    }
    
    return results;
  } catch (error) {
    console.error('Error searching Firestore users:', error);
    throw error;
  }
};

/**
 * Send a family request to another user
 * @param {string} fromUid - Sender's UID
 * @param {string} fromEmail - Sender's email
 * @param {string} fromName - Sender's name
 * @param {string} toUid - Recipient's UID (if available)
 * @param {string} toEmail - Recipient's email
 * @param {string} toName - Recipient's name
 * @param {string} relationship - Relationship between users
 * @returns {Promise<Object>} - Created request
 */
export const sendFamilyRequest = async (fromUid, fromEmail, fromName, toUid, toEmail, toName, relationship) => {
  try {
    // Check if request already exists
    const existingQuery = query(
      familyRequestsCollection,
      where('fromUid', '==', fromUid),
      where('toEmail', '==', toEmail),
      where('status', '==', 'pending')
    );
    
    const existingSnapshot = await getDocs(existingQuery);
    if (!existingSnapshot.empty) {
      throw new Error('A pending request already exists for this user');
    }
    
    // Check if already in family network
    const networkQuery = query(
      familyNetworksCollection,
      where('userUid', '==', fromUid),
      where('members', 'array-contains', { email: toEmail })
    );
    
    const networkSnapshot = await getDocs(networkQuery);
    if (!networkSnapshot.empty) {
      throw new Error('This user is already in your family network');
    }
    
    // Create the request
    const requestData = {
      fromUid,
      fromEmail,
      fromName,
      toUid: toUid || null,
      toEmail,
      toName,
      relationship,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const requestRef = await addDoc(familyRequestsCollection, requestData);
    
    // Add notification for recipient
    if (toUid) {
      const userRef = doc(usersCollection, toUid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        await updateDoc(userRef, {
          notifications: arrayUnion({
            id: requestRef.id,
            type: 'family_request',
            fromName,
            fromEmail,
            relationship,
            status: 'unread',
            createdAt: new Date().toISOString()
          })
        });
      }
    }
    
    return {
      id: requestRef.id,
      ...requestData,
      createdAt: new Date().toISOString() // Convert server timestamp to string for frontend
    };
  } catch (error) {
    console.error('Error sending family request:', error);
    throw error;
  }
};

/**
 * Accept a family request
 * @param {string} requestId - Request document ID
 * @param {string} currentUserUid - Current user's UID
 * @returns {Promise<Object>} - Updated request
 */
export const acceptFamilyRequest = async (requestId, currentUserUid) => {
  try {
    const requestRef = doc(familyRequestsCollection, requestId);
    const requestDoc = await getDoc(requestRef);
    
    if (!requestDoc.exists()) {
      throw new Error('Request not found');
    }
    
    const requestData = requestDoc.data();
    
    // Verify this request is for the current user
    if (requestData.toUid && requestData.toUid !== currentUserUid) {
      throw new Error('You are not authorized to accept this request');
    }
    
    if (requestData.status !== 'pending') {
      throw new Error('This request has already been processed');
    }
    
    // Update request status
    await updateDoc(requestRef, {
      status: 'accepted',
      updatedAt: serverTimestamp()
    });
    
    // Add to sender's family network
    await addToFamilyNetwork(
      requestData.fromUid,
      requestData.toUid || currentUserUid,
      requestData.toEmail,
      requestData.toName,
      requestData.relationship
    );
    
    // Add to recipient's family network
    await addToFamilyNetwork(
      requestData.toUid || currentUserUid,
      requestData.fromUid,
      requestData.fromEmail,
      requestData.fromName,
      getInverseRelationship(requestData.relationship)
    );
    
    // Add notification for sender
    const senderRef = doc(usersCollection, requestData.fromUid);
    await updateDoc(senderRef, {
      notifications: arrayUnion({
        id: requestId,
        type: 'family_request_accepted',
        fromName: requestData.toName,
        fromEmail: requestData.toEmail,
        relationship: requestData.relationship,
        status: 'unread',
        createdAt: new Date().toISOString()
      })
    });
    
    return {
      id: requestId,
      ...requestData,
      status: 'accepted',
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error accepting family request:', error);
    throw error;
  }
};

/**
 * Reject a family request
 * @param {string} requestId - Request document ID
 * @param {string} currentUserUid - Current user's UID
 * @returns {Promise<Object>} - Updated request
 */
export const rejectFamilyRequest = async (requestId, currentUserUid) => {
  try {
    const requestRef = doc(familyRequestsCollection, requestId);
    const requestDoc = await getDoc(requestRef);
    
    if (!requestDoc.exists()) {
      throw new Error('Request not found');
    }
    
    const requestData = requestDoc.data();
    
    // Verify this request is for the current user
    if (requestData.toUid && requestData.toUid !== currentUserUid) {
      throw new Error('You are not authorized to reject this request');
    }
    
    if (requestData.status !== 'pending') {
      throw new Error('This request has already been processed');
    }
    
    // Update request status
    await updateDoc(requestRef, {
      status: 'rejected',
      updatedAt: serverTimestamp()
    });
    
    // Add notification for sender
    const senderRef = doc(usersCollection, requestData.fromUid);
    await updateDoc(senderRef, {
      notifications: arrayUnion({
        id: requestId,
        type: 'family_request_rejected',
        fromName: requestData.toName,
        fromEmail: requestData.toEmail,
        relationship: requestData.relationship,
        status: 'unread',
        createdAt: new Date().toISOString()
      })
    });
    
    return {
      id: requestId,
      ...requestData,
      status: 'rejected',
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error rejecting family request:', error);
    throw error;
  }
};

/**
 * Get all family requests for a user
 * @param {string} userUid - User's UID
 * @returns {Promise<Object>} - Sent and received requests
 */
export const getFamilyRequests = async (userUid) => {
  try {
    // Get sent requests
    const sentQuery = query(
      familyRequestsCollection,
      where('fromUid', '==', userUid)
    );
    
    const sentSnapshot = await getDocs(sentQuery);
    const sentRequests = [];
    
    sentSnapshot.forEach(doc => {
      sentRequests.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Get received requests
    const receivedQuery = query(
      familyRequestsCollection,
      where('toUid', '==', userUid),
      where('status', '==', 'pending')
    );
    
    const receivedSnapshot = await getDocs(receivedQuery);
    const receivedRequests = [];
    
    receivedSnapshot.forEach(doc => {
      receivedRequests.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return {
      sent: sentRequests,
      received: receivedRequests
    };
  } catch (error) {
    console.error('Error getting family requests:', error);
    throw error;
  }
};

/**
 * Get family network for a user
 * @param {string} userUid - User's UID
 * @returns {Promise<Array>} - Family members
 */
export const getFamilyNetwork = async (userUid) => {
  try {
    const networkQuery = query(
      familyNetworksCollection,
      where('userUid', '==', userUid)
    );
    
    const networkSnapshot = await getDocs(networkQuery);
    
    if (networkSnapshot.empty) {
      return [];
    }
    
    // Should only be one document per user
    const networkDoc = networkSnapshot.docs[0];
    const networkData = networkDoc.data();
    
    return networkData.members || [];
  } catch (error) {
    console.error('Error getting family network:', error);
    throw error;
  }
};

/**
 * Remove a member from family network
 * @param {string} userUid - Current user's UID
 * @param {string} memberEmail - Email of member to remove
 * @returns {Promise<boolean>} - Success status
 */
export const removeFamilyMember = async (userUid, memberEmail) => {
  try {
    // Get user's network document
    const networkQuery = query(
      familyNetworksCollection,
      where('userUid', '==', userUid)
    );
    
    const networkSnapshot = await getDocs(networkQuery);
    
    if (networkSnapshot.empty) {
      throw new Error('Family network not found');
    }
    
    const networkDoc = networkSnapshot.docs[0];
    const networkData = networkDoc.data();
    
    // Find the member to remove
    const memberToRemove = networkData.members.find(member => member.email === memberEmail);
    
    if (!memberToRemove) {
      throw new Error('Member not found in family network');
    }
    
    // Remove member from user's network
    await updateDoc(doc(familyNetworksCollection, networkDoc.id), {
      members: arrayRemove(memberToRemove),
      updatedAt: serverTimestamp()
    });
    
    // Find the other user's network and remove current user
    const otherNetworkQuery = query(
      familyNetworksCollection,
      where('members', 'array-contains', { email: userUid })
    );
    
    const otherNetworkSnapshot = await getDocs(otherNetworkQuery);
    
    if (!otherNetworkSnapshot.empty) {
      const otherNetworkDoc = otherNetworkSnapshot.docs[0];
      const otherNetworkData = otherNetworkDoc.data();
      
      const currentUserInOtherNetwork = otherNetworkData.members.find(
        member => member.email === userUid
      );
      
      if (currentUserInOtherNetwork) {
        await updateDoc(doc(familyNetworksCollection, otherNetworkDoc.id), {
          members: arrayRemove(currentUserInOtherNetwork),
          updatedAt: serverTimestamp()
        });
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error removing family member:', error);
    throw error;
  }
};

/**
 * Helper function to add a member to a user's family network
 * @param {string} userUid - User's UID
 * @param {string} memberUid - Member's UID
 * @param {string} memberEmail - Member's email
 * @param {string} memberName - Member's name
 * @param {string} relationship - Relationship to member
 * @returns {Promise<void>}
 */
const addToFamilyNetwork = async (userUid, memberUid, memberEmail, memberName, relationship) => {
  try {
    // Check if user already has a network document
    const networkQuery = query(
      familyNetworksCollection,
      where('userUid', '==', userUid)
    );
    
    const networkSnapshot = await getDocs(networkQuery);
    
    const memberData = {
      uid: memberUid,
      email: memberEmail,
      name: memberName,
      relationship: relationship,
      accessLevel: 'limited', // Default access level
      isEmergencyContact: false,
      addedAt: new Date().toISOString()
    };
    
    if (networkSnapshot.empty) {
      // Create new network document
      await addDoc(familyNetworksCollection, {
        userUid: userUid,
        members: [memberData],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } else {
      // Update existing network document
      const networkDoc = networkSnapshot.docs[0];
      await updateDoc(doc(familyNetworksCollection, networkDoc.id), {
        members: arrayUnion(memberData),
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error adding to family network:', error);
    throw error;
  }
};

/**
 * Update family member access level
 * @param {string} userUid - Current user's UID
 * @param {string} memberEmail - Email of member to update
 * @param {string} accessLevel - New access level (full, limited, emergency)
 * @param {boolean} isEmergencyContact - Whether member is emergency contact
 * @returns {Promise<boolean>} - Success status
 */
export const updateFamilyMemberAccess = async (userUid, memberEmail, accessLevel, isEmergencyContact) => {
  try {
    // Get user's network document
    const networkQuery = query(
      familyNetworksCollection,
      where('userUid', '==', userUid)
    );
    
    const networkSnapshot = await getDocs(networkQuery);
    
    if (networkSnapshot.empty) {
      throw new Error('Family network not found');
    }
    
    const networkDoc = networkSnapshot.docs[0];
    const networkData = networkDoc.data();
    
    // Find the member to update
    const memberIndex = networkData.members.findIndex(member => member.email === memberEmail);
    
    if (memberIndex === -1) {
      throw new Error('Member not found in family network');
    }
    
    // Create updated members array
    const updatedMembers = [...networkData.members];
    updatedMembers[memberIndex] = {
      ...updatedMembers[memberIndex],
      accessLevel,
      isEmergencyContact,
      updatedAt: new Date().toISOString()
    };
    
    // Update the document
    await updateDoc(doc(familyNetworksCollection, networkDoc.id), {
      members: updatedMembers,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating family member access:', error);
    throw error;
  }
};

/**
 * Helper function to get the inverse relationship
 * @param {string} relationship - Original relationship
 * @returns {string} - Inverse relationship
 */
const getInverseRelationship = (relationship) => {
  const inverseMap = {
    'Spouse': 'Spouse',
    'Parent': 'Child',
    'Child': 'Parent',
    'Sibling': 'Sibling',
    'Grandparent': 'Grandchild',
    'Grandchild': 'Grandparent',
    'Uncle': 'Niece/Nephew',
    'Aunt': 'Niece/Nephew',
    'Niece/Nephew': 'Uncle/Aunt',
    'Cousin': 'Cousin',
    'Friend': 'Friend',
    'Caregiver': 'Patient'
  };
  
  return inverseMap[relationship] || 'Family Member';
};