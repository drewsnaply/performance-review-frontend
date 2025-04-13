import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PrivateRoute({ children, allowedRoles = [], requiredPermissions = [] }) {
  const { currentUser, isAuthenticated, loading, hasPermission, impersonating } = useAuth();
  const location = useLocation();

  // Verbose logging for debugging
  console.log('PrivateRoute check:', { 
    isAuthenticated, 
    currentUser, 
    tokenExists: !!localStorage.getItem('authToken'),
    allowedRoles,
    requiredPermissions,
    impersonating,
    path: location.pathname
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
  const isDevelopmentMode = process.env.NODE_ENV === 'development';
  
  // Check for Super Admin role first, which can access anything
  const userRole = currentUser?.role?.toLowerCase();
  const isSuperAdmin = userRole === 'superadmin' || userRole === 'super_admin';
  
  // Fix: Only apply impersonation restrictions if we're actually impersonating
  // AND the impersonation is not for accessing Super Admin features
  const impersonatedCustomer = JSON.parse(localStorage.getItem('impersonatedCustomer') || 'null');
  const isActuallyImpersonating = impersonating && !!impersonatedCustomer;
  
  if (isActuallyImpersonating) {
    // When impersonating, Super Admin can only access customer routes
    if (isSuperAdmin && location.pathname.startsWith('/super-admin')) {
      // Except for exit-impersonation route which is always allowed
      if (!location.pathname.includes('/exit-impersonation')) {
        console.warn('Super Admin impersonating customer tried to access Super Admin routes');
        return <Navigate to="/dashboard" replace />;
      }
    }
  } else {
    // When not impersonating, only Super Admin can access Super Admin routes
    if (location.pathname.startsWith('/super-admin') && !isSuperAdmin) {
      console.warn('Non-Super Admin tried to access Super Admin routes');
      return <Navigate to="/unauthorized" replace />;
    }
  }
  
  // Check if user has the required role (Super Admin bypasses role checks)
  if (
    !isDevelopmentMode && 
    allowedRoles.length > 0 &&
    currentUser &&
    !isSuperAdmin && // Super Admin bypass role checks
    !allowedRoles.includes(userRole)
  ) {
    console.warn(`User role "${currentUser.role}" not authorized`);
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Check if user has the required permissions (Super Admin bypasses permission checks)
  if (
    !isDevelopmentMode && 
    requiredPermissions.length > 0 &&
    !isSuperAdmin && // Super Admin bypass permission checks
    !requiredPermissions.every(permission => hasPermission(permission))
  ) {
    console.warn(`User lacks required permissions: ${requiredPermissions.join(', ')}`);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default PrivateRoute;