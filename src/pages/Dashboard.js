import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/Dashboard.css';
import { useDepartments } from '../context/DepartmentContext';
import { useAuth } from '../context/AuthContext'; 

// Import components
import MyReviews from '../components/MyReviews';
import TeamReviews from '../components/TeamReviews';
import Employees from './Employees';
import ReviewCycles from '../components/ReviewCycles';
import ReviewTemplates from '../components/ReviewTemplates';
import ImportTool from '../components/ImportTool';
import ExportTool from '../components/ExportTool';
import EvaluationManagement from '../components/EvaluationManagement';
import DepartmentManager from '../components/DepartmentManager';
import ViewEvaluation from '../components/ViewEvaluation';

function Dashboard({ initialView = 'dashboard' }) {
  console.log('Dashboard component rendering - full version');
  const { employees } = useDepartments();
  const [activeView, setActiveView] = useState(initialView);
  const [reviewData, setReviewData] = useState({
    pending: 0,
    completed: 0,
    upcoming: 0,
    recentReviews: []
  });
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const params = useParams();
  
  // Get auth state directly from context - simplified approach
  const { currentUser, logout } = useAuth();
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    console.log('Dashboard useEffect triggered');
    
    if (!currentUser) {
      console.warn('No user found - redirecting to login');
      setIsLoading(false);
      navigate('/login');
      return;
    }
    
    // Create a normalized user that has firstName/lastName
    const normalizedUser = {
      ...currentUser,
      firstName: currentUser.username || 'User',
      lastName: ''
    };
    
    setUser(normalizedUser);
    
    // Fetch reviews from localStorage
    const storedReviews = localStorage.getItem('reviews');
    if (storedReviews) {
      try {
        const parsedReviews = JSON.parse(storedReviews);
        
        // Calculate review statistics
        const pendingCount = parsedReviews.filter(r => 
          r.status?.toLowerCase() === 'pending' || 
          r.status?.toLowerCase() === 'pending manager review'
        ).length;
        
        const completedCount = parsedReviews.filter(r => 
          r.status?.toLowerCase() === 'completed'
        ).length;
        
        const upcomingCount = parsedReviews.filter(r => 
          r.status?.toLowerCase() === 'upcoming'
        ).length;
        
        setReviewData({
          pending: pendingCount,
          completed: completedCount,
          upcoming: upcomingCount,
          recentReviews: parsedReviews.slice(0, 5).map(review => ({
            id: review.id,
            employee: review.employeeName || 'Unknown',
            cycle: review.reviewCycle || 'Annual Review',
            dueDate: review.submissionDate || 'N/A',
            reviewType: 'Performance',
            status: review.status?.toLowerCase() || 'pending'
          }))
        });
      } catch (error) {
        console.error('Error parsing reviews:', error);
      }
    }
    
    setIsLoading(false);
  }, [currentUser, navigate]);
  
  // Set initial view based on prop
  useEffect(() => {
    setActiveView(initialView);
  }, [initialView]);
  
  const handleLogout = () => {
    try {
      logout();
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/login');
    }
  };

  const confirmLogout = () => setShowLogoutConfirm(true);
  const cancelLogout = () => setShowLogoutConfirm(false);
  const proceedLogout = () => handleLogout();
  
  const toggleToolsDropdown = () => {
    setToolsDropdownOpen(!toolsDropdownOpen);
  };

  const setView = (view) => {
    setActiveView(view);
    setToolsDropdownOpen(false);
  };
  
  const handlePendingReviewsClick = () => {
    setActiveView('evaluation-management');
  };
  
  const renderActiveView = () => {
    console.log('Rendering active view:', activeView);
    switch (activeView) {
      case 'my-reviews':
        return <MyReviews />;
      case 'team-reviews':
        return <TeamReviews />;
      case 'employees':
        return <Employees />;
      case 'departments':
        return <DepartmentManager />;
      case 'review-cycles':
        return <ReviewCycles />;
      case 'templates':
        return <ReviewTemplates />;
      case 'tools-imports':
        return <ImportTool />;
      case 'tools-exports':
        return <ExportTool />;
      case 'evaluation-management':
        return <EvaluationManagement initialActiveTab="active-evaluations" />;
      case 'evaluation-detail':
        return <ViewEvaluation />;
      default:
        return renderDashboardDefault();
    }
  };

  const renderDashboardDefault = () => {
    console.log('Rendering default dashboard view');
    // Filter for active employees
    const activeEmployeesCount = employees.filter(employee => 
      employee.isActive === true || 
      employee.status?.toLowerCase() === 'active'
    ).length;

    return (
      <>
        <h1 className="page-title">Dashboard Overview</h1>
        
        <div className="dashboard-overview">
          <div 
            className="overview-card clickable" 
            onClick={() => setView('employees')}
          >
            <h3>Active Employees</h3>
            <div className="value">{activeEmployeesCount}</div>
            <div className="status positive">View Employee List</div>
          </div>

          <div 
            className="overview-card clickable" 
            onClick={handlePendingReviewsClick}
          >
            <h3>Pending Reviews</h3>
            <div className="value">{reviewData.pending}</div>
            <div className="status">Due this month</div>
          </div>
          
          <div 
            className="overview-card clickable" 
            onClick={() => setView('my-reviews')}
          >
            <h3>Completed Reviews</h3>
            <div className="value">{reviewData.completed}</div>
            <div className="status positive">+3 from last cycle</div>
          </div>
          
          <div 
            className="overview-card clickable" 
            onClick={() => setView('my-reviews')}
          >
            <h3>Upcoming Reviews</h3>
            <div className="value">{reviewData.upcoming}</div>
            <div className="status">Starting next month</div>
          </div>
        </div>
        
        <div className="dashboard-recent">
          <h2>Recent Reviews</h2>
          {reviewData.recentReviews.length > 0 ? (
            <table className="review-list">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Review Cycle</th>
                  <th>Due Date</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reviewData.recentReviews.map((review) => (
                  <tr key={review.id}>
                    <td className="employee-name">{review.employee}</td>
                    <td>{review.cycle}</td>
                    <td>{review.dueDate}</td>
                    <td>{review.reviewType}</td>
                    <td>
                      <span className={`status-badge ${review.status}`}>
                        {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="action-button"
                        onClick={() => handleReviewAction(review)}
                      >
                        {review.status === 'completed' ? 'View' : 'Review'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <p>No reviews found. Create a review cycle to get started.</p>
            </div>
          )}
        </div>
      </>
    );
  };

  // Updated to navigate to the evaluation route
  const handleReviewAction = (review) => {
    navigate(`/evaluation/${review.id}`);
    console.log(`Navigating to evaluation/${review.id}`);
  };
  
  // Show loading state while checking for user data
  if (isLoading) {
    return <div className="loading-state">Loading dashboard...</div>;
  }
  
  // Render fallback if no user data is found
  if (!user) {
    console.log('User data not available - rendering fallback');
    return (
      <div className="error-state">
        <h1>Authentication Error</h1>
        <p>There was a problem loading your user data.</p>
        <button 
          className="return-login-button" 
          onClick={() => navigate('/login')}
        >
          Return to Login
        </button>
      </div>
    );
  }
  
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="user-info">
          <span className="user-name">{user.firstName} {user.lastName}</span>
          <button 
            className="logout-button" 
            onClick={confirmLogout}
          >
            Logout
          </button>
        </div>
      </header>
      
      {showLogoutConfirm && (
        <div className="logout-modal">
          <div className="logout-modal-content">
            <h2>Confirm Logout</h2>
            <p>Are you sure you want to log out?</p>
            <div className="logout-modal-actions">
              <button 
                className="btn btn-cancel" 
                onClick={cancelLogout}
              >
                Cancel
              </button>
              <button 
                className="btn btn-logout" 
                onClick={proceedLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="dashboard-main">
        <aside className="dashboard-sidebar">
          <nav className="sidebar-menu">
            <button 
              className={activeView === 'dashboard' ? 'active' : ''}
              onClick={() => {
                setView('dashboard');
                navigate('/dashboard');
              }}
            >
              Dashboard
            </button>
            
            <button 
              className={activeView === 'my-reviews' ? 'active' : ''}
              onClick={() => setView('my-reviews')}
            >
              My Reviews
            </button>
            
            <div className="sidebar-heading">Management</div>
            <button 
              className={activeView === 'team-reviews' ? 'active' : ''}
              onClick={() => setView('team-reviews')}
            >
              Team Reviews
            </button>
            <button 
              className={activeView === 'employees' ? 'active' : ''}
              onClick={() => setView('employees')}
            >
              Employees
            </button>
            
            {(user.role?.toLowerCase() === 'admin' || user.role?.toLowerCase() === 'manager') && (
              <>
                <div className="sidebar-heading">Administration</div>
                <button 
                  className={activeView === 'departments' ? 'active' : ''}
                  onClick={() => setView('departments')}
                >
                  Departments
                </button>
                <button 
                  className={activeView === 'review-cycles' ? 'active' : ''}
                  onClick={() => setView('review-cycles')}
                >
                  Review Cycles
                </button>
                <button 
                  className={activeView === 'templates' ? 'active' : ''}
                  onClick={() => setView('templates')}
                >
                  Templates
                </button>
                <button 
                  className={activeView === 'evaluation-management' ? 'active' : ''}
                  onClick={() => setView('evaluation-management')}
                >
                  Evaluation Management
                </button>

                <div className="sidebar-heading">Tools</div>
                <div className="tools-menu">
                  <button 
                    className={`dropdown-button ${toolsDropdownOpen ? 'active' : ''}`}
                    onClick={toggleToolsDropdown}
                  >
                    Tools {toolsDropdownOpen ? '▲' : '▼'}
                  </button>
                  
                  {toolsDropdownOpen && (
                    <div className="dropdown-menu">
                      <button 
                        className={activeView === 'tools-imports' ? 'active' : ''}
                        onClick={() => setView('tools-imports')}
                      >
                        Data Imports
                      </button>
                      <button 
                        className={activeView === 'tools-exports' ? 'active' : ''}
                        onClick={() => setView('tools-exports')}
                      >
                        Data Exports
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </nav>
        </aside>
        
        <main className="dashboard-content">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;