// src/components/AdminSidebar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  
  // Helper function to check if a view is active
  const isActive = (view) => activeView === view;
  
  // FIXED: Navigation function with direct page reload for problematic routes
  const handleNavigation = (path) => {
    if (path === '/employees') {
      // Direct reload for Employees
      window.location.href = '/employees';
      return;
    }
    
    if (path === '/templates') {
      // Direct reload for Templates
      window.location.href = '/templates';
      return;
    }
    
    // Regular navigation for other routes
    navigate(path);
    if (setActiveView) {
      setActiveView(path.replace('/', ''));
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
        
        {/* MAIN NAVIGATION ITEMS */}
        <a 
          href="/dashboard" 
          className={`sidebar-item ${isActive('dashboard') ? 'active' : ''}`}
          onClick={(e) => { 
            e.preventDefault(); 
            handleNavigation('/dashboard');
          }}
          data-title="Dashboard"
        >
          <span className="sidebar-icon" style={{ fill: 'url(#dashboardGradient)' }}>
            <MdDashboard />
          </span>
          <span className="sidebar-text">Dashboard</span>
        </a>
      
        <a 
          href="/team-reviews" 
          className={`sidebar-item ${isActive('team-reviews') ? 'active' : ''}`}
          onClick={(e) => { 
            e.preventDefault(); 
            handleNavigation('/team-reviews');
          }}
          data-title="Team Reviews"
        >
          <span className="sidebar-icon" style={{ fill: 'url(#teamGradient)' }}>
            <FaUsers />
          </span>
          <span className="sidebar-text">Team Reviews</span>
        </a>
        
        {/* FIXED: Use direct page reload for Employees */}
        <a 
          href="/employees" 
          className={`sidebar-item ${isActive('employees') ? 'active' : ''}`}
          onClick={(e) => { 
            e.preventDefault(); 
            window.location.href = '/employees';
          }}
          data-title="Employees"
        >
          <span className="sidebar-icon" style={{ fill: 'url(#employeesGradient)' }}>
            <MdPeople />
          </span>
          <span className="sidebar-text">Employees</span>
        </a>
        
        <a 
          href="/my-reviews" 
          className={`sidebar-item ${isActive('my-reviews') ? 'active' : ''}`}
          onClick={(e) => { 
            e.preventDefault(); 
            handleNavigation('/my-reviews');
          }}
          data-title="My Reviews"
        >
          <span className="sidebar-icon" style={{ fill: 'url(#myReviewsGradient)' }}>
            <FaClipboardCheck />
          </span>
          <span className="sidebar-text">My Reviews</span>
        </a>
      </div>
      
      <div className="sidebar-section">
        <h3 className="sidebar-heading">MANAGEMENT</h3>
        
        <a 
          href="/schedule" 
          className={`sidebar-item ${isActive('schedule') ? 'active' : ''}`}
          onClick={(e) => { 
            e.preventDefault(); 
            handleNavigation('/schedule');
          }}
          data-title="Schedule"
        >
          <span className="sidebar-icon" style={{ fill: 'url(#scheduleGradient)' }}>
            <FaRegCalendarAlt />
          </span>
          <span className="sidebar-text">Schedule</span>
        </a>
        
        <a 
          href="/review-cycles" 
          className={`sidebar-item ${isActive('review-cycles') ? 'active' : ''}`}
          onClick={(e) => { 
            e.preventDefault(); 
            handleNavigation('/review-cycles');
          }}
          data-title="Review Cycles"
        >
          <span className="sidebar-icon" style={{ fill: 'url(#cyclesGradient)' }}>
            <MdTimer />
          </span>
          <span className="sidebar-text">Review Cycles</span>
        </a>
        
        {/* FIXED: Use direct page reload for Templates */}
        <a 
          href="/templates" 
          className={`sidebar-item ${isActive('templates') ? 'active' : ''}`}
          onClick={(e) => { 
            e.preventDefault(); 
            window.location.href = '/templates';
          }}
          data-title="Templates"
        >
          <span className="sidebar-icon" style={{ fill: 'url(#templatesGradient)' }}>
            <FaFileAlt />
          </span>
          <span className="sidebar-text">Templates</span>
        </a>
        
        <a 
          href="/template-assignments" 
          className={`sidebar-item ${isActive('template-assignments') ? 'active' : ''}`}
          onClick={(e) => { 
            e.preventDefault(); 
            handleNavigation('/template-assignments');
          }}
          data-title="Template Assignments"
        >
          <span className="sidebar-icon" style={{ fill: 'url(#assignmentsGradient)' }}>
            <MdAssignment />
          </span>
          <span className="sidebar-text">Template Assignments</span>
        </a>
        
        <a 
          href="/pending-reviews" 
          className={`sidebar-item ${isActive('pending-reviews') ? 'active' : ''}`}
          onClick={(e) => { 
            e.preventDefault(); 
            handleNavigation('/pending-reviews');
          }}
          data-title="Pending Reviews"
        >
          <span className="sidebar-icon" style={{ fill: 'url(#pendingGradient)' }}>
            <MdNotificationsActive />
          </span>
          <span className="sidebar-text">Pending Reviews</span>
          <span className="badge">4</span>
        </a>
      </div>
      
      <div className="sidebar-section">
        <h3 className="sidebar-heading">REPORTING</h3>
        
        <a 
          href="/metrics" 
          className={`sidebar-item ${isActive('metrics') ? 'active' : ''}`}
          onClick={(e) => { 
            e.preventDefault(); 
            handleNavigation('/metrics');
          }}
          data-title="Metrics"
        >
          <span className="sidebar-icon" style={{ fill: 'url(#kpiGradient)' }}>
            <FaCalculator />
          </span>
          <span className="sidebar-text">Metrics</span>
        </a>
        
        <a 
          href="/reports" 
          className={`sidebar-item ${isActive('reports') ? 'active' : ''}`}
          onClick={(e) => { 
            e.preventDefault(); 
            handleNavigation('/reports');
          }}
          data-title="Reports"
        >
          <span className="sidebar-icon" style={{ fill: 'url(#reportsGradient)' }}>
            <MdBarChart />
          </span>
          <span className="sidebar-text">Reports</span>
        </a>
        
        <a 
          href="/analytics" 
          className={`sidebar-item ${isActive('analytics') ? 'active' : ''}`}
          onClick={(e) => { 
            e.preventDefault(); 
            handleNavigation('/analytics');
          }}
          data-title="Analytics"
        >
          <span className="sidebar-icon" style={{ fill: 'url(#analyticsGradient)' }}>
            <MdAnalytics />
          </span>
          <span className="sidebar-text">Analytics</span>
        </a>
        
        <a 
          href="/kpi-management" 
          className={`sidebar-item ${isActive('kpi-management') ? 'active' : ''}`}
          onClick={(e) => { 
            e.preventDefault(); 
            handleNavigation('/kpi-management');
          }}
          data-title="KPI Management"
        >
          <span className="sidebar-icon" style={{ fill: 'url(#kpiGradient)' }}>
            <MdTrendingUp />
          </span>
          <span className="sidebar-text">KPI Management</span>
        </a>
      </div>
      
      <div className="sidebar-section">
        <h3 className="sidebar-heading">CONFIGURATION</h3>
        
        <a 
          href="/data-import" 
          className={`sidebar-item ${isActive('data-import') ? 'active' : ''}`}
          onClick={(e) => { 
            e.preventDefault(); 
            handleNavigation('/data-import');
          }}
          data-title="Import/Export"
        >
          <span className="sidebar-icon" style={{ fill: 'url(#toolsGradient)' }}>
            <MdImportExport />
          </span>
          <span className="sidebar-text">Import/Export</span>
        </a>
        
        <a 
          href="/settings" 
          className={`sidebar-item ${isActive('settings') ? 'active' : ''}`}
          onClick={(e) => { 
            e.preventDefault(); 
            handleNavigation('/settings');
          }}
          data-title="Settings"
        >
          <span className="sidebar-icon" style={{ fill: 'url(#settingsGradient)' }}>
            <MdSettings />
          </span>
          <span className="sidebar-text">Settings</span>
        </a>
      </div>
    </div>
  );
};

export default AdminSidebar;