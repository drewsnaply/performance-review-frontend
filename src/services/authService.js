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
    console.log('Detailed API Request:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      headers: config.headers,
      data: config.data,
      env: {
        API_URL: process.env.REACT_APP_API_URL,
        NODE_ENV: process.env.NODE_ENV
      }
    });
    
    return config;
  },
  (error) => {
    console.error('Request Preparation Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('Detailed API Response:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    console.error('Comprehensive API Error:', {
      response: error.response,
      request: error.request,
      message: error.message,
      config: error.config
    });
    return Promise.reject(error);
  }
);

const login = async (username, password) => {
  try {
    console.log('Attempting Login:', { username, apiUrl: API_URL });

    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    });

    console.log('Raw Fetch Response:', {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries())
    });

    const data = await response.json();

    console.log('Parsed Response Data:', data);

    if (response.ok) {
      if (data.token) {
        return {
          token: data.token,
          user: data.user
        };
      } else {
        throw new Error('No token in response');
      }
    } else {
      throw new Error(data.message || 'Login failed');
    }
  } catch (error) {
    console.error('Login Error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    throw error;
  }
};

export default {
  login,
};