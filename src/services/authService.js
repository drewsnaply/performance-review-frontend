import axios from 'axios';

// IMPORTANT: Make sure this points to your deployed backend
const API_URL = process.env.REACT_APP_API_URL || 'https://performance-review-backend.onrender.com/api/auth';

console.log('Using API URL:', API_URL); // Debug URL being used

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000 // Increased timeout for slower response on Render free tier
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log('API Request:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      headers: config.headers,
      data: config.data
    });
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error Details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

const login = async (username, password) => {
  try {
    console.log('Attempting Login:', { username });
    
    // Try a direct raw fetch first with better error handling
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });
    
    console.log('Raw Fetch Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    // Check for empty response
    const text = await response.text();
    console.log('Raw response text:', text);
    
    if (!text || text.trim() === '') {
      throw new Error('Empty response from server');
    }
    
    // Parse JSON manually after checking it's not empty
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('JSON Parse Error:', e, 'Raw Text:', text);
      throw new Error(`Failed to parse server response: ${e.message}`);
    }
    
    console.log('Parsed Login Response:', data);
    
    if (data && data.token) {
      return {
        token: data.token,
        user: data.user
      };
    } else {
      throw new Error('Invalid response: No token received');
    }
  } catch (error) {
    console.error('Login Error:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    throw error;
  }
};

export default {
  login,
};