import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

function ViewEvaluation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  
  const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : 'https://performance-review-backend-ab8z.onrender.com';

  // Format date safely as a string
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Safely get employee name
  const getEmployeeName = (employee) => {
    if (!employee) return 'Unknown';
    const firstName = employee.firstName || '';
    const lastName = employee.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'Unknown';
  };

  useEffect(() => {
    let isMounted = true;
    
    const fetchReview = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/api/reviews/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch review: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Review data:", data);
        
        if (isMounted) {
          // Store safe versions of data
          setReviewData({
            id: data.id || id,
            employeeName: data.employee ? getEmployeeName(data.employee) : 'Unknown Employee',
            reviewPeriod: data.reviewPeriod || 'N/A',
            status: data.status || 'Unknown',
            startDateFormatted: formatDate(data.startDate)
          });
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching review:', err);
        if (isMounted) {
          setError(err.message || 'Error fetching review data');
          setLoading(false);
        }
      }
    };

    fetchReview();
    
    return () => {
      isMounted = false;
    };
  }, [id, API_BASE_URL]);
  
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate('/pending-reviews')}
        style={{ 
          padding: '8px 16px', 
          background: '#4c75af', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px', 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          marginBottom: '20px'
        }}
      >
        <FaArrowLeft /> Back to Pending Reviews
      </button>
      
      <h1>Review Editor</h1>
      
      {loading ? (
        <p>Loading review data...</p>
      ) : error ? (
        <div style={{ color: 'red' }}>
          <p>Error: {error}</p>
        </div>
      ) : reviewData ? (
        <div>
          <p><strong>Employee:</strong> {reviewData.employeeName}</p>
          <p><strong>Review Period:</strong> {reviewData.reviewPeriod}</p>
          <p><strong>Status:</strong> {reviewData.status}</p>
          <p><strong>Date Started:</strong> {reviewData.startDateFormatted}</p>
        </div>
      ) : (
        <p>No review found</p>
      )}
    </div>
  );
}

export default ViewEvaluation;