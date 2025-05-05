import React, { useEffect, useState } from 'react';

const AuthInitCheck = () => {
  const [checked, setChecked] = useState(false);
  
  useEffect(() => {
    // Only run once on component mount
    if (!checked) {
      const currentPath = window.location.pathname;
      
      // CRITICAL: Special handling for exit impersonation process
      // Check for multiple fallback flags - ANY of these should bypass checks
      if (localStorage.getItem('exiting_impersonation') === 'true' || 
          localStorage.getItem('superadmin_return') === 'true') {
        console.log('AuthInitCheck: Exit impersonation flags detected, bypassing all checks');
        
        // Clear all flags for cleanup
        localStorage.removeItem('exiting_impersonation');
        localStorage.removeItem('superadmin_return');
        localStorage.removeItem('manual_redirect_in_progress');
        
        // If we're on the super admin path AND have flags, ALWAYS bypass auth checks
        if (currentPath.startsWith('/super-admin')) {
          console.log('On super-admin path with exit flags - BYPASSING ALL AUTH CHECKS');
          
          // Check for original user data and restore it if available
          const originalUserData = localStorage.getItem('originalUser');
          if (originalUserData) {
            try {
              console.log('Restoring original superadmin user data');
              localStorage.setItem('user', originalUserData);
              localStorage.removeItem('originalUser');
            } catch (e) {
              console.error('Error restoring original user:', e);
            }
          }
          
          setChecked(true);
          return;
        }
      }
      
      // CRITICAL: Always clear any redirect flags first
      if(localStorage.getItem('manual_redirect_in_progress') === 'true') {
        console.log('AuthInitCheck: Clearing redirect flag');
        localStorage.removeItem('manual_redirect_in_progress');
      }
      
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
      
      // CRITICAL: Add special handling for superadmin paths
      if (currentPath.startsWith('/super-admin')) {
        console.log('AuthInitCheck: On superadmin path, checking role');
        
        try {
          // Check for original user data first (in case of impersonation exit)
          const originalUserData = localStorage.getItem('originalUser');
          if (originalUserData) {
            console.log('Found original user data from impersonation, restoring it');
            localStorage.setItem('user', originalUserData);
            localStorage.removeItem('originalUser');
          }
          
          // Get user data from localStorage
          const userData = localStorage.getItem('user');
          const token = localStorage.getItem('authToken');
          
          // Log for debugging
          console.log('- Token exists:', token ? 'true' : 'false');
          console.log('- User data exists:', userData ? 'true' : 'false');
          
          if (!token) {
            console.log('No token found for superadmin path, redirecting to login');
            window.location.href = '/login';
            return;
          }
          
          if (!userData) {
            console.log('No user data found for superadmin path, redirecting to login');
            window.location.href = '/login';
            return;
          }
          
          // Check if user is a superadmin
          const user = JSON.parse(userData);
          const role = user.role ? user.role.toLowerCase() : null;
          console.log('- User role from localStorage:', role);
          
          if (role === 'superadmin' || role === 'super_admin') {
            console.log('User is superadmin, allowing access to superadmin path');
            // Clear any redirect flags to be safe
            localStorage.removeItem('manual_redirect_in_progress');
            setChecked(true);
            return;
          }
          
          console.log('User is not a superadmin, redirecting to unauthorized');
          window.location.href = '/unauthorized';
          return;
        } catch (e) {
          console.error('Error checking superadmin access:', e);
          window.location.href = '/login';
          return;
        }
      }
      
      // Check if we're in impersonation mode - NEVER redirect if impersonating
      const impersonationData = localStorage.getItem('impersonatedCustomer');
      if (impersonationData) {
        console.log('Impersonation session active, skipping auth init checks');
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
      }, 50); // Reduced delay to 50ms for faster checks
    }
  }, [checked]);

  // This component doesn't render anything
  return null;
};

export default AuthInitCheck;