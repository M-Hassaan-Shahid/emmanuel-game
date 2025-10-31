import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./src/services/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth(); // Get user from AuthContext

  if (!user) {
    // If no user, redirect to login page
    return <Navigate to="/" replace />;
  }

  // If user exists, allow access to the protected route
  return children;
};

export default ProtectedRoute;
