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

// Send a family request
export const sendFamilyRequest = async ({ fromEmail, toEmail, toName, relationship }) => {
  try {
    console.log("Sending family request:", { fromEmail, toEmail, toName, relationship });
    
    // Get current user
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('You must be logged in to send a family request');
    }
    
    // Find the recipient user by email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', toEmail));
    const querySnapshot = await getDocs(q);
    
    let toUid = null;
    querySnapshot.forEach((doc) => {
      toUid = doc.id;
    });
    
    if (!toUid) {
      throw new Error('Recipient user not found');
    }
    
    // Check if a request already exists
    const requestsRef = collection(db, 'familyRequests');
    const existingRequestQuery = query(
      requestsRef, 
      where('fromUid', '==', currentUser.uid),
      where('toUid', '==', toUid)
    );
    
    const existingRequestSnapshot = await getDocs(existingRequestQuery);
    if (!existingRequestSnapshot.empty) {
      throw new Error('A request to this user already exists');
    }
    
    // Create the request
    const requestData = {
      fromUid: currentUser.uid,
      fromEmail: currentUser.email,
      fromName: currentUser.displayName || fromEmail.split('@')[0],
      toUid: toUid,
      toEmail: toEmail,
      toName: toName,
      relationship: relationship,
      status: 'pending',
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'familyRequests'), requestData);
    
    return {
      success: true,
      request: {
        id: docRef.id,
        ...requestData
      }
    };
  } catch (error) {
    console.error('Error sending family request:', error);
    throw error;
  }
};

// Accept a family request
export const acceptFamilyRequest = async (requestId) => {
  try {
    console.log("Accepting family request with ID:", requestId);
    
    // Get the request
    const requestRef = doc(db, 'familyRequests', requestId);
    const requestSnap = await getDoc(requestRef);
    
    if (!requestSnap.exists()) {
      console.error("Request not found with ID:", requestId);
      throw new Error('Request not found');
    }
    
    const requestData = requestSnap.data();
    console.log("Request data:", requestData);
    
    // Check if the request is already accepted
    if (requestData.status === 'accepted') {
      console.log("Request is already accepted, skipping update");
      return {
        success: true,
        message: 'Family request already accepted'
      };
    }
    
    // Update the request status
    await updateDoc(requestRef, {
      status: 'accepted',
      updatedAt: serverTimestamp()
    });
    console.log("Request status updated to 'accepted'");
    
    // Verify the update was successful
    const updatedRequestSnap = await getDoc(requestRef);
    const updatedRequestData = updatedRequestSnap.data();
    console.log("Updated request data:", updatedRequestData);
    
    // Create or update family networks for both users
    console.log("Updating family network for sender:", requestData.fromUid);
    try {
      await updateFamilyNetwork(requestData.fromUid, requestData.toUid, requestData.relationship, requestData);
      console.log("Successfully updated sender's family network");
    } catch (error) {
      console.error("Error updating sender's family network:", error);
      // Continue with recipient's network update even if sender's update fails
    }
    
    console.log("Updating family network for recipient:", requestData.toUid);
    try {
      await updateFamilyNetwork(requestData.toUid, requestData.fromUid, requestData.relationship, requestData);
      console.log("Successfully updated recipient's family network");
    } catch (error) {
      console.error("Error updating recipient's family network:", error);
    }
    
    console.log("Family networks updated successfully");
    
    return {
      success: true,
      message: 'Family request accepted successfully'
    };
  } catch (error) {
    console.error('Error accepting family request:', error);
    throw error;
  }
};

