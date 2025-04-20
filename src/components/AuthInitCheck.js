import React, { useEffect, useState } from 'react';

const AuthInitCheck = () => {
  const [checked, setChecked] = useState(false);
  
  useEffect(() => {
    // Only run once on component mount
    if (!checked) {
      const currentPath = window.location.pathname;
      
      // CRITICAL: Always skip for admin dashboard path
      if (currentPath === '/dashboard') {
        console.log('On admin dashboard, COMPLETELY skipping auth check');
        setChecked(true);
        return;
      }
      
      // Skip for login, register, unauthorized, test pages, and setup-password
      if (currentPath === '/login' || 
          currentPath === '/register' || 
          currentPath === '/unauthorized' || 
          currentPath === '/test' ||
          currentPath === '/direct-dashboard' ||
          currentPath.startsWith('/setup-password')) {
        console.log('On excluded path, skipping auth check:', currentPath);
        setChecked(true);
        return;
      }
      
      // Check if we're in impersonation mode - NEVER redirect if impersonating
      const impersonationData = localStorage.getItem('impersonatedCustomer');
      if (impersonationData) {
        console.log('Impersonation session active, skipping auth init checks');
        setChecked(true);
        return;
      }
      
      // Check if manual redirect is in progress and skip if so
      const manualRedirectInProgress = localStorage.getItem('manual_redirect_in_progress') === 'true';
      if (manualRedirectInProgress) {
        console.log('Manual redirect in progress, skipping AuthInitCheck');
        setChecked(true);
        return;
      }
      
      // Add a small delay to let AuthContext initialize first
      setTimeout(() => {
        try {
          // Check if token exists
          const token = localStorage.getItem('authToken');
          
          if (!token) {
            console.log('No token found during initialization check');
            // Redirect to login
            window.location.href = '/login';
            return;
          }
          
          // Get user data to check role
          const userData = localStorage.getItem('user');
          if (!userData) {
            // Double-check for impersonation again before redirecting
            if (localStorage.getItem('impersonatedCustomer')) {
              console.log('Impersonation data found on second check, skipping redirect');
              setChecked(true);
              return;
            }
            
            console.log('No user data found, clearing session and redirecting to login');
            localStorage.clear();
            window.location.href = '/login';
            return;
          }
          
          // Parse user data
          let user;
          try {
            user = JSON.parse(userData);
          } catch (parseError) {
            console.error('Error parsing user data:', parseError);
            localStorage.clear();
            window.location.href = '/login';
            return;
          }
          
          // Check if we need to redirect to role-specific dashboard
          if (currentPath === '/' || currentPath === '/dashboard') {
            // If user is superadmin, redirect to Super Admin dashboard
            if (user.role === 'superadmin' || user.role === 'super_admin') {
              console.log('Super Admin detected, redirecting to Super Admin dashboard');
              window.location.href = '/super-admin/customers';
              return;
            }
            
            // If user is manager, redirect to Manager dashboard
            if (user.role === 'manager') {
              console.log('Manager detected, redirecting to Manager dashboard');
              window.location.href = '/manager/dashboard';
              return;
            }
          }
          
          // Special handling for admin users to prevent unnecessary redirects
          if (user.role === 'admin') {
            console.log('Admin user authenticated, allowing access');
            setChecked(true);
            return;
          }
          
          // Check if manager is trying to access admin-only pages
          if (user.role === 'manager') {
            const adminOnlyPages = [
              '/settings',
              '/import-tool',
              '/export-tool',
              '/kpis'
            ];
            
            // Check if current path starts with any admin-only page path
            const isAdminOnlyPage = adminOnlyPages.some(page => 
              currentPath.startsWith(page)
            );
            
            if (isAdminOnlyPage) {
              console.log('Manager trying to access admin-only page, redirecting to manager dashboard');
              window.location.href = '/manager/dashboard';
              return;
            }
            
            // If not on manager dashboard or approved pages, redirect to manager dashboard
            const managerApprovedPages = [
              '/manager/',
              '/pending-reviews',
              '/team-members',
              '/team-reviews',
              '/review-cycles',
              '/templates',
              '/my-reviews',
              '/profile',
              '/reviews/'
            ];
            
            // Check if current path starts with any manager-approved page path
            const isApprovedPage = managerApprovedPages.some(page => 
              currentPath.startsWith(page)
            );
            
            if (!isApprovedPage) {
              console.log('Manager on unauthorized page, redirecting to manager dashboard');
              window.location.href = '/manager/dashboard';
              return;
            }
          }
          
          console.log('Auth check passed for path:', currentPath);
          
        } catch (error) {
          console.error('Auth check error:', error);
          // On any error, only clear storage if not impersonating
          if (!localStorage.getItem('impersonatedCustomer')) {
            localStorage.clear();
            window.location.href = '/login';
          } else {
            console.log('Error occurred but impersonation active, not redirecting');
          }
        }
        
        setChecked(true);
      }, 200); // Increased delay to 200ms to ensure AuthContext has time to initialize
    }
  }, [checked]);

  // This component doesn't render anything
  return null;
};

export default AuthInitCheck;