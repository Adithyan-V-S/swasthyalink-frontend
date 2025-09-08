import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

// Firestore collection for user profiles
const PROFILE_COLLECTION = "userProfiles";

// Get user profile by userId
export const getUserProfile = async (userId) => {
  try {
    const docRef = doc(db, PROFILE_COLLECTION, userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    } else {
      return { success: false, error: "Profile not found" };
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    return { success: false, error: error.message };
  }
};

// Create or update user profile by userId
export const updateUserProfile = async (userId, profileData) => {
  try {
    const docRef = doc(db, PROFILE_COLLECTION, userId);
    await setDoc(docRef, profileData, { merge: true });
    return { success: true };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { success: false, error: error.message };
  }
};
