import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import AuthService from '../services/authService';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Set this to false to disable console logging
  const isDebugMode = false;
  
  // Debug log function - only logs when debug mode is on
  const debugLog = (message) => {
    if (isDebugMode) {
      console.log(message);
    }
  };

  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [impersonating, setImpersonating] = useState(false);
  const [originalUser, setOriginalUser] = useState(null);
  const [impersonatedCustomer, setImpersonatedCustomer] = useState(null);
  
  // Reference to track initial mount
  const isInitialMount = useRef(true);
  // Track if redirect is in progress to prevent loops
  const redirectInProgress = useRef(false);
  // Track if we've already checked auth status
  const authStatusChecked = useRef(false);

  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp < Date.now() / 1000;
    } catch (error) {
      console.error('Token decoding error:', error);
      return true;
    }
  };

  // CRITICAL: Check if we should skip login redirect for current path
  const shouldSkipLoginRedirect = () => {
    // CRITICAL: Always skip for admin dashboard and super admin paths
    if (window.location.pathname === '/dashboard' || 
        window.location.pathname.startsWith('/super-admin')) {
      debugLog('On admin or super-admin path, skipping login redirect from AuthContext');
      return true;
    }
    
    // Skip for impersonation
    if (localStorage.getItem('impersonatedCustomer')) {
      debugLog('Impersonation active, skipping login redirect');
      return true;
    }
    
    // Skip if we have a user in localStorage
    if (localStorage.getItem('user')) {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData && userData.role) {
          debugLog('Valid user data in localStorage, skipping login redirect');
          return true;
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    return false;
  };

  useEffect(() => {
    // Skip if we already checked auth status
    if (authStatusChecked.current) {
      return;
    }
    
    const checkAuthStatus = () => {
      // Skip if redirect already in progress
      if (redirectInProgress.current) {
        debugLog('Redirect already in progress, skipping auth check');
        setLoading(false);
        return;
      }
      
      // CRITICAL FIX: Always check and clear manual_redirect flag on startup
      if (localStorage.getItem('manual_redirect_in_progress') === 'true') {
        debugLog('Found stale manual_redirect_in_progress flag, clearing it');
        localStorage.removeItem('manual_redirect_in_progress');
      }
      
      // CRITICAL: Check for impersonation first - if impersonating, always set state
      const impersonationData = localStorage.getItem('impersonatedCustomer');
      if (impersonationData) {
        debugLog('AuthContext: Impersonation detected, setting impersonation state');
        try {
          const parsedData = JSON.parse(impersonationData);
          setImpersonating(true);
          setImpersonatedCustomer(parsedData);
          
          // Check for original user data
          const originalUserData = localStorage.getItem('originalUser');
          if (originalUserData) {
            try {
              setOriginalUser(JSON.parse(originalUserData));
            } catch (e) {
              console.error('Error parsing original user:', e);
            }
          }
        } catch (e) {
          console.error('Error parsing impersonation data:', e);
        }
      }
      
      // DEBUG: Log auth state only in debug mode
      if (isDebugMode) {
        console.log('=== DEBUG AUTH STATE ===');
        console.log('token:', localStorage.getItem('authToken') ? 'exists' : 'missing');
        console.log('user:', localStorage.getItem('user'));
        console.log('currentUser from context:', currentUser);
        console.log('isAuthenticated:', isAuthenticated);
        console.log('current path:', window.location.pathname);
        console.log('========================');
      }
      
      // CRITICAL: Special handling for superadmin paths
      if (window.location.pathname.startsWith('/super-admin')) {
        debugLog('Super admin path detected, using special handling');
        
        // Check for token and user data
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          try {
            const user = JSON.parse(userData);
            const role = user.role ? user.role.toLowerCase() : null;
            
            debugLog('User role from localStorage: ' + role);
            
            if (role === 'superadmin' || role === 'super_admin') {
              debugLog('User is valid superadmin, setting auth state');
              
              // Set auth state if not already set
              if (!isAuthenticated || !currentUser) {
                setCurrentUser(user);
                setIsAuthenticated(true);
              }
              
              setLoading(false);
              // Mark as checked
              authStatusChecked.current = true;
              return;
            } else {
              debugLog('User is not a superadmin, redirecting to unauthorized');
              window.location.href = '/unauthorized';
              return;
            }
          } catch (e) {
            console.error('Error checking localStorage:', e);
          }
        } else {
          debugLog('Missing token or user data for superadmin path, redirecting to login');
          window.location.href = '/login';
          return;
        }
      }
      
      debugLog('Checking auth status...');
      
      // Try to get user from localStorage first (fastest)
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          debugLog('User restored from localStorage');
          
          // Set user state directly from localStorage
          setCurrentUser(userData);
          setIsAuthenticated(true);
          
          // Only redirect if on login page
          const isLoginPage = window.location.pathname === '/login';
          if (isLoginPage) {
            const role = userData.role ? userData.role.toLowerCase() : null;
            
            if (role === 'superadmin' || role === 'super_admin') {
              debugLog('Redirecting superadmin from login to super admin dashboard');
              // CRITICAL: Direct navigation without flags
              window.location.href = '/super-admin/customers';
              return;
            } else {
              // Regular user
              window.location.href = '/dashboard';
              return;
            }
          }
          
          setLoading(false);
          // Mark as checked
          authStatusChecked.current = true;
          return;
        } catch (e) {
          console.error('Error parsing stored user:', e);
        }
      }
      
      // If no stored user, check for token
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          // Just decode it to get user info
          const decodedToken = jwtDecode(token);
          debugLog('User restored from token');
          
          // Store for future quick restore
          localStorage.setItem('user', JSON.stringify(decodedToken));
          
          // Set auth state
          setCurrentUser(decodedToken);
          setIsAuthenticated(true);
          
          // Only redirect if on login page
          const isLoginPage = window.location.pathname === '/login';
          if (isLoginPage) {
            const role = decodedToken.role ? decodedToken.role.toLowerCase() : null;
            
            if (role === 'superadmin' || role === 'super_admin') {
              debugLog('Redirecting superadmin from login to super admin dashboard');
              window.location.href = '/super-admin/customers';
              return;
            } else {
              // Regular user
              window.location.href = '/dashboard';
              return;
            }
          }
        } catch (error) {
          console.error('Error decoding token:', error);
          
          // Check if we should skip login redirect
          if (shouldSkipLoginRedirect()) {
            debugLog('Skipping login redirect despite token error');
            setLoading(false);
            authStatusChecked.current = true;
            return;
          }
        }
      } else {
        // No token - check if we should skip login redirect anyway
        if (shouldSkipLoginRedirect()) {
          debugLog('No token but skipping login redirect');
          setLoading(false);
          authStatusChecked.current = true;
          return;
        }
        
        // Only redirect if not on public page
        const publicPages = ['/login', '/register', '/unauthorized', '/exit-impersonation'];
        const isPublicPage = publicPages.includes(window.location.pathname) || 
                          window.location.pathname.startsWith('/setup-password');
        
        if (!isPublicPage) {
          debugLog('No authentication, redirecting to login');
          window.location.href = '/login';
          return;
        }
      }
      
      setLoading(false);
      isInitialMount.current = false;
      authStatusChecked.current = true;
    };
    
    // Use a small timeout to avoid race conditions
    setTimeout(checkAuthStatus, 50);
    
    // Cleanup function to reset redirect flag
    return () => {
      redirectInProgress.current = false;
      // CRITICAL FIX: Always clear redirect flags on unmount
      localStorage.removeItem('manual_redirect_in_progress');
    };
  }, [currentUser, isAuthenticated]);

  const login = async (username, password) => {
    try {
      const response = await AuthService.login(username, password);
      const { token } = response;

      if (!token) {
        throw new Error('No token received from backend');
      }

      // Clean up any stale data
      localStorage.removeItem('manual_redirect_in_progress');
      localStorage.removeItem('impersonatedCustomer');
      localStorage.removeItem('originalUser');
      localStorage.removeItem('impersonationToken');
      
      localStorage.setItem('authToken', token);
      const decodedToken = jwtDecode(token);
      
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(decodedToken));
      
      // Set auth state
      setCurrentUser(decodedToken);
      setIsAuthenticated(true);
      setImpersonating(false);
      setOriginalUser(null);
      setImpersonatedCustomer(null);
      
      // Return both token and user data for the login component
      debugLog('Login successful, returning user and token');
      return { token, user: decodedToken };
    } catch (err) {
      console.error('Login context error:', err);
      throw err;
    }
  };

  const logout = () => {
    // Clear all auth-related localStorage items
    localStorage.removeItem('authToken');
    localStorage.removeItem('impersonatedCustomer');
    localStorage.removeItem('impersonationToken');
    localStorage.removeItem('manual_redirect_in_progress');
    localStorage.removeItem('user');
    localStorage.removeItem('originalUser');
    localStorage.removeItem('impersonation_active');
    
    // Reset state
    setCurrentUser(null);
    setIsAuthenticated(false);
    setImpersonating(false);
    setOriginalUser(null);
    setImpersonatedCustomer(null);
    
    // Reset auth check flag for next login
    authStatusChecked.current = false;
    
    // Redirect to login if not already there
    if (window.location.pathname !== '/login') {
      redirectInProgress.current = true;
      window.location.href = '/login';
    }
  };

  // Impersonate customer function (for super admins)
  const impersonateCustomer = async (customerId) => {
    try {
      // Log the start of impersonation process
      debugLog('Starting impersonation process for customer ID: ' + customerId);
      
      // Store original user if not already impersonating
      if (!impersonating) {
        debugLog('Storing original user for impersonation');
        // Store original user in state
        setOriginalUser(currentUser);
        
        // Also store original user in localStorage to persist across refreshes
        localStorage.setItem('originalUser', JSON.stringify(currentUser));
      }
      
      // In a real implementation, you would make an API call to get customer admin token
      try {
        const response = await AuthService.impersonateCustomer(customerId);
        const { token, user } = response;
        
        // Store impersonation token if available
        if (token) {
          localStorage.setItem('impersonationToken', token);
        } else {
          // Use existing token as fallback
          localStorage.setItem('impersonationToken', localStorage.getItem('authToken'));
        }
        
        // Ensure customer data is stored
        // This might already be set in SuperAdminDashboard
        const customerData = {
          id: customerId,
          name: user.organizationName || 'Customer Organization'
        };
        
        if (!localStorage.getItem('impersonatedCustomer')) {
          localStorage.setItem('impersonatedCustomer', JSON.stringify(customerData));
        }
        setImpersonatedCustomer(customerData);
        
        // Update current user to the impersonated admin
        const impersonatedUser = {
          ...user,
          impersonated: true,
          customerId: customerId
        };
        
        // Important: Store in localStorage
        localStorage.setItem('user', JSON.stringify(impersonatedUser));
        
        setCurrentUser(impersonatedUser);
        setImpersonating(true);
        
        debugLog('Impersonation successful via API');
        return impersonatedUser;
      } catch (apiError) {
        console.error('API impersonation error:', apiError);
        
        // For demo purposes, create a mock impersonated user
        const mockAdminUser = {
          id: 'admin-' + customerId,
          username: 'admin@acme.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          impersonated: true,
          customerId: customerId
        };
        
        // Store impersonation info
        const customerData = {
          id: customerId,
          name: 'Acme Corporation'
        };
        
        localStorage.setItem('impersonationToken', localStorage.getItem('authToken'));
        localStorage.setItem('impersonation_active', 'true');
        
        // Make sure customer data is set
        if (!localStorage.getItem('impersonatedCustomer')) {
          localStorage.setItem('impersonatedCustomer', JSON.stringify(customerData));
        }
        setImpersonatedCustomer(customerData);
        
        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(mockAdminUser));
        
        setCurrentUser(mockAdminUser);
        setImpersonating(true);
        
        debugLog('Fallback impersonation applied');
        return mockAdminUser;
      }
    } catch (error) {
      console.error('Impersonation error:', error);
      throw error;
    }
  };

  // Exit impersonation
  const exitImpersonation = () => {
    debugLog('Exiting impersonation');
    
    // Try to get the original user from state first
    if (originalUser) {
      setCurrentUser(originalUser);
      localStorage.setItem('user', JSON.stringify(originalUser));
      
      setOriginalUser(null);
      setImpersonatedCustomer(null);
      localStorage.removeItem('originalUser');
    } else {
      // If original user is not in state, try to get from localStorage
      const storedOriginalUser = localStorage.getItem('originalUser');
      if (storedOriginalUser) {
        try {
          const parsedUser = JSON.parse(storedOriginalUser);
          setCurrentUser(parsedUser);
          localStorage.setItem('user', JSON.stringify(parsedUser));
          
          setOriginalUser(null);
          setImpersonatedCustomer(null);
          localStorage.removeItem('originalUser');
        } catch (parseError) {
          console.error('Error parsing original user:', parseError);
          
          // If parsing fails, fall back to token
          const token = localStorage.getItem('authToken');
          if (token && !isTokenExpired(token)) {
            try {
              const decodedToken = jwtDecode(token);
              setCurrentUser(decodedToken);
              localStorage.setItem('user', JSON.stringify(decodedToken));
            } catch (error) {
              console.error('Error restoring original user from token:', error);
              logout();
              return;
            }
          } else {
            logout();
            return;
          }
        }
      } else {
        // If no original user in localStorage, try to get from token
        const token = localStorage.getItem('authToken');
        if (token && !isTokenExpired(token)) {
          try {
            const decodedToken = jwtDecode(token);
            setCurrentUser(decodedToken);
            localStorage.setItem('user', JSON.stringify(decodedToken));
          } catch (error) {
            console.error('Error restoring original user from token:', error);
            logout();
            return;
          }
        } else {
          logout();
          return;
        }
      }
    }
    
    // Clear impersonation data
    localStorage.removeItem('impersonatedCustomer');
    localStorage.removeItem('impersonationToken');
    localStorage.removeItem('impersonation_active');
    setImpersonating(false);
    
    debugLog('Successfully exited impersonation');
  };

  // Enhanced role-based permission checking
  const hasPermission = (action) => {
    if (!currentUser || !currentUser.role) return false;
    
    const role = currentUser.role.toLowerCase();
    
    // Super admin can do anything
    if (role === 'superadmin' || role === 'super_admin') return true;
    
    // Admin can do most things except manage super admins
    if (role === 'admin') {
      return action !== 'manage_superadmin';
    }
    
    // Manager permissions
    if (role === 'manager') {
      switch(action) {
        case 'view_departments':
        case 'view_own_department':
        case 'edit_own_department':
        case 'view_employees':
        case 'add_employee':
        case 'edit_employee':
        case 'view_reviews':
        case 'create_review':
        case 'approve_review':
          return true;
          
        case 'delete_department':
        case 'manage_admin':
        case 'system_settings':
          return false;
          
        default:
          return false;
      }
    }
    
    // Employee permissions
    if (role === 'employee') {
      switch(action) {
        case 'view_own_department':
        case 'view_own_profile':
        case 'edit_own_profile':
        case 'view_own_reviews':
        case 'submit_self_assessment':
          return true;
          
        default:
          return false;
      }
    }
    
    return false;
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      isAuthenticated, 
      login, 
      logout, 
      loading,
      hasPermission,
      impersonating,
      impersonatedCustomer,
      impersonateCustomer,
      exitImpersonation
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;