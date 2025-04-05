import axios from 'axios';

// IMPORTANT: Make sure this points to your deployed backend
const API_URL = process.env.REACT_APP_API_URL || 'https://performance-review-backend.onrender.com/api/auth';

console.log('Using API URL:', API_URL); // Debug URL being used

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Disabling this as it may cause issues with Render
  withCredentials: false,
  timeout: 60000 // Increased timeout for very slow response on Render free tier (60 seconds)
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
      headers: config.headers
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
    console.log('Attempting login with:', username, API_URL);
    
    // First check if the backend is available - Render free tier spins down with inactivity
    try {
      // Extract base URL to ping the root endpoint first
      const baseUrl = API_URL.split('/api/auth')[0];
      console.log('Checking if backend is available at:', baseUrl);
      
      const pingResponse = await fetch(baseUrl, { 
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        // Don't include credentials for the ping test
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000
      });
      
      console.log('Backend status check:', {
        available: pingResponse.ok,
        status: pingResponse.status
      });
    } catch (pingError) {
      console.warn('Backend may be starting up:', pingError.message);
      // Continue anyway, we just want to log this
    }
    
    // Try a direct fetch with more verbose error handling
    console.log('Attempting Login:', { username });
    
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      // Don't include credentials - can cause CORS issues with Render
      body: JSON.stringify({ username, password })
    });
    
    console.log('Raw Fetch Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    // Check for empty response
    const text = await response.text();
    console.log('Raw response text length:', text.length);
    
    if (!text || text.trim() === '') {
      console.error('Empty response received from server');
      
      if (response.status === 200) {
        // Server returned success but empty body - Render free tier issue
        // We can attempt to create a mock response with default values
        console.log('Creating mock response due to empty server response');
        
        // This is a temporary workaround for empty responses from Render
        // In production, you should fix the backend to always return proper responses
        const mockToken = localStorage.getItem('authToken');
        if (mockToken) {
          console.log('Using existing token from localStorage due to empty response');
          // If we already have a token, use that as a temporary solution
          return {
            token: mockToken,
            user: { username }
          };
        } else {
          throw new Error('Server returned empty response and no existing token found. Try again in 30 seconds - server may be waking up.');
        }
      } else {
        // Non-200 status with empty body
        throw new Error(`Server returned ${response.status} with empty response`);
      }
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
    
    // Provide a more user-friendly message for Render free tier issues
    if (error.message.includes('empty response') || 
        error.message.includes('Failed to fetch') ||
        error.message.includes('NetworkError')) {
      throw new Error('Server may be starting up (Render free tier). Please wait 30 seconds and try again.');
    }
    
    throw error;
  }
};

export default {
  login,
};