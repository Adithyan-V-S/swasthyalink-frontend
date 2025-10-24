import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, googleProvider, db } from "../firebaseConfig";
import { signInWithPopup, signInWithRedirect, getRedirectResult, createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

function EmailVerificationModal({ open, onResend, onCheck, onClose, email, verificationMessage }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
        <h2 className="text-xl font-bold mb-2 text-indigo-700">Confirm your email</h2>
        <p className="mb-4 text-gray-700">A confirmation link has been sent to <span className="font-semibold">{email}</span>.<br/>Please check your inbox and click the link to verify your account.</p>
        {verificationMessage && <p className="text-blue-600 mb-4">{verificationMessage}</p>}
        <div className="flex flex-col gap-2">
          <button onClick={onResend} className="bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 font-semibold">Resend Email</button>
          <button onClick={onCheck} className="bg-yellow-400 text-indigo-800 py-2 rounded hover:bg-yellow-500 font-semibold">I've Verified</button>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 mt-2">Close</button>
        </div>
      </div>
    </div>
  );
}

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const navigate = useNavigate();
  const [validation, setValidation] = useState({ email: '', password: '', confirm: '' });

  // Handle redirect result from Google sign-up
  useEffect(() => {
    const handleRedirectResult = async () => {
      console.log("🔄 Checking for redirect result in register...");
      try {
        const result = await getRedirectResult(auth);
        console.log("📥 Redirect result:", result);
        if (result) {
          console.log("✅ Google redirect sign-up successful:", result);
          const user = result.user;
          console.log("Google redirect sign up successful, user:", user.uid, "email:", user.email);
          
          // Always set role as "patient" without asking
          const userData = {
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            role: "patient",
            createdAt: new Date().toISOString()
          };
          
          console.log("Attempting to save user data to Firestore:", userData);
          
          try {
            await setDoc(doc(db, "users", user.uid), userData);
            console.log("User data successfully saved to Firestore");
            // Always navigate to patient dashboard
            console.log("Navigating to patient dashboard");
            navigate("/patientdashboard");
          } catch (firestoreError) {
            console.error("Error saving to Firestore:", firestoreError);
            setError("Failed to save user data: " + firestoreError.message);
          }
        } else {
          console.log("ℹ️ No redirect result found - normal page load");
        }
      } catch (error) {
        console.error("❌ Redirect result error:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        setError("Redirect authentication failed. Please try again or use popup method.");
      }
    };

    handleRedirectResult();
  }, [navigate]);

  const validateEmail = (email) => {
    // Simple email regex
    return /^\S+@\S+\.\S+$/.test(email);
  };

  // Validate name is not purely numeric
  const validateName = (name) => {
    return !/^\d+$/.test(name);
  };

  // Validate password contains at least one letter, one number, one special character and minimum 8 chars
  const validatePassword = (password) => {
    return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/.test(password);
  };

  const handleGoogleSignUp = async () => {
    setError("");
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

    try {
      console.log("🚀 Starting Google sign up");
      console.log("📍 Current origin:", window.location.origin);
      console.log("🌐 Environment:", isProduction ? 'production' : 'development');
      console.log("🔗 Auth domain:", auth.config.authDomain);

      // Force redirect in development to bypass popup issues
      const useRedirect = !isProduction || true; // Force true for development to test redirect

      console.log("🔄 Auth strategy:", useRedirect ? 'Redirect method' : 'Popup first');

      if (useRedirect) {
        console.log("🔄 Using redirect authentication to bypass popup issues");
        setError("Redirecting to Google for authentication...");
        await signInWithRedirect(auth, googleProvider);
        return;
      }

      let result;
      console.log("🪟 Attempting popup authentication...");
      try {
        result = await signInWithPopup(auth, googleProvider);
        console.log("✅ Popup authentication successful");
      } catch (popupError) {
        console.log("⚠️ Popup failed:", popupError.code, popupError.message);

        // Check if it's a recoverable error
        if (popupError.code === 'auth/popup-blocked') {
          console.log("🛡️ Popup blocked, falling back to redirect");
          setError("Popup was blocked. Redirecting to Google...");
          await signInWithRedirect(auth, googleProvider);
          return;
        } else if (popupError.code === 'auth/popup-closed-by-user') {
          setError("Sign-up was cancelled. Please try again.");
          return;
        } else if (popupError.code === 'auth/internal-error') {
          console.log("🔧 OAuth error detected, forcing redirect fallback");
          setError("Authentication issue detected. Redirecting to Google...");
          await signInWithRedirect(auth, googleProvider);
          return;
        } else {
          // For other errors, still try redirect as fallback
          console.log("🔄 Trying redirect as fallback for error:", popupError.code);
          await signInWithRedirect(auth, googleProvider);
          return;
        }
      }

      const user = result.user;
      console.log("✅ Google popup sign up successful!");
      console.log("👤 User ID:", user.uid);
      console.log("📧 Email:", user.email);
      console.log("👤 Display Name:", user.displayName);

      // Always set role as "patient" for Google sign-ups
      const userData = {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        role: "patient",
        createdAt: new Date().toISOString()
      };

      console.log("💾 Saving user data to Firestore:", userData);

      try {
        await setDoc(doc(db, "users", user.uid), userData);
        console.log("✅ User data successfully saved to Firestore");
        console.log("🚀 Navigating to patient dashboard...");
        navigate("/patientdashboard");
      } catch (firestoreError) {
        console.error("❌ Error saving to Firestore:", firestoreError);
        setError("Failed to create user profile. Please try again.");
      }

    } catch (error) {
      console.error("❌ Google sign-up failed:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);

      if (error.code === 'auth/popup-closed-by-user') {
        setError("Sign-up was cancelled. Please try again.");
      } else if (error.code === 'auth/popup-blocked') {
        setError("Popup was blocked by browser. Please allow popups and try again.");
      } else {
        setError(`Google sign-up failed: ${error.message}. Please check your browser settings and try again.`);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Real-time validation
    if (name === 'name') {
      setValidation((v) => ({ ...v, name: validateName(value) ? '' : 'Name should not be a number.' }));
    }
    if (name === 'email') {
      setValidation((v) => ({ ...v, email: validateEmail(value) ? '' : 'Please enter a valid email address.' }));
    }
    if (name === 'password') {
      setValidation((v) => ({ ...v, password: validatePassword(value) ? '' : 'Password must be at least 8 characters and include letters, numbers, and special characters.' }));
      // Also check confirm
      setValidation((v) => ({ ...v, confirm: form.confirm && value !== form.confirm ? 'Passwords do not match.' : '' }));
    }
    if (name === 'confirm') {
      setValidation((v) => ({ ...v, confirm: value !== form.password ? 'Passwords do not match.' : '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    console.log("Registration submission started...");

    // Validate name
    if (!validateName(form.name)) {
      setValidation((v) => ({ ...v, name: 'Name should not be a number.' }));
      return;
    }

    // Validate password
    if (!validatePassword(form.password)) {
      setValidation((v) => ({ ...v, password: 'Password must be at least 8 characters and include letters, numbers, and special characters.' }));
      return;
    }

    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    
    // Always set role as "patient" without asking
    const selectedRole = "patient";
    
    try {
      const res = await createUserWithEmailAndPassword(auth, form.email, form.password);
      console.log("User created successfully:", res.user.uid);
      await updateProfile(res.user, { displayName: form.name });
      
      // Store user data temporarily (will be moved to Firestore after verification)
      const tempUserData = {
        uid: res.user.uid,
        name: form.name,
        email: form.email,
        role: selectedRole,
        emailVerified: false,
        createdAt: new Date().toISOString()
      };
      
      // Store in localStorage temporarily
      localStorage.setItem('tempUserData', JSON.stringify(tempUserData));
      
      console.log("Sending verification email...");
      await sendEmailVerification(res.user);
      console.log("Verification email command sent.");

      setRegisteredUser(res.user);
      setShowVerification(true);
      console.log("Verification modal should now be visible.");

    } catch (error) {
      console.error("An error occurred during registration:", error);
      
      // Handle specific error codes with user-friendly messages
      let errorMessage = "Registration failed. Please try again.";
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered. Please use a different email or try logging in.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please use a stronger password.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password registration is not enabled. Please contact support.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many registration attempts. Please try again later.';
          break;
        default:
          errorMessage = error.message || "Registration failed. Please try again.";
      }
      
      setError(errorMessage);
    }
  };

  const handleResend = async () => {
    if (registeredUser) {
      await sendEmailVerification(registeredUser);
      setVerificationMessage("Verification email resent.");
    }
  };

  const handleCheck = async () => {
    if (registeredUser) {
      setVerifying(true);
      await registeredUser.reload();
      if (registeredUser.emailVerified) {
        // Email is verified, now save data to Firestore
        try {
          const tempUserData = JSON.parse(localStorage.getItem('tempUserData'));
          if (tempUserData) {
            // Update the data with verification status
            const userData = {
              ...tempUserData,
              emailVerified: true,
              verifiedAt: new Date().toISOString()
            };
            
            // Save to Firestore
            await setDoc(doc(db, "users", registeredUser.uid), userData);
            console.log("User data saved to Firestore after email verification.");
            
            // Clear temporary data
            localStorage.removeItem('tempUserData');
          }
        } catch (error) {
          console.error("Error saving user data to Firestore:", error);
          setVerificationMessage("Email verified but there was an error saving your data. Please contact support.");
          setVerifying(false);
          return;
        }
        
        setShowVerification(false);
        navigate("/login", { state: { message: "Email verified successfully! You can now log in." } });
      } else {
        setVerificationMessage("Email not verified yet. Please check your inbox.");
      }
      setVerifying(false);
    }
  };

  const handleModalClose = () => {
    setShowVerification(false);
    // Clean up temporary data if user closes without verifying
    localStorage.removeItem('tempUserData');
    navigate('/login', { state: { message: "Account created. Please verify your email to complete registration." } });
  }

  return (
    <main className="min-h-screen bg-[#F7F8FD] flex items-center justify-center px-4 py-8">
      {/* Email verification modal (unchanged logic) */}
      <EmailVerificationModal
        open={showVerification}
        onResend={handleResend}
        onCheck={handleCheck}
        onClose={handleModalClose}
        email={form.email}
        verificationMessage={verificationMessage}
      />

      {/* Main card with two columns to mirror the reference UI */}
      <div className="w-full max-w-6xl bg-white rounded-[32px] shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left gradient info panel */}
        <div className="relative p-10 md:p-12 text-white bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute -left-10 top-10 w-40 h-40 rounded-full bg-indigo-400 blur-3xl" />
            <div className="absolute -right-10 bottom-10 w-56 h-56 rounded-full bg-purple-400 blur-3xl" />
          </div>
          <div className="relative">
            <div className="text-white/80 text-sm mb-6 font-semibold tracking-wide">swasthyalink</div>
            <h2 className="text-2xl md:text-3xl font-semibold leading-snug mb-8">
              Get started managing secure, high‑quality health records
            </h2>

            <ul className="space-y-6">
              <li className="flex items-start gap-3">
                <span className="shrink-0 mt-1 inline-flex items-center justify-center w-7 h-7 rounded-lg bg-white/10">
                  {/* Chat bubble icon */}
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 5a3 3 0 013-3h10a3 3 0 013 3v6a3 3 0 01-3 3H8l-4 4v-4H5a3 3 0 01-3-3V5z"/></svg>
                </span>
                <div>
                  <p className="font-medium">Trusted by patients and doctors</p>
                  <p className="text-white/80 text-sm">Secure access and collaboration for better care.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="shrink-0 mt-1 inline-flex items-center justify-center w-7 h-7 rounded-lg bg-white/10">
                  {/* Clock icon */}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </span>
                <div>
                  <p className="font-medium">Save time</p>
                  <p className="text-white/80 text-sm">Fast onboarding, simple sharing, instant updates.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="shrink-0 mt-1 inline-flex items-center justify-center w-7 h-7 rounded-lg bg-white/10">
                  {/* Shield icon */}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </span>
                <div>
                  <p className="font-medium">Privacy first</p>
                  <p className="text-white/80 text-sm">Your data is protected with robust security.</p>
                </div>
              </li>
            </ul>

            {/* Optional bottom illustration style */}
            <div className="mt-12 hidden md:block">
              <div className="w-40 h-2 rounded-full bg-white/20" />
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="relative p-8 md:p-12">
          <div className="absolute right-8 top-8 text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition">Sign in</Link>
          </div>

          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-8">Create your free account</h1>

          {/* Social buttons */}
          <div className="space-y-3 mb-6">
            <button
              type="button"
              onClick={handleGoogleSignUp}
              className="w-full h-11 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 flex items-center justify-center gap-2 text-gray-800 transition"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.61l6.85-6.85C36.68 2.69 30.82 0 24 0 14.82 0 6.71 5.48 2.69 13.44l7.98 6.2C12.13 13.09 17.62 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.59C43.98 37.13 46.1 31.36 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.65c-1.13-3.36-1.13-6.99 0-10.35l-7.98-6.2C.7 16.09 0 19.95 0 24c0 4.05.7 7.91 2.69 11.9l7.98-6.2z"/><path fill="#EA4335" d="M24 48c6.48 0 11.93-2.14 15.9-5.82l-7.19-5.59c-2.01 1.35-4.59 2.16-8.71 2.16-6.38 0-11.87-3.59-14.33-8.94l-7.98 6.2C6.71 42.52 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
              Sign up with Google
            </button>
            {/* <button type="button" className="w-full h-11 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center gap-2 text-gray-400 cursor-not-allowed">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.676 0H1.324C.593 0 0 .593 0 1.324v21.352C0 23.407.593 24 1.324 24h11.495v-9.294H9.691v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.796.715-1.796 1.763v2.313h3.59l-.467 3.622h-3.123V24h6.127C23.407 24 24 23.407 24 22.676V1.324C24 .593 23.407 0 22.676 0"/></svg>
              Sign up with Facebook
            </button> */}
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="border-t border-gray-200" />
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-3 text-xs text-gray-400">or</span>
          </div>

          {/* Form (logic unchanged) */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              {/* <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label> */}
              <input
                id="name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full h-12 px-4 rounded-xl bg-gray-50 border-0 ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-400"
                placeholder="Enter your name"
                required
              />
              {validation.name && <div className="text-red-500 text-xs mt-1">{validation.name}</div>}
            </div>
            <div>
              {/* <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label> */}
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full h-12 px-4 rounded-xl bg-gray-50 border-0 ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-400"
                placeholder="Enter your email"
                required
              />
              {validation.email && <div className="text-red-500 text-xs mt-1">{validation.email}</div>}
            </div>
            <div>
              {/* <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label> */}
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full h-12 px-4 pr-10 rounded-xl bg-gray-50 border-0 ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-400"
                  placeholder="Enter password (8+ chars, letters, numbers, special chars)"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-600"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12.01c1.636 4.01 5.735 6.99 10.066 6.99 2.042 0 3.97-.488 5.627-1.354M21.12 15.804A10.477 10.477 0 0022.066 12c-1.636-4.01-5.735-6.99-10.066-6.99-1.13 0-2.22.148-3.25.425M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.32 4.906A10.477 10.477 0 0022.066 12c-1.636-4.01-5.735-6.99-10.066-6.99-2.042 0-3.97.488-5.627 1.354M3.98 8.223A10.477 10.477 0 001.934 12.01c1.636 4.01 5.735 6.99 10.066 6.99 2.042 0 3.97-.488 5.627-1.354M3.98 8.223l16.34 9.557" />
                    </svg>
                  )}
                </button>
              </div>
              {validation.password && <div className="text-red-500 text-xs mt-1">{validation.password}</div>}
            </div>
            <div>
              {/* <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label> */}
              <div className="relative">
                <input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  name="confirm"
                  value={form.confirm}
                  onChange={handleChange}
                  className="w-full h-12 px-4 pr-10 rounded-xl bg-gray-50 border-0 ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-400"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-600"
                  onClick={() => setShowConfirm((v) => !v)}
                  tabIndex={-1}
                >
                  {showConfirm ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12.01c1.636 4.01 5.735 6.99 10.066 6.99 2.042 0 3.97-.488 5.627-1.354M21.12 15.804A10.477 10.477 0 0022.066 12c-1.636-4.01-5.735-6.99-10.066-6.99-1.13 0-2.22.148-3.25.425M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.32 4.906A10.477 10.477 0 0022.066 12c-1.636-4.01-5.735-6.99-10.066-6.99-2.042 0-3.97.488-5.627 1.354M3.98 8.223A10.477 10.477 0 001.934 12.01c1.636 4.01 5.735 6.99 10.066 6.99 2.042 0 3.97-.488 5.627-1.354M3.98 8.223l16.34 9.557" />
                    </svg>
                  )}
                </button>
              </div>
              {validation.confirm && <div className="text-red-500 text-xs mt-1">{validation.confirm}</div>}
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold tracking-wide shadow hover:from-indigo-500 hover:to-violet-500 transition flex items-center justify-center gap-2"
            >
              <span>Sign up with Email</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10.293 15.707a1 1 0 010-1.414L12.586 12H4a1 1 0 110-2h8.586l-2.293-2.293a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/></svg>
            </button>
          </form>

          {/* Feedback messages (logic unchanged) */}
          {error && (
            <div className="w-full mt-4 text-center p-2 bg-red-100 text-red-700 rounded-lg">{error}</div>
          )}
          {showVerification && !error && (
            <div className="w-full mt-4 text-center p-2 bg-blue-100 text-blue-700 rounded-lg">
              Account created! Please verify your email to complete registration and save your data.
            </div>
          )}

          {/* Extra helper card */}
          <div className="mt-8">
            <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-gray-700">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700">✍️</span>
                <p className="text-sm">Are you a doctor looking to join?</p>
              </div>
                <button 
                type="button" 
                onClick={() => navigate('/login')}
                className="text-indigo-700 hover:text-indigo-900 text-sm font-medium"
              >
                Click here to apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Register; 