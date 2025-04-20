import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Get the page the user was trying to access before logging in
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      console.log('Attempting login with:', username);

      // Use the login function from AuthContext
      const response = await login(username, password);
      console.log('Login successful, response:', response);

      // Ensure both token and user exist in the response
      const { token, user } = response;
      if (!token) {
        console.error('Token not found in the response:', response);
        throw new Error('No token received from backend');
      }

      // Decode the token to extract user details
      const decodedToken = jwtDecode(token);
      console.log('Decoded token:', decodedToken);

      // Save additional user data (role is critical here)
      console.log('Saving user to localStorage:', user);
      localStorage.setItem('user', JSON.stringify(user));

      // Check if user is a superadmin and redirect accordingly
      if (user && (user.role === 'superadmin' || user.role === 'super_admin')) {
        console.log('Superadmin detected, redirecting to Super Admin dashboard');
        
        // Use a direct browser-level redirect for superadmin
        window.location.href = '/super-admin/customers';
      } else {
        // Navigate to the dashboard or the page they were trying to access
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-header">
            <h1>Welcome Back</h1>
            {error && <p className="error-message">{error}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isLoading}
              required
            />
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>

          <div className="register-link">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="ml-2">
                Register here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;