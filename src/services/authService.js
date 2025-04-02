import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth functions
const register = async (username, email, password, role = 'employee') => {
  try {
    const response = await api.post('/register', {
      username,
      email,
      password,
      role
    });
    
    // Save token and user info to localStorage
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Registration failed');
  }
};

const login = async (username, password) => {
  try {
    const response = await api.post('/login', { username, password });
    
    // Save token and user info to localStorage
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Login failed');
  }
};

const logout = () => {
  try {
    // Clear all authentication-related storage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Optional: Clear any other application-specific storage
    localStorage.clear(); // Use cautiously if you have other important data
    
    // Return a flag to indicate successful logout
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
};

const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

const getProfile = async () => {
  try {
    const response = await api.get('/me');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to fetch profile');
  }
};

export default {
  register,
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
  getProfile,
  api
};