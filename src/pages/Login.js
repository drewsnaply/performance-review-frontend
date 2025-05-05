import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();

  // CRITICAL: Always clear redirect flags on component mount
  useEffect(() => {
    console.log('Login component mounted, clearing any redirect flags');
    localStorage.removeItem('manual_redirect_in_progress');
    
    // Debug current auth state
    console.log('=== DEBUG AUTH STATE ON LOGIN MOUNT ===');
    console.log('token:', localStorage.getItem('authToken') ? 'exists' : 'missing');
    console.log('user:', localStorage.getItem('user'));
    console.log('========================');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      console.log('Attempting login with username:', username);

      // Use the login function from AuthContext
      const response = await login(username, password);
      console.log('Login Response:', response);

      if (!response || !response.token) {
        throw new Error('No token received from backend');
      }

      const { token, user } = response;

      // Handle direct navigation based on role
      const role = user.role ? user.role.toLowerCase() : null;
      console.log('User role:', role);
      
      if (role === 'superadmin' || role === 'super_admin') {
        console.log('Redirect: Superadmin -> /super-admin/customers');
        window.location.href = '/super-admin/customers';
      } else if (role === 'manager') {
        console.log('Redirect: Manager -> /manager/dashboard');
        window.location.href = '/manager/dashboard';
      } else {
        console.log('Redirect: Admin/Other -> /dashboard');
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error('Login error:', err);
      localStorage.removeItem('manual_redirect_in_progress');
      setError(err.message || 'Login failed. Please check your credentials.');
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