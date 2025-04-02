import React, { createContext, useState, useContext, useEffect } from 'react';
import AuthService from '../services/authService';

// Create the context
const AuthContext = createContext(null);

// Export custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state on component mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = AuthService.getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError('Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      setError(null);
      const response = await AuthService.login(username, password);
      setCurrentUser(response.user);
      return response.user;
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  // Registration function
  const register = async (username, email, password, role = 'employee') => {
    try {
      setError(null);
      const response = await AuthService.register(username, email, password, role);
      setCurrentUser(response.user);
      return response.user;
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  // Logout function
  const logout = () => {
    try {
      const logoutResult = AuthService.logout();
      setCurrentUser(null);
      
      if (logoutResult) {
        // Force navigation
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Context logout error:', error);
    }
  };

  // Context value
  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    loading,
    error,
    login,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <div>Loading authentication...</div>}
    </AuthContext.Provider>
  );
};

export default AuthContext;