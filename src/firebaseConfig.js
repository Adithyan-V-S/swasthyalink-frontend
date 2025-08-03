// frontend/src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCwoqFsGf3KNbKKeAht16HnGgdclsub0A0",
  authDomain: "swasthyakink.firebaseapp.com",
  projectId: "swasthyakink",
  storageBucket: "swasthyakink.appspot.com",
  messagingSenderId: "613048256435",
  // For development, we can use a placeholder appId
  appId: "1:613048256435:web:development_app_id", 
  // Optional measurement ID
  measurementId: "G-development-id" 
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Add error handling for Firebase initialization
try {
  // Test Firebase connection
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
}