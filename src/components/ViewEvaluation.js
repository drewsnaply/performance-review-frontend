import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SidebarLayout from './SidebarLayout';
import { useAuth } from '../context/AuthContext';
import { FaArrowLeft, FaSave } from 'react-icons/fa';

function ViewEvaluation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  
  const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : 'https://performance-review-backend-ab8z.onrender.com';

  useEffect(() => {
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

        const rawData = await response.json();
        console.log("Raw review data:", rawData);
        
        // Create a sanitized version of the data that avoids rendering objects
        const sanitizedData = {
          id: rawData._id || id,
          employeeName: extractEmployeeName(rawData.employee),
          reviewerName: extractReviewerName(rawData.reviewer),
          reviewPeriod: extractSimpleValue(rawData.reviewPeriod),
          status: rawData.status || 'Unknown',
          startDate: formatDate(rawData.startDate)
        };
        
        console.log("Sanitized data:", sanitizedData);
        setReviewData(sanitizedData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching review:', err);
        setError(err.message || 'Error fetching review data');
        setLoading(false);
      }
    };

    if (id) {
      fetchReview();
    }
  }, [id, API_BASE_URL]);
  
  // Helper function to extract employee name
  const extractEmployeeName = (employee) => {
    if (!employee) return 'Unknown Employee';
    // If employee is just an object reference with _ property
    if (employee._) return 'Employee #' + employee._;
    
    const firstName = employee.firstName || '';
    const lastName = employee.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'Unknown Employee';
  };
  
  // Helper function to extract reviewer name
  const extractReviewerName = (reviewer) => {
    if (!reviewer) return 'Unknown Reviewer';
    // If reviewer is just an object reference with _ property
    if (reviewer._) return 'Reviewer #' + reviewer._;
    
    const firstName = reviewer.firstName || '';
    const lastName = reviewer.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'Unknown Reviewer';
  };
  
  // Helper function to extract simple values
  const extractSimpleValue = (value) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'object') {
      // If it has a _ property, it might be an object reference
      if (value._) return value._.toString();
      // Otherwise just show it's an object
      return '[Object]';
    }
    return 'N/A';
  };
  
  // Format date safely
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return 'Invalid Date';
    }
  };
  
  const content = () => {
    if (loading) {
      return <div className="loading">Loading review data...</div>;
    }
    
    if (error) {
      return (
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      );
    }
    
    if (!reviewData) {
      return <div className="no-data">No review data found.</div>;
    }
    
    return (
      <div className="review-details">
        <table>
          <tbody>
            <tr>
              <td><strong>Employee:</strong></td>
              <td>{reviewData.employeeName}</td>
            </tr>
            <tr>
              <td><strong>Reviewer:</strong></td>
              <td>{reviewData.reviewerName}</td>
            </tr>
            <tr>
              <td><strong>Review Period:</strong></td>
              <td>{reviewData.reviewPeriod}</td>
            </tr>
            <tr>
              <td><strong>Status:</strong></td>
              <td>{reviewData.status}</td>
            </tr>
            <tr>
              <td><strong>Date Started:</strong></td>
              <td>{reviewData.startDate}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <SidebarLayout user={user} activeView="my-reviews">
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
              gap: '5px'
            }}
          >
            <FaArrowLeft /> Back to Pending Reviews
          </button>
        </div>
        
        <h1>Review Editor</h1>
        {content()}
      </div>
    </SidebarLayout>
  );
}

export default ViewEvaluation;