import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, googleProvider, db } from "../firebaseConfig";
import { signInWithPopup, createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "firebase/auth";
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

  const validateEmail = (email) => {
    // Simple email regex
    return /^\S+@\S+\.\S+$/.test(email);
  };

  // Validate name is not purely numeric
  const validateName = (name) => {
    return !/^\d+$/.test(name);
  };

  // Validate password contains at least one letter and one number and minimum 8 chars
  const validatePassword = (password) => {
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
  };

  const handleGoogleSignUp = async () => {
    setError("");
    try {
      console.log("Starting Google sign up process");
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Google sign in successful, user:", result.user.uid);
      
      // Always set role as "patient" without asking
      const userData = {
        uid: result.user.uid,
        name: result.user.displayName,
        email: result.user.email,
        role: "patient",
        createdAt: new Date().toISOString()
      };
      
      console.log("Attempting to save user data to Firestore:", userData);
      
      try {
        await setDoc(doc(db, "users", result.user.uid), userData);
        console.log("User data successfully saved to Firestore");
      } catch (firestoreError) {
        console.error("Error saving to Firestore:", firestoreError);
        setError("Failed to save user data: " + firestoreError.message);
        return;
      }
      
      // Always navigate to patient dashboard
      console.log("Navigating to patient dashboard");
      navigate("/patientdashboard");
    } catch (error) {
      console.error("Google sign up failed:", error);
      setError("Google sign up failed: " + error.message);
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
      setValidation((v) => ({ ...v, password: validatePassword(value) ? '' : 'Password must be at least 8 characters and include both letters and numbers.' }));
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
      setValidation((v) => ({ ...v, password: 'Password must be at least 8 characters and include both letters and numbers.' }));
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
      setError("Registration failed: " + error.message);
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
    <main className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-100 to-pink-100 px-4 py-10 overflow-hidden">
      {/* Back to Home Button - Same as login page */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        <span className="font-medium">Back to Home</span>
      </Link>
      
      <EmailVerificationModal
        open={showVerification}
        onResend={handleResend}
        onCheck={handleCheck}
        onClose={handleModalClose}
        email={form.email}
        verificationMessage={verificationMessage}
      />
      {/* Blurred floating shapes */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-300 opacity-30 rounded-full filter blur-3xl animate-float z-0" style={{animationDuration:'7s'}} />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-pink-300 opacity-20 rounded-full filter blur-2xl animate-float z-0" style={{animationDuration:'9s'}} />
      <div className="absolute top-1/2 left-1/3 w-60 h-60 bg-yellow-200 opacity-20 rounded-full filter blur-2xl animate-float z-0" style={{animationDuration:'11s'}} />
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-green-200 opacity-20 rounded-full filter blur-2xl animate-float z-0" style={{animationDuration:'13s'}} />
      {/* Animated health icons */}
      <div className="absolute top-16 left-24 z-0 animate-bounce-slow">
        {/* Heart icon */}
        <svg className="w-12 h-12 text-red-400 opacity-60" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="absolute bottom-24 right-32 z-0 animate-pulse-slow">
        {/* Medical cross icon */}
        <svg className="w-10 h-10 text-blue-400 opacity-50" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v6h6a1 1 0 110 2h-6v6a1 1 0 11-2 0v-6H3a1 1 0 110-2h6V3a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="absolute top-1/3 right-1/4 z-0 animate-float">
        {/* Stethoscope icon */}
        <svg className="w-12 h-12 text-green-400 opacity-50" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 3v6a6 6 0 006 6 6 6 0 006-6V3m-6 18v-2m0 0a4 4 0 004-4h-4a4 4 0 01-4 4z" />
        </svg>
      </div>
      <div className="relative w-full max-w-3xl flex flex-col md:flex-row items-center justify-center z-10 gap-8">
        {/* Form container */}
        <div className="relative w-full max-w-md bg-white/90 backdrop-blur-lg rounded-3xl shadow-3xl p-10 flex flex-col items-center border border-indigo-100">
          <div className="mb-6 flex flex-col items-center">
            <img
              src="https://e7.pngegg.com/pngimages/261/718/png-clipart-perth-health-fitness-and-wellness-logo-meetup-embracing-miscellaneous-leaf-thumbnail.png"
              alt="Health Logo"
              className="w-16 h-16 mb-2 animate-float"
            />
            <h2 className="text-2xl font-bold text-indigo-700">Create Account</h2>
            <p className="text-gray-500 text-sm">Register for Swasthyakink</p>
          </div>
          <button
            type="button"
            onClick={handleGoogleSignUp}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg font-semibold shadow hover:bg-yellow-50 hover:border-yellow-400 transition-colors duration-200 mb-4"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.61l6.85-6.85C36.68 2.69 30.82 0 24 0 14.82 0 6.71 5.48 2.69 13.44l7.98 6.2C12.13 13.09 17.62 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.59C43.98 37.13 46.1 31.36 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.65c-1.13-3.36-1.13-6.99 0-10.35l-7.98-6.2C.7 16.09 0 19.95 0 24c0 4.05.7 7.91 2.69 11.9l7.98-6.2z"/><path fill="#EA4335" d="M24 48c6.48 0 11.93-2.14 15.9-5.82l-7.19-5.59c-2.01 1.35-4.59 2.16-8.71 2.16-6.38 0-11.87-3.59-14.33-8.94l-7.98 6.2C6.71 42.52 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
            Sign up with Google
          </button>
          {error && (
            <div className="w-full mt-4 text-center p-2 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          {showVerification && !error && (
            <div className="w-full mt-4 text-center p-2 bg-blue-100 text-blue-700 rounded-lg">
              Account created! Please verify your email to complete registration and save your data.
            </div>
          )}
          <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
              <label htmlFor="name" className="block text-gray-700 mb-1 font-medium">Name</label>
              <input
                id="name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Enter your name"
                required
              />
              {validation.name && <div className="text-red-500 text-xs mt-1">{validation.name}</div>}
            </div>
            <div>
              <label htmlFor="email" className="block text-gray-700 mb-1 font-medium">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Enter your email"
                required
              />
              {validation.email && <div className="text-red-500 text-xs mt-1">{validation.email}</div>}
            </div>
            <div>
              <label htmlFor="password" className="block text-gray-700 mb-1 font-medium">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 pr-10"
                  placeholder="Enter your password"
                  required
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
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.32 4.906A10.477 10.477 0 0022.066 12c-1.636-4.01-5.735-6.99-10.066-6.99-2.042 0-3.97.488-5.627 1.354M3.98 8.223A10.477 10.477 0 001.934 12.01c1.636 4.01 5.735 6.99 10.066 6.99 2.042 0 3.97-.488 5.627-1.354M3.98 8.223l16.34 9.557" />
                    </svg>
                  )}
                </button>
              </div>
              {validation.password && <div className="text-red-500 text-xs mt-1">{validation.password}</div>}
            </div>
            <div>
              <label htmlFor="confirm" className="block text-gray-700 mb-1 font-medium">Confirm Password</label>
              <div className="relative">
                <input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  name="confirm"
                  value={form.confirm}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 pr-10"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 text-gray-500 hover:text-indigo-600 focus:outline-none"
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
              className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold text-lg shadow hover:bg-yellow-400 hover:text-indigo-800 transition-colors duration-200 mt-2"
            >
              Register
            </button>
          </form>
          <div className="mt-4 text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-yellow-500 font-semibold">Login</Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Register; 