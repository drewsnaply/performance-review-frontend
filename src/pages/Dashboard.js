import React, { useState, useEffect, lazy, Suspense, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/Dashboard.css';
import { useDepartments } from '../context/DepartmentContext';
import { useAuth } from '../context/AuthContext';
// Import SidebarLayout with the correct path
import SidebarLayout from '../components/SidebarLayout';

// Lazy-load component imports to improve initial loading speed
const MyReviews = lazy(() => import('../components/MyReviews'));
const TeamReviews = lazy(() => import('../components/TeamReviews'));
const Employees = lazy(() => import('./Employees'));
const ReviewCycles = lazy(() => import('../components/ReviewCycles'));
const ReviewTemplates = lazy(() => import('../components/ReviewTemplates'));
const KpiManager = lazy(() => import('../components/KpiManager')); 
const ImportTool = lazy(() => import('../components/ImportTool'));
const ExportTool = lazy(() => import('../components/ExportTool'));
// EvaluationManagement import removed
const Settings = lazy(() => import('./Settings'));
const ViewEvaluation = lazy(() => import('../components/ViewEvaluation'));
const PendingReviews = lazy(() => import('../components/PendingReviews'));
const TemplateAssignments = lazy(() => import('../components/TemplateAssignments'));

// Import Super Admin components
const SuperAdminDashboard = lazy(() => import('../components/super-admin/SuperAdminDashboard'));

function Dashboard({ initialView = 'dashboard' }) {
  const { employees } = useDepartments();
  const [activeView, setActiveView] = useState(initialView);
  const [reviewData, setReviewData] = useState({
    pending: 0,
    completed: 0,
    upcoming: 0,
    recentReviews: []
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Simple flag to prevent repeated API calls
  const fetchedAssignmentsRef = useRef(false);
  
  const navigate = useNavigate();
  const params = useParams();
  
  // Get completed review data from session storage only once
  const completedReviewId = sessionStorage.getItem('completedReviewId');
  const completedReviewMetadata = JSON.parse(sessionStorage.getItem('completedReviewMetadata') || 'null');
  
  // Get auth state directly from context
  const { currentUser, logout } = useAuth();
  const [user, setUser] = useState(null);
  
  // API base URL for fetching data
  const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : 'https://performance-review-backend-ab8z.onrender.com';

  // Initialize user - run only when currentUser changes
  useEffect(() => {
    if (!currentUser) {
      setIsLoading(false);
      navigate('/login');
      return;
    }
    
    // Create a normalized user
    setUser({
      ...currentUser,
      firstName: currentUser.username || 'User',
      lastName: '',
      role: currentUser.role || 'USER'
    });
    
    // Set loading to false once user is set
    setIsLoading(false);
  }, [currentUser, navigate]);

  // Fetch assignments only once per session
  useEffect(() => {
    const fetchAssignments = async () => {
      // If we've already fetched, don't fetch again - this is the key fix
      if (fetchedAssignmentsRef.current) {
        return;
      }

      try {
        // Mark that we're fetching to prevent duplicate calls
        fetchedAssignmentsRef.current = true;
        
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
        
        // Process assignments in a more efficient way
        let pendingCount = 0;
        let completedCount = 0;
        let upcomingCount = 0;
        
        // Current and next month for filtering
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        
        // Process all assignments in a single loop
        assignments.forEach(a => {
          // Count pending/in-progress
          if (a.status === 'Pending' || a.status === 'InProgress') {
            // If this is a completed review (client-side), don't count as pending
            if (completedReviewId && 
               (a._id === completedReviewId || a.createdReview === completedReviewId)) {
              completedCount++;
            } else {
              pendingCount++;
            }
          }
          // Count completed
          else if (a.status === 'Completed') {
            completedCount++;
          }
          
          // Count upcoming
          const dueDate = new Date(a.dueDate);
          if (dueDate >= nextMonth && a.status !== 'Completed' && a.status !== 'Canceled') {
            upcomingCount++;
          }
        });
        
        // Map only the first 5 assignments for display
        const recentReviews = assignments.slice(0, 5).map(assignment => {
          // Build the basic review object
          const review = {
            id: assignment._id,
            employee: `${assignment.employee?.firstName || ''} ${assignment.employee?.lastName || ''}`.trim() || 'Unknown',
            cycle: assignment.template?.name || 'Performance Review',
            dueDate: new Date(assignment.dueDate).toLocaleDateString(),
            reviewType: assignment.template?.frequency || 'Performance',
            status: assignment.status?.toLowerCase() || 'pending',
            createdReview: assignment.createdReview || null
          };
          
          // Update status if this is a completed review
          if (completedReviewId && 
             (assignment._id === completedReviewId || assignment.createdReview === completedReviewId)) {
            review.status = 'completed';
          }
          
          return review;
        });
        
        // Update state once with all data
        setReviewData({
          pending: pendingCount,
          completed: completedCount,
          upcoming: upcomingCount,
          recentReviews
        });
      } catch (error) {
        console.error('Error fetching assignments:', error);
        
        // Attempt to use localStorage as fallback
        const storedReviews = localStorage.getItem('reviews');
        if (storedReviews) {
          try {
            const parsedReviews = JSON.parse(storedReviews);
            // Process localStorage data (simplified)
            setReviewData({
              pending: parsedReviews.filter(r => 
                r.status?.toLowerCase() === 'pending' || 
                r.status?.toLowerCase() === 'pending manager review'
              ).length,
              completed: parsedReviews.filter(r => 
                r.status?.toLowerCase() === 'completed'
              ).length,
              upcoming: parsedReviews.filter(r => 
                r.status?.toLowerCase() === 'upcoming'
              ).length,
              recentReviews: parsedReviews.slice(0, 5).map(review => ({
                id: review.id,
                employee: review.employeeName || 'Unknown',
                cycle: review.reviewCycle || 'Annual Review',
                dueDate: review.submissionDate || 'N/A',
                reviewType: 'Performance',
                status: review.status?.toLowerCase() || 'pending',
                createdReview: review.reviewId || null
              }))
            });
          } catch (localStorageError) {
            console.error('Error parsing reviews from localStorage:', localStorageError);
          }
        }
      }
    };

    // Only call the fetch function when on the dashboard view
    if (activeView === 'dashboard' && user) {
      fetchAssignments();
    }
  }, [activeView, user, API_BASE_URL, completedReviewId]);
  
  // Handle review actions 
  const handleReviewAction = (review) => {
    if (review.status === 'completed') {
      navigate(`/reviews/${review.id}`);
    } else if (review.status === 'pending' || review.status === 'inprogress') {
      if (review.createdReview) {
        navigate(`/reviews/edit/${review.createdReview}`);
      } else {
        fetch(`${API_BASE_URL}/api/templates/assignments/${review.id}/start`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        })
        .then(response => {
          if (!response.ok) throw new Error('Failed to start review');
          return response.json();
        })
        .then(data => {
          navigate(`/reviews/edit/${data.review._id}`);
        })
        .catch(error => {
          console.error('Error starting review:', error);
          alert(`Error starting review: ${error.message}`);
        });
      }
    } else {
      // Navigate to templates page instead of evaluation management
      navigate(`/templates`);
      setActiveView('templates');
    }
  };

  // Handle navigation to Super Admin Dashboard
  const goToSuperAdmin = () => {
    setActiveView('super-admin');
    navigate('/super-admin/customers');
  };
  
  // Calculate active employees count safely
  const activeEmployeesCount = Array.isArray(employees) ? 
    employees.filter(employee => 
      employee && (employee.isActive === true || 
      employee.status?.toLowerCase() === 'active')
    ).length : 0;
  
  // Render the active view with Suspense for lazy-loaded components
  const renderActiveView = () => {
    // Return a Suspense wrapped component
    const renderComponent = (Component, props = {}) => (
      <Suspense fallback={<div className="loading-state">Loading component...</div>}>
        <Component {...props} />
      </Suspense>
    );
    
    switch (activeView) {
      case 'my-reviews': return renderComponent(MyReviews);
      case 'team-reviews': return renderComponent(TeamReviews);
      case 'employees': return renderComponent(Employees);
      case 'settings': return renderComponent(Settings);
      case 'review-cycles': return renderComponent(ReviewCycles);
      case 'templates': return renderComponent(ReviewTemplates);
      case 'template-assignments': return renderComponent(TemplateAssignments);
      case 'kpis': return renderComponent(KpiManager);
      case 'tools-imports': return renderComponent(ImportTool);
      case 'tools-exports': return renderComponent(ExportTool);
      case 'evaluation-detail': return renderComponent(ViewEvaluation);
      case 'pending-reviews': return renderComponent(PendingReviews);
      case 'super-admin': return renderComponent(SuperAdminDashboard);
      default: return renderDashboardDefault();
    }
  };

  // Default dashboard view
  const renderDashboardDefault = () => {
    return (
      <>
        <h1 className="page-title">Dashboard Overview</h1>
        
        {/* Super Admin Access Panel - Only visible to superadmin users */}
        {user && user.role === 'superadmin' && (
          <div className="super-admin-access-panel mb-6 p-4 bg-indigo-100 rounded-lg border border-indigo-200">
            <h3 className="text-lg font-medium text-indigo-800 mb-2">Super Admin Access</h3>
            <p className="text-indigo-700 mb-3">
              You are logged in as a Super Admin. Access advanced administrative features below.
            </p>
            <button
              onClick={goToSuperAdmin}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
            >
              Go to Super Admin Dashboard
            </button>
          </div>
        )}
        
        <div className="dashboard-overview">
          <div 
            className="overview-card clickable" 
            onClick={() => {
              setActiveView('employees');
              navigate('/employees');
            }}
          >
            <h3>Active Employees</h3>
            <div className="value">{activeEmployeesCount}</div>
            <div className="status positive">View Employee List</div>
          </div>

          <div 
            className="overview-card clickable" 
            onClick={() => {
              // Direct to template assignments instead of pending reviews
              setActiveView('template-assignments');
              navigate('/templates/assignments');
            }}
          >
            <h3>Pending Reviews</h3>
            <div className="value">{reviewData.pending}</div>
            <div className="status">Due this month</div>
          </div>
          
          <div 
            className="overview-card clickable" 
            onClick={() => {
              // Direct to template assignments instead of my-reviews
              setActiveView('template-assignments');
              navigate('/templates/assignments');
            }}
          >
            <h3>Completed Reviews</h3>
            <div className="value">{reviewData.completed}</div>
            <div className="status positive">+3 from last cycle</div>
          </div>
          
          <div 
            className="overview-card clickable" 
            onClick={() => {
              // Direct to template assignments instead of my-reviews
              setActiveView('template-assignments');
              navigate('/templates/assignments');
            }}
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
  
  // Show loading state while checking for user data
  if (isLoading) {
    return <div className="loading-state">Loading dashboard...</div>;
  }
  
  // Render fallback if no user data is found
  if (!user) {
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
  
  // The main dashboard content to be wrapped by SidebarLayout
  const renderDashboardContent = () => {
    return renderActiveView();
  };
  
  // Return the dashboard wrapped in SidebarLayout
  return (
    <SidebarLayout user={user} activeView={activeView} setActiveView={setActiveView}>
      {renderDashboardContent()}
    </SidebarLayout>
  );
}

export default Dashboard;