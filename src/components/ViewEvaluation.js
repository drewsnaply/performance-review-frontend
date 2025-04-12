import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SidebarLayout from './SidebarLayout';
import '../styles/ViewEvaluation.css';
import { FaArrowLeft, FaSave, FaCheck, FaTimes } from 'react-icons/fa';

function ViewEvaluation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});
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
          throw new Error('Failed to fetch review');
        }

        const data = await response.json();
        setReview(data);
        setFormData({
          ...data,
          feedback: data.feedback || {},
          ratings: data.ratings || {},
          goals: data.goals || []
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching review:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchReview();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested fields like feedback.strengths or ratings.technicalSkillsRating
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleGoalChange = (index, field, value) => {
    const updatedGoals = [...formData.goals];
    updatedGoals[index] = {
      ...updatedGoals[index],
      [field]: value
    };
    
    setFormData({
      ...formData,
      goals: updatedGoals
    });
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

      const updatedReview = await response.json();
      setReview(updatedReview);
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
    if (saveStatus === 'saving') return <span className="saving-status">Saving...</span>;
    if (saveStatus === 'success') return <span className="success-status">Saved Successfully!</span>;
    if (saveStatus === 'error') return <span className="error-status">Error Saving!</span>;
    return null;
  };

  if (loading) {
    return (
      <SidebarLayout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading review data...</p>
        </div>
      </SidebarLayout>
    );
  }

  if (error) {
    return (
      <SidebarLayout>
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/pending-reviews')} className="btn-back">
            <FaArrowLeft /> Back to Pending Reviews
          </button>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="view-evaluation-container">
        <div className="eval-header">
          <div className="eval-title-section">
            <button onClick={() => navigate('/pending-reviews')} className="btn-back">
              <FaArrowLeft /> Back
            </button>
            <h1>Review Editor</h1>
            {renderSaveStatus()}
          </div>
          
          <div className="eval-actions">
            <button className="btn-save" onClick={handleSubmit}>
              <FaSave /> Save
            </button>
            <button className="btn-complete" onClick={handleComplete}>
              <FaCheck /> Complete Review
            </button>
          </div>
        </div>

        {review ? (
          <form onSubmit={handleSubmit} className="review-form">
            <div className="review-meta">
              <div className="meta-item">
                <strong>Employee:</strong> {review.employee?.firstName} {review.employee?.lastName}
              </div>
              <div className="meta-item">
                <strong>Review Period:</strong> {review.reviewPeriod}
              </div>
              <div className="meta-item">
                <strong>Status:</strong> <span className={`status-badge ${review.status.replace(/\s+/g, '-').toLowerCase()}`}>{review.status}</span>
              </div>
              <div className="meta-item">
                <strong>Started:</strong> {new Date(review.startDate).toLocaleDateString()}
              </div>
            </div>

            <div className="review-sections">
              <div className="review-section">
                <h2>Performance Ratings</h2>
                <div className="ratings-grid">
                  <div className="rating-item">
                    <label htmlFor="overall-rating">Overall Rating:</label>
                    <select 
                      id="overall-rating" 
                      name="ratings.overallRating" 
                      value={formData.ratings?.overallRating || ''} 
                      onChange={handleInputChange}
                    >
                      <option value="">Select Rating</option>
                      <option value="5">5 - Exceptional</option>
                      <option value="4">4 - Exceeds Expectations</option>
                      <option value="3">3 - Meets Expectations</option>
                      <option value="2">2 - Needs Improvement</option>
                      <option value="1">1 - Unsatisfactory</option>
                    </select>
                  </div>
                  <div className="rating-item">
                    <label htmlFor="technical-rating">Technical Skills:</label>
                    <select 
                      id="technical-rating" 
                      name="ratings.technicalSkillsRating" 
                      value={formData.ratings?.technicalSkillsRating || ''} 
                      onChange={handleInputChange}
                    >
                      <option value="">Select Rating</option>
                      <option value="5">5 - Exceptional</option>
                      <option value="4">4 - Exceeds Expectations</option>
                      <option value="3">3 - Meets Expectations</option>
                      <option value="2">2 - Needs Improvement</option>
                      <option value="1">1 - Unsatisfactory</option>
                    </select>
                  </div>
                  <div className="rating-item">
                    <label htmlFor="communication-rating">Communication:</label>
                    <select 
                      id="communication-rating" 
                      name="ratings.communicationRating" 
                      value={formData.ratings?.communicationRating || ''} 
                      onChange={handleInputChange}
                    >
                      <option value="">Select Rating</option>
                      <option value="5">5 - Exceptional</option>
                      <option value="4">4 - Exceeds Expectations</option>
                      <option value="3">3 - Meets Expectations</option>
                      <option value="2">2 - Needs Improvement</option>
                      <option value="1">1 - Unsatisfactory</option>
                    </select>
                  </div>
                  <div className="rating-item">
                    <label htmlFor="teamwork-rating">Teamwork:</label>
                    <select 
                      id="teamwork-rating" 
                      name="ratings.teamworkRating" 
                      value={formData.ratings?.teamworkRating || ''} 
                      onChange={handleInputChange}
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

              <div className="review-section">
                <h2>Feedback</h2>
                <div className="feedback-item">
                  <label htmlFor="strengths">Strengths:</label>
                  <textarea
                    id="strengths"
                    name="feedback.strengths"
                    value={formData.feedback?.strengths || ''}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Describe employee's strengths and accomplishments..."
                  ></textarea>
                </div>
                <div className="feedback-item">
                  <label htmlFor="improvements">Areas for Improvement:</label>
                  <textarea
                    id="improvements"
                    name="feedback.areasForImprovement"
                    value={formData.feedback?.areasForImprovement || ''}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Describe areas where the employee can improve..."
                  ></textarea>
                </div>
                <div className="feedback-item">
                  <label htmlFor="development">Development Plan:</label>
                  <textarea
                    id="development"
                    name="feedback.developmentPlan"
                    value={formData.feedback?.developmentPlan || ''}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Outline a plan for the employee's professional development..."
                  ></textarea>
                </div>
              </div>

              <div className="review-section">
                <h2>Goals</h2>
                {formData.goals && formData.goals.length > 0 ? (
                  <div className="goals-list">
                    {formData.goals.map((goal, index) => (
                      <div key={index} className="goal-item">
                        <div className="goal-description">
                          <label>Description:</label>
                          <textarea
                            value={goal.description || ''}
                            onChange={(e) => handleGoalChange(index, 'description', e.target.value)}
                            rows="2"
                            placeholder="Goal description..."
                          ></textarea>
                        </div>
                        <div className="goal-target">
                          <label>Target Date:</label>
                          <input
                            type="date"
                            value={goal.targetDate ? goal.targetDate.slice(0, 10) : ''}
                            onChange={(e) => handleGoalChange(index, 'targetDate', e.target.value)}
                          />
                        </div>
                        <div className="goal-status">
                          <label>Status:</label>
                          <select
                            value={goal.status || 'Not Started'}
                            onChange={(e) => handleGoalChange(index, 'status', e.target.value)}
                          >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Canceled">Canceled</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-goals">
                    <p>No goals have been set for this review yet.</p>
                  </div>
                )}
              </div>

              <div className="review-section">
                <h2>Additional Comments</h2>
                <textarea
                  name="comments"
                  value={formData.comments || ''}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Any additional comments about the employee's performance..."
                ></textarea>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-save">
                <FaSave /> Save
              </button>
              <button type="button" className="btn-complete" onClick={handleComplete}>
                <FaCheck /> Complete Review
              </button>
              <button type="button" className="btn-cancel" onClick={() => navigate('/pending-reviews')}>
                <FaTimes /> Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="no-review">Review not found</div>
        )}
      </div>
    </SidebarLayout>
  );
}

export default ViewEvaluation;