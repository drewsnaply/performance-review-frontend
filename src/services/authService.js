import axios from 'axios';

// Determine API URL based on environment
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://performance-review-backend.onrender.com/api/auth'
  : 'http://localhost:5000/api/auth';

// Create axios instance with comprehensive configuration
const api = axios.create({
  baseURL: API_URL,
  withCredentials: false,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  }
});

const login = async (username, password) => {
  try {
    console.log('Attempting login with:', username);
    console.log('Using API URL:', API_URL);

    const response = await api.post('/login', { username, password }, {
      // Additional axios config for CORS
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
    
    if (response.data && response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      
      return {
        token: response.data.token,
        user: response.data.user
      };
    } else {
      throw new Error('Invalid credentials');
    }
  } catch (error) {
    console.error('Full login error:', error);
    
    if (error.response) {
      // Server responded with an error
      console.error('Server error response:', error.response.data);
      throw new Error(error.response.data.message || 'Login failed');
    } else if (error.request) {
      // Request made but no response received
      console.error('No response from server:', error.request);
      throw new Error('No response from server. Check your connection.');
    } else {
      // Error setting up the request
      console.error('Error setting up request:', error.message);
      throw new Error('Error setting up login request');
    }
  }
};

const authService = {
  login,
};

export default authService;