import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SidebarLayout from '../SidebarLayout';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Manager/TeamMember.css';

const TeamMember = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { user, fetchWithAuth } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const fetchEmployeeData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch employee details
        const employeeResponse = await fetchWithAuth(`/api/employees/${employeeId}`);
        
        if (employeeResponse.ok) {
          const employeeData = await employeeResponse.json();
          setEmployee(employeeData);
        } else {
          throw new Error('Failed to fetch employee details');
        }
        
        // Fetch employee reviews
        const reviewsResponse = await fetchWithAuth(`/api/employees/${employeeId}/reviews`);
        
        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();
          setReviews(reviewsData);
        } else {
          throw new Error('Failed to fetch employee reviews');
        }
      } catch (error) {
        console.error('Error fetching employee data:', error);
        setError('Failed to load employee data. Please try again later.');
        
        // Set mock data for development/demo purposes
        setEmployee({
          id: employeeId,
          name: 'John Doe',
          email: 'john.doe@example.com',
          role: 'Software Engineer',
          department: 'Engineering',
          hireDate: '2023-06-15',
          manager: 'Jane Smith',
          status: 'Active',
          performanceMetrics: {
            currentScore: 85,
            previousScore: 78,
            trends: [
              { month: 'Jan', score: 72 },
              { month: 'Feb', score: 75 },
              { month: 'Mar', score: 77 },
              { month: 'Apr', score: 78 },
              { month: 'May', score: 80 },
              { month: 'Jun', score: 85 }
            ]
          },
          skills: [
            { name: 'JavaScript', level: 90 },
            { name: 'React', level: 85 },
            { name: 'Node.js', level: 75 },
            { name: 'SQL', level: 70 },
            { name: 'Git', level: 88 }
          ]
        });
        
        setReviews([
          {
            id: 1,
            type: 'Annual Review',
            date: '2024-12-15',
            status: 'Completed',
            score: 85,
            summary: 'John has consistently demonstrated strong technical skills and teamwork throughout the year. His recent project contributions have been particularly valuable.'
          },
          {
            id: 2,
            type: 'Quarterly Check-in',
            date: '2024-09-01',
            status: 'Completed',
            score: 78,
            summary: 'Making good progress on key objectives. Communication could be improved.'
          },
          {
            id: 3,
            type: 'Quarterly Check-in',
            date: '2025-03-01',
            status: 'Pending',
            score: null,
            summary: null
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEmployeeData();
  }, [employeeId, fetchWithAuth]);

  const handleStartReview = () => {
    navigate(`/reviews/new?employeeId=${employeeId}`);
  };

  const handleViewReview = (reviewId) => {
    navigate(`/reviews/${reviewId}`);
  };

  const renderProfileTab = () => {
    if (!employee) return null;
    
    return (
      <div className="team-member-profile-tab">
        <div className="team-member-basic-info">
          <div className="team-member-avatar">
            {employee.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="team-member-details">
            <h2>{employee.name}</h2>
            <p className="team-member-role">{employee.role}</p>
            <p className="team-member-email">{employee.email}</p>
            <p className="team-member-department">Department: {employee.department}</p>
            <p className="team-member-hire-date">Hire Date: {new Date(employee.hireDate).toLocaleDateString()}</p>
            <p className="team-member-status">Status: <span className={`status-indicator ${employee.status.toLowerCase()}`}>{employee.status}</span></p>
          </div>
        </div>
        
        <div className="team-member-metrics">
          <div className="metrics-card">
            <h3>Current Performance</h3>
            <div className="performance-score">
              <div className="score-value">{employee.performanceMetrics.currentScore}</div>
              <div className="score-label">/100</div>
            </div>
            <div className="score-comparison">
              {employee.performanceMetrics.currentScore > employee.performanceMetrics.previousScore ? (
                <span className="score-improvement">↑ {employee.performanceMetrics.currentScore - employee.performanceMetrics.previousScore} points from previous review</span>
              ) : employee.performanceMetrics.currentScore < employee.performanceMetrics.previousScore ? (
                <span className="score-decline">↓ {employee.performanceMetrics.previousScore - employee.performanceMetrics.currentScore} points from previous review</span>
              ) : (
                <span className="score-same">No change from previous review</span>
              )}
            </div>
          </div>
          
          <div className="skills-card">
            <h3>Core Skills</h3>
            <div className="skills-list">
              {employee.skills.map((skill, index) => (
                <div key={index} className="skill-item">
                  <div className="skill-name">{skill.name}</div>
                  <div className="skill-bar-container">
                    <div 
                      className="skill-bar" 
                      style={{ 
                        width: `${skill.level}%`,
                        backgroundColor: skill.level >= 80 ? '#4CAF50' : 
                                         skill.level >= 60 ? '#FFC107' : '#F44336'
                      }}
                    ></div>
                    <span className="skill-level">{skill.level}/100</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="team-member-actions">
          <button className="team-member-action-btn primary" onClick={handleStartReview}>
            Start New Review
          </button>
          <button className="team-member-action-btn" onClick={() => setActiveTab('reviews')}>
            View Past Reviews
          </button>
          <button className="team-member-action-btn" onClick={() => navigate(`/employees/${employeeId}/goals`)}>
            Manage Goals
          </button>
          <button className="team-member-action-btn" onClick={() => navigate(`/employees/${employeeId}/development`)}>
            Development Plan
          </button>
        </div>
      </div>
    );
  };

  const renderReviewsTab = () => {
    return (
      <div className="team-member-reviews-tab">
        <div className="team-member-section-header">
          <h2>Performance Reviews</h2>
          <button className="team-member-action-btn primary" onClick={handleStartReview}>
            Start New Review
          </button>
        </div>
        
        {reviews.length === 0 ? (
          <div className="no-reviews">
            <p>No reviews found for this employee.</p>
          </div>
        ) : (
          <div className="reviews-list">
            {reviews.map(review => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div className="review-type-date">
                    <h3>{review.type}</h3>
                    <p className="review-date">{new Date(review.date).toLocaleDateString()}</p>
                  </div>
                  <div className="review-status">
                    <span className={`status-badge ${review.status.toLowerCase()}`}>
                      {review.status}
                    </span>
                    {review.score && (
                      <div className="review-score">
                        Score: <strong>{review.score}/100</strong>
                      </div>
                    )}
                  </div>
                </div>
                
                {review.summary && (
                  <div className="review-summary">
                    <h4>Summary</h4>
                    <p>{review.summary}</p>
                  </div>
                )}
                
                <div className="review-actions">
                  <button 
                    className="team-member-action-btn primary"
                    onClick={() => handleViewReview(review.id)}
                  >
                    {review.status === 'Completed' ? 'View Details' : 
                     review.status === 'In Progress' ? 'Continue Review' : 'Start Review'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <SidebarLayout user={user} activeView="manager-dashboard">
      <div className="team-member-container">
        {isLoading ? (
          <div className="team-member-loading">
            <div className="spinner"></div>
            <p>Loading employee data...</p>
          </div>
        ) : error ? (
          <div className="team-member-error">
            <p>{error}</p>
            <button 
              className="team-member-action-btn"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="team-member-header">
              <div className="team-member-breadcrumbs">
                <span onClick={() => navigate('/manager/dashboard')}>Dashboard</span>
                <span className="separator">›</span>
                <span onClick={() => navigate('/manager/dashboard')}>Team</span>
                <span className="separator">›</span>
                <span className="current">{employee?.name || 'Employee'}</span>
              </div>
              
              <div className="team-member-tabs">
                <button 
                  className={`team-member-tab ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  Profile
                </button>
                <button 
                  className={`team-member-tab ${activeTab === 'reviews' ? 'active' : ''}`}
                  onClick={() => setActiveTab('reviews')}
                >
                  Reviews
                </button>
              </div>
            </div>
            
            <div className="team-member-content">
              {activeTab === 'profile' && renderProfileTab()}
              {activeTab === 'reviews' && renderReviewsTab()}
            </div>
          </>
        )}
      </div>
    </SidebarLayout>
  );
};

export default TeamMember;