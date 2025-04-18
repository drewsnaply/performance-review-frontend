import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Import icons
import { 
  MdDashboard, 
  MdPeople, 
  MdAssignment, 
  MdAssessment, 
  MdDateRange,
  MdPerson,
  MdSettings,
  MdExpandLess,
  MdExpandMore,
  MdExitToApp
} from 'react-icons/md';

const ManagerSidebar = ({ activeView, user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, impersonating, exitImpersonation } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  // Detect if user is a super admin impersonating
  const isSuperAdmin = user && (user.role === 'superadmin' || user.role === 'super_admin');
  const isImpersonating = impersonating || localStorage.getItem('impersonatedCustomer');

  const handleSectionToggle = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Handle exit impersonation
  const handleExitImpersonation = () => {
    if (typeof exitImpersonation === 'function') {
      exitImpersonation();
    } else {
      // Fallback if context method is not available
      localStorage.removeItem('impersonatedCustomer');
    }
    
    // Navigate to Super Admin
    navigate('/super-admin/customers');
  };

  // Check if a path is active
  const isActivePath = (path) => {
    return location.pathname.startsWith(path);
  };

  // Navigation items for manager
  const navItems = [
    {
      icon: <MdDashboard />,
      label: 'Dashboard',
      path: '/manager/dashboard',
      isActive: activeView === 'manager-dashboard' || isActivePath('/manager/dashboard')
    },
    {
      icon: <MdPeople />,
      label: 'Team',
      section: 'team',
      isExpanded: expandedSection === 'team',
      isActive: activeView === 'team' || isActivePath('/team-reviews'),
      onClick: () => handleSectionToggle('team'),
      subItems: [
        {
          label: 'Team Overview',
          path: '/manager/dashboard?tab=team',
          isActive: activeView === 'team-overview'
        },
        {
          label: 'Team Reviews',
          path: '/team-reviews',
          isActive: activeView === 'team-reviews' || isActivePath('/team-reviews')
        }
      ]
    },
    {
      icon: <MdAssignment />,
      label: 'Reviews',
      section: 'reviews',
      isExpanded: expandedSection === 'reviews',
      isActive: activeView === 'reviews' || isActivePath('/pending-reviews') || isActivePath('/manager/reviews'),
      onClick: () => handleSectionToggle('reviews'),
      subItems: [
        {
          label: 'Pending Reviews',
          path: '/pending-reviews',
          isActive: activeView === 'pending-reviews' || isActivePath('/pending-reviews')
        },
        {
          label: 'Create Review',
          path: '/manager/reviews/new',
          isActive: activeView === 'create-review' || isActivePath('/manager/reviews/new')
        }
      ]
    },
    {
      icon: <MdDateRange />,
      label: 'Review Cycles',
      path: '/review-cycles',
      isActive: activeView === 'review-cycles' || isActivePath('/review-cycles')
    },
    {
      icon: <MdAssessment />,
      label: 'KPI Management',
      path: '/kpis',
      isActive: activeView === 'kpis' || isActivePath('/kpis')
    },
    {
      icon: <MdPerson />,
      label: 'My Profile',
      path: '/profile',
      isActive: activeView === 'profile' || isActivePath('/profile')
    }
  ];

  // If super admin is impersonating, add exit option
  if (isSuperAdmin && isImpersonating) {
    navItems.push({
      icon: <MdExitToApp />,
      label: 'Exit Impersonation',
      onClick: handleExitImpersonation,
      isActive: false,
      className: 'exit-impersonation'
    });
  }

  return (
    <div className={`manager-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <img src="/logo.svg" alt="Logo" />
          {!collapsed && <span>Performance Review</span>}
        </div>
        <button 
          className="collapse-btn" 
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <MdExpandMore /> : <MdExpandLess />}
        </button>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">
          {user?.name?.charAt(0) || user?.firstName?.charAt(0) || 'U'}
        </div>
        {!collapsed && (
          <div className="user-info">
            <div className="user-name">{user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`}</div>
            <div className="user-role">Manager</div>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item, index) => (
          <div key={index} className="nav-item-container">
            {item.subItems ? (
              <>
                <div 
                  className={`nav-item ${item.isActive ? 'active' : ''} ${item.className || ''}`}
                  onClick={item.onClick}
                >
                  <div className="nav-item-content">
                    {item.icon}
                    {!collapsed && <span>{item.label}</span>}
                  </div>
                  {!collapsed && (
                    <span className="expand-icon">
                      {item.isExpanded ? <MdExpandLess /> : <MdExpandMore />}
                    </span>
                  )}
                </div>
                {item.isExpanded && !collapsed && (
                  <div className="sub-nav">
                    {item.subItems.map((subItem, subIndex) => (
                      <NavLink
                        key={subIndex}
                        to={subItem.path}
                        className={({ isActive }) => 
                          `sub-nav-item ${isActive || subItem.isActive ? 'active' : ''}`
                        }
                      >
                        <span>{subItem.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </>
            ) : item.path ? (
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  `nav-item ${isActive || item.isActive ? 'active' : ''} ${item.className || ''}`
                }
              >
                <div className="nav-item-content">
                  {item.icon}
                  {!collapsed && <span>{item.label}</span>}
                </div>
              </NavLink>
            ) : (
              <div 
                className={`nav-item ${item.isActive ? 'active' : ''} ${item.className || ''}`}
                onClick={item.onClick}
              >
                <div className="nav-item-content">
                  {item.icon}
                  {!collapsed && <span>{item.label}</span>}
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          {collapsed ? <MdExitToApp /> : <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default ManagerSidebar;