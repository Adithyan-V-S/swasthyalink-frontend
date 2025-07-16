// frontend/src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCwoqFsGf3KNbKKeAht16HnGgdclsub0A0",
  authDomain: "swasthyakink.firebaseapp.com",
  projectId: "swasthyakink",
  storageBucket: "swasthyakink.appspot.com",
  messagingSenderId: "613048256435",
  appId: "1:613048256435:web:xxxxxxxxxxxxxxxxxxxxxx", // fill in your appId
  measurementId: "G-xxxxxxxxxx" // optional
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();