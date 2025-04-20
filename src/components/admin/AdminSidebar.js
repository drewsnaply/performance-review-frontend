import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MdDashboard, 
  MdPeople, 
  MdSettings, 
  MdDateRange,
  MdInsights,
  MdBarChart,
  MdDescription,
  MdAssignment,
  MdTimer,
  MdImportExport,
  MdAnalytics,
  MdTrendingUp,
  MdPerson,
  MdList,
  MdFormatListBulleted,
  MdAccessTime,
  MdNotificationsActive
} from 'react-icons/md';
import { 
  FaUsers, 
  FaChartBar, 
  FaCog, 
  FaClipboardList,
  FaClipboardCheck,
  FaRegCalendarAlt,
  FaCalculator,
  FaFileAlt,
  FaUserTie
} from 'react-icons/fa';

const AdminSidebar = ({ activeView, setActiveView, collapsed }) => {
  // Helper function to check if a view is active
  const isActive = (view) => activeView === view;
  
  // Set active view and update URL
  const handleNavigation = (view) => {
    if (setActiveView) {
      setActiveView(view);
    }
  };

  // Icon gradient colors
  const iconGradients = {
    dashboard: { start: '#6366f1', end: '#818cf8' },
    team: { start: '#8b5cf6', end: '#a78bfa' },
    employees: { start: '#0ea5e9', end: '#38bdf8' },
    myReviews: { start: '#0d9488', end: '#14b8a6' },
    settings: { start: '#64748b', end: '#94a3b8' },
    cycles: { start: '#0ea5e9', end: '#38bdf8' },
    templates: { start: '#10b981', end: '#34d399' },
    assignments: { start: '#f97316', end: '#fb923c' },
    kpi: { start: '#eab308', end: '#facc15' },
    pending: { start: '#ef4444', end: '#f87171' },
    tools: { start: '#4338ca', end: '#6366f1' },
    reports: { start: '#b45309', end: '#f59e0b' },
    analytics: { start: '#7e22ce', end: '#a855f7' },
    schedule: { start: '#9333ea', end: '#a855f7' }
  };

  // Create SVG gradient definitions
  const renderGradientDefs = () => (
    <svg width="0" height="0" className="hidden">
      <defs>
        {Object.keys(iconGradients).map(key => (
          <linearGradient key={key} id={`${key}Gradient`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={iconGradients[key].start} />
            <stop offset="100%" stopColor={iconGradients[key].end} />
          </linearGradient>
        ))}
      </defs>
    </svg>
  );

  return (
    <div className="sidebar-menu admin-sidebar">
      {renderGradientDefs()}
      
      <div className="sidebar-section">
        <h3 className="sidebar-heading">MAIN</h3>
        
        <Link 
          to="/dashboard" 
          className={`sidebar-item ${isActive('/dashboard') ? 'active' : ''}`}
          onClick={() => handleNavigation('/dashboard')}
          data-title="Dashboard"
        >
          <span className="sidebar-icon" style={{ fill: 'url(#dashboardGradient)' }}>
            <MdDashboard />
          </span>
          <span className="sidebar-text">Dashboard</span>
        </Link>
      
        <Link 
          to="/team-reviews" 
          className={`sidebar-item ${isActive('/team-reviews') ? 'active' : ''}`}
          onClick={() => handleNavigation('/team-reviews')}
          data-title="Team Reviews"
        >
          <span className="sidebar-icon" style={{ fill: 'url(#teamGradient)' }}>
            <FaUsers />
          </span>
          <span className="sidebar-text">Team Reviews</span>
        </Link>
        
        <Link 
          to="/employees" 
          className={`sidebar-item ${isActive('/employees') ? 'active' : ''}`}
          onClick={() => handleNavigation('/employees')}
          data-title="Employees"
        >
          <span className="sidebar-icon" style={{ fill: 'url(#employeesGradient)' }}>
            <MdPeople />
          </span>
          <span className="sidebar-text">Employees</span>
        </Link>
        
        <Link 
          to="/my-reviews" 
          className={`sidebar-item ${isActive('/my-reviews') ? 'active' : ''}`}
          onClick={() => handleNavigation('/my-reviews')}
          data-title="My Reviews"
        >
          <span className="sidebar-icon" style={{ fill: 'url(#myReviewsGradient)' }}>
            <FaClipboardCheck />
          </span>
          <span className="sidebar-text">My Reviews</span>
        </Link>
      </div>
      
      <div className="sidebar-section">
        <h3 className="sidebar-heading">MANAGEMENT</h3>
        
        <Link 
          to="/schedule" 
          className={`sidebar-item ${isActive('/schedule') ? 'active' : ''}`}
          onClick={() => handleNavigation('/schedule')}
          data-title="Schedule"
        >
          <span className="sidebar-icon" style={{ fill: 'url(#scheduleGradient)' }}>
            <FaRegCalendarAlt />
          </span>
          <span className="sidebar-text">Schedule</span>
        </Link>
        
        <Link 
          to="/review-cycles" 
          className={`sidebar-item ${isActive('/review-cycles') ? 'active' : ''}`}
          onClick={() => handleNavigation('/review-cycles')}
          data-title="Review Cycles"
        >
          <span className="sidebar-icon" style={{ fill: 'url(#cyclesGradient)' }}>
            <MdTimer />
          </span>
          <span className="sidebar-text">Review Cycles</span>
        </Link>
        
        <Link 
          to="/template-assignments" 
          className={`sidebar-item ${isActive('/template-assignments') ? 'active' : ''}`}
          onClick={() => handleNavigation('/template-assignments')}
          data-title="Template Assignments"
        >
          <span className="sidebar-icon" style={{ fill: 'url(#assignmentsGradient)' }}>
            <MdAssignment />
          </span>
          <span className="sidebar-text">Template Assignments</span>
        </Link>
        
        <Link 
          to="/pending-reviews" 
          className={`sidebar-item ${isActive('/pending-reviews') ? 'active' : ''}`}
          onClick={() => handleNavigation('/pending-reviews')}
          data-title="Pending Reviews"
        >
          <span className="sidebar-icon" style={{ fill: 'url(#pendingGradient)' }}>
            <MdNotificationsActive />
          </span>
          <span className="sidebar-text">Pending Reviews</span>
          <span className="badge">4</span>
        </Link>
      </div>
      
      <div className="sidebar-section">
        <h3 className="sidebar-heading">REPORTING</h3>
        
        <Link 
          to="/metrics" 
          className={`sidebar-item ${isActive('/metrics') ? 'active' : ''}`}
          onClick={() => handleNavigation('/metrics')}
          data-title="Metrics"
        >
          <span className="sidebar-icon" style={{ fill: 'url(#kpiGradient)' }}>
            <FaCalculator />
          </span>
          <span className="sidebar-text">Metrics</span>
        </Link>
        
        <Link 
          to="/reports" 
          className={`sidebar-item ${isActive('/reports') ? 'active' : ''}`}
          onClick={() => handleNavigation('/reports')}
          data-title="Reports"
        >
          <span className="sidebar-icon" style={{ fill: 'url(#reportsGradient)' }}>
            <MdBarChart />
          </span>
          <span className="sidebar-text">Reports</span>
        </Link>
        
        <Link 
          to="/analytics" 
          className={`sidebar-item ${isActive('/analytics') ? 'active' : ''}`}
          onClick={() => handleNavigation('/analytics')}
          data-title="Analytics"
        >
          <span className="sidebar-icon" style={{ fill: 'url(#analyticsGradient)' }}>
            <MdAnalytics />
          </span>
          <span className="sidebar-text">Analytics</span>
        </Link>
        
        <Link 
          to="/kpi-management" 
          className={`sidebar-item ${isActive('/kpi-management') ? 'active' : ''}`}
          onClick={() => handleNavigation('/kpi-management')}
          data-title="KPI Management"
        >
          <span className="sidebar-icon" style={{ fill: 'url(#kpiGradient)' }}>
            <MdTrendingUp />
          </span>
          <span className="sidebar-text">KPI Management</span>
        </Link>
      </div>
      
      <div className="sidebar-section">
        <h3 className="sidebar-heading">CONFIGURATION</h3>
        
        <Link 
          to="/templates" 
          className={`sidebar-item ${isActive('/templates') ? 'active' : ''}`}
          onClick={() => handleNavigation('/templates')}
          data-title="Templates"
        >
          <span className="sidebar-icon" style={{ fill: 'url(#templatesGradient)' }}>
            <FaFileAlt />
          </span>
          <span className="sidebar-text">Templates</span>
        </Link>
        
        <Link 
          to="/review-templates" 
          className={`sidebar-item ${isActive('/review-templates') ? 'active' : ''}`}
          onClick={() => handleNavigation('/review-templates')}
          data-title="Review Templates"
        >
          <span className="sidebar-icon" style={{ fill: 'url(#templatesGradient)' }}>
            <MdDescription />
          </span>
          <span className="sidebar-text">Review Templates</span>
        </Link>
        
        <Link 
          to="/data-import" 
          className={`sidebar-item ${isActive('/data-import') ? 'active' : ''}`}
          onClick={() => handleNavigation('/data-import')}
          data-title="Import/Export"
        >
          <span className="sidebar-icon" style={{ fill: 'url(#toolsGradient)' }}>
            <MdImportExport />
          </span>
          <span className="sidebar-text">Import/Export</span>
        </Link>
        
        <Link 
          to="/settings" 
          className={`sidebar-item ${isActive('/settings') ? 'active' : ''}`}
          onClick={() => handleNavigation('/settings')}
          data-title="Settings"
        >
          <span className="sidebar-icon" style={{ fill: 'url(#settingsGradient)' }}>
            <MdSettings />
          </span>
          <span className="sidebar-text">Settings</span>
        </Link>
      </div>
    </div>
  );
};

export default AdminSidebar;