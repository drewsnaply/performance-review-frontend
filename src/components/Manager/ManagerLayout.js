import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ManagerSidebar from './ManagerSidebar';

const ManagerLayout = ({ children }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  
  // Ensure user is a manager
  useEffect(() => {
    const checkUserRole = () => {
      // Get role from localStorage to ensure persistence after refresh
      const storedUserData = localStorage.getItem('userData');
      let role = '';
      
      if (storedUserData) {
        try {
          const userData = JSON.parse(storedUserData);
          role = userData.role || '';
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
      
      // If currentUser is available, use its role
      if (currentUser && currentUser.role) {
        role = currentUser.role;
      }
      
      // If not manager, redirect to appropriate dashboard
      if (role !== 'manager') {
        if (role === 'admin') {
          navigate('/admin/dashboard');
        } else if (role === 'employee') {
          navigate('/employee/dashboard');
        } else {
          navigate('/login');
        }
      }
      
      // Force role to be manager in localStorage to prevent UI changes
      if (role === 'manager' && storedUserData) {
        try {
          const userData = JSON.parse(storedUserData);
          userData.role = 'manager';
          localStorage.setItem('userData', JSON.stringify(userData));
        } catch (error) {
          console.error('Error updating user data:', error);
        }
      }
    };
    
    checkUserRole();
  }, [currentUser, navigate]);
  
  return (
    <div className="app-container">
      <ManagerSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className={`main-content ${collapsed ? 'expanded' : ''}`}>
        {children}
      </main>
      
      <style jsx>{`
        .app-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        
        .main-content {
          margin-left: 240px;
          padding: 20px;
          transition: margin-left 0.3s;
          flex: 1;
        }
        
        .main-content.expanded {
          margin-left: 60px;
        }
      `}</style>
    </div>
  );
};

export default ManagerLayout;