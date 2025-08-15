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
    return currentUser?.emailVerified || isPresetAdmin;
  };

  const getUserRole = () => {
    if (isPresetAdmin) return 'admin';
    return userRole;
  };

  const canAccessRoute = (requiredRole = null) => {
    if (!isAuthenticated()) return false;
    if (!isEmailVerified()) return false;
    
    if (requiredRole) {
      // Special handling for family dashboard - patients can access it
      if (requiredRole === 'family' && getUserRole() === 'patient') {
        return true;
      }
      return getUserRole() === requiredRole;
    }
    
    return true;
  };

  const logout = async () => {
    try {
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