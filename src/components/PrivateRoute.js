import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, currentUser, loading } = useAuth();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [isCheckComplete, setIsCheckComplete] = useState(false);

  useEffect(() => {
    console.log('PrivateRoute Debug:');
    console.log('Path:', location.pathname);
    console.log('isAuthenticated:', isAuthenticated);
    console.log('currentUser:', currentUser);
    console.log('allowedRoles:', allowedRoles);
    
    // CRITICAL: Always check for and clean up any redirect flags
    if(localStorage.getItem('manual_redirect_in_progress') === 'true') {
      console.log('Clearing redirect flag from PrivateRoute');
      localStorage.removeItem('manual_redirect_in_progress');
    }
    
    // CRITICAL: Superadmin path check
    if (location.pathname.startsWith('/super-admin')) {
      console.log('SUPERADMIN PATH DETECTED - Special handling');
      // Direct localStorage check
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');
        
        // Log token status and user data for debugging
        console.log('- Token exists:', token ? 'true' : 'false');
        console.log('- User data exists:', userData ? 'true' : 'false');
        
        if (userData) {
          const user = JSON.parse(userData);
          const userRole = user.role ? user.role.toLowerCase() : null;
          console.log('- User role from localStorage:', userRole);
          
          if (userRole === 'superadmin' || userRole === 'super_admin') {
            console.log('User is superadmin according to localStorage, allowing access');
            setIsAuthorized(true);
            setIsCheckComplete(true);
            return;
          }
        }
      } catch (e) {
        console.error('Error checking localStorage:', e);
      }
    }

    // Check if loading
    if (loading) {
      console.log('Auth context still loading');
      return;
    }

    // Try localStorage first if context auth state is not set
    if (!isAuthenticated) {
      console.log('Not authenticated via context, checking localStorage');
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        console.log('Found token and user data in localStorage');
        try {
          const user = JSON.parse(userData);
          const userRole = user.role ? user.role.toLowerCase() : null;
          
          // If no role restrictions or role is allowed
          if (allowedRoles.length === 0 || 
              allowedRoles.includes(userRole) || 
              userRole === 'superadmin' || 
              userRole === 'super_admin') {
            console.log('User authorized via localStorage, role:', userRole);
            setIsAuthorized(true);
            setIsCheckComplete(true);
            return;
          } else {
            console.log('User has token but role not allowed:', userRole);
            setIsAuthorized(false);
            setIsCheckComplete(true);
            return;
          }
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      } else {
        console.log('No token or user data in localStorage');
        setIsAuthorized(false);
        setIsCheckComplete(true);
        return;
      }
    }

    // If authenticated via context, check roles
    if (currentUser) {
      const userRole = currentUser.role ? currentUser.role.toLowerCase() : null;
      
      // Superadmin can access anything
      if (userRole === 'superadmin' || userRole === 'super_admin') {
        console.log('User is superadmin via context, allowing access');
        setIsAuthorized(true);
        setIsCheckComplete(true);
        return;
      }

      // Check if role is allowed
      if (allowedRoles.length === 0 || allowedRoles.includes(userRole)) {
        console.log('User role is allowed via context:', userRole);
        setIsAuthorized(true);
        setIsCheckComplete(true);
        return;
      }

      console.log('User authenticated but role not allowed:', userRole);
      setIsAuthorized(false);
      setIsCheckComplete(true);
      return;
    }

    // No user in context
    if (!currentUser && isAuthenticated) {
      console.log('Authenticated but no current user, checking localStorage');
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          const userRole = user.role ? user.role.toLowerCase() : null;
          
          if (allowedRoles.length === 0 || 
              allowedRoles.includes(userRole) || 
              userRole === 'superadmin' || 
              userRole === 'super_admin') {
            console.log('User authorized via localStorage backup check');
            setIsAuthorized(true);
            setIsCheckComplete(true);
            return;
          }
        }
      } catch (e) {
        console.error('Error in localStorage backup check:', e);
      }
    }

    console.log('No authorization found, denying access');
    setIsAuthorized(false);
    setIsCheckComplete(true);
  }, [isAuthenticated, currentUser, loading, allowedRoles, location.pathname]);

  // Show loading while checking
  if (!isCheckComplete) {
    return <div>Loading...</div>;
  }

  // Handle unauthorized access
  if (!isAuthorized) {
    // Check if we have a token at all
    const hasToken = localStorage.getItem('authToken');
    
    if (!hasToken) {
      console.log('No token, redirecting to login');
      return <Navigate to="/login" state={{ from: location }} replace />;
    } else {
      console.log('Has token but unauthorized, redirecting to unauthorized page');
      return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }
  }

  // Render children if authorized
  return children;
};

export default PrivateRoute;