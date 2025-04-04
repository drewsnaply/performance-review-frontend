import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://performance-review-backend.onrender.com/api/auth';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000 // Increased timeout
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Log full request details
    console.log('Full API Request Configuration:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      headers: config.headers,
      env: {
        API_URL: process.env.REACT_APP_API_URL,
        NODE_ENV: process.env.NODE_ENV
      }
    });
    
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('Request Preparation Error:', error);
    return Promise.reject(error);
  }
);

const login = async (username, password) => {
  try {
    console.log('Login Attempt:', {
      username,
      apiUrl: API_URL
    });

    const response = await api.post('/login', { 
      username, 
      password 
    }, {
      // Additional axios config
      validateStatus: function (status) {
        return status >= 200 && status < 500; // Reject only if status is 500 or above
      }
    });

    console.log('Raw Login Response:', response);

    // More robust response handling
    if (response.status === 200 && response.data && response.data.token) {
      return {
        token: response.data.token,
        user: response.data.user
      };
    } else {
      console.error('Unexpected Response:', response);
      throw new Error(response.data?.message || 'Unexpected server response');
    }
  } catch (error) {
    console.error('Comprehensive Login Error:', {
      name: error.name,
      message: error.message,
      response: error.response,
      request: error.request,
      config: error.config
    });

    if (error.response) {
      // The request was made and the server responded with a status code
      throw new Error(error.response.data.message || 'Login failed');
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response received from server');
    } else {
      // Something happened in setting up the request
      throw new Error('Error preparing login request: ' + error.message);
    }
  }
};

export default {
  login,
};