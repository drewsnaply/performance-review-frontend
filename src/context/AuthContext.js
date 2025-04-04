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

  // Function to check if token is expired
  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp < Date.now() / 1000;
    } catch (error) {
      return true;
    }
  };

  // Restore authentication on page load
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('authToken');
      
      if (token) {
        try {
          // Check if token is expired
          if (isTokenExpired(token)) {
            console.log('Token expired, logging out');
            localStorage.removeItem('authToken');
            setCurrentUser(null);
            setIsAuthenticated(false);
            // Don't automatically redirect if on login page when token is expired
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
          console.error('Error decoding token:', error);
          localStorage.removeItem('authToken');
          setCurrentUser(null);
          setIsAuthenticated(false);
          window.location.replace('/login');
        }
      } else {
        // No token found, ensure user is not authenticated
        setCurrentUser(null);
        setIsAuthenticated(false);
        
        // If not on login or register page, redirect to login
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
      console.log('Decoded token after login:', decodedToken);

      setCurrentUser(decodedToken);
      setIsAuthenticated(true);
      return { token, user: decodedToken };
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  };

  const logout = async () => {
    console.error('LOGOUT CALLED - AuthContext');
    
    try {
      // Remove authentication token
      localStorage.removeItem('authToken');
      console.log('Token removed from localStorage');
      
      // Clear all local storage to remove any sensitive data
      localStorage.clear();
      console.log('Local storage cleared');
      sessionStorage.clear();
      console.log('Session storage cleared');
      
      // Reset context state IMMEDIATELY
      setCurrentUser(null);
      setIsAuthenticated(false);
      console.log('Context state reset');

      // Force full page reload to login
      window.location.replace('/login');
    } catch (error) {
      console.error('Comprehensive logout error:', error);
      window.location.replace('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, login, logout, loading }}>
      {!loading ? children : <div>Loading authentication...</div>}
    </AuthContext.Provider>
  );
};

export default AuthContext;