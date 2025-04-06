import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';

function SidebarLayout({ children, user, activeView, setActiveView }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [toolsOpen, setToolsOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { logout } = useAuth(); // Keep for compatibility

  // Check localStorage for saved sidebar state on component mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setSidebarCollapsed(JSON.parse(savedState));
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
      '/evaluation-management': 'evaluation-management',
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

  // Fallback to default if user or activeView is undefined
  const currentUser = user || { firstName: 'Guest', lastName: '', role: 'USER' };
  const currentActiveView = activeView || 'dashboard';

  return (
    <div className="dashboard-container">
      <div className={`dashboard-header ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="user-info">
          <span className="user-name">
            {`${currentUser.firstName} ${currentUser.lastName}`}
          </span>
          
          {/* Logout button */}
          <a 
            href="#"
            className="logout-button"
            onClick={handleLogout}
          >
            LOGOUT
          </a>
        </div>
      </div>
      
      <div className="dashboard-main">
        <aside className={`dashboard-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          {/* Highly visible toggle button */}
          <button 
            className="sidebar-toggle"
            onClick={toggleSidebar}
            style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              background: 'white',
              color: '#5a189a',
              border: 'none',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              zIndex: 1001,
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)'
            }}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
          
          {!sidebarCollapsed && (
            <nav className="sidebar-menu">
              <button 
                className={currentActiveView === 'dashboard' ? 'active' : ''}
                onClick={() => navigateTo('/dashboard')}
              >
                Dashboard
              </button>
              
              <button 
                className={currentActiveView === 'my-reviews' ? 'active' : ''}
                onClick={() => navigateTo('/my-reviews')}
              >
                My Reviews
              </button>
              
              {(currentUser.role === 'MANAGER' || currentUser.role === 'ADMIN') && (
                <>
                  <div className="sidebar-heading">Management</div>
                  <button 
                    className={currentActiveView === 'team-reviews' ? 'active' : ''}
                    onClick={() => navigateTo('/team-reviews')}
                  >
                    Team Reviews
                  </button>
                </>
              )}
              
              {currentUser.role === 'ADMIN' && (
                <>
                  <div className="sidebar-heading">Administration</div>
                  <button 
                    className={currentActiveView === 'employees' ? 'active' : ''}
                    onClick={() => navigateTo('/employees')}
                  >
                    Employees
                  </button>
                  {/* Add the Department Management Button */}
                  <button 
                    className={currentActiveView === 'settings' ? 'active' : ''}
                    onClick={() => navigateTo('/settings')}
                  >
                    Settings
                  </button>
                  <button 
                    className={currentActiveView === 'review-cycles' ? 'active' : ''}
                    onClick={() => navigateTo('/review-cycles')}
                  >
                    Review Cycles
                  </button>
                  <button 
                    className={currentActiveView === 'templates' ? 'active' : ''}
                    onClick={() => navigateTo('/templates')}
                  >
                    Templates
                  </button>
                </>
              )}

              {/* Direct Evaluation Management Button - Always Visible */}
              <div style={{margin: '10px 20px'}}>
                <button 
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    padding: '8px 0',
                    textAlign: 'left',
                    width: '100%',
                    cursor: 'pointer',
                    fontWeight: currentActiveView === 'evaluation-management' ? 'bold' : 'normal'
                  }}
                  onClick={() => navigateTo('/evaluation-management')}
                >
                  Evaluation Management
                </button>
              </div>
              
              {currentUser.role === 'ADMIN' && (
                <>
                  <div className="sidebar-heading">Tools</div>
                  <div className="tools-dropdown">
                    <button 
                      className={`dropdown-button ${currentActiveView.startsWith('tools-') ? 'active' : ''}`}
                      onClick={handleToolsToggle}
                    >
                      Tools {toolsOpen ? '▲' : '▼'}
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
                </>
              )}
            </nav>
          )}
          
          {sidebarCollapsed && (
            <nav className="sidebar-menu-icons">
              <button 
                className={currentActiveView === 'dashboard' ? 'active' : ''}
                onClick={() => navigateTo('/dashboard')}
                title="Dashboard"
              >
                🏠
              </button>
              
              <button 
                className={currentActiveView === 'my-reviews' ? 'active' : ''}
                onClick={() => navigateTo('/my-reviews')}
                title="My Reviews"
              >
                📋
              </button>
              
              {(currentUser.role === 'MANAGER' || currentUser.role === 'ADMIN') && (
                <>
                  <div className="sidebar-divider"></div>
                  <button 
                    className={currentActiveView === 'team-reviews' ? 'active' : ''}
                    onClick={() => navigateTo('/team-reviews')}
                    title="Team Reviews"
                  >
                    👥
                  </button>
                </>
              )}
              
              {currentUser.role === 'ADMIN' && (
                <>
                  <div className="sidebar-divider"></div>
                  <button 
                    className={currentActiveView === 'employees' ? 'active' : ''}
                    onClick={() => navigateTo('/employees')}
                    title="Employees"
                  >
                    👤
                  </button>
                  {/* Add Department Management Icon Button */}
                  <button 
                    className={currentActiveView === 'settings' ? 'active' : ''}
                    onClick={() => navigateTo('/settings')}
                    title="Settings"
                  >
                    🏢
                  </button>
                  <button 
                    className={currentActiveView === 'review-cycles' ? 'active' : ''}
                    onClick={() => navigateTo('/review-cycles')}
                    title="Review Cycles"
                  >
                    🔄
                  </button>
                  <button 
                    className={currentActiveView === 'templates' ? 'active' : ''}
                    onClick={() => navigateTo('/templates')}
                    title="Templates"
                  >
                    📝
                  </button>
                </>
              )}

              {/* Direct icon for Evaluation Management - Always Visible */}
              <button 
                className={currentActiveView === 'evaluation-management' ? 'active' : ''}
                onClick={() => navigateTo('/evaluation-management')}
                title="Evaluation Management"
                style={{
                  background: 'transparent',
                  color: 'rgba(255, 255, 255, 0.8)',
                  border: 'none',
                  borderRadius: '8px',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  padding: 0,
                  margin: '0.5rem auto'
                }}
              >
                📊
              </button>
              
              {currentUser.role === 'ADMIN' && (
                <>
                  <div className="sidebar-divider"></div>
                  <button 
                    className={currentActiveView.startsWith('tools-') ? 'active' : ''}
                    onClick={() => navigateTo('/import-tool')}
                    title="Tools"
                  >
                    🛠️
                  </button>
                </>
              )}
            </nav>
          )}
        </aside>
        
        <main className={`dashboard-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          {children}
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