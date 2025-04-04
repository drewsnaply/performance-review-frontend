import React, { useEffect, useState } from 'react';

const AuthInitCheck = () => {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Only run once on component mount
    if (!checked) {
      const currentPath = window.location.pathname;
      
      // Skip for login, register, unauthorized and test pages
      if (currentPath === '/login' || currentPath === '/register' || 
          currentPath === '/unauthorized' || currentPath === '/test' ||
          currentPath === '/direct-dashboard') {
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
          
          // Here you would validate the token if needed
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