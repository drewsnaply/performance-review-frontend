import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaBuilding, 
  FaUsers, 
  FaUserShield, 
  FaCog, 
  FaChartLine, 
  FaClipboardList,
  FaHome
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

function SuperAdminSidebar({ activeView, setActiveView }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { impersonating } = useAuth();
  
  // Check if current path matches the given path
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };
  
  // Navigate and update active view
  const handleNavigation = (route) => {
    navigate(route);
    if (typeof setActiveView === 'function') {
      setActiveView('super-admin');
    }
  };
  
  return (
    <>
      <div className="sidebar-section">
        <div className="sidebar-heading">SUPER ADMIN</div>
        
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); handleNavigation('/super-admin/customers'); }}
          className={`sidebar-item ${isActive('/super-admin/customers') ? 'active' : ''}`}
          data-title="Organizations"
        >
          <div className="sidebar-icon"><FaBuilding /></div>
          <div className="sidebar-text">Organizations</div>
        </a>
        
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); handleNavigation('/super-admin/users'); }}
          className={`sidebar-item ${isActive('/super-admin/users') ? 'active' : ''}`}
          data-title="User Management"
        >
          <div className="sidebar-icon"><FaUsers /></div>
          <div className="sidebar-text">User Management</div>
        </a>
        
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); handleNavigation('/super-admin/sessions'); }}
          className={`sidebar-item ${isActive('/super-admin/sessions') ? 'active' : ''}`}
          data-title="Active Sessions"
        >
          <div className="sidebar-icon"><FaUserShield /></div>
          <div className="sidebar-text">Active Sessions</div>
        </a>
        
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); handleNavigation('/super-admin/analytics'); }}
          className={`sidebar-item ${isActive('/super-admin/analytics') ? 'active' : ''}`}
          data-title="System Analytics"
        >
          <div className="sidebar-icon"><FaChartLine /></div>
          <div className="sidebar-text">System Analytics</div>
        </a>
        
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); handleNavigation('/super-admin/logs'); }}
          className={`sidebar-item ${isActive('/super-admin/logs') ? 'active' : ''}`}
          data-title="System Logs"
        >
          <div className="sidebar-icon"><FaClipboardList /></div>
          <div className="sidebar-text">System Logs</div>
        </a>
        
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); handleNavigation('/super-admin/settings'); }}
          className={`sidebar-item ${isActive('/super-admin/settings') ? 'active' : ''}`}
          data-title="System Settings"
        >
          <div className="sidebar-icon"><FaCog /></div>
          <div className="sidebar-text">System Settings</div>
        </a>
      </div>
      
      {/* Only show the Return to Dashboard option when impersonating */}
      {impersonating && (
        <div className="sidebar-section">
          <div className="sidebar-heading">NAVIGATION</div>
          
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); handleNavigation('/dashboard'); }}
            className={`sidebar-item ${isActive('/dashboard') ? 'active' : ''}`}
            data-title="Return to Dashboard"
          >
            <div className="sidebar-icon"><FaHome /></div>
            <div className="sidebar-text">Return to Dashboard</div>
          </a>
        </div>
      )}
    </>
  );
}

export default SuperAdminSidebar;