import axios from 'axios';

// Determine API URL based on environment
const API_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000/api/auth'
  : 'https://performance-review-backend-ab8z.onrender.com/api/auth';

// Create axios instance with comprehensive configuration
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include credentials in the request
});

const login = async (username, password) => {
  try {
    console.log('Attempting login with:', username);
    console.log('Using API URL:', API_URL);

    const response = await api.post('/login', { username, password });
    
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
      console.error('Server error response:', error.response.data);
      throw new Error(error.response.data.message || 'Login failed');
    } else if (error.request) {
      console.error('No response from server:', error.request);
      throw new Error('No response from server. Check your connection.');
    } else {
      console.error('Error setting up request:', error.message);
      throw new Error('Error setting up login request');
    }
  }
};

const authService = {
  login,
};

export default authService;