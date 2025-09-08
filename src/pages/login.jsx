import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth, googleProvider, db } from "../firebaseConfig";
import { signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import authService from "../services/authService";
import { ERROR_MESSAGES } from "../constants";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showResend, setShowResend] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { setPresetAdmin } = useAuth();

  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
    }
  }, [location]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      console.log("Starting Google sign in process");
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log("Google sign in successful, user:", user.uid, "email:", user.email);
      
      // Preset admin check for Google sign-in
      if (user.email === "admin@gmail.com") {
        console.log("Admin user detected, redirecting to admin dashboard");
        setLoading(false);
        setPresetAdmin(true);
        navigate("/admindashboard");
        return;
      }
      
      // Fetch user data from Firestore
      console.log("Checking if user exists in Firestore");
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        console.log("User found in Firestore:", userDocSnap.data());
        // Always navigate to patient dashboard since we're focusing only on patient role
        navigate("/patientdashboard");
      } else {
        console.log("User not found in Firestore, creating new user document");
        // If user doesn't exist in Firestore yet, create a new user document
        try {
          const userData = {
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            role: "patient",
            createdAt: new Date().toISOString()
          };
          
          console.log("Saving user data to Firestore:", userData);
          await setDoc(doc(db, "users", user.uid), userData);
          console.log("User data successfully saved to Firestore");
          navigate("/patientdashboard");
        } catch (error) {
          console.error("Error saving to Firestore:", error);
          setError("Failed to create user profile. Please try again.");
        }
      }
    } catch (err) {
      console.error("Google sign-in failed:", err);
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    console.log("Login attempt with:", { email, password });
    
    // Preset admin login check
    if (email === "admin@gmail.com" && password === "admin123") {
      console.log("Preset admin credentials detected, redirecting to admin dashboard");
      setLoading(false);
      setPresetAdmin(true);
      console.log("Preset admin set, attempting navigation...");
      try {
        navigate("/admindashboard");
        console.log("Navigation to /admin completed");
      } catch (error) {
        console.error("Navigation error:", error);
      }
      return;
    }
    
    console.log("Not preset admin, proceeding with Firebase Auth");
    
    try {
      const response = await authService.login(email, password);
      if (response.success) {
        const user = response.user;
        if (!user.emailVerified) {
          setError(ERROR_MESSAGES.INVALID_EMAIL);
          setShowResend(true);
          setLoading(false);
          return;
        }
        // Fetch user data from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          // Always navigate to patient dashboard since we're focusing only on patient role
          navigate("/patientdashboard");
        } else {
          setError("User data not found. Please contact support.");
        }
      } else {
        setError(response.error || ERROR_MESSAGES.AUTHENTICATION_FAILED);
      }
    } catch (err) {
      setError(ERROR_MESSAGES.AUTHENTICATION_FAILED);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    setError("");
    try {
      if (auth.currentUser) {
        await auth.currentUser.sendEmailVerification();
        setError("Verification email resent. Please check your inbox.");
        setShowResend(false);
      }
    } catch (err) {
      setError("Failed to resend verification email. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      setForgotPasswordMessage("Please enter your email address.");
      return;
    }
    
    setLoading(true);
    setForgotPasswordMessage("");
    
    try {
      await sendPasswordResetEmail(auth, forgotPasswordEmail);
      setForgotPasswordMessage("Password reset email sent! Please check your inbox.");
      setForgotPasswordEmail("");
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotPasswordMessage("");
      }, 3000);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setForgotPasswordMessage("No account found with this email address.");
      } else if (err.code === 'auth/invalid-email') {
        setForgotPasswordMessage("Please enter a valid email address.");
      } else {
        setForgotPasswordMessage("Failed to send reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-10">
      {/* Back to Home Button */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        <span className="font-medium">Back to Home</span>
      </Link>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center">
        <div className="mb-6 flex flex-col items-center">
          <img
            src="https://e7.pngegg.com/pngimages/261/718/png-clipart-perth-health-fitness-and-wellness-logo-meetup-embracing-miscellaneous-leaf-thumbnail.png"
            alt="Health Logo"
            className="w-16 h-16 mb-2 animate-float"
          />
          <h2 className="text-2xl font-bold text-indigo-700">
            {showForgotPassword ? "Reset Password" : "Welcome Back"}
          </h2>
          <p className="text-gray-500 text-sm">
            {showForgotPassword ? "Enter your email to reset your password" : "Login to your Swasthyalink account"}
          </p>
        </div>
        {message && (
          <div className="w-full mb-4 text-center p-2 bg-green-100 text-green-700 rounded-lg">
            {message}
          </div>
        )}
        {!showForgotPassword && (
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg font-semibold text-lg shadow hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-200 mb-4"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.61l6.85-6.85C35.64 2.7 30.23 0 24 0 14.82 0 6.73 5.82 2.69 14.09l7.98 6.2C12.36 13.6 17.74 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.59C43.98 37.13 46.1 31.3 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.29c-1.13-3.36-1.13-6.97 0-10.33l-7.98-6.2C.7 15.1 0 19.44 0 24c0 4.56.7 8.9 2.69 12.24l7.98-6.2z"/><path fill="#EA4335" d="M24 48c6.23 0 11.64-2.06 15.52-5.6l-7.19-5.59c-2.01 1.35-4.59 2.15-8.33 2.15-6.26 0-11.64-4.1-13.33-9.64l-7.98 6.2C6.73 42.18 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
            {loading ? "Signing in..." : "Sign in with Google"}
          </button>
        )}
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        
        {showForgotPassword ? (
          // Forgot Password Form
          <form className="w-full flex flex-col gap-4" onSubmit={handleForgotPassword}>
            {forgotPasswordMessage && (
              <div className={`text-sm mb-2 p-2 rounded-lg ${
                forgotPasswordMessage.includes("sent") 
                  ? "bg-green-100 text-green-700" 
                  : "bg-red-100 text-red-700"
              }`}>
                {forgotPasswordMessage}
              </div>
            )}
            <div>
              <input
                type="email"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Enter your email address"
                required
                value={forgotPasswordEmail}
                onChange={e => setForgotPasswordEmail(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold text-lg shadow hover:bg-yellow-400 hover:text-indigo-800 transition-colors duration-200 mt-2"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Email"}
            </button>
            <button
              type="button"
              onClick={() => setShowForgotPassword(false)}
              className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold text-lg shadow hover:bg-gray-300 transition-colors duration-200"
            >
              Back to Login
            </button>
          </form>
        ) : (
          // Login Form
          <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <input
                type="email"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Enter your email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 pr-10"
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 text-gray-500 hover:text-indigo-600 focus:outline-none"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12.01c1.636 4.01 5.735 6.99 10.066 6.99 2.042 0 3.97-.488 5.627-1.354M21.12 15.804A10.477 10.477 0 0022.066 12c-1.636-4.01-5.735-6.99-10.066-6.99-1.13 0-2.22.148-3.25.425M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.32 4.906A10.477 10.477 0 0022.066 12c-1.636-4.01-5.735-6.99-10.066-6.99-2.042 0-3.97-.488-5.627-1.354M3.98 8.223A10.477 10.477 0 001.934 12.01c1.636 4.01 5.735 6.99 10.066 6.99 2.042 0 3.97-.488 5.627-1.354M3.98 8.223l16.34 9.557" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="text-right mt-1">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  Forgot Password?
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold text-lg shadow hover:bg-yellow-400 hover:text-indigo-800 transition-colors duration-200 mt-2"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        )}
        {showResend && (
          <button
            onClick={handleResendVerification}
            className="w-full bg-yellow-400 text-indigo-800 py-2 rounded-lg font-semibold text-lg shadow hover:bg-yellow-500 transition-colors duration-200 mt-2 mb-2"
            disabled={loading}
          >
            {loading ? "Resending..." : "Resend Verification Email"}
          </button>
        )}
        {!showForgotPassword && (
          <div className="mt-4 text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 hover:text-yellow-500 font-semibold">Register</Link>
          </div>
        )}
      </div>
    </main>
  );
};

export default Login; 