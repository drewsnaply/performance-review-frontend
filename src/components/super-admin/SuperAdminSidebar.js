import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaBuilding, 
  FaUsers, 
  FaUserShield, 
  FaCog, 
  FaChartLine, 
  FaClipboardList,
  FaHome
} from 'react-icons/fa';

function SuperAdminSidebar({ activeView, setActiveView }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if current path matches the given path
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };
  
  // Navigate and update active view
  const navigateTo = (route) => {
    navigate(route);
    if (typeof setActiveView === 'function') {
      setActiveView('super-admin');
    }
  };
  
  return (
    <nav className="sidebar-menu">
      <div className="sidebar-heading">SUPER ADMIN</div>
      
      <button 
        className={isActive('/super-admin/customers') ? 'active' : ''}
        onClick={() => navigateTo('/super-admin/customers')}
      >
        <span className="sidebar-icon"><FaBuilding /></span>
        Organizations
      </button>
      
      <button 
        className={isActive('/super-admin/users') ? 'active' : ''}
        onClick={() => navigateTo('/super-admin/users')}
      >
        <span className="sidebar-icon"><FaUsers /></span>
        User Management
      </button>
      
      <button 
        className={isActive('/super-admin/sessions') ? 'active' : ''}
        onClick={() => navigateTo('/super-admin/sessions')}
      >
        <span className="sidebar-icon"><FaUserShield /></span>
        Active Sessions
      </button>
      
      <button 
        className={isActive('/super-admin/analytics') ? 'active' : ''}
        onClick={() => navigateTo('/super-admin/analytics')}
      >
        <span className="sidebar-icon"><FaChartLine /></span>
        System Analytics
      </button>
      
      <button 
        className={isActive('/super-admin/logs') ? 'active' : ''}
        onClick={() => navigateTo('/super-admin/logs')}
      >
        <span className="sidebar-icon"><FaClipboardList /></span>
        System Logs
      </button>
      
      <button 
        className={isActive('/super-admin/settings') ? 'active' : ''}
        onClick={() => navigateTo('/super-admin/settings')}
      >
        <span className="sidebar-icon"><FaCog /></span>
        System Settings
      </button>
      
      <div className="sidebar-heading">NAVIGATION</div>
      
      <button 
        onClick={() => navigateTo('/dashboard')}
      >
        <span className="sidebar-icon"><FaHome /></span>
        Return to Dashboard
      </button>
    </nav>
  );
}

export default SuperAdminSidebar;