// Helper function to update family network
const updateFamilyNetwork = async (userUid, familyMemberUid, relationship, requestData) => {
  console.log(`Updating family network: User ${userUid} adding member ${familyMemberUid} as ${relationship}`);
  
  try {
    // Get user data
    const userDoc = await getDoc(doc(db, 'users', userUid));
    const familyMemberDoc = await getDoc(doc(db, 'users', familyMemberUid));
    
    if (!userDoc.exists()) {
      console.error(`User ${userUid} not found`);
      throw new Error(`User ${userUid} not found`);
    }
    
    if (!familyMemberDoc.exists()) {
      console.error(`Family member ${familyMemberUid} not found`);
      throw new Error(`Family member ${familyMemberUid} not found`);
    }
    
    const userData = userDoc.data();
    const familyMemberData = familyMemberDoc.data();
    
    console.log("User data:", userData);
    console.log("Family member data:", familyMemberData);
    
    // Check if network exists
    const networksRef = collection(db, 'familyNetworks');
    const q = query(networksRef, where('userUid', '==', userUid));
    const querySnapshot = await getDocs(q);
    
    let networkRef;
    let networkData = {
      userUid: userUid,
      userEmail: userData.email,
      userName: userData.displayName || userData.name,
      members: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // If network exists, update it
    if (!querySnapshot.empty) {
      console.log(`Family network found for user ${userUid}`);
      networkRef = querySnapshot.docs[0].ref;
      networkData = querySnapshot.docs[0].data();
    } else {
      console.log(`Creating new family network for user ${userUid}`);
      // Create new network with initial data
      const newNetworkData = {
        userUid: userUid,
        userEmail: userData.email,
        userName: userData.displayName || userData.name,
        members: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Add the document to Firestore
      const newNetworkRef = await addDoc(networksRef, newNetworkData);
      console.log(`Created new family network with ID: ${newNetworkRef.id}`);
      
      // Set the reference and data
      networkRef = newNetworkRef;
      networkData = newNetworkData;
    }
    
    // Ensure members array exists
    if (!networkData.members) {
      networkData.members = [];
    }
    
    // Check if member already exists in network
    const memberExists = networkData.members && networkData.members.some(member => 
      member.uid === familyMemberUid || member.email === familyMemberData.email
    );
    
    console.log(`Member exists in network: ${memberExists}`);
    
    // Always add the member to ensure it's in the network
    // Determine the correct name to use
    const memberName = familyMemberData.displayName || familyMemberData.name || 
                       (userUid === requestData.fromUid ? requestData.fromName : requestData.toName);
    
    // Add new member
    const newMember = {
      uid: familyMemberUid,
      name: memberName,
      email: familyMemberData.email,
      relationship: relationship,
      accessLevel: 'limited',
      isEmergencyContact: false,
      addedAt: new Date().toISOString()
    };
    
    console.log("Adding/updating member in network:", newMember);
    
    // If the member already exists, update it; otherwise, add it
    let updatedMembers;
    if (memberExists) {
      // Update the existing member
      updatedMembers = networkData.members.map(member => 
        (member.uid === familyMemberUid || member.email === familyMemberData.email)
          ? { ...member, ...newMember }
          : member
      );
      console.log("Updated existing member in network");
    } else {
      // Add the new member
      updatedMembers = [...(networkData.members || []), newMember];
      console.log("Added new member to network");
    }
    
    // Update network
    await updateDoc(networkRef, {
      members: updatedMembers,
      updatedAt: serverTimestamp()
    });
    
    console.log(`Family network updated for user ${userUid}`);
    
    // Verify the update was successful
    const updatedNetworkSnap = await getDoc(networkRef);
    const updatedNetworkData = updatedNetworkSnap.data();
    console.log("Updated network data:", updatedNetworkData);
  } catch (error) {
    console.error("Error in updateFamilyNetwork:", error);
    throw error;
  }
};

// Reject a family request
export const rejectFamilyRequest = async (requestId) => {
  try {
    // Get the request
    const requestRef = doc(db, 'familyRequests', requestId);
    const requestSnap = await getDoc(requestRef);
    
    if (!requestSnap.exists()) {
      throw new Error('Request not found');
    }
    
    // Update the request status
    await updateDoc(requestRef, {
      status: 'rejected',
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      message: 'Family request rejected successfully'
    };
  } catch (error) {
    console.error('Error rejecting family request:', error);
    throw error;
  }
};

// Get family network for a user
export const getFamilyNetwork = async (email) => {
  try {
    console.log("Getting family network for email:", email);
    
    // Get current user
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('You must be logged in to view family network');
    }
    
    const userUid = currentUser.uid;
    console.log("Current user UID:", userUid);
    
    // Get family network
    const networksRef = collection(db, 'familyNetworks');
    const networkQuery = query(networksRef, where('userUid', '==', userUid));
    const networkSnapshot = await getDocs(networkQuery);
    
    console.log("Family networks found:", networkSnapshot.size);
    
    if (networkSnapshot.empty) {
      console.log("No family network found for user:", userUid);
      return {
        success: true,
        network: {
          members: []
        }
      };
    }
    
    // Get the network data
    const networkData = networkSnapshot.docs[0].data();
    console.log("Family network data:", networkData);
    
    // Make sure members is an array
    if (!networkData.members) {
      console.log("No members found in network, initializing empty array");
      networkData.members = [];
    } else {
      console.log(`Found ${networkData.members.length} members in network`);
    }
    
    return {
      success: true,
      network: networkData
    };
  } catch (error) {
    console.error('Error fetching family network:', error);
    throw error;
  }
};

// Search for users
export const searchUsers = async (query, searchType = 'all') => {
  try {
    console.log("Searching for users with query:", query);
    
    const usersRef = collection(db, 'users');
    let q;
    
    // Search by email (exact match)
    if (searchType === 'email' || searchType === 'all') {
      q = query(usersRef, where('email', '==', query.toLowerCase()));
      const emailSnapshot = await getDocs(q);
      
      if (!emailSnapshot.empty) {
        const results = [];
        emailSnapshot.forEach((doc) => {
          results.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        return {
          success: true,
          results: results
        };
      }
    }
    
    // Search by name (contains)
    if (searchType === 'name' || searchType === 'all') {
      // Firebase doesn't support contains queries directly
      // We'll use a range query as a workaround
      q = query(
        usersRef,
        where('name', '>=', query),
        where('name', '<=', query + '\uf8ff')
      );
      
      const nameSnapshot = await getDocs(q);
      
      if (!nameSnapshot.empty) {
        const results = [];
        nameSnapshot.forEach((doc) => {
          results.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        return {
          success: true,
          results: results
        };
      }
      
      // Try displayName if name didn't work
      q = query(
        usersRef,
        where('displayName', '>=', query),
        where('displayName', '<=', query + '\uf8ff')
      );
      
      const displayNameSnapshot = await getDocs(q);
      
      if (!displayNameSnapshot.empty) {
        const results = [];
        displayNameSnapshot.forEach((doc) => {
          results.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        return {
          success: true,
          results: results
        };
      }
    }
    
    // No results found
    return {
      success: true,
      results: []
    };
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

// Get family requests for a user
export const getFamilyRequests = async (email) => {
  try {
    console.log("Getting family requests for email:", email);
    
    // Get current user
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('You must be logged in to view family requests');
    }
    
    console.log("Current user UID:", currentUser.uid);
    
    const requestsRef = collection(db, 'familyRequests');
    
    // Get requests sent to the user
    const receivedQuery = query(
      requestsRef,
      where('toUid', '==', currentUser.uid)
    );
    
    // Get requests sent by the user
    const sentQuery = query(
      requestsRef,
      where('fromUid', '==', currentUser.uid)
    );
    
    const [receivedSnapshot, sentSnapshot] = await Promise.all([
      getDocs(receivedQuery),
      getDocs(sentQuery)
    ]);
    
    console.log("Received requests count:", receivedSnapshot.size);
    console.log("Sent requests count:", sentSnapshot.size);
    
    const received = [];
    const sent = [];
    
    receivedSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log("Received request:", doc.id, data);
      
      // Make sure we're using the actual status from Firestore
      const status = data.status || 'pending';
      console.log(`Request ${doc.id} status: ${status}`);
      
      // Only add pending requests to the received list
      if (status === 'pending') {
        received.push({
          id: doc.id,
          ...data,
          type: 'received',
          status: status
        });
      } else {
        console.log(`Skipping non-pending received request: ${doc.id} (${status})`);
      }
    });
    
    sentSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log("Sent request:", doc.id, data);
      
      // Make sure we're using the actual status from Firestore
      const status = data.status || 'pending';
      console.log(`Request ${doc.id} status: ${status}`);
      
      sent.push({
        id: doc.id,
        ...data,
        type: 'sent',
        status: status
      });
    });
    
    console.log("Processed received requests:", received.length);
    console.log("Processed sent requests:", sent.length);
    
    return {
      success: true,
      requests: {
        received,
        sent
      }
    };
  } catch (error) {
    console.error('Error fetching family requests:', error);
    throw error;
  }
};

// Get mutual family network
export const getMutualFamilyNetwork = async (email1, email2) => {
  try {
    // Get both users' networks
    const network1 = await getFamilyNetwork(email1);
    const network2 = await getFamilyNetwork(email2);
    
    if (!network1.success || !network2.success) {
      throw new Error('Failed to fetch networks');
    }
    
    // Find mutual connections
    const members1 = network1.network.members || [];
    const members2 = network2.network.members || [];
    
    const mutualMembers = members1.filter(member1 => 
      members2.some(member2 => member2.email === member1.email)
    );
    
    return {
      success: true,
      mutualNetwork: {
        members: mutualMembers
      }
    };
  } catch (error) {
    console.error('Error fetching mutual family network:', error);
    throw error;
  }
};
