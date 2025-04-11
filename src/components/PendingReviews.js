import React, { useState, useEffect } from 'react';
import { FaTasks, FaTrash } from 'react-icons/fa';
import '../styles/PendingReviews.css'; // You'll need to create this CSS file

function PendingReviews() {
  const [pendingAssignments, setPendingAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : 'https://performance-review-backend-ab8z.onrender.com';

  useEffect(() => {
    fetchPendingAssignments();
  }, []);

  const fetchPendingAssignments = async () => {
    try {
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
      
      // Filter to only show pending assignments
      const pending = assignments.filter(a => 
        a.status === 'Pending' || a.status === 'InProgress'
      );
      
      setPendingAssignments(pending);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching pending assignments:', error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  const handleStartReview = async (assignmentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/templates/assignments/${assignmentId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start review');
      }

      const { assignment, review } = await response.json();
      
      // Update the assignment in the list
      setPendingAssignments(pendingAssignments.map(a => 
        a._id === assignment._id ? assignment : a
      ));
      
      // Redirect to the review editor
      window.location.href = `/reviews/edit/${review._id}`;
    } catch (error) {
      console.error('Error starting review:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleUpdateAssignmentStatus = async (assignmentId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/templates/assignments/${assignmentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update assignment status');
      }

      // Refresh the list after status update
      fetchPendingAssignments();
    } catch (error) {
      console.error('Error updating assignment status:', error);
      alert(`Error: ${error.message}`);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading pending reviews...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="pending-reviews-container">
      <h1>Pending Reviews</h1>
      
      {pendingAssignments.length === 0 ? (
        <div className="no-assignments">
          <p>No pending reviews found.</p>
          <p>All reviews are up to date!</p>
        </div>
      ) : (
        <div className="pending-reviews-table-container">
          <table className="pending-reviews-table">
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
              {pendingAssignments.map(assignment => (
                <tr key={assignment._id} className={`status-${assignment.status.toLowerCase()}`}>
                  <td>{assignment.template?.name || 'Unknown Template'}</td>
                  <td>{`${assignment.employee?.firstName} ${assignment.employee?.lastName}`}</td>
                  <td>{`${assignment.reviewer?.firstName} ${assignment.reviewer?.lastName}`}</td>
                  <td>{new Date(assignment.dueDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${assignment.status.toLowerCase()}`}>
                      {assignment.status}
                    </span>
                  </td>
                  <td className="action-buttons">
                    {assignment.status === 'Pending' && (
                      <>
                        <button 
                          className="btn-icon"
                          onClick={() => handleStartReview(assignment._id)}
                          title="Start Review"
                        >
                          <FaTasks /> Start
                        </button>
                        <button 
                          className="btn-icon"
                          onClick={() => handleUpdateAssignmentStatus(assignment._id, 'Canceled')}
                          title="Cancel Assignment"
                        >
                          <FaTrash /> Cancel
                        </button>
                      </>
                    )}
                    {assignment.status === 'InProgress' && (
                      <button 
                        className="btn-icon"
                        onClick={() => window.location.href = `/reviews/edit/${assignment.createdReview}`}
                        title="Continue Review"
                      >
                        Continue
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PendingReviews;