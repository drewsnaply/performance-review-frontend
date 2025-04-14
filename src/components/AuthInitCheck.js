import React, { useEffect, useState } from 'react';

const AuthInitCheck = () => {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Only run once on component mount
    if (!checked) {
      const currentPath = window.location.pathname;
      
      // Skip for login, register, unauthorized, test pages, and setup-password
      if (currentPath === '/login' || 
          currentPath === '/register' || 
          currentPath === '/unauthorized' || 
          currentPath === '/test' ||
          currentPath === '/direct-dashboard' ||
          currentPath.startsWith('/setup-password')) {
        setChecked(true);
        return;
      }
      
      // For all other routes, verify token
      const verifyAuth = () => {
        try {
          // Check if token exists
          const token = localStorage.getItem('authToken');
          
          if (!token) {
            console.log('No token found during initialization check');
            // Redirect to login
            window.location.href = '/login';
            return;
          }
          
          // Check if we need to redirect to Super Admin dashboard
          if (currentPath === '/' || currentPath === '/dashboard') {
            // Get user data to check role
            const userData = localStorage.getItem('user');
            if (userData) {
              try {
                const user = JSON.parse(userData);
                
                // If user is superadmin, redirect to Super Admin dashboard
                if (user.role === 'superadmin') {
                  console.log('Super Admin detected, redirecting to Super Admin dashboard');
                  window.location.href = '/super-admin/customers';
                  return;
                }
              } catch (parseError) {
                console.error('Error parsing user data:', parseError);
              }
            }
          }
          
          console.log('Token found during initialization check');
          
        } catch (error) {
          console.error('Auth check error:', error);
          // On any error, clear storage and redirect to login
          localStorage.clear();
          window.location.href = '/login';
        }
        
        setChecked(true);
      };
      
      verifyAuth();
    }
  }, [checked]);

  // This component doesn't render anything
  return null;
};

export default AuthInitCheck;