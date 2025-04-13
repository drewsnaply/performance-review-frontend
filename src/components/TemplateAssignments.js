import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SidebarLayout from '../components/SidebarLayout';
import '../styles/Templates.css';

const TemplateAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All Status');
  const navigate = useNavigate();
  
  // Get current user for SidebarLayout
  const { currentUser } = useAuth();
  
  // Create user object for SidebarLayout
  const user = currentUser ? {
    firstName: currentUser.firstName || currentUser.username || 'User',
    lastName: currentUser.lastName || '',
    role: currentUser.role || 'USER'
  } : null;

  const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : 'https://performance-review-backend-ab8z.onrender.com';

  useEffect(() => {
    // Load assignments from API first, fall back to localStorage
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      // First try to fetch from API
      const response = await fetch(`${API_BASE_URL}/api/templates/assignments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const apiAssignments = await response.json();
        const formattedAssignments = apiAssignments.map(assignment => ({
          id: assignment._id,
          templateId: assignment.template?._id || '',
          templateTitle: assignment.template?.name || 'Unknown Template',
          employeeId: assignment.employee?._id || '',
          employeeName: `${assignment.employee?.firstName || ''} ${assignment.employee?.lastName || ''}`.trim() || 'Unknown',
          reviewer: assignment.reviewer?.username || 'Self',
          dueDate: assignment.dueDate || new Date().toISOString(),
          status: assignment.status?.toLowerCase() || 'pending',
          reviewId: assignment.createdReview || null
        }));
        setAssignments(formattedAssignments);
        return;
      }
      
      throw new Error('API fetch failed, falling back to localStorage');
    } catch (error) {
      console.log('Error fetching from API, trying localStorage:', error);
      
      // If API fails, check localStorage for existing assignments
      const savedAssignments = localStorage.getItem('assignments');
      if (savedAssignments) {
        try {
          const parsedAssignments = JSON.parse(savedAssignments);
          setAssignments(parsedAssignments);
          return;
        } catch (parseError) {
          console.error('Error parsing assignments from localStorage:', parseError);
        }
      }
      
      // If no assignments found in localStorage, create sample data
      const sampleAssignments = [
        {
          id: '1',
          templateId: '1',
          templateTitle: 'Quarterly Performance Review',
          employeeId: '1',
          employeeName: 'Dana Bear',
          reviewer: 'Manager',
          dueDate: '2025-04-24',
          status: 'inprogress',
          reviewId: null
        },
        {
          id: '2',
          templateId: '2',
          templateTitle: 'Annual Manager Assessment',
          employeeId: '2',
          employeeName: 'andrew mintzell',
          reviewer: 'Director',
          dueDate: '2025-05-11',
          status: 'inprogress',
          reviewId: null
        },
        {
          id: '3',
          templateId: '1',
          templateTitle: 'Monthly Performance Check-in',
          employeeId: '1',
          employeeName: 'Dana Bear',
          reviewer: 'Self',
          dueDate: '2025-05-11',
          status: 'inprogress',
          reviewId: null
        }
      ];
      
      // Store sample data in localStorage for future use
      localStorage.setItem('assignments', JSON.stringify(sampleAssignments));
      setAssignments(sampleAssignments);
    }
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const getFilteredAssignments = () => {
    if (statusFilter === 'All Status') {
      return assignments;
    }
    
    // Convert filter to lowercase for case-insensitive comparison
    const normalizedFilter = statusFilter.toLowerCase();
    return assignments.filter(assignment => {
      // Handle special case for "InProgress" filter
      if (normalizedFilter === 'inprogress') {
        return assignment.status === 'inprogress';
      }
      return assignment.status === normalizedFilter;
    });
  };

  const handleViewAssignment = async (assignmentId) => {
    try {
      // Try to use API first
      const response = await fetch(`${API_BASE_URL}/api/templates/assignments/${assignmentId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        navigate(`/reviews/edit/${data.review._id}`);
        return;
      }
      
      // If API fails, check if we have a reviewId in the assignment
      const assignment = assignments.find(a => a.id === assignmentId);
      if (assignment && assignment.reviewId) {
        navigate(`/reviews/edit/${assignment.reviewId}`);
        return;
      }
      
      // If no reviewId, create a placeholder one for local testing
      const placeholderId = `placeholder-${Date.now()}`;
      
      // Update the assignment with the new reviewId
      const updatedAssignments = assignments.map(a => 
        a.id === assignmentId ? { ...a, reviewId: placeholderId } : a
      );
      
      localStorage.setItem('assignments', JSON.stringify(updatedAssignments));
      setAssignments(updatedAssignments);
      
      // Redirect to the review page
      navigate(`/reviews/edit/${placeholderId}`);
      
    } catch (error) {
      console.error('Error viewing assignment:', error);
      alert('There was an error opening this review. Please try again.');
    }
  };

  const handleCancelAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to cancel this assignment? This will also delete any associated review.')) {
      return;
    }

    try {
      // First try API
      const response = await fetch(`${API_BASE_URL}/api/templates/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // If API succeeds, update local state
        const updatedAssignments = assignments.filter(a => a.id !== assignmentId);
        setAssignments(updatedAssignments);
        alert('Assignment cancelled successfully.');
        return;
      }

      throw new Error('API delete failed, falling back to localStorage');
    } catch (error) {
      console.error('Error with API, updating localStorage:', error);
      
      // Find the assignment to cancel
      const assignment = assignments.find(a => a.id === assignmentId);
      if (!assignment) {
        alert('Assignment not found.');
        return;
      }

      // Get the associated reviewId
      const reviewId = assignment.reviewId;

      // Remove the assignment
      const updatedAssignments = assignments.filter(a => a.id !== assignmentId);
      setAssignments(updatedAssignments);
      localStorage.setItem('assignments', JSON.stringify(updatedAssignments));

      // Remove associated review if it exists
      if (reviewId) {
        const savedReviews = localStorage.getItem('reviews') || '[]';
        let reviews = JSON.parse(savedReviews);
        reviews = reviews.filter(review => review.id !== reviewId);
        localStorage.setItem('reviews', JSON.stringify(reviews));
      }

      alert('Assignment cancelled successfully.');
    }
  };

  const handleAssignTemplate = () => {
    navigate('/templates/assign');
  };

  return (
    <SidebarLayout user={user} activeView="templates">
      <div className="template-page-container">
        <div className="templates-navbar">
          <Link to="/templates" className="tab-button">Templates</Link>
          <Link to="/templates/assignments" className="tab-button active">Assignments</Link>
        </div>
        
        <div className="template-header">
          <h2>Template Assignments</h2>
          <button className="assign-button" onClick={handleAssignTemplate}>
            + Assign Template
          </button>
        </div>
        
        <div className="filter-section">
          <label htmlFor="status-filter">Status:</label>
          <select 
            id="status-filter"
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="status-filter"
          >
            <option value="All Status">All Status</option>
            <option value="InProgress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
        
        <div className="assignments-table-container">
          {getFilteredAssignments().length > 0 ? (
            <table className="assignments-table">
              <thead>
                <tr>
                  <th>Template</th>
                  <th>Employee</th>
                  <th>Reviewer</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredAssignments().map(assignment => (
                  <tr key={assignment.id}>
                    <td>{assignment.templateTitle}</td>
                    <td>{assignment.employeeName}</td>
                    <td>{assignment.reviewer || 'Self'}</td>
                    <td>{new Date(assignment.dueDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${assignment.status}`}>
                        {assignment.status === 'inprogress' ? 'In Progress' : 
                         assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button 
                        className="view-button"
                        onClick={() => handleViewAssignment(assignment.id)}
                      >
                        View
                      </button>
                      <button 
                        className="cancel-button"
                        onClick={() => handleCancelAssignment(assignment.id)}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-assignments">
              <p>No assignments found with the selected filter.</p>
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
};

export default TemplateAssignments;