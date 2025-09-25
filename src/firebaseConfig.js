// frontend/src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration for swasthyalink (corrected project name)
const firebaseConfig = {
  apiKey: "AIzaSyCwoqFsGf3KNbKKeAht16HnGgdclsub0A0",
  authDomain: "swasthyalink.firebaseapp.com",
  projectId: "swasthyalink",
  storageBucket: "swasthyalink.firebasestorage.app",
  messagingSenderId: "613048256435",
  appId: "1:613048256435:web:f7b9f390ff21154b9fedc6",
  measurementId: "G-D0QZ3NL9J1"
};
// Initialize Firebase
let app;
let auth;
let db;
let storage;
let googleProvider;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  db = getFirestore(app);
  storage = getStorage(app);

  // Configure Google Auth Provider
  googleProvider.setCustomParameters({
    prompt: 'select_account',
    hd: undefined // Allow any domain
  });

  // Add additional scopes if needed
  googleProvider.addScope('email');
  googleProvider.addScope('profile');

  console.log('✅ Firebase initialized successfully');
  console.log('🔗 Project ID:', firebaseConfig.projectId);
  console.log('🌐 Auth Domain:', firebaseConfig.authDomain);

} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw new Error(`Firebase initialization failed: ${error.message}`);
}

export { auth, googleProvider, db, storage };
