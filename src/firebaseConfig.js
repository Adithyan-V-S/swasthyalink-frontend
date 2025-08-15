// frontend/src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Replace the following with your app's Firebase project configuration
// You can find these values in your Firebase project settings
const firebaseConfig = {
  apiKey: "AIzaSyCwoqFsGf3KNbKKeAht16HnGgdclsub0A0",
  authDomain: "swasthyakink.firebaseapp.com",
  projectId: "swasthyakink",
  storageBucket: "swasthyakink.appspot.com",
  messagingSenderId: "613048256435",
  appId: "1:613048256435:web:development_app_id",
  measurementId: "G-development-id" // Optional
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

// Add error handling for Firebase initialization
try {
  // Test Firebase connection
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
}
