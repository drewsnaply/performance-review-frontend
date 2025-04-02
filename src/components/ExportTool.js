import React from 'react';
import { useAuth } from '../context/AuthContext';
import SidebarLayout from './SidebarLayout';
import { useNavigate } from 'react-router-dom';

const ExportTool = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <SidebarLayout user={currentUser} handleLogout={handleLogout} activeView="export-tool">
      <div className="export-tool-container">
        <h1>Data Export Tool</h1>
        <p>This feature is coming soon. You'll be able to export employee data and review information.</p>
        
        <div className="export-placeholder">
          <div className="placeholder-card">
            <h3>Export Employees</h3>
            <p>Download employee data as CSV or Excel files.</p>
            <button className="placeholder-button">Coming Soon</button>
          </div>
          
          <div className="placeholder-card">
            <h3>Export Reviews</h3>
            <p>Download review data as CSV or Excel files.</p>
            <button className="placeholder-button">Coming Soon</button>
          </div>
          
          <div className="placeholder-card">
            <h3>Export Reports</h3>
            <p>Generate and download performance reports in various formats.</p>
            <button className="placeholder-button">Coming Soon</button>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default ExportTool;