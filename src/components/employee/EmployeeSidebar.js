import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  MdDashboard, 
  MdDescription, 
  MdFeedback, 
  MdPerson
} from 'react-icons/md';

// Remove incorrect CSS import
// import '../styles/SidebarLayout.css';

const EmployeeSidebar = ({ collapsed }) => {
  const location = useLocation();
  
  // Improved active path detection
  const isActivePath = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="sidebar-nav">
      <div className="nav-item">
        <NavLink 
          to="/employee/dashboard" 
          className={isActivePath('/employee/dashboard') ? 'active' : ''}
        >
          <span className="nav-icon"><MdDashboard /></span>
          <span className={`nav-text ${collapsed ? 'hidden' : ''}`}>Dashboard</span>
        </NavLink>
      </div>
      
      <div className="nav-item">
        <NavLink 
          to="/employee/my-reviews" 
          className={isActivePath('/employee/my-reviews') ? 'active' : ''}
        >
          <span className="nav-icon"><MdDescription /></span>
          <span className={`nav-text ${collapsed ? 'hidden' : ''}`}>My Reviews</span>
        </NavLink>
      </div>
      
      <div className={`section-header ${collapsed ? 'hidden' : ''}`}>
        FEEDBACK
      </div>
      
      <div className="nav-item">
        <NavLink 
          to="/employee/provide-feedback" 
          className={isActivePath('/employee/provide-feedback') ? 'active' : ''}
        >
          <span className="nav-icon"><MdFeedback /></span>
          <span className={`nav-text ${collapsed ? 'hidden' : ''}`}>Provide Feedback</span>
        </NavLink>
      </div>
      
      <div className="nav-item">
        <NavLink 
          to="/employee/profile" 
          className={isActivePath('/employee/profile') ? 'active' : ''}
        >
          <span className="nav-icon"><MdPerson /></span>
          <span className={`nav-text ${collapsed ? 'hidden' : ''}`}>My Profile</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default EmployeeSidebar;