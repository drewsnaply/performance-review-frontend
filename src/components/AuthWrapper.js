import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// This wrapper component checks authentication before rendering any protected routes
const AuthWrapper = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      // Get token from localStorage
      const token = localStorage.getItem('authToken');
      
      // Public routes that don't require authentication
      const publicRoutes = ['/login', '/register'];
      const isPublicRoute = publicRoutes.includes(location.pathname);
      
      if (!token && !isPublicRoute) {
        // No token and trying to access protected route - force redirect
        console.log('No token found, redirecting to login');
        window.location.href = '/login';
        return;
      }
      
      if (token) {
        try {
          // Check if token is valid
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp < currentTime) {
            // Token expired
            console.log('Token expired, redirecting to login');
            localStorage.removeItem('authToken');
            window.location.href = '/login';
            return;
          }
          
          // Valid token
          setIsAuthenticated(true);
          
          // If on login page with valid token, redirect to dashboard
          if (isPublicRoute) {
            window.location.href = '/dashboard';
            return;
          }
        } catch (error) {
          // Invalid token
          console.error('Invalid token:', error);
          localStorage.removeItem('authToken');
          
          if (!isPublicRoute) {
            window.location.href = '/login';
            return;
          }
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, [location.pathname]);
  
  if (isLoading) {
    return <div>Checking authentication...</div>;
  }
  
  return children;
};

export default AuthWrapper;