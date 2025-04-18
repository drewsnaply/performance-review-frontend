import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Import React Icons
import { 
  MdDashboard, 
  MdDescription, 
  MdPeople, 
  MdPerson, 
  MdSettings, 
  MdLoop, 
  MdAssignment,
  MdBarChart,
  MdBuild,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdChevronLeft,
  MdChevronRight,
  MdSupervisorAccount,
  MdExitToApp,
  MdAssessment,
  MdDateRange
} from 'react-icons/md';

// Import the SuperAdminSidebar
import SuperAdminSidebar from './super-admin/SuperAdminSidebar';

// Import the dedicated CSS file
import '../styles/SidebarLayout.css';

function SidebarLayout({ children, user, activeView, setActiveView }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [toolsOpen, setToolsOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { logout, impersonating, exitImpersonation } = useAuth();
  const [companyInfo, setCompanyInfo] = useState({
    name: 'Performance Review System',
    logo: null
  });
  
  // State for impersonation
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatedCustomer, setImpersonatedCustomer] = useState(null);

  // User role detection - this is the key part for determining which sidebar to show
  const isSuperAdmin = user && user.role === 'superadmin';
  const isManager = user && user.role === 'manager';
  const isInSuperAdminSection = location.pathname.startsWith('/super-admin');

  // Check for impersonation data in localStorage
  useEffect(() => {
    // Check for impersonation data whenever location changes
    const checkImpersonation = () => {
      try {
        const impersonationData = localStorage.getItem('impersonatedCustomer');
        if (impersonationData) {
          const parsedData = JSON.parse(impersonationData);
          setImpersonatedCustomer(parsedData);
          setIsImpersonating(true);
        } else {
          setImpersonatedCustomer(null);
          setIsImpersonating(false);
        }
      } catch (error) {
        console.error('Error checking impersonation status:', error);
        setIsImpersonating(false);
      }
    };
    
    checkImpersonation();
  }, [location.pathname]); // Re-run whenever the URL changes

  // IMPORTANT: Local function for checking active paths - fixes "useLocation is called" error
  const isActivePath = (path) => {
    return location.pathname.startsWith(path);
  };

  // Check localStorage for saved sidebar state and company info on component mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setSidebarCollapsed(JSON.parse(savedState));
    }
    
    // Load company information from localStorage
    try {
      const savedCompanyInfo = localStorage.getItem('companyInfo');
      if (savedCompanyInfo) {
        setCompanyInfo(JSON.parse(savedCompanyInfo));
      }
    } catch (error) {
      console.error('Error loading company info:', error);
    }
  }, []);

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Safeguard against undefined user or props
  if (!user) {
    console.error('SidebarLayout: Missing "user" prop');
  }

  // Function to handle Tools dropdown toggle
  const handleToolsToggle = () => {
    setToolsOpen(!toolsOpen);
  };

  // Function to toggle sidebar collapse state
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Handle exit impersonation
  const handleExitImpersonation = () => {
    if (typeof exitImpersonation === 'function') {
      exitImpersonation();
    } else {
      // Fallback if context method is not available
      localStorage.removeItem('impersonatedCustomer');
      // Update local state to reflect the change immediately
      setIsImpersonating(false);
      setImpersonatedCustomer(null);
    }
    
    // Navigate to Super Admin
    navigate('/super-admin/customers');
  };

  // Updated navigateTo function
  const navigateTo = (route) => {
    navigate(route);
    
    // Map routes to active views
    const viewMapping = {
      '/dashboard': 'dashboard',
      '/my-reviews': 'my-reviews',
      '/team-reviews': 'team-reviews',
      '/employees': 'employees',
      '/settings': 'settings',
      '/review-cycles': 'review-cycles',
      '/templates': 'templates',
      '/kpis': 'kpis',
      '/import-tool': 'tools-imports',
      '/export-tool': 'tools-exports',
      '/super-admin/customers': 'super-admin',
      '/manager/dashboard': 'manager-dashboard',
      '/manager/reviews/new': 'create-review',
      '/pending-reviews': 'pending-reviews'
    };

    const activeViewName = viewMapping[route] || route.replace('/', '');
    
    // Only call setActiveView if it's a function
    if (typeof setActiveView === 'function') {
      setActiveView(activeViewName);
    }
  };

  // Return to Super Admin dashboard
  const handleReturnToSuperAdmin = () => {
    // First clear any impersonation data
    localStorage.removeItem('impersonatedCustomer');
    
    // If you have an impersonation flag in context, reset it
    if (typeof exitImpersonation === 'function') {
      exitImpersonation();
    }
    
    // Update local state immediately
    setIsImpersonating(false);
    setImpersonatedCustomer(null);
    
    console.log('Navigating to Super Admin dashboard');
    
    // Use window.location for a full page reload to ensure clean state
    window.location.href = '/super-admin/customers';
  };

  // Function to generate absolute URL
  const getAbsoluteUrl = (relativeUrl) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}${relativeUrl}`;
  };

  // Get the full URL for the login page
  const loginUrl = getAbsoluteUrl('/login');

  // Comprehensive logout handler
  const handleLogout = async (e) => {
    e.preventDefault(); // Prevent default link behavior

    console.error('Logout Initiated - Clearing Authentication');

    // Remove authentication token first
    localStorage.removeItem('authToken');

    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();

    // Attempt to use context logout
    if (typeof logout === 'function') {
      try {
        await logout();
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    console.log('Redirecting to login page:', loginUrl);
    
    // Force complete logout and redirect
    window.location.replace(loginUrl);
  };

  // Modern React Icons for each menu item
  const icons = {
    dashboard: <MdDashboard />,         // Dashboard icon
    myReviews: <MdDescription />,       // Document icon
    teamReviews: <MdPeople />,          // People/Team icon
    employees: <MdPerson />,            // Person icon
    settings: <MdSettings />,           // Settings/Gear icon
    reviewCycles: <MdLoop />,           // Cycle/Loop icon
    templates: <MdAssignment />,        // Clipboard/Assignment icon
    kpis: <MdBarChart />,               // Chart/Analytics icon
    tools: <MdBuild />,                 // Tool/Wrench icon
    superAdmin: <MdSupervisorAccount />, // Super Admin icon
    exit: <MdExitToApp />,              // Exit icon
    assessment: <MdAssessment />,       // Assessment/KPI icon
    calendar: <MdDateRange />           // Calendar/Schedule icon
  };

  // Fallback to default if user or activeView is undefined
  const currentUser = user || { firstName: 'Guest', lastName: '', role: 'USER' };
  const currentActiveView = activeView || 'dashboard';

  // Default logo if no company logo is set
  const defaultLogoUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMTdDMTQuNzYxNCAxNyAxNyAxNC43NjE0IDE3IDEyQzE3IDkuMjM4NTggMTQuNzYxNCA3IDEyIDdDOS4yMzg1OCA3IDcgOS4yMzg1OCA3IDEyQzcgMTQuNzYxNCA5LjIzODU4IDE3IDEyIDE3WiIgc3Ryb2tlPSIjNjM2NmYxIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xMiAyM0MxOC4wNzUxIDIzIDIzIDE4LjA3NTEgMjMgMTJDMjMgNS45MjQ4NyAxOC4wNzUxIDEgMTIgMUM1LjkyNDg3IDEgMSA1LjkyNDg3IDEgMTJDMSAxOC4wNzUxIDUuOTI0ODcgMjMgMTIgMjNaIiBzdHJva2U9IiM2MzY2ZjEiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+';

  // Create fixed header styles that ensure visibility
  const fixedHeaderStyle = {
    position: "fixed",
    top: 0,
    left: sidebarCollapsed ? "60px" : "260px",
    right: 0,
    height: "60px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e2e8f0",
    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
    zIndex: 1000,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 25px",
    width: sidebarCollapsed ? "calc(100% - 60px)" : "calc(100% - 260px)",
    transition: "left 0.3s ease, width 0.3s ease"
  };

  // Fixed company info styles
  const companyInfoStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  };

  // Fixed logo styles
  const logoStyle = {
    height: "40px",
    width: "auto",
    maxWidth: "40px",
    objectFit: "contain"
  };

  // Fixed company name styles
  const companyNameStyle = {
    fontSize: "1.2rem",
    fontWeight: 600,
    color: "#4a5568"
  };

  // Super admin badge styles
  const superAdminBadgeStyle = {
    backgroundColor: "#805ad5",
    color: "white",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "0.7rem",
    fontWeight: "bold",
    marginLeft: "8px"
  };
  
  // Manager badge styles
  const managerBadgeStyle = {
    backgroundColor: "#38a169",
    color: "white",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "0.7rem",
    fontWeight: "bold",
    marginLeft: "8px"
  };

  // Impersonation badge styles
  const impersonationBadgeStyle = {
    backgroundColor: "#f6ad55",
    color: "#744210",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "0.7rem",
    fontWeight: "bold",
    marginLeft: "8px",
    display: "flex",
    alignItems: "center",
    gap: "4px"
  };

  // Exit impersonation button styles
  const exitImpersonationButtonStyle = {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#744210",
    padding: "0 0 0 4px",
    display: "flex",
    alignItems: "center"
  };

  // User info styles
  const userInfoStyle = {
    display: "flex",
    alignItems: "center",
    gap: "15px"
  };

  // User name styles
  const userNameStyle = {
    fontWeight: 500,
    color: "#333"
  };

  // Return to super admin button styles
  const returnToSuperAdminButtonStyle = {
    backgroundColor: "#805ad5",
    color: "white",
    padding: "6px 12px",
    borderRadius: "4px",
    border: "none",
    fontWeight: 500,
    fontSize: "0.85rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px"
  };

  // Logout button styles
  const logoutButtonStyle = {
    backgroundColor: "#7c3aed",
    color: "white",
    padding: "8px 16px",
    borderRadius: "6px",
    fontWeight: 500,
    textDecoration: "none",
    transition: "all 0.2s",
    boxShadow: "0 2px 4px rgba(124, 58, 237, 0.2)"
  };

  // Render Manager Sidebar Component
  const renderManagerSidebar = () => {
    return (
      <nav className="sidebar-menu">
        <button 
          className={currentActiveView === 'manager-dashboard' ? 'active' : ''}
          onClick={() => navigateTo('/manager/dashboard')}
        >
          <span className="sidebar-icon">{icons.dashboard}</span>
          Dashboard
        </button>
        
        <button 
          className={currentActiveView === 'my-reviews' ? 'active' : ''}
          onClick={() => navigateTo('/my-reviews')}
        >
          <span className="sidebar-icon">{icons.myReviews}</span>
          My Reviews
        </button>
        
        {/* Team Management section */}
        <div className="sidebar-heading">Team Management</div>
        <button 
          className={currentActiveView === 'team-reviews' ? 'active' : ''}
          onClick={() => navigateTo('/team-reviews')}
        >
          <span className="sidebar-icon">{icons.teamReviews}</span>
          Team Reviews
        </button>
        
        <button 
          className={isActivePath('/pending-reviews') || currentActiveView === 'pending-reviews' ? 'active' : ''}
          onClick={() => navigateTo('/pending-reviews')}
        >
          <span className="sidebar-icon">{icons.assessment}</span>
          Pending Reviews
        </button>
        
        <button 
          className={isActivePath('/manager/reviews/new') || currentActiveView === 'create-review' ? 'active' : ''}
          onClick={() => navigateTo('/manager/reviews/new')}
        >
          <span className="sidebar-icon">{icons.templates}</span>
          Create Review
        </button>
        
        {/* Review Management section */}
        <div className="sidebar-heading">Review Management</div>
        <button 
          className={currentActiveView === 'review-cycles' ? 'active' : ''}
          onClick={() => navigateTo('/review-cycles')}
        >
          <span className="sidebar-icon">{icons.calendar}</span>
          Review Cycles
        </button>
        
        <button 
          className={currentActiveView === 'kpis' ? 'active' : ''}
          onClick={() => navigateTo('/kpis')}
        >
          <span className="sidebar-icon">{icons.kpis}</span>
          KPI Management
        </button>
        
        {/* Exit Impersonation - only show for superadmin users who are impersonating */}
        {isSuperAdmin && isImpersonating && (
          <>
            <div className="sidebar-heading">Super Admin</div>
            <button 
              className="exit-impersonation-button"
              onClick={handleExitImpersonation}
              style={{
                backgroundColor: 'rgba(246, 173, 85, 0.1)',
                borderLeft: '3px solid #f6ad55',
                color: '#744210'
              }}
            >
              <span className="sidebar-icon">{icons.exit}</span>
              Exit Impersonation
            </button>
          </>
        )}
      </nav>
    );
  };
  
  // Render Manager sidebar icons (collapsed state)
  const renderManagerIcons = () => {
    return (
      <>
        <button 
          className={currentActiveView === 'manager-dashboard' ? 'active' : ''}
          onClick={() => navigateTo('/manager/dashboard')}
          title="Dashboard"
        >
          {icons.dashboard}
        </button>
        
        <button 
          className={currentActiveView === 'my-reviews' ? 'active' : ''}
          onClick={() => navigateTo('/my-reviews')}
          title="My Reviews"
        >
          {icons.myReviews}
        </button>
        
        {/* Divider */}
        <div className="sidebar-divider"></div>
        
        <button 
          className={currentActiveView === 'team-reviews' ? 'active' : ''}
          onClick={() => navigateTo('/team-reviews')}
          title="Team Reviews"
        >
          {icons.teamReviews}
        </button>
        
        <button 
          className={isActivePath('/pending-reviews') || currentActiveView === 'pending-reviews' ? 'active' : ''}
          onClick={() => navigateTo('/pending-reviews')}
          title="Pending Reviews"
        >
          {icons.assessment}
        </button>
        
        <button 
          className={isActivePath('/manager/reviews/new') || currentActiveView === 'create-review' ? 'active' : ''}
          onClick={() => navigateTo('/manager/reviews/new')}
          title="Create Review"
        >
          {icons.templates}
        </button>
        
        {/* Divider */}
        <div className="sidebar-divider"></div>
        
        <button 
          className={currentActiveView === 'review-cycles' ? 'active' : ''}
          onClick={() => navigateTo('/review-cycles')}
          title="Review Cycles"
        >
          {icons.calendar}
        </button>
        
        <button 
          className={currentActiveView === 'kpis' ? 'active' : ''}
          onClick={() => navigateTo('/kpis')}
          title="KPI Management"
        >
          {icons.kpis}
        </button>
        
        {/* Exit Impersonation - only if impersonating */}
        {isSuperAdmin && isImpersonating && (
          <>
            <div className="sidebar-divider"></div>
            <button 
              onClick={handleExitImpersonation}
              title="Exit Impersonation"
              style={{
                color: '#f6ad55',
                fontSize: '1.1em'
              }}
            >
              {icons.exit}
            </button>
          </>
        )}
      </>
    );
  };

  // Determine which sidebar to show based ONLY on user role
  const showManagerSidebar = isManager;
  const showSuperAdminSidebar = isSuperAdmin && isInSuperAdminSection && !isImpersonating;
  const showDefaultSidebar = !showManagerSidebar && !showSuperAdminSidebar;

  return (
    <div className="dashboard-container">
      {/* Header with company info and user info - using inline styles for maximum compatibility */}
      <header style={fixedHeaderStyle}>
        {/* Company Logo & Name - always visible regardless of sidebar state */}
        <div style={companyInfoStyle}>
          <img 
            src={companyInfo.logo || defaultLogoUrl} 
            alt={`${companyInfo.name} Logo`} 
            style={logoStyle}
          />
          
          {/* Company name - always visible */}
          <span style={companyNameStyle}>
            {companyInfo.name}
          </span>
          
          {/* Show Super Admin badge if in Super Admin section */}
          {isInSuperAdminSection && (
            <span style={superAdminBadgeStyle}>
              SUPER ADMIN
            </span>
          )}
          
          {/* Show Manager badge for manager role */}
          {isManager && (
            <span style={managerBadgeStyle}>
              MANAGER
            </span>
          )}
          
          {/* Show impersonation badge if Super Admin is impersonating */}
          {isImpersonating && isSuperAdmin && !isInSuperAdminSection && (
            <span style={impersonationBadgeStyle}>
              <span>VIEWING AS {impersonatedCustomer?.name || 'CUSTOMER'}</span>
              <button 
                onClick={handleExitImpersonation}
                style={exitImpersonationButtonStyle}
                title="Exit impersonation"
              >
                {icons.exit}
              </button>
            </span>
          )}
        </div>
        
        {/* User Info & Logout */}
        <div style={userInfoStyle}>
          {/* Return to Super Admin button - only visible when impersonating */}
          {isSuperAdmin && isImpersonating && !isInSuperAdminSection && (
            <button 
              onClick={handleReturnToSuperAdmin}
              style={returnToSuperAdminButtonStyle}
            >
              <MdSupervisorAccount style={{ fontSize: '1.2em' }} />
              Return to Super Admin
            </button>
          )}
          
          <span style={userNameStyle}>
            {`${currentUser.firstName} ${currentUser.lastName || ''}`}
          </span>
          
          <a 
            href="#"
            onClick={handleLogout}
            style={logoutButtonStyle}
          >
            LOGOUT
          </a>
        </div>
      </header>
      
      <div className="dashboard-main">
        {/* Sidebar uses classes that match Dashboard.css */}
        <aside className={`dashboard-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          {/* Sidebar toggle button */}
          <button 
            className="sidebar-toggle"
            onClick={toggleSidebar}
          >
            {sidebarCollapsed ? <MdChevronRight /> : <MdChevronLeft />}
          </button>
          
          {/* Show different sidebar based on user role */}
          {!sidebarCollapsed && (
            <>
              {showSuperAdminSidebar && (
                <SuperAdminSidebar 
                  activeView={currentActiveView} 
                  setActiveView={setActiveView} 
                />
              )}
              
              {showManagerSidebar && renderManagerSidebar()}
              
              {showDefaultSidebar && (
                <nav className="sidebar-menu">
                  <button 
                    className={currentActiveView === 'dashboard' ? 'active' : ''}
                    onClick={() => navigateTo('/dashboard')}
                  >
                    <span className="sidebar-icon">{icons.dashboard}</span>
                    Dashboard
                  </button>
                  
                  <button 
                    className={currentActiveView === 'my-reviews' ? 'active' : ''}
                    onClick={() => navigateTo('/my-reviews')}
                  >
                    <span className="sidebar-icon">{icons.myReviews}</span>
                    My Reviews
                  </button>
                  
                  {/* Management section */}
                  <div className="sidebar-heading">Management</div>
                  <button 
                    className={currentActiveView === 'team-reviews' ? 'active' : ''}
                    onClick={() => navigateTo('/team-reviews')}
                  >
                    <span className="sidebar-icon">{icons.teamReviews}</span>
                    Team Reviews
                  </button>
                  
                  {/* Administration section */}
                  <div className="sidebar-heading">Administration</div>
                  <button 
                    className={currentActiveView === 'employees' ? 'active' : ''}
                    onClick={() => navigateTo('/employees')}
                  >
                    <span className="sidebar-icon">{icons.employees}</span>
                    Employees
                  </button>
                  <button 
                    className={currentActiveView === 'settings' ? 'active' : ''}
                    onClick={() => navigateTo('/settings')}
                  >
                    <span className="sidebar-icon">{icons.settings}</span>
                    Settings
                  </button>
                  <button 
                    className={currentActiveView === 'review-cycles' ? 'active' : ''}
                    onClick={() => navigateTo('/review-cycles')}
                  >
                    <span className="sidebar-icon">{icons.reviewCycles}</span>
                    Review Cycles
                  </button>
                  <button 
                    className={currentActiveView === 'templates' ? 'active' : ''}
                    onClick={() => navigateTo('/templates')}
                  >
                    <span className="sidebar-icon">{icons.templates}</span>
                    Templates
                  </button>
                  <button 
                    className={currentActiveView === 'kpis' ? 'active' : ''}
                    onClick={() => navigateTo('/kpis')}
                  >
                    <span className="sidebar-icon">{icons.kpis}</span>
                    KPI Management
                  </button>
                  
                  {/* Tools section */}
                  <div className="sidebar-heading">Tools</div>
                  <div className="tools-dropdown">
                    <button 
                      className={`dropdown-button ${currentActiveView.startsWith('tools-') ? 'active' : ''}`}
                      onClick={handleToolsToggle}
                    >
                      <span className="sidebar-icon">{icons.tools}</span>
                      Tools {toolsOpen ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
                    </button>
                    {toolsOpen && (
                      <div className="dropdown-menu">
                        <button 
                          className={currentActiveView === 'tools-imports' ? 'active' : ''}
                          onClick={() => navigateTo('/import-tool')}
                        >
                          Imports
                        </button>
                        <button 
                          className={currentActiveView === 'tools-exports' ? 'active' : ''}
                          onClick={() => navigateTo('/export-tool')}
                        >
                          Exports
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Super Admin Access - only show for superadmin users who are not impersonating */}
                  {isSuperAdmin && !isImpersonating && !isInSuperAdminSection && (
                    <>
                      <div className="sidebar-heading">Super Admin</div>
                      <button 
                        className="super-admin-button"
                        onClick={() => navigateTo('/super-admin/customers')}
                        style={{
                          backgroundColor: 'rgba(99, 102, 241, 0.1)',
                          borderLeft: '3px solid #6366f1'
                        }}
                      >
                        <span className="sidebar-icon">{icons.superAdmin}</span>
                        Super Admin Portal
                      </button>
                    </>
                  )}
                  
                  {/* Exit Impersonation - only show for superadmin users who are impersonating */}
                  {isSuperAdmin && isImpersonating && (
                    <>
                      <div className="sidebar-heading">Super Admin</div>
                      <button 
                        className="exit-impersonation-button"
                        onClick={handleExitImpersonation}
                        style={{
                          backgroundColor: 'rgba(246, 173, 85, 0.1)',
                          borderLeft: '3px solid #f6ad55',
                          color: '#744210'
                        }}
                      >
                        <span className="sidebar-icon">{icons.exit}</span>
                        Exit Impersonation
                      </button>
                    </>
                  )}
                </nav>
              )}
            </>
          )}
          
          {/* Collapsed mode sidebar icons */}
          {sidebarCollapsed && (
            <nav className="sidebar-menu-icons">
              {showSuperAdminSidebar && (
                <>
                  {/* Super Admin icons */}
                  <button 
                    className={isActivePath('/super-admin/customers') ? 'active' : ''}
                    onClick={() => navigateTo('/super-admin/customers')}
                    title="Organizations"
                  >
                    <MdSupervisorAccount />
                  </button>
                  <button 
                    className={isActivePath('/super-admin/users') ? 'active' : ''}
                    onClick={() => navigateTo('/super-admin/users')}
                    title="User Management"
                  >
                    <MdPeople />
                  </button>
                  <button 
                    className={isActivePath('/super-admin/analytics') ? 'active' : ''}
                    onClick={() => navigateTo('/super-admin/analytics')}
                    title="System Analytics"
                  >
                    <MdBarChart />
                  </button>
                  <button 
                    className={isActivePath('/super-admin/settings') ? 'active' : ''}
                    onClick={() => navigateTo('/super-admin/settings')}
                    title="System Settings"
                  >
                    <MdSettings />
                  </button>
                  
                  {/* Divider */}
                  <div className="sidebar-divider"></div>
                  
                  {/* Link back to dashboard */}
                  <button 
                    onClick={() => navigateTo('/dashboard')}
                    title="Return to Dashboard"
                  >
                    {icons.dashboard}
                  </button>
                </>
              )}
              
              {showManagerSidebar && renderManagerIcons()}
              
              {showDefaultSidebar && (
                <>
                  {/* Regular dashboard icons */}
                  <button 
                    className={currentActiveView === 'dashboard' ? 'active' : ''}
                    onClick={() => navigateTo('/dashboard')}
                    title="Dashboard"
                  >
                    {icons.dashboard}
                  </button>
                  
                  <button 
                    className={currentActiveView === 'my-reviews' ? 'active' : ''}
                    onClick={() => navigateTo('/my-reviews')}
                    title="My Reviews"
                  >
                    {icons.myReviews}
                  </button>
                  
                  {/* Divider */}
                  <div className="sidebar-divider"></div>
                  
                  <button 
                    className={currentActiveView === 'team-reviews' ? 'active' : ''}
                    onClick={() => navigateTo('/team-reviews')}
                    title="Team Reviews"
                  >
                    {icons.teamReviews}
                  </button>
                  
                  {/* Divider */}
                  <div className="sidebar-divider"></div>
                  
                  <button 
                    className={currentActiveView === 'employees' ? 'active' : ''}
                    onClick={() => navigateTo('/employees')}
                    title="Employees"
                  >
                    {icons.employees}
                  </button>
                  <button 
                    className={currentActiveView === 'settings' ? 'active' : ''}
                    onClick={() => navigateTo('/settings')}
                    title="Settings"
                  >
                    {icons.settings}
                  </button>
                  <button 
                    className={currentActiveView === 'review-cycles' ? 'active' : ''}
                    onClick={() => navigateTo('/review-cycles')}
                    title="Review Cycles"
                  >
                    {icons.reviewCycles}
                  </button>
                  <button 
                    className={currentActiveView === 'templates' ? 'active' : ''}
                    onClick={() => navigateTo('/templates')}
                    title="Templates"
                  >
                    {icons.templates}
                  </button>
                  <button 
                    className={currentActiveView === 'kpis' ? 'active' : ''}
                    onClick={() => navigateTo('/kpis')}
                    title="KPI Management"
                  >
                    {icons.kpis}
                  </button>
                  
                  {/* Divider */}
                  <div className="sidebar-divider"></div>
                  
                  <button 
                    className={currentActiveView.startsWith('tools-') ? 'active' : ''}
                    onClick={() => navigateTo('/import-tool')}
                    title="Tools"
                  >
                    {icons.tools}
                  </button>
                  
                  {/* Super Admin access */}
                  {isSuperAdmin && !isImpersonating && (
                    <>
                      <div className="sidebar-divider"></div>
                      <button 
                        onClick={() => navigateTo('/super-admin/customers')}
                        title="Super Admin Portal"
                        style={{
                          color: '#6366f1',
                          fontSize: '1.1em'
                        }}
                      >
                        {icons.superAdmin}
                      </button>
                    </>
                  )}
                  
                  {/* Exit Impersonation - only if impersonating */}
                  {isSuperAdmin && isImpersonating && (
                    <>
                      <div className="sidebar-divider"></div>
                      <button 
                        onClick={handleExitImpersonation}
                        title="Exit Impersonation"
                        style={{
                          color: '#f6ad55',
                          fontSize: '1.1em'
                        }}
                      >
                        {icons.exit}
                      </button>
                    </>
                  )}
                </>
              )}
            </nav>
          )}
        </aside>
        
        {/* Content area that matches Dashboard.css */}
        <main className={`dashboard-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`} style={{marginTop: "60px"}}>
          <div className="dashboard-content-wrapper">
            <div className="dashboard-content-inner">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Default props in case any are missing
SidebarLayout.defaultProps = {
  user: { firstName: 'Guest', lastName: '', role: 'USER' },
  activeView: 'dashboard',
  setActiveView: () => {}
};

export default SidebarLayout;