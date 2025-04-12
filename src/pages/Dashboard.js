import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/Dashboard.css';
import { useDepartments } from '../context/DepartmentContext';
import { useAuth } from '../context/AuthContext'; 
import LogoutButton from '../components/LogoutButton';

// Import components
import MyReviews from '../components/MyReviews';
import TeamReviews from '../components/TeamReviews';
import Employees from './Employees';
import ReviewCycles from '../components/ReviewCycles';
import ReviewTemplates from '../components/ReviewTemplates';
import ImportTool from '../components/ImportTool';
import ExportTool from '../components/ExportTool';
import EvaluationManagement from '../components/EvaluationManagement';
import Settings from './Settings';
import ViewEvaluation from '../components/ViewEvaluation';
import PendingReviews from '../components/PendingReviews';

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
  
  // Client-side review completion tracking
  const [completedReviewId, setCompletedReviewId] = useState(
    sessionStorage.getItem('completedReviewId')
  );
  const [completedReviewMetadata, setCompletedReviewMetadata] = useState(() => {
    const storedMetadata = sessionStorage.getItem('completedReviewMetadata');
    return storedMetadata ? JSON.parse(storedMetadata) : null;
  });
  
  // Get auth state directly from context - simplified approach
  const { currentUser, logout } = useAuth();
  const [user, setUser] = useState(null);
  
  // API base URL for fetching data
  const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : 'https://performance-review-backend-ab8z.onrender.com';

  // Check if we're coming from a completed review
  useEffect(() => {
    const locationState = window.history.state?.state;
    const fromPendingWithCompleted = locationState?.completedReview;
    const reviewMetadata = locationState?.completedReviewMetadata;
    
    if (fromPendingWithCompleted) {
      setCompletedReviewId(fromPendingWithCompleted);
      // Store in session storage to persist across page refreshes
      sessionStorage.setItem('completedReviewId', fromPendingWithCompleted);
      
      if (reviewMetadata) {
        setCompletedReviewMetadata(reviewMetadata);
        sessionStorage.setItem('completedReviewMetadata', JSON.stringify(reviewMetadata));
      }
    }
  }, []);

  // Function to fetch assignments from the API
  const fetchAssignments = async () => {
    try {
      console.log('Fetching assignments from API');
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/api/templates/assignments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch assignments');
      }

      const assignments = await response.json();
      console.log('Fetched assignments:', assignments);
      
      // Calculate counts
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const nextMonth = new Date(currentYear, currentMonth + 1, 1);
      
      let pendingCount = assignments.filter(a => 
        a.status === 'Pending' || a.status === 'InProgress'
      ).length;
      
      let completedCount = assignments.filter(a => 
        a.status === 'Completed'
      ).length;
      
      const upcomingCount = assignments.filter(a => {
        const dueDate = new Date(a.dueDate);
        return dueDate >= nextMonth && a.status !== 'Completed' && a.status !== 'Canceled';
      }).length;
      
      // Adjust counts for client-side completed reviews
      if (completedReviewId) {
        // Find if any pending reviews match the completed review ID
        const hasCompletedPendingReview = assignments.some(a => 
          (a._id === completedReviewId || a.createdReview === completedReviewId) && 
          (a.status === 'Pending' || a.status === 'InProgress')
        );
        
        // If we found a pending review that should be marked as completed
        if (hasCompletedPendingReview) {
          // Decrease pending count by 1
          pendingCount = Math.max(0, pendingCount - 1);
          // Increase completed count by 1
          completedCount += 1;
        }
      }
      
      // Map assignments to recent reviews for display
      let recentReviews = assignments.slice(0, 5).map(assignment => ({
        id: assignment._id,
        employee: `${assignment.employee?.firstName || ''} ${assignment.employee?.lastName || ''}`.trim() || 'Unknown',
        cycle: assignment.template?.name || 'Performance Review',
        dueDate: new Date(assignment.dueDate).toLocaleDateString(),
        reviewType: assignment.template?.frequency || 'Performance',
        status: assignment.status?.toLowerCase() || 'pending',
        createdReview: assignment.createdReview || null
      }));
      
      // Update status of any reviews that were marked as completed client-side
      if (completedReviewId) {
        recentReviews = recentReviews.map(review => {
          if (review.id === completedReviewId || review.createdReview === completedReviewId) {
            return {
              ...review,
              status: 'completed'
            };
          }
          return review;
        });
      }
      
      setReviewData({
        pending: pendingCount,
        completed: completedCount,
        upcoming: upcomingCount,
        recentReviews: recentReviews
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      
      // Fallback to localStorage if API fails
      const storedReviews = localStorage.getItem('reviews');
      if (storedReviews) {
        try {
          const parsedReviews = JSON.parse(storedReviews);
          
          // Calculate review statistics from localStorage
          let pendingCount = parsedReviews.filter(r => 
            r.status?.toLowerCase() === 'pending' || 
            r.status?.toLowerCase() === 'pending manager review'
          ).length;
          
          let completedCount = parsedReviews.filter(r => 
            r.status?.toLowerCase() === 'completed'
          ).length;
          
          const upcomingCount = parsedReviews.filter(r => 
            r.status?.toLowerCase() === 'upcoming'
          ).length;
          
          // Adjust counts for client-side completed reviews
          if (completedReviewId) {
            // Find if any pending reviews match the completed review ID
            const hasCompletedPendingReview = parsedReviews.some(r => 
              (r.id === completedReviewId || r.reviewId === completedReviewId) && 
              (r.status?.toLowerCase() === 'pending' || r.status?.toLowerCase() === 'pending manager review')
            );
            
            // If we found a pending review that should be marked as completed
            if (hasCompletedPendingReview) {
              // Decrease pending count by 1
              pendingCount = Math.max(0, pendingCount - 1);
              // Increase completed count by 1
              completedCount += 1;
            }
          }
          
          // Map local reviews for display
          let recentReviews = parsedReviews.slice(0, 5).map(review => ({
            id: review.id,
            employee: review.employeeName || 'Unknown',
            cycle: review.reviewCycle || 'Annual Review',
            dueDate: review.submissionDate || 'N/A',
            reviewType: 'Performance',
            status: review.status?.toLowerCase() || 'pending',
            createdReview: review.reviewId || null
          }));
          
          // Update status of any reviews that were marked as completed client-side
          if (completedReviewId) {
            recentReviews = recentReviews.map(review => {
              if (review.id === completedReviewId || review.createdReview === completedReviewId) {
                return {
                  ...review,
                  status: 'completed'
                };
              }
              return review;
            });
          }
          
          setReviewData({
            pending: pendingCount,
            completed: completedCount,
            upcoming: upcomingCount,
            recentReviews: recentReviews
          });
        } catch (error) {
          console.error('Error parsing reviews from localStorage:', error);
        }
      }
      
      setIsLoading(false);
    }
  };
  
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
    
    // Fetch assignments from the API
    fetchAssignments();
  }, [currentUser, navigate]);
  
  // Set initial view based on prop
  useEffect(() => {
    setActiveView(initialView);
  }, [initialView]);
  
  // Refetch data when component becomes visible again
  useEffect(() => {
    if (activeView === 'dashboard' && user) {
      fetchAssignments();
    }
  }, [activeView, user]);
  
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
    setActiveView('pending-reviews');
    navigate('/pending-reviews');
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
      case 'settings':
        return <Settings />;
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
      case 'pending-reviews':
        return <PendingReviews />;
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

  // Fixed function to handle review actions
  const handleReviewAction = (review) => {
    console.log('Handling review action for:', review);

    if (review.status === 'completed') {
      // Navigate to view completed review
      navigate(`/reviews/${review.id}`);
      console.log(`Navigating to view completed review: /reviews/${review.id}`);
    } else if (review.status === 'pending' || review.status === 'inprogress') {
      // For pending or in-progress reviews
      
      if (review.createdReview) {
        // Continue existing review if it has already been started
        navigate(`/reviews/edit/${review.createdReview}`);
        console.log(`Continuing existing review: /reviews/edit/${review.createdReview}`);
      } else {
        // Start a new review process by calling the API
        console.log(`Starting new review for assignment: ${review.id}`);
        
        fetch(`${API_BASE_URL}/api/templates/assignments/${review.id}/start`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to start review');
          }
          return response.json();
        })
        .then(data => {
          console.log('Review started successfully:', data);
          // Navigate to the review editor with the newly created review
          navigate(`/reviews/edit/${data.review._id}`);
        })
        .catch(error => {
          console.error('Error starting review:', error);
          alert(`Error starting review: ${error.message}`);
        });
      }
    } else {
      // For other statuses, navigate to evaluation management
      navigate(`/evaluation-management`);
      setActiveView('evaluation-management');
    }
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
          <LogoutButton />
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
            
            <button 
              className={activeView === 'pending-reviews' ? 'active' : ''}
              onClick={() => {
                setView('pending-reviews');
                navigate('/pending-reviews');
              }}
            >
              Pending Reviews
            </button>
            
            {(user.role?.toLowerCase() === 'admin' || user.role?.toLowerCase() === 'manager') && (
              <>
                <div className="sidebar-heading">Administration</div>
                <button 
                  className={activeView === 'settings' ? 'active' : ''}
                  onClick={() => setView('settings')}
                >
                  Settings
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