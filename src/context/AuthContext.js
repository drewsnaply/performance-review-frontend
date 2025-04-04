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

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      isAuthenticated, 
      login, 
      logout, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;