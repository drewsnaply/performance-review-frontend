import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  MdChevronLeft, 
  MdChevronRight, 
  MdSupervisorAccount, 
  MdExitToApp
} from 'react-icons/md';
import Header from './Header';
import AdminSidebar from './admin/AdminSidebar';

// Import CSS
import '../styles/SidebarLayout.css';

const SidebarLayout = ({ children }) => {
  // State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    localStorage.getItem('sidebarCollapsed') === 'true'
  );
  
  // Hooks
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Variables for handling super admin and impersonation
  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isInSuperAdminSection = location.pathname.includes('/super-admin');
  
  // Check for impersonation
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatedCustomer, setImpersonatedCustomer] = useState(null);

  // Effect to check for impersonation data in localStorage
  useEffect(() => {
    const checkImpersonation = () => {
      try {
        const impersonationData = localStorage.getItem('impersonatedCustomer');
        
        if (impersonationData) {
          const parsedData = JSON.parse(impersonationData);
          setIsImpersonating(true);
          setImpersonatedCustomer(parsedData);
        } else {
          setIsImpersonating(false);
          setImpersonatedCustomer(null);
        }
      } catch (e) {
        console.error('Error checking impersonation data:', e);
      }
    };

    checkImpersonation();
  }, []);

  // Determine user role
  const getUserRole = () => {
    if (!currentUser) return 'admin'; // Default to admin to prevent blank sidebar
    return currentUser.role?.toLowerCase() || 'admin';
  };

  const userRole = getUserRole();
  
  // Toggle sidebar collapsed state
  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', newState);
  };
  
  // Handle log out function
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Handle returning to super admin section
  const handleReturnToSuperAdmin = () => {
    window.location.href = '/super-admin/customers';
  };
  
  // Handle exit impersonation
  const handleExitImpersonation = () => {
    localStorage.removeItem('impersonatedCustomer');
    setIsImpersonating(false);
    setImpersonatedCustomer(null);
    window.location.href = '/super-admin/customers';
  };
  
  // Check authentication and redirect if needed
  useEffect(() => {
    const publicPaths = ['/login', '/forgot-password', '/reset-password'];
    
    if (!currentUser && !publicPaths.some(path => location.pathname.startsWith(path))) {
      // Don't redirect from any internal pages
      const bypassPaths = ['/dashboard', '/employees'];
      if (bypassPaths.some(path => location.pathname === path || location.pathname.startsWith(path))) {
        console.log("Bypassing auth check for:", location.pathname);
      } else {
        navigate('/login');
      }
    }
  }, [currentUser, navigate, location.pathname]);
  
  // Function to check if a route is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  // Check if we should show the layout
  const shouldShowLayout = () => {
    const publicPaths = ['/login', '/forgot-password', '/reset-password'];
    return !publicPaths.some(path => location.pathname.startsWith(path));
  };
  
  // Check if we're on the employees page
  const isEmployeesPage = location.pathname === '/employees' || location.pathname.startsWith('/employees/');
  
  if (!shouldShowLayout()) {
    return children;
  }
  
  // CSS Fixes for header and logout button
  const cssFixesStyle = `
    /* ---------- RESET ALL STYLES ---------- */
    * {
      box-sizing: border-box;
    }
    
    /* Global Variables */
    :root {
      --primary: #6366f1;
      --primary-light: #818cf8;
      --primary-dark: #4f46e5;
      --header-height: 64px;
      --sidebar-width: 250px;
      --sidebar-collapsed-width: 72px;
    }
    
    /* Header Styles */
    .modern-header, header, .main-header {
      position: fixed !important;
      z-index: 1000 !important;
      width: 100% !important;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1) !important;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark)) !important;
      height: var(--header-height) !important;
    }
    
    /* Logout Button */
    .logout-direct-button, button[class*="logout"], .logout-button {
      display: flex !important;
      visibility: visible !important;
      opacity: 1 !important;
      position: relative !important;
      z-index: 1001 !important;
      color: white !important;
      background: rgba(239, 68, 68, 0.1) !important;
      border: 1px solid rgba(239, 68, 68, 0.3) !important;
      padding: 0.5rem 1rem !important;
      border-radius: 8px !important;
      transition: background 0.3s ease !important;
    }
    
    .logout-direct-button:hover, button[class*="logout"]:hover, .logout-button:hover {
      background: rgba(239, 68, 68, 0.2) !important;
    }
    
    /* Content Layout */
    .content-wrapper {
      padding: 0 !important;
      margin: 0 !important;
      display: flex !important;
    }
    
    /* ---------- MAIN CONTENT LAYOUT ---------- */
    .main-content {
      margin-top: var(--header-height) !important;
      padding: 20px !important;
      transition: margin-left 0.3s ease !important;
      width: calc(100% - ${sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)'}) !important;
      margin-left: ${sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)'} !important;
    }
    
    /* Header Elements */
    .user-name, .user-info {
      display: flex !important;
      visibility: visible !important;
      color: white !important;
    }
    
    .header-button {
      opacity: 1 !important;
      visibility: visible !important;
    }
    
    .header-container {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
    }
    
    .app-logo, .brand {
      display: flex !important;
    }
    
    .date-display {
      background: rgba(255, 255, 255, 0.1) !important;
      padding: 0.5rem 1rem !important;
      border-radius: 8px !important;
      font-size: 0.9rem !important;
      font-weight: 500 !important;
      color: white !important;
    }
    
    /* MODERN TOGGLE BUTTON */
    #toggle-control {
      position: fixed !important;
      top: calc(var(--header-height) + 16px) !important;
      left: ${sidebarCollapsed ? '52px' : '226px'} !important;
      width: 36px !important;
      height: 36px !important;
      background-color: white !important;
      border: 1px solid var(--neutral-200) !important;
      border-radius: 50% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      color: var(--neutral-600) !important;
      cursor: pointer !important;
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08) !important;
      z-index: 1500 !important;
      opacity: 1 !important;
      visibility: visible !important;
      transition: left 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease !important;
    }
    
    #toggle-control:hover {
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15) !important;
      transform: scale(1.05) !important;
    }
    
    #toggle-control svg {
      width: 22px !important;
      height: 22px !important;
      color: var(--neutral-600) !important;
    }
    
    /* ---------- EMPLOYEES PAGE SPECIFIC FIXES ---------- */
    ${isEmployeesPage ? `
      /* Override the inline styles from the Employees component */
      .employees-container {
        padding: 0 !important;
        margin: 0 !important;
        max-width: 100% !important;
        margin-left: 0 !important;
      }
      
      /* Critical: Override the customStyles in the Employees component */
      .employees-header {
        padding-left: 0 !important;
        margin-left: 0 !important;
      }
      
      /* Override any search container styles */
      .filters-container {
        padding-left: 0 !important;
        margin-left: 0 !important;
      }
      
      /* Override table container */
      .employee-table-container {
        margin-left: 0 !important;
        padding-left: 0 !important;
      }
      
      /* Force content containers to be full width */
      .employees-container > * {
        width: 100% !important;
      }
    ` : ''}
  `;
  
  return (
    <div className="dashboard-container">
      {/* CSS Fixes */}
      <style>{cssFixesStyle}</style>
      
      {/* Impersonation banner */}
      {isImpersonating && impersonatedCustomer && !isInSuperAdminSection && (
        <div className="impersonation-banner">
          <div className="impersonation-message">
            <MdSupervisorAccount className="impersonation-icon" />
            You are viewing as {impersonatedCustomer.name}
          </div>
          <button className="end-impersonation-btn" onClick={handleReturnToSuperAdmin}>
            <MdExitToApp />
            Return to Enterprise
          </button>
        </div>
      )}
      
      {/* Header Component with Logo and User Menu */}
      <Header 
        userRole={userRole}
        sidebarCollapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
        currentUser={currentUser}
        handleLogout={handleLogout}
        isImpersonating={isImpersonating}
        impersonatedCustomer={impersonatedCustomer}
        isSuperAdmin={isSuperAdmin}
        isInSuperAdminSection={isInSuperAdminSection}
        handleExitImpersonation={handleExitImpersonation}
        handleReturnToSuperAdmin={handleReturnToSuperAdmin}
      />
      
      {/* Main Content Area with Sidebar and Content */}
      <div className={`content-wrapper ${isImpersonating ? 'with-banner' : ''}`} data-page={isEmployeesPage ? 'employees' : ''}>
        {/* Toggle Button - Completely Separate and Fixed */}
        <button 
          id="toggle-control" 
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <MdChevronRight /> : <MdChevronLeft />}
        </button>
        
        {/* Sidebar navigation */}
        <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${isImpersonating ? 'with-banner' : ''}`}>
          {/* Always render AdminSidebar regardless of role to prevent blank sidebar */}
          <AdminSidebar 
            activeView={location.pathname} 
            setActiveView={(path) => navigate(path)} 
            collapsed={sidebarCollapsed} 
          />
        </div>
        
        {/* Main content */}
        <div className={`main-content ${sidebarCollapsed ? 'expanded' : ''} ${isImpersonating ? 'with-banner' : ''} ${isEmployeesPage ? 'employees-page' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default SidebarLayout;