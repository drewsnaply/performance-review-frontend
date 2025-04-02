import React from 'react';
import { useAuth } from '../context/AuthContext';
import SidebarLayout from './SidebarLayout';
import { useNavigate } from 'react-router-dom';

const ImportTool = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <SidebarLayout user={currentUser} handleLogout={handleLogout} activeView="import-tool">
      <div className="import-tool-container">
        <h1>Data Import Tool</h1>
        <p>This feature is coming soon. You'll be able to import employee data and review information.</p>
        
        <div className="import-placeholder">
          <div className="placeholder-card">
            <h3>Import Employees</h3>
            <p>Upload employee data from CSV or Excel files.</p>
            <button className="placeholder-button">Coming Soon</button>
          </div>
          
          <div className="placeholder-card">
            <h3>Import Reviews</h3>
            <p>Upload historical review data from CSV or Excel files.</p>
            <button className="placeholder-button">Coming Soon</button>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default ImportTool;