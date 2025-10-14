import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPresetAdmin, setIsPresetAdmin] = useState(false);

  useEffect(() => {
    // Check for preset admin on mount
    const presetAdmin = localStorage.getItem('presetAdmin') === 'true';
    setIsPresetAdmin(presetAdmin);

    // Function to check and set test user
    const checkTestUser = () => {
      const testUser = localStorage.getItem('testUser');
      const testUserRole = localStorage.getItem('testUserRole');

      if (testUser && testUserRole) {
        console.log('🧪 Using test user from localStorage');
        const mockUser = JSON.parse(testUser);
        console.log('🧪 Test user data:', mockUser);
        console.log('🧪 Test user role:', testUserRole);
        setCurrentUser(mockUser);
        setUserRole(testUserRole);
        setLoading(false);
        return true;
      }
      return false;
    };

    // Check for test user first
    if (checkTestUser()) {
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUser(user);

        // Check if this is a test user (mock authentication)
        const isTestUser = localStorage.getItem('testUser') !== null;

        if (isTestUser) {
          console.log('🧪 Using test user - checking role from localStorage');
          const testUserRole = localStorage.getItem('testUserRole');
          setUserRole(testUserRole || 'patient'); // Use stored role or default to patient
          setLoading(false);
          return;
        }

        // Fetch user role from Firestore with retry logic
        try {
          console.log("AuthContext: Fetching user role for UID:", user.uid);

          // Retry mechanism for Firestore operations
          const maxRetries = 3;
          let attempt = 0;
          let userData = null;

          while (attempt < maxRetries) {
            try {
              const userDocRef = doc(db, "users", user.uid);
              const userDocSnap = await getDoc(userDocRef);

              if (userDocSnap.exists()) {
                userData = userDocSnap.data();
                console.log("AuthContext: User data found:", userData);
                break;
              } else {
                console.log(`AuthContext: No user document found (attempt ${attempt + 1}/${maxRetries})`);
                throw new Error('User document not found');
              }
            } catch (fetchError) {
              console.error(`AuthContext: Error fetching user data (attempt ${attempt + 1}):`, fetchError);
              attempt++;

              if (attempt >= maxRetries) {
                throw fetchError;
              }

              // Wait before retrying
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
          }

          if (userData) {
            setUserRole(userData.role);
            console.log("AuthContext: User role set to:", userData.role);

            // Update lastActive for presence with retry
            try {
              const userDocRef = doc(db, "users", user.uid);
              await updateDoc(userDocRef, { lastActive: serverTimestamp() });
              console.log("AuthContext: Last active updated");
            } catch (updateError) {
              console.warn("AuthContext: Failed to update lastActive:", updateError);
            }
          }
        } catch (error) {
          console.error("AuthContext: Error fetching user role after all retries:", error);

          // If user document doesn't exist, try to create it
          if (error.message === 'User document not found') {
            try {
              console.log("AuthContext: Creating new user document with patient role");
              const userDocRef = doc(db, "users", user.uid);
              const userData = {
                uid: user.uid,
                name: user.displayName || 'Unknown User',
                email: user.email,
                role: "patient",
                createdAt: new Date().toISOString(),
                lastActive: serverTimestamp(),
                emailVerified: user.emailVerified
              };

              await setDoc(userDocRef, userData);
              console.log("AuthContext: New user document created successfully");
              setUserRole("patient");
            } catch (createError) {
              console.error("AuthContext: Error creating user document:", createError);
              setUserRole(null);
            }
          } else {
            setUserRole(null);
          }
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Listen for localStorage changes to handle test user login
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'testUser' || e.key === 'testUserRole') {
        console.log('🧪 localStorage changed, checking for test user...');
        const testUser = localStorage.getItem('testUser');
        const testUserRole = localStorage.getItem('testUserRole');

        if (testUser && testUserRole) {
          console.log('🧪 Test user detected from localStorage change');
          const mockUser = JSON.parse(testUser);
          setCurrentUser(mockUser);
          setUserRole(testUserRole);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const isAuthenticated = () => {
    return currentUser !== null || isPresetAdmin;
  };

  const isEmailVerified = () => {
    // Treat test users and preset admin as verified
    if (localStorage.getItem('testUser') || isPresetAdmin) return true;

    // If Firestore role resolved to doctor, allow access even if Firebase flag isn't set
    if (userRole === 'doctor') return true;

    return !!currentUser?.emailVerified;
  };

  const getUserRole = () => {
    if (isPresetAdmin) return 'admin';
    return userRole;
  };

  const canAccessRoute = (requiredRole = null) => {
    console.log('🔐 Checking route access:', {
      requiredRole,
      isAuthenticated: isAuthenticated(),
      isEmailVerified: isEmailVerified(),
      userRole: getUserRole()
    });
    
    if (!isAuthenticated()) {
      console.log('🔐 Access denied: Not authenticated');
      return false;
    }
    if (!isEmailVerified()) {
      console.log('🔐 Access denied: Email not verified');
      return false;
    }
    
    if (requiredRole) {
      // Special handling for family dashboard - patients can access it
      if (requiredRole === 'family' && getUserRole() === 'patient') {
        console.log('🔐 Access granted: Patient can access family dashboard');
        return true;
      }
      const hasAccess = getUserRole() === requiredRole;
      console.log('🔐 Role check result:', hasAccess);
      return hasAccess;
    }
    
    console.log('🔐 Access granted: No role requirement');
    return true;
  };

  const logout = async () => {
    try {
      // Handle test user logout
      if (localStorage.getItem('testUser')) {
        console.log('🧪 Logging out test user');
        localStorage.removeItem('testUser');
        localStorage.removeItem('testUserRole');
        setCurrentUser(null);
        setUserRole(null);
        return;
      }
      
      await auth.signOut();
      localStorage.removeItem('presetAdmin');
      setIsPresetAdmin(false);
      setCurrentUser(null);
      setUserRole(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const value = {
    currentUser,
    userRole: getUserRole(),
    isAuthenticated: isAuthenticated(),
    isEmailVerified: isEmailVerified(),
    isPresetAdmin,
    loading,
    canAccessRoute,
    logout,
    setPresetAdmin: (value) => {
      setIsPresetAdmin(value);
      if (value) {
        localStorage.setItem('presetAdmin', 'true');
      } else {
        localStorage.removeItem('presetAdmin');
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 