import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://performance-review-backend.onrender.com/api/auth';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
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
    console.error('Login error:', error.response ? error.response.data : error);
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export default {
  login,
};