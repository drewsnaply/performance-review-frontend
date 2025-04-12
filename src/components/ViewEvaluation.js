import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SidebarLayout from './SidebarLayout';
import { useAuth } from '../context/AuthContext';
import { FaArrowLeft, FaSave, FaCheck, FaTimes } from 'react-icons/fa';

function ViewEvaluation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [formData, setFormData] = useState({
    ratings: {},
    feedback: {},
    goals: []
  });
  const [saveStatus, setSaveStatus] = useState(null);
  
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
        
        // Create a sanitized version of the display data
        const sanitizedData = {
          id: rawData._id || id,
          employeeName: extractEmployeeName(rawData.employee),
          reviewerName: extractReviewerName(rawData.reviewer),
          reviewPeriod: extractSimpleValue(rawData.reviewPeriod),
          status: rawData.status || 'Unknown',
          startDate: formatDate(rawData.startDate)
        };
        
        // Set up form data structure
        setFormData({
          ratings: rawData.ratings || {},
          feedback: rawData.feedback || {},
          goals: Array.isArray(rawData.goals) ? rawData.goals : [],
          comments: rawData.comments || ''
        });
        
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
  
  // Helper function to extract simple values from possibly complex objects
  const extractSimpleValue = (value) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'object') {
      // Try to JSON stringify, but fall back to [Object] if it fails
      try {
        return JSON.stringify(value);
      } catch (e) {
        // If it has a _ property, it might be an object reference
        if (value._) return value._.toString();
        // Otherwise just show it's an object
        return '[Object]';
      }
    }
    return String(value);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested fields like feedback.strengths or ratings.technicalSkillsRating
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent] || {}),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleGoalChange = (index, field, value) => {
    const updatedGoals = [...formData.goals];
    if (!updatedGoals[index]) {
      updatedGoals[index] = {};
    }
    
    updatedGoals[index][field] = value;
    
    setFormData(prev => ({
      ...prev,
      goals: updatedGoals
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaveStatus('saving');
      
      const response = await fetch(`${API_BASE_URL}/api/reviews/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to save review');
      }

      setSaveStatus('success');
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving review:', err);
      setSaveStatus('error');
      // Reset status after 3 seconds
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    }
  };

  const handleComplete = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews/${id}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to complete review');
      }

      // Navigate back to pending reviews
      navigate('/pending-reviews');
    } catch (err) {
      console.error('Error completing review:', err);
      setError(err.message);
    }
  };

  const renderSaveStatus = () => {
    if (saveStatus === 'saving') return <span style={{color: 'blue', marginLeft: '10px'}}>Saving...</span>;
    if (saveStatus === 'success') return <span style={{color: 'green', marginLeft: '10px'}}>Saved Successfully!</span>;
    if (saveStatus === 'error') return <span style={{color: 'red', marginLeft: '10px'}}>Error Saving!</span>;
    return null;
  };
  
  const content = () => {
    if (loading) {
      return <div className="loading">Loading review data...</div>;
    }
    
    if (error) {
      return (
        <div className="error-message" style={{ color: 'red' }}>
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      );
    }
    
    if (!reviewData) {
      return <div className="no-data">No review data found.</div>;
    }
    
    return (
      <form onSubmit={handleSubmit}>
        <div className="review-info" style={{ marginBottom: '20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ fontWeight: 'bold', padding: '8px', width: '150px' }}>Employee:</td>
                <td style={{ padding: '8px' }}>{reviewData.employeeName}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold', padding: '8px' }}>Reviewer:</td>
                <td style={{ padding: '8px' }}>{reviewData.reviewerName}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold', padding: '8px' }}>Review Period:</td>
                <td style={{ padding: '8px' }}>{reviewData.reviewPeriod}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold', padding: '8px' }}>Status:</td>
                <td style={{ padding: '8px' }}>{reviewData.status}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold', padding: '8px' }}>Date Started:</td>
                <td style={{ padding: '8px' }}>{reviewData.startDate}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="review-sections" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Performance Ratings Section */}
          <div className="review-section" style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '15px' }}>
            <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginTop: 0 }}>Performance Ratings</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
              <div>
                <label htmlFor="overall-rating" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Overall Rating:</label>
                <select 
                  id="overall-rating" 
                  name="ratings.overallRating" 
                  value={formData.ratings.overallRating || ''} 
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '8px' }}
                >
                  <option value="">Select Rating</option>
                  <option value="5">5 - Exceptional</option>
                  <option value="4">4 - Exceeds Expectations</option>
                  <option value="3">3 - Meets Expectations</option>
                  <option value="2">2 - Needs Improvement</option>
                  <option value="1">1 - Unsatisfactory</option>
                </select>
              </div>
              <div>
                <label htmlFor="technical-rating" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Technical Skills:</label>
                <select 
                  id="technical-rating" 
                  name="ratings.technicalSkillsRating" 
                  value={formData.ratings.technicalSkillsRating || ''} 
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '8px' }}
                >
                  <option value="">Select Rating</option>
                  <option value="5">5 - Exceptional</option>
                  <option value="4">4 - Exceeds Expectations</option>
                  <option value="3">3 - Meets Expectations</option>
                  <option value="2">2 - Needs Improvement</option>
                  <option value="1">1 - Unsatisfactory</option>
                </select>
              </div>
              <div>
                <label htmlFor="communication-rating" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Communication:</label>
                <select 
                  id="communication-rating" 
                  name="ratings.communicationRating" 
                  value={formData.ratings.communicationRating || ''} 
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '8px' }}
                >
                  <option value="">Select Rating</option>
                  <option value="5">5 - Exceptional</option>
                  <option value="4">4 - Exceeds Expectations</option>
                  <option value="3">3 - Meets Expectations</option>
                  <option value="2">2 - Needs Improvement</option>
                  <option value="1">1 - Unsatisfactory</option>
                </select>
              </div>
              <div>
                <label htmlFor="teamwork-rating" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Teamwork:</label>
                <select 
                  id="teamwork-rating" 
                  name="ratings.teamworkRating" 
                  value={formData.ratings.teamworkRating || ''} 
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '8px' }}
                >
                  <option value="">Select Rating</option>
                  <option value="5">5 - Exceptional</option>
                  <option value="4">4 - Exceeds Expectations</option>
                  <option value="3">3 - Meets Expectations</option>
                  <option value="2">2 - Needs Improvement</option>
                  <option value="1">1 - Unsatisfactory</option>
                </select>
              </div>
            </div>
          </div>

          {/* Feedback Section */}
          <div className="review-section" style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '15px' }}>
            <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginTop: 0 }}>Feedback</h3>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="strengths" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Strengths:</label>
              <textarea
                id="strengths"
                name="feedback.strengths"
                value={formData.feedback.strengths || ''}
                onChange={handleInputChange}
                rows="4"
                placeholder="Describe employee's strengths and accomplishments..."
                style={{ width: '100%', padding: '8px' }}
              ></textarea>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="improvements" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Areas for Improvement:</label>
              <textarea
                id="improvements"
                name="feedback.areasForImprovement"
                value={formData.feedback.areasForImprovement || ''}
                onChange={handleInputChange}
                rows="4"
                placeholder="Describe areas where the employee can improve..."
                style={{ width: '100%', padding: '8px' }}
              ></textarea>
            </div>
          </div>

          {/* Comments Section */}
          <div className="review-section" style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '15px' }}>
            <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginTop: 0 }}>Additional Comments</h3>
            <textarea
              name="comments"
              value={formData.comments || ''}
              onChange={handleInputChange}
              rows="4"
              placeholder="Any additional comments about the employee's performance..."
              style={{ width: '100%', padding: '8px' }}
            ></textarea>
          </div>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button 
            type="submit" 
            style={{ 
              padding: '10px 20px',
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
            <FaSave /> Save
          </button>
          <button 
            type="button" 
            onClick={handleComplete} 
            style={{ 
              padding: '10px 20px',
              background: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <FaCheck /> Complete Review
          </button>
          {renderSaveStatus()}
        </div>
      </form>
    );
  };

  return (
    <SidebarLayout user={user} activeView="my-reviews">
      <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
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