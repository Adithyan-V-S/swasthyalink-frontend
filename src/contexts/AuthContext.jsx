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
  const [userData, setUserData] = useState(null); // Store Firestore user data
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

        // Try to fetch user data from Firestore first
        try {
          console.log("AuthContext: Fetching user data from Firestore for UID:", user.uid);
          const userDoc = await getDoc(doc(db, "users", user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("AuthContext: User data from Firestore:", userData);
            console.log("AuthContext: User name from Firestore:", userData.name);
            console.log("AuthContext: Complete userData object:", JSON.stringify(userData, null, 2));
            setUserData(userData); // Store the Firestore user data
            setUserRole(userData.role || "patient");
            console.log("AuthContext: User role set to:", userData.role);
          } else {
            console.log("AuthContext: No user document found, using default role");
            setUserData(null);
            setUserRole("patient");
          }
        } catch (error) {
          console.error("AuthContext: Error fetching user data from Firestore:", error);
          
          // Check if it's a quota exceeded error
          if (error.message && error.message.includes('quota')) {
            console.log("AuthContext: CONSERVATIVE MODE - Firebase quota exceeded, using pattern matching");
            
            // Try to determine role from email pattern as fallback
            let userRole = "patient"; // Default role
            
            if (user.email) {
              if (user.email.includes('@swasthyalink.com') && user.email.startsWith('doctor')) {
                userRole = "doctor";
                console.log("AuthContext: Doctor pattern detected from email");
              } else if (user.email.includes('admin') || user.email.includes('administrator')) {
                userRole = "admin";
                console.log("AuthContext: Admin pattern detected from email");
              } else if (user.email.includes('family')) {
                userRole = "family";
                console.log("AuthContext: Family pattern detected from email");
              }
            }
            
            setUserRole(userRole);
            console.log("AuthContext: Emergency mode - User role set to:", userRole);
            // Create fallback user data for emergency mode
            setUserData({
              name: user.email?.split('@')[0] || 'User',
              email: user.email,
              role: userRole
            });
          } else {
            // For other errors, default to patient
            console.log("AuthContext: Other error, defaulting to patient role");
            setUserData(null);
            setUserRole("patient");
          }
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setUserData(null);
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
    userData, // Add userData to context
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