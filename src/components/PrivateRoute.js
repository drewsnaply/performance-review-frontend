// PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PrivateRoute({ children, allowedRoles = [] }) {
  const { currentUser, isAuthenticated } = useAuth();
  
  console.log('PrivateRoute check:', { isAuthenticated, currentUser, allowedRoles });

  // First, just check authentication 
  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" />;
  }
  
  // Keep the role check commented out for now
  /*
  // If roles are specified and user doesn't have permission
  if (allowedRoles.length > 0 && 
      currentUser && 
      !allowedRoles.includes(currentUser.role?.toLowerCase())) {
    return <Navigate to="/unauthorized" />;
  }
  */
  
  return children;
}

export default PrivateRoute;