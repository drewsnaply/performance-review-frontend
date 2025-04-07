import React, { createContext, useState, useContext, useEffect } from 'react';
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
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp < Date.now() / 1000;
    } catch (error) {
      console.error('Token decoding error:', error);
      return true;
    }
  };

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('authToken');
      
      if (token) {
        try {
          if (isTokenExpired(token)) {
            console.log('Token expired, logging out');
            localStorage.removeItem('authToken');
            setCurrentUser(null);
            setIsAuthenticated(false);
            if (window.location.pathname !== '/login') {
              window.location.replace('/login');
            }
          } else {
            const decodedToken = jwtDecode(token);
            console.log('Restored user from token:', decodedToken);
            setCurrentUser(decodedToken);
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('Authentication check error:', error);
          localStorage.removeItem('authToken');
          setCurrentUser(null);
          setIsAuthenticated(false);
          window.location.replace('/login');
        }
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
        
        if (
          window.location.pathname !== '/login' && 
          window.location.pathname !== '/register'
        ) {
          window.location.replace('/login');
        }
      }
      
      setLoading(false);
    };
    
    checkAuthStatus();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await AuthService.login(username, password);
      const { token } = response;

      if (!token) {
        throw new Error('No token received from backend');
      }

      localStorage.setItem('authToken', token);
      const decodedToken = jwtDecode(token);
      
      setCurrentUser(decodedToken);
      setIsAuthenticated(true);
      
      return { token, user: decodedToken };
    } catch (err) {
      console.error('Login context error:', err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setCurrentUser(null);
    setIsAuthenticated(false);
    window.location.replace('/login');
  };

  // Enhanced role-based permission checking
  const hasPermission = (action) => {
    if (!currentUser || !currentUser.role) return false;
    
    const role = currentUser.role.toLowerCase();
    
    // Super admin can do anything
    if (role === 'superadmin') return true;
    
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
      hasPermission 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;