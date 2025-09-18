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
    const docSnap = await getDoc(docRef);
    const existingData = docSnap.exists() ? docSnap.data() : {};

    // Check if data has actually changed to avoid unnecessary writes
    const hasChanged = Object.keys(profileData).some(key => {
      return existingData[key] !== profileData[key];
    });

    if (!hasChanged) {
      console.log("Profile data unchanged, skipping write");
      return { success: true, skipped: true };
    }

    await setDoc(docRef, profileData, { merge: true });
    return { success: true };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { success: false, error: error.message };
  }
};
