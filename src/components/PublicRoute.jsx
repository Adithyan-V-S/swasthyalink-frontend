import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "./common/LoadingSpinner";

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isEmailVerified, userRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <LoadingSpinner />
      </div>
    );
  }

  // If user is authenticated and email is verified, redirect to appropriate dashboard
  if (isAuthenticated && isEmailVerified) {
    const from = location.state?.from?.pathname || "/";
    
    // Redirect based on user role
    if (userRole === "admin") {
      return <Navigate to="/admindashboard" replace />;
    } else if (userRole === "doctor") {
      return <Navigate to="/doctordashboard" replace />;
    } else if (userRole === "patient") {
      return <Navigate to="/patientdashboard" replace />;
    } else {
      // Fallback to home page if role is unknown
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default PublicRoute; 