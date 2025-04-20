import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PrivateRoute({ children, allowedRoles = [], requiredPermissions = [] }) {
  const { currentUser, isAuthenticated, loading, hasPermission, impersonating } = useAuth();
  const location = useLocation();

  // CRITICAL BYPASS: Check for impersonation data directly in localStorage
  // This will prevent redirect to login even if Auth context hasn't fully initialized
  const impersonationData = localStorage.getItem('impersonatedCustomer');
  if (impersonationData && location.pathname !== '/login') {
    console.log('PrivateRoute: Impersonation data found, bypassing auth checks');
    return children;
  }

  // CRITICAL BYPASS: If user data exists in localStorage, temporarily allow access
  // This helps prevent refresh issues with regular admin users
  const localUserData = localStorage.getItem('user');
  const authToken = localStorage.getItem('authToken');
  if (localUserData && authToken && location.pathname !== '/login') {
    try {
      const userData = JSON.parse(localUserData);
      if (userData.role === 'admin') {
        console.log('PrivateRoute: Admin user found in localStorage, temporarily allowing access');
        // Continue with render while auth context catches up
        if (loading) {
          return children;
        }
      }
    } catch (e) {
      console.error('Error parsing local user data:', e);
    }
  }

  // Check if manual redirect is in progress
  const manualRedirectInProgress = localStorage.getItem('manual_redirect_in_progress') === 'true';
  if (manualRedirectInProgress) {
    console.log('Manual redirect in progress, passing through PrivateRoute');
    return children;
  }

  // Special handling for superadmin routes
  if (location.pathname.startsWith('/super-admin')) {
    const token = localStorage.getItem('authToken');
    
    // For superadmin routes specifically, do additional checks
    try {
      // Check token directly from localStorage as a fallback
      if (token) {
        // If we have a token but currentUser isn't fully loaded yet, allow access to superadmin routes
        // This helps during initial redirect from login
        if (!currentUser && token) {
          console.log('Token exists for superadmin route, temporarily allowing access');
          localStorage.setItem('temp_superadmin_access', 'true');
          // Return children without additional checks to allow superadmin access
          return children;
        }
      }
    } catch (err) {
      console.error('Error in superadmin route check:', err);
    }
  }

  // Handle loading state - show loading indicator
  if (loading) {
    return <div className="auth-loading">Authenticating...</div>;
  }

  // CRITICAL CHECK: Before redirecting to login, check again for impersonation data or valid admin in localStorage
  // This covers cases where the auth context might not be fully loaded yet
  if (!isAuthenticated || !currentUser) {
    if (impersonationData) {
      console.log('Auth not ready but impersonation data exists, allowing access');
      return children;
    }
    
    // Check localStorage for valid user data as a fallback
    try {
      if (localUserData && authToken) {
        const userData = JSON.parse(localUserData);
        if (userData.role) {
          console.log('Auth context not ready but valid user found in localStorage');
          // Set a temporary flag to prevent future redirects
          localStorage.setItem('pending_auth_validation', 'true');
          // Allow access while auth context catches up
          return children;
        }
      }
    } catch (e) {
      console.error('Error checking local user data:', e);
    }
  }

  // Standard auth check - only redirect if no token AND no impersonation
  const token = localStorage.getItem('authToken');
  if (!token && !impersonationData) {
    // Clear pending flag if redirecting
    localStorage.removeItem('pending_auth_validation');
    console.warn('No valid authentication, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If we reach here with a token but no authenticated user, it means auth context is still loading
  // Let's be more patient and show loading instead of redirecting
  if (!isAuthenticated && token) {
    if (localStorage.getItem('pending_auth_validation') === 'true') {
      console.log('Auth still pending, waiting instead of redirecting');
      return <div className="auth-loading">Validating authentication...</div>;
    }
  }

  // DEVELOPMENT MODE: Temporarily bypass role checks
  // IMPORTANT: Remove this bypass before deploying to production
  const isDevelopmentMode = process.env.NODE_ENV === 'development';
  
  // Check for Super Admin role first, which can access anything
  const userRole = currentUser?.role?.toLowerCase();
  const isSuperAdmin = userRole === 'superadmin' || userRole === 'super_admin';
  
  // Fix: Only apply impersonation restrictions if we're actually impersonating
  // AND the impersonation is not for accessing Super Admin features
  let impersonatedCustomer = null;
  try {
    impersonatedCustomer = JSON.parse(localStorage.getItem('impersonatedCustomer') || 'null');
  } catch (e) {
    console.error('Error parsing impersonatedCustomer:', e);
  }
  
  const isActuallyImpersonating = (impersonating || !!impersonationData) && !!impersonatedCustomer;
  
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
      // Special case: check if we're in temp superadmin access mode
      if (localStorage.getItem('temp_superadmin_access') === 'true') {
        console.log('Using temporary superadmin access');
        // Remove the temp access flag after using it once
        localStorage.removeItem('temp_superadmin_access');
        return children;
      }
      
      console.warn('Non-Super Admin tried to access Super Admin routes');
      return <Navigate to="/unauthorized" replace />;
    }
  }
  
  // Clear pending auth flag when everything is fully validated
  localStorage.removeItem('pending_auth_validation');
  
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