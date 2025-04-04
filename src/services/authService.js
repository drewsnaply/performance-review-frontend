import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://performance-review-backend.onrender.com/api/auth';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'https://performance-review-frontend.onrender.com'
  },
  withCredentials: true,
  timeout: 10000 // 10 second timeout
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

const login = async (username, password) => {
  try {
    const response = await api.post('/login', { username, password });
    console.log('Login Response:', response.data);

    if (response.data && response.data.token) {
      return {
        token: response.data.token,
        user: response.data.user
      };
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    console.error('Login Error:', {
      response: error.response?.data,
      message: error.message
    });
    
    // More detailed error handling
    if (error.response) {
      // The request was made and the server responded with a status code
      throw new Error(error.response.data.message || 'Login failed');
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response received from server');
    } else {
      // Something happened in setting up the request
      throw new Error('Error preparing login request');
    }
  }
};

export default {
  login,
};