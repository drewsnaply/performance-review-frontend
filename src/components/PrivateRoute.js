import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PrivateRoute({ children, allowedRoles = [] }) {
  const { currentUser, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Verbose logging for debugging
  console.log('PrivateRoute check:', { 
    isAuthenticated, 
    currentUser, 
    tokenExists: !!localStorage.getItem('authToken'),
    allowedRoles 
  });

  // If still loading authentication status, show loading indicator
  if (loading) {
    return <div>Authenticating...</div>;
  }

  // Check token existence as a secondary measure
  const token = localStorage.getItem('authToken');
  if (!token || !isAuthenticated) {
    console.warn('No valid authentication, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // DEVELOPMENT MODE: Temporarily bypass role checks
  // IMPORTANT: Remove this bypass before deploying to production
  const isDevelopmentMode = true; // Set to false for production
  
  if (
    !isDevelopmentMode && 
    allowedRoles.length > 0 &&
    currentUser &&
    !allowedRoles.includes(currentUser.role?.toLowerCase())
  ) {
    console.warn(`User role "${currentUser.role}" not authorized`);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default PrivateRoute;