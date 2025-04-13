// src/components/MyReviews.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook
import SidebarLayout from '../components/SidebarLayout'; // Import SidebarLayout

function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // Default filter
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // Get current user for SidebarLayout

  // Create user object for SidebarLayout
  const user = currentUser ? {
    firstName: currentUser.firstName || currentUser.username || 'User',
    lastName: currentUser.lastName || '',
    role: currentUser.role || 'USER'
  } : null;

  // Mock review data - this would be fetched from an API in a real application
  const mockReviews = [
    { 
      id: 'review_1', 
      employee: 'John Doe', 
      cycle: 'Q1 2025', 
      dueDate: '2025-04-15', 
      status: 'pending',
      reviewType: 'annual',
      completionPercentage: 0
    },
    { 
      id: 'review_2', 
      employee: 'Jane Smith', 
      cycle: 'Q1 2025', 
      dueDate: '2025-04-10', 
      status: 'in-progress',
      reviewType: 'mid-year',
      completionPercentage: 40
    },
    { 
      id: 'review_3', 
      employee: 'Bob Johnson', 
      cycle: 'Q1 2025', 
      dueDate: '2025-04-12', 
      status: 'completed',
      reviewType: 'annual',
      completionPercentage: 100
    },
    { 
      id: 'review_4', 
      employee: 'Alice Brown', 
      cycle: 'Q1 2025', 
      dueDate: '2025-04-18', 
      status: 'pending',
      reviewType: 'performance',
      completionPercentage: 0
    },
    { 
      id: 'review_5', 
      employee: 'Charlie Wilson', 
      cycle: 'Q1 2025', 
      dueDate: '2025-04-20', 
      status: 'completed',
      reviewType: 'mid-year',
      completionPercentage: 100
    }
  ];

  useEffect(() => {
    // Simulate API fetch
    const fetchReviews = () => {
      setIsLoading(true);
      
      // In a real app, this would be an API call
      setTimeout(() => {
        setReviews(mockReviews);
        setIsLoading(false);
      }, 500);
    };

    fetchReviews();
    
    // Check for filter in session storage (from dashboard navigation)
    const storedFilter = window.sessionStorage?.getItem('reviewFilter');
    if (storedFilter) {
      setFilter(storedFilter);
      // Clear the filter after using it once
      window.sessionStorage.removeItem('reviewFilter');
    }
  }, []);

  // Handle filtering based on status
  const getFilteredReviews = () => {
    switch (filter) {
      case 'pending':
        return reviews.filter(review => 
          review.status === 'pending' || review.status === 'in-progress');
      case 'completed':
        return reviews.filter(review => review.status === 'completed');
      default:
        return reviews;
    }
  };

  // Handle navigating to a specific review
  const handleReviewAction = (review) => {
    navigate(`/review/${review.id}`);
  };

  // Define inline styles
  const styles = {
    container: {
      padding: '20px'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px'
    },
    title: {
      fontSize: '24px',
      margin: 0
    },
    filterTabs: {
      display: 'flex',
      gap: '8px'
    },
    filterButton: (isActive) => ({
      backgroundColor: isActive ? '#1976d2' : '#f0f0f0',
      color: isActive ? 'white' : 'inherit',
      border: 'none',
      padding: '8px 16px',
      fontSize: '14px',
      cursor: 'pointer',
      borderRadius: '4px',
      transition: 'all 0.2s ease'
    }),
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      borderRadius: '6px',
      overflow: 'hidden'
    },
    tableCell: {
      textAlign: 'left',
      padding: '12px 16px',
      borderBottom: '1px solid #eee'
    },
    tableHeader: {
      backgroundColor: '#f9f9f9',
      fontWeight: 600,
      textAlign: 'left',
      padding: '12px 16px',
      borderBottom: '1px solid #eee'
    },
    employeeName: {
      fontWeight: 500
    },
    statusBadge: (status) => ({
      display: 'inline-block',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 500,
      textTransform: 'capitalize',
      backgroundColor: 
        status === 'pending' ? '#ffecb3' : 
        status === 'in-progress' ? '#b3e5fc' : 
        status === 'completed' ? '#c8e6c9' : 
        status === 'upcoming' ? '#e1f5fe' : '#f5f5f5',
      color: 
        status === 'pending' ? '#ff8f00' : 
        status === 'in-progress' ? '#0277bd' : 
        status === 'completed' ? '#2e7d32' : 
        status === 'upcoming' ? '#0288d1' : '#333'
    }),
    actionButton: {
      backgroundColor: '#1976d2',
      color: 'white',
      border: 'none',
      padding: '6px 12px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '13px'
    },
    progressContainer: {
      width: '100%',
      height: '12px',
      backgroundColor: '#f0f0f0',
      borderRadius: '6px',
      overflow: 'hidden',
      position: 'relative'
    },
    progressBar: (percentage) => ({
      height: '100%',
      width: `${percentage}%`,
      backgroundColor: '#4caf50',
      transition: 'width 0.3s ease'
    }),
    progressText: {
      position: 'absolute',
      top: '-2px',
      right: 0,
      fontSize: '11px',
      fontWeight: 500
    },
    overdueBadge: {
      display: 'inline-block',
      backgroundColor: '#ffcdd2',
      color: '#d32f2f',
      fontSize: '11px',
      padding: '2px 6px',
      borderRadius: '4px',
      marginLeft: '6px',
      fontWeight: 500
    },
    dueDate: {
      display: 'flex',
      alignItems: 'center'
    },
    loadingState: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '200px',
      fontSize: '16px',
      color: '#757575'
    },
    emptyState: {
      backgroundColor: '#f5f5f5',
      borderRadius: '6px',
      padding: '40px',
      textAlign: 'center',
      color: '#757575'
    }
  };

  // Function to render the My Reviews content
  const renderMyReviewsContent = () => {
    // Render loading state
    if (isLoading) {
      return <div style={styles.loadingState}>Loading reviews...</div>;
    }

    const filteredReviews = getFilteredReviews();

    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>My Reviews</h1>
          <div style={styles.filterTabs}>
            <button 
              style={styles.filterButton(filter === 'all')}
              onClick={() => setFilter('all')}
            >
              All Reviews
            </button>
            <button 
              style={styles.filterButton(filter === 'pending')}
              onClick={() => setFilter('pending')}
            >
              Pending
            </button>
            <button 
              style={styles.filterButton(filter === 'completed')}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
          </div>
        </div>

        {filteredReviews.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No reviews found matching the selected filter.</p>
          </div>
        ) : (
          <div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Employee</th>
                  <th style={styles.tableHeader}>Review Cycle</th>
                  <th style={styles.tableHeader}>Due Date</th>
                  <th style={styles.tableHeader}>Type</th>
                  <th style={styles.tableHeader}>Status</th>
                  <th style={styles.tableHeader}>Progress</th>
                  <th style={styles.tableHeader}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map((review) => (
                  <tr key={review.id}>
                    <td style={{...styles.tableCell, ...styles.employeeName}}>{review.employee}</td>
                    <td style={styles.tableCell}>{review.cycle}</td>
                    <td style={styles.tableCell}>
                      <div style={styles.dueDate}>
                        {review.dueDate}
                        {new Date(review.dueDate) < new Date() && review.status !== 'completed' && (
                          <span style={styles.overdueBadge}>Overdue</span>
                        )}
                      </div>
                    </td>
                    <td style={styles.tableCell}>{review.reviewType}</td>
                    <td style={styles.tableCell}>
                      <span style={styles.statusBadge(review.status)}>
                        {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      <div style={styles.progressContainer}>
                        <div style={styles.progressBar(review.completionPercentage)}></div>
                        <span style={styles.progressText}>{review.completionPercentage}%</span>
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      <button 
                        style={styles.actionButton}
                        onClick={() => handleReviewAction(review)}
                      >
                        {review.status === 'completed' ? 'View' : 'Continue'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // Wrap the My Reviews content with SidebarLayout
  return (
    <SidebarLayout user={user} activeView="my-reviews">
      {renderMyReviewsContent()}
    </SidebarLayout>
  );
}

export default MyReviews;