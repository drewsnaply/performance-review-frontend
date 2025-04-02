import React, { useState, useEffect } from 'react';
import { useDepartments } from '../context/DepartmentContext';

function TeamReviews() {
  const { employees } = useDepartments();
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);

  // Sample initial reviews data
  const initialReviews = [
    {
      id: 1,
      reviewCycle: 'Annual Review 2024',
      revieweeId: 'emp002',
      revieweeName: 'Jane Smith',
      reviewerId: 'emp001',
      reviewerName: 'John Doe',
      status: 'in_progress',
      department: 'Marketing',
      startDate: new Date('2024-01-15'),
      dueDate: new Date('2024-02-15')
    },
    {
      id: 2,
      reviewCycle: 'Mid-Year Review 2024',
      revieweeId: 'emp003',
      revieweeName: 'Bob Johnson',
      reviewerId: 'emp001',
      reviewerName: 'John Doe',
      status: 'pending',
      department: 'HR',
      startDate: new Date('2024-06-01'),
      dueDate: new Date('2024-06-30')
    }
  ];

  useEffect(() => {
    // Retrieve user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);

    // Load reviews from localStorage or use initial reviews
    const storedReviews = localStorage.getItem('teamReviews');
    
    if (storedReviews) {
      try {
        const parsedReviews = JSON.parse(storedReviews);
        // Filter reviews based on user role
        const filteredReviews = parsedReviews.filter(review => 
          userData?.role === 'MANAGER' || userData?.role === 'ADMIN'
        );
        setReviews(filteredReviews);
      } catch (error) {
        console.error('Error parsing reviews:', error);
        const filteredInitialReviews = initialReviews.filter(review => 
          userData?.role === 'MANAGER' || userData?.role === 'ADMIN'
        );
        setReviews(filteredInitialReviews);
        localStorage.setItem('teamReviews', JSON.stringify(initialReviews));
      }
    } else {
      const filteredInitialReviews = initialReviews.filter(review => 
        userData?.role === 'MANAGER' || userData?.role === 'ADMIN'
      );
      setReviews(filteredInitialReviews);
      localStorage.setItem('teamReviews', JSON.stringify(initialReviews));
    }
  }, []);

  const handleManageReview = (reviewId) => {
    // Placeholder for review management logic
    console.log(`Managing review ${reviewId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_progress':
        return 'badge-warning';
      case 'pending':
        return 'badge-secondary';
      case 'completed':
        return 'badge-success';
      default:
        return 'badge-light';
    }
  };

  return (
    <div className="team-reviews-container">
      <div className="page-header">
        <h1 className="page-title">Team Reviews</h1>
        {user && (user.role === 'MANAGER' || user.role === 'ADMIN') && (
          <button className="btn btn-primary">
            Initiate New Review Cycle
          </button>
        )}
      </div>
      
      <div className="team-reviews-list">
        {reviews.length === 0 ? (
          <div className="empty-state">
            <p>No team reviews found.</p>
            {user && (user.role === 'MANAGER' || user.role === 'ADMIN') && (
              <p>You can start a new review cycle to get began.</p>
            )}
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
                  <td>{review.startDate.toLocaleDateString()}</td>
                  <td>{review.dueDate.toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${getStatusColor(review.status)}`}>
                      {review.status.replace('_', ' ').charAt(0).toUpperCase() + 
                       review.status.replace('_', ' ').slice(1)}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="action-button"
                      onClick={() => handleManageReview(review.id)}
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
}

export default TeamReviews;