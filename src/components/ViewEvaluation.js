// components/ViewEvaluation.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css'; // Keep existing Dashboard styles
import '../styles/EvaluationReview.css'; // Add the new styles

function ViewEvaluation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evaluation, setEvaluation] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        setIsLoading(true);
        // Fetch from localStorage since that's where your app stores the data
        const storedReviews = localStorage.getItem('reviews');
        
        if (storedReviews) {
          const parsedReviews = JSON.parse(storedReviews);
          const foundReview = parsedReviews.find(review => review.id === id);
          
          if (foundReview) {
            setEvaluation(foundReview);
            setFeedback(foundReview.feedback || '');
            setStatus(foundReview.status?.toLowerCase() || 'pending');
            setIsLoading(false);
          } else {
            setError('Evaluation not found');
            setIsLoading(false);
          }
        } else {
          setError('No reviews data found');
          setIsLoading(false);
        }
      } catch (err) {
        setError('Failed to load evaluation data');
        setIsLoading(false);
        console.error('Error fetching evaluation:', err);
      }
    };

    if (id) {
      fetchEvaluation();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Update in localStorage
      const storedReviews = localStorage.getItem('reviews');
      
      if (storedReviews) {
        const parsedReviews = JSON.parse(storedReviews);
        const updatedReviews = parsedReviews.map(review => {
          if (review.id === id) {
            return {
              ...review,
              status: status,
              feedback: feedback,
              lastUpdated: new Date().toISOString()
            };
          }
          return review;
        });
        
        localStorage.setItem('reviews', JSON.stringify(updatedReviews));
        
        setSuccessMessage('Evaluation updated successfully');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError('No reviews data found');
      }
    } catch (err) {
      setError('Failed to update evaluation');
      console.error('Error updating evaluation:', err);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  // Content to render based on loading/error states
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading evaluation data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <div className="error-message">{error}</div>
          <button onClick={handleCancel} className="btn btn-primary">
            Back to Dashboard
          </button>
        </div>
      );
    }

    if (!evaluation) {
      return (
        <div className="not-found-container">
          <div className="not-found-icon">🔍</div>
          <div className="not-found-message">Evaluation not found</div>
          <button onClick={handleCancel} className="btn btn-primary">
            Back to Dashboard
          </button>
        </div>
      );
    }

    return (
      <div className="evaluation-content">
        <div className="page-header">
          <h1 className="page-title">Review Evaluation</h1>
          <button className="btn btn-outline-primary" onClick={handleCancel}>
            Back to Dashboard
          </button>
        </div>

        {successMessage && (
          <div className="alert alert-success">
            <span className="success-icon">✓</span> {successMessage}
          </div>
        )}

        <div className="card mb-4">
          <div className="card-header">
            <h3 className="card-title">Evaluation Details</h3>
          </div>
          <div className="card-body">
            <div className="detail-grid">
              <div className="detail-row">
                <div className="detail-label">Employee:</div>
                <div className="detail-value">{evaluation.employeeName || 'Unknown'}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Review Cycle:</div>
                <div className="detail-value">{evaluation.reviewCycle || 'Annual Review'}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Due Date:</div>
                <div className="detail-value">
                  {evaluation.dueDate ? new Date(evaluation.dueDate).toLocaleDateString() : 
                  evaluation.submissionDate ? new Date(evaluation.submissionDate).toLocaleDateString() : 
                  'N/A'}
                </div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Status:</div>
                <div className="detail-value">
                  <span className={`status-badge ${status}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>
              </div>
              
              {evaluation.completionPercentage !== undefined && (
                <div className="detail-row">
                  <div className="detail-label">Completion:</div>
                  <div className="detail-value">
                    <div className="progress-container">
                      <div className="progress">
                        <div 
                          className="progress-bar" 
                          style={{width: `${evaluation.completionPercentage}%`}}
                        ></div>
                      </div>
                      <span className="progress-value">{evaluation.completionPercentage}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {evaluation.sections && evaluation.sections.length > 0 && (
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="card-title">Review Sections</h3>
            </div>
            <div className="card-body">
              {evaluation.sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="section-container">
                  <h4 className="section-title">{section.title}</h4>
                  {section.questions && section.questions.map((question, questionIndex) => (
                    <div key={questionIndex} className="question-container">
                      <div className="question-text">{question.text}</div>
                      <div className="answer-container">
                        {question.answer ? (
                          <div className="answer">{question.answer}</div>
                        ) : (
                          <div className="no-answer">No response yet</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Manager Review</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group mb-4">
                <label htmlFor="status" className="form-label">Update Status:</label>
                <select 
                  id="status"
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="in progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <div className="form-group mb-4">
                <label htmlFor="feedback" className="form-label">Manager Feedback:</label>
                <textarea
                  id="feedback"
                  className="form-control"
                  rows="5"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Enter your feedback for this evaluation"
                ></textarea>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-outline-secondary" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // This component now only returns the content portion, not the full layout
  return renderContent();
}

export default ViewEvaluation;