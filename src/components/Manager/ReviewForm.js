import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import SidebarLayout from '../SidebarLayout';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Manager/ReviewForm.css';

const ReviewForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { reviewId } = useParams();
  const { user, fetchWithAuth } = useAuth();
  
  // Extract employee ID from query params if starting a new review
  const queryParams = new URLSearchParams(location.search);
  const employeeIdParam = queryParams.get('employeeId');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  const [reviewData, setReviewData] = useState({
    employeeId: employeeIdParam || '',
    reviewType: 'quarterly',
    dueDate: '',
    sections: [
      {
        id: 'performance',
        title: 'Performance Evaluation',
        questions: [
          {
            id: 'goals',
            type: 'rating',
            question: 'Achievement of goals and objectives',
            rating: 0,
            comments: ''
          },
          {
            id: 'quality',
            type: 'rating',
            question: 'Quality of work',
            rating: 0,
            comments: ''
          },
          {
            id: 'productivity',
            type: 'rating',
            question: 'Productivity and efficiency',
            rating: 0,
            comments: ''
          }
        ]
      },
      {
        id: 'skills',
        title: 'Skills and Competencies',
        questions: [
          {
            id: 'technical',
            type: 'rating',
            question: 'Technical skills',
            rating: 0,
            comments: ''
          },
          {
            id: 'communication',
            type: 'rating',
            question: 'Communication skills',
            rating: 0,
            comments: ''
          },
          {
            id: 'teamwork',
            type: 'rating',
            question: 'Teamwork and collaboration',
            rating: 0,
            comments: ''
          }
        ]
      },
      {
        id: 'overall',
        title: 'Overall Assessment',
        questions: [
          {
            id: 'strengths',
            type: 'text',
            question: 'Key strengths',
            comments: ''
          },
          {
            id: 'improvements',
            type: 'text',
            question: 'Areas for improvement',
            comments: ''
          },
          {
            id: 'summary',
            type: 'text',
            question: 'Overall performance summary',
            comments: ''
          }
        ]
      }
    ],
    overallRating: 0,
    overallComments: '',
    status: 'draft'
  });
  
  const [employee, setEmployee] = useState(null);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [activeSection, setActiveSection] = useState(0);
  
  useEffect(() => {
    const fetchReviewData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // If reviewId exists, fetch existing review
        if (reviewId) {
          const reviewResponse = await fetchWithAuth(`/api/reviews/${reviewId}`);
          
          if (reviewResponse.ok) {
            const existingReview = await reviewResponse.json();
            setReviewData(existingReview);
            
            // Fetch employee data
            const employeeResponse = await fetchWithAuth(`/api/employees/${existingReview.employeeId}`);
            
            if (employeeResponse.ok) {
              const employeeData = await employeeResponse.json();
              setEmployee(employeeData);
            }
          } else {
            throw new Error('Failed to fetch review data');
          }
        } 
        // If employeeId exists but not reviewId, fetch employee data
        else if (employeeIdParam) {
          const employeeResponse = await fetchWithAuth(`/api/employees/${employeeIdParam}`);
          
          if (employeeResponse.ok) {
            const employeeData = await employeeResponse.json();
            setEmployee(employeeData);
          } else {
            throw new Error('Failed to fetch employee data');
          }
        }
        
        // Fetch available employees for dropdown
        const employeesResponse = await fetchWithAuth('/api/manager/team-members');
        
        if (employeesResponse.ok) {
          const employeesData = await employeesResponse.json();
          setAvailableEmployees(employeesData);
        }
        
        // Fetch review templates
        const templatesResponse = await fetchWithAuth('/api/templates');
        
        if (templatesResponse.ok) {
          const templatesData = await templatesResponse.json();
          setTemplates(templatesData);
        }
      } catch (error) {
        console.error('Error fetching review data:', error);
        setError('Failed to load review data. Please try again later.');
        
        // Set mock data for development/demo purposes
        if (reviewId) {
          // Mock existing review data
          const mockReview = {
            id: reviewId,
            employeeId: '123',
            reviewType: 'quarterly',
            dueDate: '2025-05-15',
            sections: [
              {
                id: 'performance',
                title: 'Performance Evaluation',
                questions: [
                  {
                    id: 'goals',
                    type: 'rating',
                    question: 'Achievement of goals and objectives',
                    rating: 4,
                    comments: 'John has met most of his quarterly objectives ahead of schedule.'
                  },
                  {
                    id: 'quality',
                    type: 'rating',
                    question: 'Quality of work',
                    rating: 5,
                    comments: 'Consistently delivers high-quality work with minimal revisions needed.'
                  },
                  {
                    id: 'productivity',
                    type: 'rating',
                    question: 'Productivity and efficiency',
                    rating: 4,
                    comments: 'Good productivity with room for improvement in task prioritization.'
                  }
                ]
              },
              {
                id: 'skills',
                title: 'Skills and Competencies',
                questions: [
                  {
                    id: 'technical',
                    type: 'rating',
                    question: 'Technical skills',
                    rating: 5,
                    comments: 'Excellent technical skills, especially in React and Node.js.'
                  },
                  {
                    id: 'communication',
                    type: 'rating',
                    question: 'Communication skills',
                    rating: 3,
                    comments: 'Communicates well with team members but could improve documentation.'
                  },
                  {
                    id: 'teamwork',
                    type: 'rating',
                    question: 'Teamwork and collaboration',
                    rating: 4,
                    comments: 'Works well with the team and is always willing to help others.'
                  }
                ]
              },
              {
                id: 'overall',
                title: 'Overall Assessment',
                questions: [
                  {
                    id: 'strengths',
                    type: 'text',
                    question: 'Key strengths',
                    comments: 'Technical expertise, problem-solving ability, work quality'
                  },
                  {
                    id: 'improvements',
                    type: 'text',
                    question: 'Areas for improvement',
                    comments: 'Documentation, proactive communication with stakeholders'
                  },
                  {
                    id: 'summary',
                    type: 'text',
                    question: 'Overall performance summary',
                    comments: 'John is a valuable team member who consistently delivers high-quality work. His technical skills are excellent, and he collaborates well with the team. Areas for improvement include documentation and communication with stakeholders.'
                  }
                ]
              }
            ],
            overallRating: 4,
            overallComments: 'John has performed well this quarter and shows consistent growth. With some improvements in communication, he could take on more leadership responsibilities.',
            status: 'in-progress'
          };
          
          setReviewData(mockReview);
        }
        
        // Mock employee data
        setEmployee({
          id: employeeIdParam || '123',
          name: 'John Doe',
          role: 'Software Engineer',
          department: 'Engineering',
          email: 'john.doe@example.com'
        });
        
        // Mock available employees
        setAvailableEmployees([
          { id: '123', name: 'John Doe', role: 'Software Engineer' },
          { id: '456', name: 'Jane Smith', role: 'UX Designer' },
          { id: '789', name: 'Mike Johnson', role: 'Product Manager' },
          { id: '012', name: 'Sarah Williams', role: 'QA Engineer' }
        ]);
        
        // Mock templates
        setTemplates([
          { id: '1', name: 'Quarterly Review' },
          { id: '2', name: 'Annual Performance Evaluation' },
          { id: '3', name: 'Probation Review' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReviewData();
  }, [reviewId, employeeIdParam, fetchWithAuth]);
  
  // Set default due date to 2 weeks from today
  useEffect(() => {
    if (!reviewData.dueDate) {
      const twoWeeksFromNow = new Date();
      twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
      
      setReviewData(prev => ({
        ...prev,
        dueDate: twoWeeksFromNow.toISOString().split('T')[0]
      }));
    }
  }, [reviewData.dueDate]);
  
  const handleEmployeeChange = (e) => {
    const selectedEmployeeId = e.target.value;
    const selectedEmployee = availableEmployees.find(emp => emp.id === selectedEmployeeId);
    
    setReviewData(prev => ({
      ...prev,
      employeeId: selectedEmployeeId
    }));
    
    setEmployee(selectedEmployee);
  };
  
  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    // In a real implementation, we would load the template structure here
    // For this demo, we'll just update the review type
    
    if (templateId === '1') {
      setReviewData(prev => ({
        ...prev,
        reviewType: 'quarterly'
      }));
    } else if (templateId === '2') {
      setReviewData(prev => ({
        ...prev,
        reviewType: 'annual'
      }));
    } else if (templateId === '3') {
      setReviewData(prev => ({
        ...prev,
        reviewType: 'probation'
      }));
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setReviewData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleRatingChange = (sectionIndex, questionIndex, value) => {
    setReviewData(prev => {
      const newSections = [...prev.sections];
      newSections[sectionIndex].questions[questionIndex].rating = parseInt(value);
      
      return {
        ...prev,
        sections: newSections
      };
    });
    
    // Recalculate overall rating
    calculateOverallRating();
  };
  
  const handleCommentChange = (sectionIndex, questionIndex, value) => {
    setReviewData(prev => {
      const newSections = [...prev.sections];
      newSections[sectionIndex].questions[questionIndex].comments = value;
      
      return {
        ...prev,
        sections: newSections
      };
    });
  };
  
  const calculateOverallRating = () => {
    let ratingSum = 0;
    let ratingCount = 0;
    
    reviewData.sections.forEach(section => {
      section.questions.forEach(question => {
        if (question.type === 'rating' && question.rating > 0) {
          ratingSum += question.rating;
          ratingCount++;
        }
      });
    });
    
    const newOverallRating = ratingCount > 0 ? Math.round(ratingSum / ratingCount) : 0;
    
    setReviewData(prev => ({
      ...prev,
      overallRating: newOverallRating
    }));
  };
  
  const handleSaveDraft = async () => {
    await saveReview('draft');
  };
  
  const handleSubmitReview = async () => {
    await saveReview('completed');
  };
  
  const saveReview = async (status) => {
    if (!reviewData.employeeId) {
      setError('Please select an employee for this review.');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Prepare data for submission
      const reviewToSubmit = {
        ...reviewData,
        status: status
      };
      
      // API endpoint (create new or update existing)
      const endpoint = reviewId 
        ? `/api/reviews/${reviewId}` 
        : '/api/reviews';
      
      const method = reviewId ? 'PUT' : 'POST';
      
      const response = await fetchWithAuth(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewToSubmit)
      });
      
      if (response.ok) {
        const savedReview = await response.json();
        
        // Update the form with saved data (including generated ID if new)
        if (!reviewId) {
          // Redirect to the edit page for the new review
          navigate(`/reviews/${savedReview.id}`, { replace: true });
        }
        
        setSuccessMessage(status === 'completed' 
          ? 'Review submitted successfully!'
          : 'Review saved as draft.'
        );
        
        // If completed, redirect back to reviews list after a delay
        if (status === 'completed') {
          setTimeout(() => {
            navigate('/manager/dashboard');
          }, 2000);
        }
      } else {
        throw new Error('Failed to save review');
      }
    } catch (error) {
      console.error('Error saving review:', error);
      setError('Failed to save review. Please try again later.');
      
      // For demo/development, simulate success
      setSuccessMessage(status === 'completed' 
        ? 'Review submitted successfully! (Demo mode)'
        : 'Review saved as draft. (Demo mode)'
      );
      
      if (status === 'completed') {
        setTimeout(() => {
          navigate('/manager/dashboard');
        }, 2000);
      }
    } finally {
      setIsSaving(false);
      // Scroll to top to show any messages
      window.scrollTo(0, 0);
    }
  };
  
  const handleNextSection = () => {
    if (activeSection < reviewData.sections.length - 1) {
      setActiveSection(activeSection + 1);
      window.scrollTo(0, 0);
    }
  };
  
  const handlePrevSection = () => {
    if (activeSection > 0) {
      setActiveSection(activeSection - 1);
      window.scrollTo(0, 0);
    }
  };
  
  // Function to render star rating component
  const renderStarRating = (sectionIndex, questionIndex, rating) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span 
            key={star}
            className={`star ${star <= rating ? 'filled' : ''}`}
            onClick={() => handleRatingChange(sectionIndex, questionIndex, star)}
          >
            ★
          </span>
        ))}
        <span className="rating-value">{rating > 0 ? rating : 'Not rated'}/5</span>
      </div>
    );
  };
  
  // Function to render review form header
  const renderReviewHeader = () => {
    return (
      <div className="review-form-header">
        <h1>{reviewId ? 'Edit Review' : 'New Review'}</h1>
        
        {!reviewId && (
          <div className="review-setup-options">
            <div className="form-group">
              <label>Employee:</label>
              <select 
                value={reviewData.employeeId} 
                onChange={handleEmployeeChange}
                disabled={!!reviewId}
              >
                <option value="">Select Employee</option>
                {availableEmployees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} - {emp.role}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Template:</label>
              <select 
                onChange={handleTemplateChange}
                disabled={!!reviewId}
              >
                <option value="">Select Template</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>{template.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Due Date:</label>
              <input 
                type="date" 
                name="dueDate"
                value={reviewData.dueDate}
                onChange={handleInputChange}
              />
            </div>
          </div>
        )}
        
        {employee && (
          <div className="employee-info-card">
            <div className="employee-info-header">
              <div className="employee-avatar">
                {employee.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3>{employee.name}</h3>
                <p>{employee.role}</p>
              </div>
            </div>
            <div className="employee-info-details">
              <div>
                <strong>Department:</strong> {employee.department}
              </div>
              <div>
                <strong>Email:</strong> {employee.email}
              </div>
              <div>
                <strong>Review Type:</strong> {reviewData.reviewType.charAt(0).toUpperCase() + reviewData.reviewType.slice(1)}
              </div>
              <div>
                <strong>Due Date:</strong> {new Date(reviewData.dueDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}
        
        {(error || successMessage) && (
          <div className={`alert ${error ? 'alert-error' : 'alert-success'}`}>
            {error || successMessage}
          </div>
        )}
      </div>
    );
  };
  
  // Function to render section navigation
  const renderSectionNav = () => {
    return (
      <div className="section-navigation">
        <div className="section-tabs">
          {reviewData.sections.map((section, index) => (
            <button
              key={section.id}
              className={`section-tab ${activeSection === index ? 'active' : ''}`}
              onClick={() => setActiveSection(index)}
            >
              {section.title}
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  // Function to render action buttons
  const renderActionButtons = () => {
    return (
      <div className="review-form-actions">
        <div className="section-navigation-buttons">
          {activeSection > 0 && (
            <button 
              className="action-btn"
              onClick={handlePrevSection}
            >
              ← Previous Section
            </button>
          )}
          
          {activeSection < reviewData.sections.length - 1 && (
            <button 
              className="action-btn primary"
              onClick={handleNextSection}
            >
              Next Section →
            </button>
          )}
        </div>
        
        <div className="review-save-buttons">
          <button 
            className="action-btn"
            onClick={handleSaveDraft}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>
          
          {activeSection === reviewData.sections.length - 1 && (
            <button 
              className="action-btn primary"
              onClick={handleSubmitReview}
              disabled={isSaving}
            >
              {isSaving ? 'Submitting...' : 'Submit Review'}
            </button>
          )}
        </div>
      </div>
    );
  };
  
  // Function to render overall rating and comments (on last section)
  const renderOverallRating = () => {
    if (activeSection !== reviewData.sections.length - 1) return null;
    
    return (
      <div className="overall-rating-section">
        <h3>Overall Rating</h3>
        
        <div className="overall-rating-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <span 
              key={star}
              className={`star ${star <= reviewData.overallRating ? 'filled' : ''}`}
              onClick={() => setReviewData(prev => ({ ...prev, overallRating: star }))}
            >
              ★
            </span>
          ))}
          <span className="rating-value">
            {reviewData.overallRating > 0 ? reviewData.overallRating : 'Not rated'}/5
          </span>
        </div>
        
        <div className="form-group full-width">
          <label>Overall Comments:</label>
          <textarea
            name="overallComments"
            value={reviewData.overallComments}
            onChange={handleInputChange}
            rows={4}
            placeholder="Provide overall feedback and recommendations..."
          />
        </div>
      </div>
    );
  };
  
  // Render current section's questions
  const renderCurrentSection = () => {
    if (!reviewData.sections || reviewData.sections.length === 0) return null;
    
    const currentSection = reviewData.sections[activeSection];
    
    return (
      <div className="review-section">
        <h2>{currentSection.title}</h2>
        
        {currentSection.questions.map((question, qIndex) => (
          <div key={question.id} className="question-card">
            <h3>{question.question}</h3>
            
            {question.type === 'rating' && (
              renderStarRating(activeSection, qIndex, question.rating)
            )}
            
            <div className="form-group full-width">
              <label>Comments:</label>
              <textarea
                value={question.comments}
                onChange={(e) => handleCommentChange(activeSection, qIndex, e.target.value)}
                rows={3}
                placeholder="Add your comments here..."
              />
            </div>
          </div>
        ))}
        
        {activeSection === reviewData.sections.length - 1 && renderOverallRating()}
      </div>
    );
  };
  
  return (
    <SidebarLayout user={user} activeView="manager-dashboard">
      <div className="review-form-container">
        {isLoading ? (
          <div className="review-form-loading">
            <div className="spinner"></div>
            <p>Loading review data...</p>
          </div>
        ) : (
          <>
            {renderReviewHeader()}
            {renderSectionNav()}
            {renderCurrentSection()}
            {renderActionButtons()}
          </>
        )}
      </div>
    </SidebarLayout>
  );
};

export default ReviewForm;