import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // Get the page they were trying to access (if any)
  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // Add this console log
      console.log('Attempting login with:', username, password);
      
      // Use the login method from AuthContext
      const user = await login(username, password);
      
      // Add this console log
      console.log('Login response:', user);
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotCredentials = (e) => {
    e.preventDefault();
    alert('Forgot credentials functionality to be implemented');
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
          
          <div className="form-actions">
            <button 
              type="button" 
              className="forgot-link"
              onClick={handleForgotCredentials}
            >
              Forgot Username/Password?
            </button>
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>

          <div className="register-link">
            <p>
              Don't have an account? 
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