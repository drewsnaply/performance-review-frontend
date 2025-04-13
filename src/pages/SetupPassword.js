import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaLock, FaCheckCircle } from 'react-icons/fa';

function SetupPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { token } = useParams();
  const navigate = useNavigate();
  
  const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : 'https://performance-review-backend-ab8z.onrender.com';
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate password
    if (password.length < 8) {
      return setError('Password must be at least 8 characters long');
    }
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/setup-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, password })
      });
      
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to setup password');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (success) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', maxWidth: '450px', width: '100%', textAlign: 'center' }}>
          <FaCheckCircle style={{ color: '#10b981', fontSize: '48px', marginBottom: '16px' }} />
          <h2 style={{ margin: '0 0 16px 0', color: '#111827', fontSize: '24px' }}>Password Setup Complete</h2>
          <p style={{ margin: '0 0 24px 0', color: '#4b5563' }}>
            Your password has been set successfully. You will be redirected to the login page shortly.
          </p>
          <Link to="/login" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: '500' }}>
            Login Now
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', maxWidth: '450px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <FaLock style={{ color: '#6366f1', fontSize: '48px', marginBottom: '16px' }} />
          <h2 style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '24px' }}>Set Your Password</h2>
          <p style={{ margin: '0', color: '#6b7280', fontSize: '16px' }}>Create a secure password for your account</p>
        </div>
        
        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '4px', marginBottom: '16px' }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#4b5563' }}>New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '16px' }}
              placeholder="Enter your new password"
            />
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#4b5563' }}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '16px' }}
              placeholder="Confirm your new password"
            />
          </div>
          
          <button 
            type="submit" 
            style={{ 
              width: '100%', 
              padding: '12px', 
              backgroundColor: '#6366f1', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              fontWeight: '500', 
              fontSize: '16px',
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1
            }}
            disabled={loading}
          >
            {loading ? 'Setting up...' : 'Set Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SetupPassword;