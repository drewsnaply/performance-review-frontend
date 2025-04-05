// src/services/authService.js
import axios from 'axios';

// Determine API URL based on environment
const API_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000/api/auth'
  : 'https://performance-review-backend.onrender.com/api/auth';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  withCredentials: false, // Set to true if using cookies/sessions
  headers: {
    'Content-Type': 'application/json',
  }
});

const login = async (username, password) => {
  try {
    console.log('Attempting login with:', username);
    console.log('Using API URL:', API_URL);

    const response = await api.post('/login', { username, password });
    
    if (response.data && response.data.token) {
      // Store token and user info
      localStorage.setItem('authToken', response.data.token);
      
      return {
        token: response.data.token,
        user: response.data.user
      };
    } else {
      throw new Error('Invalid credentials');
    }
  } catch (error) {
    console.error('Login Error:', error.response ? error.response.data : error.message);
    
    // More detailed error handling
    if (error.response) {
      // The request was made and the server responded with a status code
      throw new Error(error.response.data.message || 'Login failed');
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response from server. Check your connection.');
    } else {
      // Something happened in setting up the request
      throw new Error('Error setting up login request');
    }
  }
};

const authService = {
  login,
};

export default authService;