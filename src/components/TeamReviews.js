import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDepartments } from '../context/DepartmentContext';
import { useAuth } from '../context/AuthContext';
import SidebarLayout from '../components/SidebarLayout';

function TeamReviews() {
  const { employees } = useDepartments();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Create user object for SidebarLayout
  const sidebarUser = currentUser ? {
    firstName: currentUser.firstName || currentUser.username || 'User',
    lastName: currentUser.lastName || '',
    role: currentUser.role || 'USER'
  } : null;

  // API base URL for fetching data
  const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : 'https://performance-review-backend-ab8z.onrender.com';

  useEffect(() => {
    // Fetch team reviews data
    fetchTeamReviews();
  }, [currentUser]);

  const fetchTeamReviews = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // Only allow managers and admins to access team reviews
    if (currentUser.role !== 'manager' && currentUser.role !== 'admin') {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Try fetching from API first
      const response = await fetch(`${API_BASE_URL}/api/templates/assignments/team`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Map API data to the review format
        const formattedReviews = data.map(item => ({
          id: item._id,
          reviewCycle: item.template?.name || 'Performance Review',
          revieweeId: item.employee?._id || '',
          revieweeName: `${item.employee?.firstName || ''} ${item.employee?.lastName || ''}`.trim() || 'Unknown',
          reviewerId: item.reviewer?._id || currentUser._id,
          reviewerName: item.reviewer?.username || currentUser.username || 'Current User',
          status: item.status?.toLowerCase().replace(' ', '_') || 'pending',
          department: item.employee?.department?.name || 'Not Assigned',
          startDate: new Date(item.createdAt || Date.now()),
          dueDate: new Date(item.dueDate || Date.now()),
          createdReview: item.createdReview || null
        }));
        
        setReviews(formattedReviews);
        setLoading(false);
        return;
      }
      
      throw new Error('Failed to fetch team reviews from API');
    } catch (error) {
      console.error('Error fetching team reviews from API:', error);
      
      // Try localStorage fallback for team reviews
      try {
        // Get all assignments from localStorage
        const allAssignments = JSON.parse(localStorage.getItem('assignments') || '[]');
        
        // Get all employees from localStorage
        const allEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
        
        // Filter assignments for current user's team members
        // In a real app, you'd have a way to identify team relationships
        // For now, we'll assume managers can see all assignments
        const teamAssignments = allAssignments.map(assignment => {
          // Find the employee for this assignment
          const employee = allEmployees.find(emp => emp.id === assignment.employeeId) || {};
          
          return {
            id: assignment.id,
            reviewCycle: assignment.templateTitle || 'Performance Review',
            revieweeId: assignment.employeeId,
            revieweeName: assignment.employeeName || 'Unknown',
            reviewerId: currentUser?._id || 'current',
            reviewerName: currentUser?.username || 'Current User',
            status: assignment.status || 'pending',
            department: employee.department || 'Not Assigned',
            startDate: new Date(assignment.startDate || Date.now()),
            dueDate: new Date(assignment.dueDate || Date.now()),
            createdReview: assignment.reviewId || null
          };
        });
        
        setReviews(teamAssignments);
      } catch (localStorageError) {
        console.error('Error fetching from localStorage:', localStorageError);
        // If all fails, use empty array
        setReviews([]);
      }
      
      setLoading(false);
    }
  };

  const handleManageReview = (review) => {
    // If there's a created review, navigate to it
    if (review.createdReview) {
      navigate(`/reviews/edit/${review.createdReview}`);
      return;
    }
    
    // Otherwise, navigate to start a review
    navigate(`/templates/assignments`);
  };

  const handleInitiateNewReviewCycle = () => {
    // Navigate to templates page to create and assign templates
    navigate('/templates');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_progress':
      case 'inprogress':
        return 'badge-warning';
      case 'pending':
        return 'badge-secondary';
      case 'completed':
        return 'badge-success';
      default:
        return 'badge-light';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Function to render the Team Reviews content
  const renderTeamReviewsContent = () => {
    if (loading) {
      return <div className="loading-state">Loading team reviews...</div>;
    }

    if (!currentUser || (currentUser.role !== 'manager' && currentUser.role !== 'admin')) {
      return (
        <div className="error-state">
          <h2>Access Restricted</h2>
          <p>You don't have permission to view team reviews.</p>
        </div>
      );
    }

    return (
      <div className="team-reviews-container">
        <div className="page-header">
          <h1 className="page-title">Team Reviews</h1>
          <button 
            className="btn btn-primary"
            onClick={handleInitiateNewReviewCycle}
          >
            Initiate New Review Cycle
          </button>
        </div>
        
        <div className="team-reviews-list">
          {reviews.length === 0 ? (
            <div className="empty-state">
              <p>No team reviews found.</p>
              <p>You can start a new review cycle to begin the process.</p>
            </div>
          ) : (
            <table className="review-list">
              <thead>
                <tr>
                  <th>Review Cycle</th>
                  <th>Reviewee</th>
                  <th>Department</th>
                  <th>Start Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map(review => (
                  <tr key={review.id}>
                    <td>{review.reviewCycle}</td>
                    <td>{review.revieweeName}</td>
                    <td>{review.department}</td>
                    <td>{formatDate(review.startDate)}</td>
                    <td>{formatDate(review.dueDate)}</td>
                    <td>
                      <span className={`status-badge ${getStatusColor(review.status)}`}>
                        {review.status.replace('_', ' ').charAt(0).toUpperCase() + 
                         review.status.replace('_', ' ').slice(1)}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="action-button"
                        onClick={() => handleManageReview(review)}
                      >
                        Manage Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  };

  // Wrap the Team Reviews content with SidebarLayout
  return (
    <SidebarLayout user={sidebarUser} activeView="team-reviews">
      {renderTeamReviewsContent()}
    </SidebarLayout>
  );
}

export default TeamReviews;