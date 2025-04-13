import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Import React Icons (you need to install this package)
// npm install react-icons --save
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
  MdChevronRight
} from 'react-icons/md';

// Import the dedicated CSS file
import '../styles/SidebarLayout.css';

function SidebarLayout({ children, user, activeView, setActiveView }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [toolsOpen, setToolsOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { logout } = useAuth(); // Keep for compatibility
  const [companyInfo, setCompanyInfo] = useState({
    name: 'Performance Review System',
    logo: null
  });

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
      '/export-tool': 'tools-exports'
    };

    const activeViewName = viewMapping[route] || route.replace('/', '');
    
    // Only call setActiveView if it's a function
    if (typeof setActiveView === 'function') {
      setActiveView(activeViewName);
    }
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
    tools: <MdBuild />                  // Tool/Wrench icon
  };

  // Fallback to default if user or activeView is undefined
  const currentUser = user || { firstName: 'Guest', lastName: '', role: 'USER' };
  const currentActiveView = activeView || 'dashboard';

  // Default logo if no company logo is set
  const defaultLogoUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMTdDMTQuNzYxNCAxNyAxNyAxNC43NjE0IDE3IDEyQzE3IDkuMjM4NTggMTQuNzYxNCA3IDEyIDdDOS4yMzg1OCA3IDcgOS4yMzg1OCA3IDEyQzcgMTQuNzYxNCA5LjIzODU4IDE3IDEyIDE3WiIgc3Ryb2tlPSIjNjM2NmYxIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xMiAyM0MxOC4wNzUxIDIzIDIzIDE4LjA3NTEgMjMgMTJDMjMgNS45MjQ4NyAxOC4wNzUxIDEgMTIgMUM1LjkyNDg3IDEgMSA1LjkyNDg3IDEgMTJDMSAxOC4wNzUxIDUuOTI0ODcgMjMgMTIgMjNaIiBzdHJva2U9IiM2MzY2ZjEiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+';

  return (
    <div className="dashboard-container">
      {/* Header with company info and user info */}
      <header className={`dashboard-header ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`} 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 20px',
          height: '60px',
          backgroundColor: '#fff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
        }}
      >
        {/* Company Logo & Name - always visible regardless of sidebar state */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <img 
            src={companyInfo.logo || defaultLogoUrl} 
            alt={`${companyInfo.name} Logo`} 
            style={{
              height: '40px',
              width: 'auto',
              maxWidth: '40px',
              objectFit: 'contain'
            }}
          />
          
          {/* Company name - always visible */}
          <span style={{
            fontSize: '1.2rem',
            fontWeight: 600,
            color: '#4a5568',
            display: 'block' // Force display
          }}>
            {companyInfo.name}
          </span>
        </div>
        
        {/* User Info & Logout */}
        <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span className="user-name" style={{ fontSize: '0.95rem', fontWeight: 500 }}>
            {`${currentUser.firstName} ${currentUser.lastName || ''}`}
          </span>
          
          <a 
            href="#"
            className="logout-button"
            onClick={handleLogout}
            style={{ 
              backgroundColor: '#6366f1',
              color: 'white',
              padding: '6px 16px',
              borderRadius: '4px',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: 500
            }}
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
          
          {!sidebarCollapsed && (
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
              
              {/* Always show Management section - removes role restriction */}
              <div className="sidebar-heading">Management</div>
              <button 
                className={currentActiveView === 'team-reviews' ? 'active' : ''}
                onClick={() => navigateTo('/team-reviews')}
              >
                <span className="sidebar-icon">{icons.teamReviews}</span>
                Team Reviews
              </button>
              
              {/* Always show Administration section - removes role restriction */}
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
              
              {/* Always show Tools section - removes role restriction */}
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
            </nav>
          )}
          
          {sidebarCollapsed && (
            <nav className="sidebar-menu-icons">
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
              
              {/* Always include divider for visual separation */}
              <div className="sidebar-divider"></div>
              
              <button 
                className={currentActiveView === 'team-reviews' ? 'active' : ''}
                onClick={() => navigateTo('/team-reviews')}
                title="Team Reviews"
              >
                {icons.teamReviews}
              </button>
              
              {/* Always include divider for visual separation */}
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
              
              {/* Always include divider for visual separation */}
              <div className="sidebar-divider"></div>
              
              <button 
                className={currentActiveView.startsWith('tools-') ? 'active' : ''}
                onClick={() => navigateTo('/import-tool')}
                title="Tools"
              >
                {icons.tools}
              </button>
            </nav>
          )}
        </aside>
        
        {/* Content area that matches Dashboard.css */}
        <main className={`dashboard-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
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