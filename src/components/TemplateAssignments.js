import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SidebarLayout from '../components/SidebarLayout';
import '../styles/Templates.css'; // Make sure you have this CSS file

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

  useEffect(() => {
    // Load assignments from localStorage
    loadAssignments();
  }, []);

  const loadAssignments = () => {
    const savedAssignments = localStorage.getItem('assignments');
    if (savedAssignments) {
      try {
        setAssignments(JSON.parse(savedAssignments));
      } catch (error) {
        console.error('Error parsing assignments:', error);
      }
    }
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const getFilteredAssignments = () => {
    if (statusFilter === 'All Status') {
      return assignments;
    }
    return assignments.filter(assignment => assignment.status === statusFilter.toLowerCase());
  };

  const handleViewAssignment = (assignmentId) => {
    // Extract reviewId from the assignment
    const assignment = assignments.find(a => a.id === assignmentId);
    if (assignment && assignment.reviewId) {
      // Navigate to the review page
      navigate(`/reviews/edit/${assignment.reviewId}`);
    } else {
      alert('Review not found.');
    }
  };

  const handleCancelAssignment = (assignmentId) => {
    if (!window.confirm('Are you sure you want to cancel this assignment? This will also delete any associated review.')) {
      return;
    }

    try {
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
      
    } catch (error) {
      console.error('Error cancelling assignment:', error);
      alert('An error occurred while cancelling the assignment.');
    }
  };

  const handleAssignTemplate = () => {
    navigate('/templates/assign');
  };

  return (
    <SidebarLayout user={user} activeView="templates">
      <div className="template-page-container">
        <div className="templates-navbar">
          <a href="/templates" className="tab-button">Templates</a>
          <a href="/templates/assignments" className="tab-button active">Assignments</a>
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
                  <td>{assignment.reviewer || 'Unknown'}</td>
                  <td>{new Date(assignment.dueDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${assignment.status}`}>
                      {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
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
          
          {getFilteredAssignments().length === 0 && (
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