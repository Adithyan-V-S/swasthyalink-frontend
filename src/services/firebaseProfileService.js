import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

// Firestore collection for user profiles
const PROFILE_COLLECTION = "userProfiles";

// Helper function to create profile document with retry logic
async function createProfileDocument(userId, profileData) {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      console.log(`🔄 Creating profile document (attempt ${attempt + 1}/${maxRetries})`);

      const profileDoc = {
        userId: userId,
        ...profileData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, PROFILE_COLLECTION, userId), profileDoc);
      console.log('✅ Profile document created successfully');
      return { success: true };
    } catch (error) {
      console.error(`❌ Profile document creation failed (attempt ${attempt + 1}):`, error);
      attempt++;

      if (attempt >= maxRetries) {
        console.error('❌ All attempts to create profile document failed');
        return {
          success: false,
          error: `Failed to create profile: ${error.message}`
        };
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}

// Get user profile by userId
export const getUserProfile = async (userId) => {
  // Check if this is a test user (mock authentication)
  const isTestUser = localStorage.getItem('testUser') !== null;

  if (isTestUser) {
    console.log('🧪 Using test user - returning mock profile for getUserProfile');
    return {
      success: true,
      data: {
        userId: userId,
        name: 'Test User',
        email: 'test@example.com',
        role: 'patient'
      }
    };
  }

  try {
    console.log(`🔍 Fetching profile for user: ${userId}`);
    const docRef = doc(db, PROFILE_COLLECTION, userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('✅ Profile found:', data);
      return { success: true, data };
    } else {
      console.log('⚠️ Profile not found, returning empty profile');
      return {
        success: true,
        data: {},
        message: "Profile not found"
      };
    }
  } catch (error) {
    console.error("❌ Error getting user profile:", error);
    return {
      success: false,
      error: error.message,
      fallback: "Profile service temporarily unavailable"
    };
  }
};

// Create or update user profile by userId
export const updateUserProfile = async (userId, profileData) => {
  // Check if this is a test user (mock authentication)
  const isTestUser = localStorage.getItem('testUser') !== null;

  if (isTestUser) {
    console.log('🧪 Using test user - skipping Firestore operations for updateUserProfile');
    return { success: true };
  }

  try {
    console.log(`📝 Updating profile for user: ${userId}`);
    const docRef = doc(db, PROFILE_COLLECTION, userId);
    const docSnap = await getDoc(docRef);
    const existingData = docSnap.exists() ? docSnap.data() : {};

    // Check if data has actually changed to avoid unnecessary writes
    const hasChanged = Object.keys(profileData).some(key => {
      return existingData[key] !== profileData[key];
    });

    if (!hasChanged) {
      console.log("⚡ Profile data unchanged, skipping write");
      return { success: true, skipped: true };
    }

    // If profile doesn't exist, create it
    if (!docSnap.exists()) {
      console.log('➕ Profile document not found, creating new one');
      const createResult = await createProfileDocument(userId, profileData);
      if (!createResult.success) {
        return createResult;
      }
    } else {
      // Update existing profile
      const updatedData = {
        ...profileData,
        updatedAt: serverTimestamp()
      };

      await updateDoc(docRef, updatedData);
      console.log('✅ Profile updated successfully');
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Error updating user profile:", error);

    // If it's a permission error, provide helpful message
    if (error.code === 'permission-denied') {
      return {
        success: false,
        error: "Permission denied. Please check your authentication status.",
        code: error.code
      };
    }

    return {
      success: false,
      error: error.message,
      fallback: "Profile update service temporarily unavailable"
    };
  }
};
