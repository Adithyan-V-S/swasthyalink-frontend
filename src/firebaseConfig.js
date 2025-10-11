// frontend/src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration for swasthyakink (correct project name)
const firebaseConfig = {
  apiKey: "AIzaSyCwoqFsGf3KNbKKeAht16HnGgdclsub0A0",
  authDomain: "swasthyakink.firebaseapp.com",
  projectId: "swasthyakink",
  storageBucket: "swasthyakink.firebasestorage.app",
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

// Configure Google Auth Provider with environment-specific settings
  const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });

  // Add additional scopes if needed
  googleProvider.addScope('email');
  googleProvider.addScope('profile');
  googleProvider.addScope('openid');

  console.log('🔧 Google Provider configured for:', isProduction ? 'production' : 'development');
  console.log('🌐 Current hostname:', window.location.hostname);
  console.log('🔗 Expected redirect URI:', isProduction ? `${window.location.origin}/__/auth/handler` : 'auto-detected');

  console.log('✅ Firebase initialized successfully');
  console.log('🔗 Project ID:', firebaseConfig.projectId);
  console.log('🌐 Auth Domain:', firebaseConfig.authDomain);

} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw new Error(`Firebase initialization failed: ${error.message}`);
}

export { auth, googleProvider, db, storage };
