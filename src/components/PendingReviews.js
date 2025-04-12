import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SidebarLayout from './SidebarLayout';
import { useAuth } from '../context/AuthContext';
import { FaEdit, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

function PendingReviews() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(location.state?.message || null);
  const [completedReviewId, setCompletedReviewId] = useState(location.state?.completedReview || null);

  // Fallback data in case API fails
  const mockReviews = [
    {
      _id: location.state?.completedReview || "mock-review-1",
      employee: { firstName: "Dana", lastName: "Bear" },
      reviewer: { firstName: "Andrew", lastName: "Mintzell" },
      reviewPeriod: { 
        start: "2024-10-12T00:00:00.000Z", 
        end: "2025-04-10T00:00:00.000Z" 
      },
      status: "inProgress",
      clientSideCompleted: location.state?.completedReview ? true : false
    }
  ];

  const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : 'https://performance-review-backend-ab8z.onrender.com';

  useEffect(() => {
    const fetchPendingReviews = async () => {
      try {
        setLoading(true);
        console.log("Attempting to fetch pending reviews from API");
        
        const response = await fetch(`${API_BASE_URL}/api/reviews/pending`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch pending reviews: ${response.status}`);
        }

        const data = await response.json();
        
        // Mark any review as completed if it was just completed in the other component
        if (completedReviewId) {
          data.forEach(review => {
            if (review._id === completedReviewId) {
              review.clientSideCompleted = true;
            }
          });
        }
        
        setPendingReviews(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching pending reviews:', err);
        
        // Use mock data as fallback
        console.log("Using mock data as fallback due to API error");
        setPendingReviews(mockReviews);
        
        // Still show notification but don't display error
        if (completedReviewId) {
          setNotification("Review marked as completed");
        }
        
        setLoading(false);
      }
    };

    fetchPendingReviews();
    
    // Clear notification after 5 seconds
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [API_BASE_URL, completedReviewId, notification, mockReviews]);

  const handleReviewClick = (reviewId) => {
    navigate(`/reviews/edit/${reviewId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const extractName = (user) => {
    if (!user) return 'Unknown';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown';
  };

  // Style for the notification
  const notificationStyle = {
    padding: '10px 15px',
    backgroundColor: '#4caf50',
    color: 'white',
    borderRadius: '4px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  };

  // Card design for the pending reviews
  const cardStyle = {
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    marginBottom: '15px',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    position: 'relative'
  };

  const completedCardStyle = {
    ...cardStyle,
    backgroundColor: '#f0f9f0',
    borderLeft: '4px solid #4caf50'
  };

  // Safe user data to prevent undefined undefined
  const safeUser = user || {
    firstName: '',
    lastName: '',
    role: 'employee'
  };
  
  console.log("Current user data:", safeUser);

  return (
    <SidebarLayout user={safeUser} activeView="pending-reviews">
      <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '20px', color: '#333' }}>Pending Reviews</h1>
        
        {notification && (
          <div style={notificationStyle}>
            <FaCheck />
            <span>{notification}</span>
          </div>
        )}
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '5px solid #f3f3f3',
              borderTop: '5px solid #5a189a',
              borderRadius: '50%',
              margin: '0 auto 20px',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p>Loading pending reviews...</p>
            <style>
              {`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}
            </style>
          </div>
        ) : pendingReviews.length === 0 ? (
          <div style={{ 
            padding: '40px 20px', 
            textAlign: 'center',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px'
          }}>
            <p style={{ fontSize: '18px', color: '#666' }}>No pending reviews to display</p>
          </div>
        ) : (
          <div>
            {pendingReviews.map((review, index) => (
              <div 
                key={review._id || index}
                onClick={() => handleReviewClick(review._id)}
                style={review.clientSideCompleted ? completedCardStyle : cardStyle}
                onMouseEnter={(e) => {
                  if (!review.clientSideCompleted) {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!review.clientSideCompleted) {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
                  }
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
                      {review.clientSideCompleted && (
                        <span style={{ color: '#4caf50', marginRight: '10px' }}>
                          <FaCheck />
                        </span>
                      )}
                      {extractName(review.employee)}
                    </h3>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      <strong>Review Period:</strong> {review.reviewPeriod && 
                        `${formatDate(review.reviewPeriod.start)} to ${formatDate(review.reviewPeriod.end)}`
                      }
                    </p>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      <strong>Status:</strong> {review.clientSideCompleted ? 'Completed' : (review.status || 'Pending')}
                    </p>
                  </div>
                  
                  <div style={{
                    alignSelf: 'center',
                    marginRight: '10px'
                  }}>
                    {!review.clientSideCompleted && (
                      <FaEdit size={24} color="#5a189a" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}

export default PendingReviews;