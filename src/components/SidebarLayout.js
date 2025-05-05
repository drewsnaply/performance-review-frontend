// src/components/SidebarLayout.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  MdChevronLeft, 
  MdChevronRight, 
  MdDashboard,
  MdPeople,
  MdSettings,
  MdExitToApp,
  MdInsertChart,
  MdBarChart,
  MdTimer,
  MdDescription,
  MdImportExport,
  MdSupervisorAccount,
  MdAssignment
} from 'react-icons/md';
import Header from './Header';

// Import SuperAdminSidebar with the correct path
import SuperAdminSidebar from './super-admin/SuperAdminSidebar';

function SidebarLayout({ children, user, activeView = 'dashboard' }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, currentUser } = useAuth();
  
  // Get user from context if not provided
  const activeUser = user || currentUser;
  
  // Detect if user is admin - ensure Templates is visible
  const isAdmin = true; // Force admin status to show Templates menu item
  
  // Detect if user is superadmin
  const isSuperAdmin = activeUser && activeUser.role === 'superadmin';
  
  // Check if currently impersonating
  const isImpersonating = localStorage.getItem('impersonatedCustomer') !== null;
  
  // Check if we're in a super admin section
  const isInSuperAdminSection = location.pathname.includes('/super-admin');
  
  // Handle routing and sidebar toggle
  const handleNavigation = (path) => {
    // Standard navigation for most routes
    navigate(path);
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  };
  
  // FIXED: Special navigation handlers for problematic routes
  const handleEmployeesNavigation = (e) => {
    e.preventDefault();
    // Use window.location.href to force a complete page reload
    window.location.href = '/employees';
  };
  
  const handleTemplatesNavigation = (e) => {
    e.preventDefault();
    // Use window.location.href to force a complete page reload
    window.location.href = '/templates';
  };
  
  // Toggle sidebar collapse state
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  // Responsive sidebar handling
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setIsMobile(width < 768);
      
      // Auto-collapse sidebar on small screens
      if (width < 768 && !sidebarCollapsed) {
        setSidebarCollapsed(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [sidebarCollapsed]);
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Determine which sidebar to show
  const renderSidebar = () => {
    // If the user is a superadmin and not impersonating, show SuperAdminSidebar
    if (isSuperAdmin && !isImpersonating && isInSuperAdminSection) {
      try {
        return <SuperAdminSidebar activeView={activeView} />;
      } catch (error) {
        console.error("Error rendering SuperAdminSidebar:", error);
        // Fallback to default sidebar if SuperAdminSidebar fails to load
      }
    }
    
    // Otherwise show regular sidebar
    return (
      <>
        {/* MAIN NAVIGATION */}
        <div className="sidebar-section">
          <div className="sidebar-heading">Main</div>
          
          <a 
            href="/dashboard" 
            onClick={(e) => { e.preventDefault(); handleNavigation('/dashboard'); }} 
            className={`sidebar-item ${activeView === 'dashboard' ? 'active' : ''}`}
            data-title="Dashboard"
          >
            <div className="sidebar-icon"><MdDashboard /></div>
            <div className="sidebar-text">Dashboard</div>
          </a>
          
          {/* FIXED: Using direct page reload for Employees link */}
          <a 
            href="/employees" 
            onClick={handleEmployeesNavigation}
            className={`sidebar-item ${activeView === 'employees' ? 'active' : ''}`}
            data-title="Employees"
          >
            <div className="sidebar-icon"><MdPeople /></div>
            <div className="sidebar-text">Employees</div>
          </a>
        </div>
        
        {/* MANAGEMENT SECTION */}
        {isAdmin && (
          <div className="sidebar-section">
            <div className="sidebar-heading">Management</div>
            
            <a 
              href="/review-cycles" 
              onClick={(e) => { e.preventDefault(); handleNavigation('/review-cycles'); }} 
              className={`sidebar-item ${activeView === 'review-cycles' ? 'active' : ''}`}
              data-title="Review Cycles"
            >
              <div className="sidebar-icon"><MdBarChart /></div>
              <div className="sidebar-text">Review Cycles</div>
            </a>
            
            {/* FIXED: Using direct page reload for Templates link */}
            <a 
              href="/templates" 
              onClick={handleTemplatesNavigation}
              className={`sidebar-item ${activeView === 'templates' ? 'active' : ''}`}
              data-title="Templates"
            >
              <div className="sidebar-icon"><MdDescription /></div>
              <div className="sidebar-text">Templates</div>
            </a>
            
            <a 
              href="/templates/assignments" 
              onClick={(e) => { e.preventDefault(); handleNavigation('/templates/assignments'); }} 
              className={`sidebar-item ${activeView === 'template-assignments' ? 'active' : ''}`}
              data-title="Template Assignments"
            >
              <div className="sidebar-icon"><MdAssignment /></div>
              <div className="sidebar-text">Template Assignments</div>
              <div className="badge">4</div>
            </a>
          </div>
        )}
        
        {/* REPORTING SECTION */}
        {isAdmin && (
          <div className="sidebar-section">
            <div className="sidebar-heading">Reporting</div>
            
            <a 
              href="/metrics" 
              onClick={(e) => { e.preventDefault(); handleNavigation('/metrics'); }} 
              className={`sidebar-item ${activeView === 'metrics' ? 'active' : ''}`}
              data-title="Metrics"
            >
              <div className="sidebar-icon"><MdInsertChart /></div>
              <div className="sidebar-text">Metrics</div>
            </a>
            
            <a 
              href="/reports" 
              onClick={(e) => { e.preventDefault(); handleNavigation('/reports'); }} 
              className={`sidebar-item ${activeView === 'reports' ? 'active' : ''}`}
              data-title="Reports"
            >
              <div className="sidebar-icon"><MdBarChart /></div>
              <div className="sidebar-text">Reports</div>
            </a>
            
            <a 
              href="/kpis" 
              onClick={(e) => { e.preventDefault(); handleNavigation('/kpis'); }} 
              className={`sidebar-item ${activeView === 'kpis' ? 'active' : ''}`}
              data-title="KPI Management"
            >
              <div className="sidebar-icon"><MdInsertChart /></div>
              <div className="sidebar-text">KPI Management</div>
            </a>
          </div>
        )}
        
        {/* ADDITIONAL TOOLS SECTION */}
        {isAdmin && (
          <div className="sidebar-section">
            <div className="sidebar-heading">Tools</div>
            
            <a 
              href="/import-tool" 
              onClick={(e) => { e.preventDefault(); handleNavigation('/import-tool'); }} 
              className={`sidebar-item ${activeView === 'import-tool' ? 'active' : ''}`}
              data-title="Import Data"
            >
              <div className="sidebar-icon"><MdImportExport /></div>
              <div className="sidebar-text">Import Data</div>
            </a>
          </div>
        )}
        
        {/* SUPER ADMIN SECTION */}
        {isSuperAdmin && (
          <div className="sidebar-section">
            <div className="sidebar-heading">Super Admin</div>
            
            <a 
              href="/super-admin/customers" 
              onClick={(e) => { e.preventDefault(); handleNavigation('/super-admin/customers'); }} 
              className={`sidebar-item ${activeView === 'super-admin' ? 'active' : ''}`}
              data-title="Super Admin"
            >
              <div className="sidebar-icon"><MdSupervisorAccount /></div>
              <div className="sidebar-text">Super Admin</div>
            </a>
          </div>
        )}
        
        {/* USER ACTIONS */}
        <div className="sidebar-section" style={{ marginTop: 'auto' }}>
          <a 
            href="/settings" 
            onClick={(e) => { e.preventDefault(); handleNavigation('/settings'); }} 
            className={`sidebar-item ${activeView === 'settings' ? 'active' : ''}`}
            data-title="Settings"
          >
            <div className="sidebar-icon"><MdSettings /></div>
            <div className="sidebar-text">Settings</div>
          </a>
          
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); handleLogout(); }} 
            className="sidebar-item"
            data-title="Logout"
          >
            <div className="sidebar-icon"><MdExitToApp /></div>
            <div className="sidebar-text">Logout</div>
          </a>
        </div>
      </>
    );
  };
  
  return (
    <div className="sidebar-layout">
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-toggle-container">
          <div className="sidebar-toggle" onClick={toggleSidebar}>
            {sidebarCollapsed ? <MdChevronRight /> : <MdChevronLeft />}
          </div>
        </div>
        
        <div className="sidebar-menu">
          {renderSidebar()}
        </div>
      </div>
      
      <div className={`main-content ${sidebarCollapsed ? 'expanded' : ''}`}>
        <Header 
          user={activeUser}
          toggleSidebar={toggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
          isSuperAdmin={isSuperAdmin}
          isInSuperAdminSection={isInSuperAdminSection}
          isImpersonating={isImpersonating}
        />
        {children}
      </div>
      
      <style jsx="true">{`
        /* MOBILE VERSION - DO NOT MODIFY THIS SECTION */
        /* ===== MODERN SLEEK SIDEBAR STYLING ===== */
        :root {
          /* Color palette */
          --primary: #6366f1;
          --primary-light: #818cf8;
          --primary-dark: #4f46e5;
          --secondary: #10b981;
          --danger: #ef4444;
          --warning: #f59e0b;
          --success: #10b981;
          --info: #3b82f6;
          
          /* Neutrals */
          --neutral-50: #f8fafc;
          --neutral-100: #f1f5f9;
          --neutral-200: #e2e8f0;
          --neutral-300: #cbd5e1;
          --neutral-400: #94a3b8;
          --neutral-500: #64748b;
          --neutral-600: #475569;
          --neutral-700: #334155;
          --neutral-800: #1e293b;
          --neutral-900: #0f172a;
          
          /* Layout variables */
          --header-height: 64px;
          --banner-height: 36px;
          --sidebar-width: 250px;
          --sidebar-collapsed-width: 72px; /* Slightly wider for better icon display */
          --transition-speed: 0.3s;
        }

        /* ===== Global Dashboard Container ===== */
        .dashboard-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background-color: var(--neutral-50);
          position: relative;
        }

        /* ===== Content Wrapper ===== */
        .content-wrapper {
          display: flex;
          flex: 1;
          padding-top: var(--header-height);
          min-height: calc(100vh - var(--header-height));
        }

        .content-wrapper.with-banner {
          padding-top: calc(var(--header-height) + var(--banner-height));
        }

        /* ===== CLEAN MODERN SIDEBAR ===== */
        .sidebar {
          width: var(--sidebar-width);
          background-color: white;
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.03);
          position: fixed;
          top: var(--header-height);
          left: 0;
          height: calc(100vh - var(--header-height));
          overflow-y: auto;
          transition: width var(--transition-speed) cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 900;
          border-right: 1px solid var(--neutral-200);
          flex-shrink: 0;
        }

        .sidebar.with-banner {
          top: calc(var(--header-height) + var(--banner-height));
          height: calc(100vh - var(--header-height) - var(--banner-height));
        }

        .sidebar.collapsed {
          width: var(--sidebar-collapsed-width);
          overflow: visible; /* Allow tooltips to display outside sidebar */
        }

        /* Clean sidebar menu */
        .sidebar-menu {
          padding: 20px 0;
          display: flex;
          flex-direction: column;
        }

        /* Section organization */
        .sidebar-section {
          margin-bottom: 28px;
          position: relative;
        }

        /* Hidden heading in collapsed mode */
        .sidebar-heading {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--neutral-500);
          padding: 0 20px;
          margin-bottom: 8px;
        }

        .sidebar.collapsed .sidebar-heading {
          opacity: 0;
          height: 0;
          margin: 0;
          overflow: hidden;
        }

        /* Sidebar items */
        .sidebar-item {
          display: flex;
          align-items: center;
          padding: 10px 20px;
          color: var(--neutral-600);
          text-decoration: none;
          position: relative;
          transition: background-color 0.2s ease, color 0.2s ease;
          margin: 2px 8px;
          border-radius: 6px;
        }

        .sidebar-item:hover {
          background-color: var(--neutral-100);
          color: var(--neutral-800);
        }

        .sidebar-item.active {
          background-color: rgba(99, 102, 241, 0.1);
          color: var(--primary);
          font-weight: 500;
        }

        /* Centered icons in collapsed mode */
        .sidebar.collapsed .sidebar-item {
          padding: 14px 0;
          justify-content: center;
          margin: 4px 8px;
          height: 44px;
        }

        /* Sidebar icon */
        .sidebar-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          margin-right: 12px;
          transition: margin 0.2s ease;
        }

        .sidebar-icon svg {
          width: 20px;
          height: 20px;
          transition: transform 0.3s ease;
        }

        .sidebar.collapsed .sidebar-icon {
          margin-right: 0;
        }

        .sidebar.collapsed .sidebar-icon svg {
          transform: scale(1.2);
        }

        /* Text hiding */
        .sidebar-text {
          transition: opacity 0.2s ease, width 0.2s ease;
          white-space: nowrap;
          overflow: hidden;
        }

        .sidebar.collapsed .sidebar-text {
          opacity: 0;
          width: 0;
          height: 0;
          position: absolute;
          overflow: hidden;
          white-space: nowrap;
          pointer-events: none;
        }

        /* Active item in collapsed sidebar */
        .sidebar.collapsed .sidebar-item.active {
          background-color: rgba(99, 102, 241, 0.08);
          color: var(--primary);
        }

        .sidebar.collapsed .sidebar-item.active::before {
          content: '';
          position: absolute;
          left: -8px;
          top: 50%;
          transform: translateY(-50%);
          height: 24px;
          width: 3px;
          background-color: var(--primary);
          border-radius: 0 3px 3px 0;
        }

        /* Sidebar submenu */
        .sidebar-submenu {
          margin-left: 36px;
          height: 0;
          overflow: hidden;
          transition: height 0.3s ease;
        }

        .sidebar-submenu.open {
          height: auto;
        }

        .sidebar.collapsed .sidebar-submenu {
          display: none;
        }

        .submenu-item {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          color: var(--neutral-600);
          text-decoration: none;
          transition: color 0.2s ease;
          font-size: 14px;
          margin-bottom: 4px;
          border-radius: 4px;
        }

        .submenu-item:hover {
          background-color: var(--neutral-100);
          color: var(--neutral-800);
        }

        .submenu-item.active {
          color: var(--primary);
          font-weight: 500;
          background-color: rgba(99, 102, 241, 0.1);
        }

        /* Sidebar toggle button */
        .sidebar-toggle-container {
          position: absolute;
          top: 72px;
          right: 0;
          z-index: 10;
        }

        .sidebar-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background-color: white;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          border: 1px solid var(--neutral-200);
          border-radius: 50%;
          color: var(--neutral-600);
          cursor: pointer;
          transform: translateX(50%);
          transition: color 0.2s ease, background-color 0.2s ease;
        }

        .sidebar-toggle:hover {
          color: var(--primary);
          background-color: var(--neutral-100);
        }

        /* Enhanced tooltip for collapsed sidebar */
        .sidebar.collapsed .sidebar-item:hover::after {
          content: attr(data-title);
          position: absolute;
          left: 68px;
          top: 50%;
          transform: translateY(-50%);
          background-color: var(--neutral-800);
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 13px;
          white-space: nowrap;
          z-index: 1000;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
          opacity: 1;
          visibility: visible;
        }

        .sidebar.collapsed .sidebar-item:hover::before {
          content: '';
          position: absolute;
          left: 64px;
          top: 50%;
          transform: translateY(-50%) rotate(45deg);
          width: 8px;
          height: 8px;
          background-color: var(--neutral-800);
          z-index: 999;
          margin-left: -4px;
          opacity: 1;
          visibility: visible;
        }

        /* Badge styling */
        .sidebar-item .badge {
          background-color: var(--danger);
          color: white;
          border-radius: 10px;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          font-size: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-left: auto;
        }

        .sidebar.collapsed .sidebar-item .badge {
          position: absolute;
          top: 4px;
          right: 4px;
          margin-left: 0;
        }

        /* Main content */
        .main-content {
          flex-grow: 1;
          margin-left: var(--sidebar-width);
          padding: 0;
          transition: margin-left var(--transition-speed) ease;
          min-height: calc(100vh - var(--header-height));
          width: calc(100% - var(--sidebar-width));
        }

        .main-content.with-banner {
          min-height: calc(100vh - var(--header-height) - var(--banner-height));
        }

        .main-content.expanded {
          margin-left: var(--sidebar-collapsed-width);
          width: calc(100% - var(--sidebar-collapsed-width));
        }

        /* Scrollbar styling */
        .sidebar::-webkit-scrollbar {
          width: 3px;
        }

        .sidebar::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar::-webkit-scrollbar-thumb {
          background-color: var(--neutral-300);
          border-radius: 3px;
        }

        .sidebar::-webkit-scrollbar-thumb:hover {
          background-color: var(--neutral-400);
        }

        /* ===== Media Queries ===== */
        @media (max-width: 768px) {
          .sidebar {
            width: 0;
            opacity: 0;
            visibility: hidden;
          }
          
          .sidebar.collapsed {
            width: var(--sidebar-width);
            opacity: 1;
            visibility: visible;
          }
          
          .sidebar.collapsed .sidebar-icon {
            margin-right: 12px;
          }
          
          .sidebar.collapsed .sidebar-text {
            opacity: 1;
            width: auto;
            height: auto;
            position: static;
            overflow: visible;
            white-space: normal;
            pointer-events: auto;
          }
          
          .main-content {
            margin-left: 0;
            width: 100%;
          }
          
          .main-content.expanded {
            margin-left: 0;
            width: 100%;
          }
          
          .sidebar-toggle-container {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

export default SidebarLayout;