import React, { useState, useEffect } from 'react';
import { 
  MdSupervisorAccount, 
  MdExitToApp, 
  MdMenu, 
  MdNotifications, 
  MdSearch,
  MdHelp,
  MdSettings,
  MdPerson,
  MdClose,
  MdAssignment,
  MdTimer
} from 'react-icons/md';
import { 
  FaUserCircle, 
  FaChevronDown, 
  FaBuilding, 
  FaHome,
  FaBell,
  FaCrown
} from 'react-icons/fa';
import '../styles/ModernHeader.css';
import { useAuth } from '../context/AuthContext'; // Ensure this import exists

const Header = ({
  userRole,
  sidebarCollapsed,
  toggleSidebar,
  currentUser,
  companyInfo,
  handleLogout: externalHandleLogout,
  isImpersonating,
  impersonatedCustomer,
  isSuperAdmin,
  isInSuperAdminSection,
  handleExitImpersonation,
  handleReturnToSuperAdmin: externalHandleReturnToSuperAdmin,
  user
}) => {
  // Local state
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [localIsImpersonating, setLocalIsImpersonating] = useState(false);
  const [localImpersonatedCustomer, setLocalImpersonatedCustomer] = useState(null);
  
  // Get auth context to ensure logout works
  const { logout: authLogout, exitImpersonation } = useAuth();
  
  // Use the correct user object
  const activeUser = user || currentUser;
  
  // Determine if we're actually impersonating (but never on superadmin pages)
  const isSuperAdminDashboard = window.location.pathname.includes('/super-admin');
  const isActuallyImpersonating = !isSuperAdminDashboard && 
    (localIsImpersonating || (isImpersonating && impersonatedCustomer));
  const customerData = impersonatedCustomer || localImpersonatedCustomer;

  // Toggle functions
  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
    setNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    setUserMenuOpen(false);
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
  };

  // Ensure logout works properly
  const handleLogout = () => {
    // Try external handler first
    if (typeof externalHandleLogout === 'function') {
      externalHandleLogout();
    } else {
      // Fallback to auth context logout
      authLogout();
      // Redirect to login page
      window.location.href = '/login';
    }
  };

  // Handle Return to Enterprise functionality - ENHANCED VERSION
  const handleReturnToSuperAdmin = () => {
    // Try external handler first
    if (typeof externalHandleReturnToSuperAdmin === 'function') {
      externalHandleReturnToSuperAdmin();
      return;
    }

    // If no external handler, implement our own solution
    console.log("Returning to Super Admin...");
    
    try {
      // Get user data to verify superadmin role
      const userData = localStorage.getItem('user');
      if (!userData) {
        console.error('No user data found');
        window.location.href = '/login';
        return;
      }

      // Parse user data
      const user = JSON.parse(userData);
      
      // Store original user data if not already stored
      if (!localStorage.getItem('originalUser')) {
        localStorage.setItem('originalUser', userData);
      }
      
      // First: Call the context exitImpersonation function to handle state changes
      if (typeof exitImpersonation === 'function') {
        exitImpersonation();
      }
      
      // Set three special flags to ensure auth check bypassing
      localStorage.setItem('exiting_impersonation', 'true');
      localStorage.setItem('superadmin_return', 'true');
      localStorage.setItem('manual_redirect_in_progress', 'true');
      
      // Clear all impersonation data
      localStorage.removeItem('impersonatedCustomer');
      localStorage.removeItem('impersonation_active');
      localStorage.removeItem('impersonationToken');
      
      // Update local state
      setLocalIsImpersonating(false);
      setLocalImpersonatedCustomer(null);
      
      // Short delay to allow state updates to process
      setTimeout(() => {
        // Force a direct navigation to ensure page reload
        // This is necessary to reset the application state
        window.location.replace('/super-admin/customers');
      }, 100);
    } catch (error) {
      console.error('Error during return to enterprise:', error);
      // Fallback to dashboard on error
      window.location.href = '/dashboard';
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-menu-container') && !event.target.closest('.notifications-container')) {
        setUserMenuOpen(false);
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Check for impersonation data
  useEffect(() => {
    const checkImpersonation = () => {
      try {
        const isSuperAdminDashboard = window.location.pathname.includes('/super-admin/customers');
        
        if (isSuperAdminDashboard && isSuperAdmin) {
          setLocalIsImpersonating(false);
          setLocalImpersonatedCustomer(null);
          return;
        }
        
        const impersonationData = localStorage.getItem('impersonatedCustomer');
        if (impersonationData && !isSuperAdminDashboard) {
          const parsedData = JSON.parse(impersonationData);
          setLocalIsImpersonating(true);
          setLocalImpersonatedCustomer(parsedData);
        } else if (!impersonationData) {
          setLocalIsImpersonating(false);
          setLocalImpersonatedCustomer(null);
        }
      } catch (e) {
        console.error('Error checking impersonation data:', e);
      }
    };

    checkImpersonation();
    const intervalId = setInterval(checkImpersonation, 1000);
    
    return () => clearInterval(intervalId);
  }, [isSuperAdmin]);

  // Update from props
  useEffect(() => {
    const isSuperAdminDashboard = window.location.pathname.includes('/super-admin/customers');
    if (isSuperAdminDashboard && isSuperAdmin) {
      return;
    }
    
    if (isImpersonating && impersonatedCustomer) {
      setLocalIsImpersonating(true);
      setLocalImpersonatedCustomer(impersonatedCustomer);
    }
  }, [isImpersonating, impersonatedCustomer, isSuperAdmin]);

  // Mock notifications data
  const mockNotifications = [
    { 
      id: 1, 
      title: 'New Review Assigned', 
      message: 'You have a new review to complete for John Doe', 
      time: '5 minutes ago', 
      read: false,
      priority: 'high',
      type: 'review'
    },
    { 
      id: 2, 
      title: 'Review Deadline Approaching', 
      message: 'Review for Sarah Smith is due tomorrow', 
      time: '1 hour ago', 
      read: false,
      priority: 'medium',
      type: 'deadline'
    },
    { 
      id: 3, 
      title: 'System Update', 
      message: 'Performance Review System has been updated to version 2.4.1', 
      time: '1 day ago', 
      read: true,
      priority: 'low',
      type: 'system'
    }
  ];

  // Unread notifications count
  const unreadCount = mockNotifications.filter(n => !n.read).length;

  // Get appropriate role badge
  const getRoleBadge = () => {
    if (isSuperAdmin) return { label: 'SUPER ADMIN', color: 'super-admin', icon: <FaCrown className="role-icon" /> };
    if (userRole === 'admin') return { label: 'ADMIN', color: 'admin', icon: null };
    if (userRole === 'manager') return { label: 'MANAGER', color: 'manager', icon: null };
    if (userRole === 'employee') return { label: 'EMPLOYEE', color: 'employee', icon: null };
    return { label: 'USER', color: 'default', icon: null };
  };

  const roleBadge = getRoleBadge();

  // Get notification type icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'review': return <MdAssignment className="notification-type-icon review" />;
      case 'deadline': return <MdTimer className="notification-type-icon deadline" />;
      case 'system': return <MdSettings className="notification-type-icon system" />;
      case 'feedback': return <MdStar className="notification-type-icon feedback" />;
      default: return <FaBell className="notification-type-icon" />;
    }
  };

  return (
    <>
      {/* Impersonation Banner */}
      {isActuallyImpersonating && customerData && !isSuperAdminDashboard && (
        <div className="impersonation-banner">
          <div className="impersonation-content">
            <MdSupervisorAccount />
            <span>You are impersonating <strong>{customerData.name}</strong></span>
            <button 
              onClick={handleReturnToSuperAdmin} 
              className="exit-impersonation-button"
            >
              <MdExitToApp />
              <span>Exit</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Header */}
      <header className={`modern-header ${isActuallyImpersonating ? 'with-banner' : ''}`}>
        <div className="header-container">
          {/* Left Section - Logo & Menu */}
          <div className="header-left">
            <button 
              className="sidebar-toggle"
              onClick={toggleSidebar}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <MdMenu />
            </button>
            
            <div className="logo">
              <div className="logo-icon">
                <span className="logo-letter">PR</span>
              </div>
              <h1 className="app-title">Performance Review</h1>
            </div>
          </div>
          
          {/* Center Section - Only Search */}
          <div className="header-center">
            {searchOpen && (
              <div className="search-container">
                <div className="search-input-container">
                  <input 
                    type="text" 
                    className="search-input" 
                    placeholder="Search..." 
                    autoFocus
                  />
                </div>
                <button className="search-toggle close" onClick={toggleSearch}>
                  <MdClose />
                </button>
              </div>
            )}
          </div>
          
          {/* Right Section - Actions & Profile */}
          <div className="header-right">
            {/* Logout button with improved styling */}
            <button 
              className="premium-logout-button"
              onClick={handleLogout}
              title="Logout"
            >
              <MdExitToApp className="logout-icon" />
              <span className="logout-text">Logout</span>
            </button>
            
            {/* Contextual Action Buttons */}
            {isActuallyImpersonating && !isSuperAdminDashboard && (
              <button 
                className="header-action-button enterprise"
                onClick={handleReturnToSuperAdmin}
                title="Return to Enterprise"
              >
                <FaBuilding />
                <span className="action-text">Return to Enterprise</span>
              </button>
            )}
            
            {!isActuallyImpersonating && isSuperAdmin && isInSuperAdminSection && (
              <button 
                className="header-action-button dashboard"
                onClick={() => window.location.href = '/dashboard'}
                title="Go to Dashboard"
              >
                <FaHome />
                <span className="action-text">Dashboard</span>
              </button>
            )}
            
            {/* Tools & Utilities */}
            <div className="header-tools">
              {/* Search button - only shown when search is not open */}
              {!searchOpen && (
                <button 
                  className="tool-button"
                  onClick={toggleSearch}
                  title="Search"
                >
                  <MdSearch />
                </button>
              )}
              
              <button 
                className="tool-button"
                onClick={() => window.open('/help', '_blank')}
                title="Help"
              >
                <MdHelp />
              </button>
              
              {/* Notifications */}
              <div className="notifications-container">
                <button 
                  className={`tool-button ${notificationsOpen ? 'active' : ''}`}
                  onClick={toggleNotifications}
                  title="Notifications"
                >
                  <div className="notification-badge">
                    <FaBell />
                    {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
                  </div>
                </button>
                
                {notificationsOpen && (
                  <div className="notifications-dropdown">
                    <div className="dropdown-header">
                      <h3>Notifications</h3>
                      <button className="mark-all-read">Mark all as read</button>
                    </div>
                    
                    <div className="notifications-list">
                      {mockNotifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`notification-item ${notification.read ? 'read' : 'unread'} priority-${notification.priority}`}
                        >
                          <div className="notification-icon">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="notification-content">
                            <div className="notification-title">{notification.title}</div>
                            <div className="notification-message">{notification.message}</div>
                            <div className="notification-time">{notification.time}</div>
                          </div>
                          <div className="notification-actions">
                            <button className="notification-action mark-read" title="Mark as read">
                              <MdCheck size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="dropdown-footer">
                      <button className="view-all">View all notifications</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* User Profile Menu */}
            <div className="user-menu-container">
              <button 
                className={`user-menu-toggle ${userMenuOpen ? 'active' : ''}`}
                onClick={toggleUserMenu}
                aria-expanded={userMenuOpen}
              >
                <div className="user-avatar">
                  {activeUser?.image ? (
                    <img src={activeUser.image} alt={activeUser?.username || 'User'} />
                  ) : (
                    <FaUserCircle />
                  )}
                </div>
                
                <div className="user-info">
                  <span className="username">{activeUser?.username || 'User'}</span>
                  <div className={`role-badge ${roleBadge.color}`}>
                    {roleBadge.icon}
                    <span>{roleBadge.label}</span>
                  </div>
                </div>
                
                <FaChevronDown className={`dropdown-arrow ${userMenuOpen ? 'open' : ''}`} />
              </button>
              
              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <div className="user-avatar large">
                      {activeUser?.image ? (
                        <img src={activeUser.image} alt={activeUser?.username || 'User'} />
                      ) : (
                        <FaUserCircle />
                      )}
                    </div>
                    
                    <div className="user-details">
                      <div className="user-fullname">{activeUser?.firstName} {activeUser?.lastName || activeUser?.username || 'User'}</div>
                      <div className="user-email">{activeUser?.email || 'user@example.com'}</div>
                      <div className={`role-badge ${roleBadge.color}`}>
                        {roleBadge.icon}
                        <span>{roleBadge.label}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="dropdown-menu-items">
                    <button className="menu-item">
                      <MdPerson className="menu-icon" />
                      <span>My Profile</span>
                    </button>
                    
                    <button className="menu-item">
                      <MdSettings className="menu-icon" />
                      <span>Account Settings</span>
                    </button>
                    
                    <div className="dropdown-divider"></div>
                    
                    <button 
                      className="menu-item logout"
                      onClick={handleLogout}
                    >
                      <MdExitToApp className="menu-icon" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

// Define missing icon component
const MdCheck = (props) => {
  const { size = 16, ...restProps } = props;
  return <span style={{ fontSize: `${size}px` }} {...restProps}>✓</span>;
};

// Define missing icon component
const MdStar = (props) => {
  return <span {...props}>⭐</span>;
};

export default Header;