import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  MdDashboard, 
  MdDescription, 
  MdPeople, 
  MdPerson, 
  MdDateRange,
  MdPendingActions 
} from 'react-icons/md';

// Remove incorrect CSS import
// import '../styles/SidebarLayout.css';

const ManagerSidebar = ({ collapsed }) => {
  const location = useLocation();
  
  // Improved active path detection
  const isActivePath = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="sidebar-nav">
      <div className="nav-item">
        <NavLink 
          to="/manager/dashboard" 
          className={isActivePath('/manager/dashboard') ? 'active' : ''}
        >
          <span className="nav-icon"><MdDashboard /></span>
          <span className={`nav-text ${collapsed ? 'hidden' : ''}`}>Dashboard</span>
        </NavLink>
      </div>
      
      <div className="nav-item">
        <NavLink 
          to="/manager/my-reviews" 
          className={isActivePath('/manager/my-reviews') ? 'active' : ''}
        >
          <span className="nav-icon"><MdDescription /></span>
          <span className={`nav-text ${collapsed ? 'hidden' : ''}`}>My Reviews</span>
        </NavLink>
      </div>
      
      <div className={`section-header ${collapsed ? 'hidden' : ''}`}>
        TEAM MANAGEMENT
      </div>
      
      <div className="nav-item">
        <NavLink 
          to="/manager/team-reviews" 
          className={isActivePath('/manager/team-reviews') ? 'active' : ''}
        >
          <span className="nav-icon"><MdPeople /></span>
          <span className={`nav-text ${collapsed ? 'hidden' : ''}`}>Team Reviews</span>
        </NavLink>
      </div>
      
      <div className="nav-item">
        <NavLink 
          to="/manager/team-members" 
          className={isActivePath('/manager/team-members') ? 'active' : ''}
        >
          <span className="nav-icon"><MdPerson /></span>
          <span className={`nav-text ${collapsed ? 'hidden' : ''}`}>Team Members</span>
        </NavLink>
      </div>
      
      <div className="nav-item">
        <NavLink 
          to="/manager/pending-reviews" 
          className={isActivePath('/manager/pending-reviews') ? 'active' : ''}
        >
          <span className="nav-icon"><MdPendingActions /></span>
          <span className={`nav-text ${collapsed ? 'hidden' : ''}`}>Pending Reviews</span>
        </NavLink>
      </div>
      
      <div className={`section-header ${collapsed ? 'hidden' : ''}`}>
        REVIEW MANAGEMENT
      </div>
      
      <div className="nav-item">
        <NavLink 
          to="/manager/review-cycles" 
          className={isActivePath('/manager/review-cycles') ? 'active' : ''}
        >
          <span className="nav-icon"><MdDateRange /></span>
          <span className={`nav-text ${collapsed ? 'hidden' : ''}`}>Review Cycles</span>
        </NavLink>
      </div>
      {/* Templates option removed for managers */}
    </nav>
  );
};

export default ManagerSidebar;