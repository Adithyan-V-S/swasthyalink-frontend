import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { initializePresenceTracking, cleanupPresenceTracking } from '../services/presenceService';

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

    // Check for test user
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
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUser(user);
        
        // Fetch user role from Firestore
        try {
          console.log("AuthContext: Fetching user role for UID:", user.uid);
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            console.log("AuthContext: User data found:", userData);
            setUserRole(userData.role);
            console.log("AuthContext: User role set to:", userData.role);

            // Update lastActive for presence
            try {
              await updateDoc(userDocRef, { lastActive: serverTimestamp() });
            } catch {}

            // Initialize presence tracking
            initializePresenceTracking(user.uid);
          } else {
            console.log("AuthContext: No user document found in Firestore");
            // If no user document exists, create one with patient role
            try {
              console.log("AuthContext: Creating new user document with patient role");
              const userData = {
                uid: user.uid,
                name: user.displayName,
                email: user.email,
                role: "patient",
                createdAt: new Date().toISOString(),
                lastActive: serverTimestamp()
              };
              
              await setDoc(doc(db, "users", user.uid), userData);
              console.log("AuthContext: New user document created successfully");
              setUserRole("patient");
              
              // Initialize presence tracking for new user
              initializePresenceTracking(user.uid);
            } catch (createError) {
              console.error("AuthContext: Error creating user document:", createError);
              setUserRole(null);
            }
          }
        } catch (error) {
          console.error("AuthContext: Error fetching user role:", error);
          setUserRole(null);
        }
      } else {
        // Cleanup presence tracking on logout
        cleanupPresenceTracking();
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const isAuthenticated = () => {
    return currentUser !== null || isPresetAdmin;
  };

  const isEmailVerified = () => {
    // Handle test user
    if (localStorage.getItem('testUser')) {
      return true;
    }
    return currentUser?.emailVerified || isPresetAdmin;
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