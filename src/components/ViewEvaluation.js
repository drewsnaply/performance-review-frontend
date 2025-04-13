import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SidebarLayout from './SidebarLayout';
import { useAuth } from '../context/AuthContext';
import { 
  FaArrowLeft, FaPlus, FaSave, FaCheck, FaExclamationTriangle, 
  FaTrash, FaEdit, FaTimes, FaChartLine, FaCalendarCheck
} from 'react-icons/fa';
import '../styles/EvaluationReview.css';

function ViewEvaluation() {
  const { reviewId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();  // Changed from { user } to { currentUser }
  
  // Create user object for SidebarLayout
  const user = currentUser ? {
    firstName: currentUser.firstName || currentUser.username || 'User',
    lastName: currentUser.lastName || '',
    role: currentUser.role || 'USER'
  } : null;
  
  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [kpis, setKpis] = useState([]);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [activeTab, setActiveTab] = useState('questions');
  const [checkInData, setCheckInData] = useState({
    managerComments: '',
    employeeComments: '',
    date: new Date().toISOString().split('T')[0],
    goals: [],
    kpis: []
  });
  
  // Goal form state
  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    targetDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
    linkedKpi: '',
    status: 'Not Started',
    progress: 0,
    notes: ''
  });
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [currentGoal, setCurrentGoal] = useState(null);
  
  // API base URL
  const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : 'https://performance-review-backend-ab8z.onrender.com';
  
  // Fetch review data
  useEffect(() => {
    const fetchReviewData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Attempting to fetch review data for ID:', reviewId);
        console.log('Using token:', localStorage.getItem('token'));
        
        const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`, {
          headers: {
            // Changed from 'authToken' to 'token'
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorMessage = `Failed to fetch review data (Status: ${response.status})`;
          console.error(errorMessage);
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        setReviewData(data);
        
        // Fetch KPIs
        try {
          const kpisResponse = await fetch(`${API_BASE_URL}/api/kpis`, {
            headers: {
              // Changed from 'authToken' to 'token'
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (kpisResponse.ok) {
            const kpisData = await kpisResponse.json();
            setKpis(kpisData);
          } else {
            console.warn('KPIs request failed:', kpisResponse.status);
          }
        } catch (kpiError) {
          console.warn('Error fetching KPIs:', kpiError);
          // Continue with the app even if KPIs fail to load
        }
        
        // Fetch goals if not included in review data
        if (!data.goals || !Array.isArray(data.goals) || data.goals.length === 0) {
          try {
            const goalsResponse = await fetch(`${API_BASE_URL}/api/goals?reviewId=${reviewId}`, {
              headers: {
                // Changed from 'authToken' to 'token'
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (goalsResponse.ok) {
              const goalsData = await goalsResponse.json();
              setReviewData(prev => ({
                ...prev,
                goals: goalsData
              }));
            } else {
              console.warn('Goals request failed:', goalsResponse.status);
            }
          } catch (goalsError) {
            console.warn('Error fetching goals:', goalsError);
            // Continue with the app even if goals fail to load
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching review data:', error);
        setError(error.message || 'Failed to load review data');
        setLoading(false);
      }
    };
    
    if (reviewId) {
      fetchReviewData();
    }
  }, [reviewId, API_BASE_URL]);
  
  // Handle form input change
  const handleInputChange = (e, sectionIndex, questionIndex) => {
    if (!reviewData || !reviewData.sections) return;
    
    const updatedReviewData = { ...reviewData };
    updatedReviewData.sections[sectionIndex].questions[questionIndex].response = e.target.value;
    setReviewData(updatedReviewData);
  };
  
  // Handle rating change
  const handleRatingChange = (e, ratingKey) => {
    if (!reviewData || !reviewData.ratings) return;
    
    const updatedReviewData = { ...reviewData };
    updatedReviewData.ratings[ratingKey] = parseInt(e.target.value);
    setReviewData(updatedReviewData);
  };
  
  // Handle feedback input change
  const handleFeedbackChange = (e, feedbackType) => {
    if (!reviewData || !reviewData.feedback) return;
    
    const updatedReviewData = { ...reviewData };
    updatedReviewData.feedback[feedbackType] = e.target.value;
    setReviewData(updatedReviewData);
  };
  
  // Save review data
  const handleSaveReview = async () => {
    if (!reviewData) return;
    
    try {
      setSubmitting(true);
      
      const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          // Changed from 'authToken' to 'token'
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save review (Status: ${response.status})`);
      }
      
      const updatedReview = await response.json();
      setReviewData(updatedReview);
      alert('Review saved successfully!');
    } catch (error) {
      console.error('Error saving review:', error);
      alert(`Failed to save review: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Submit review
  const handleSubmitReview = async () => {
    if (!reviewData) return;
    
    // Validate required fields
    if (!validateRequiredFields()) {
      return;
    }
    
    // Confirm submission
    if (!window.confirm('Are you sure you want to submit this review? This will change the status to "Submitted" and notify the employee.')) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      const reviewToSubmit = {
        ...reviewData,
        status: 'Submitted',
        submissionDate: new Date().toISOString()
      };
      
      const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}/submit`, {
        method: 'PUT',
        headers: {
          // Changed from 'authToken' to 'token'
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewToSubmit)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to submit review (Status: ${response.status})`);
      }
      
      const submittedReview = await response.json();
      setReviewData(submittedReview);
      alert('Review submitted successfully!');
      
      // Navigate back to reviews list
      navigate('/reviews');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(`Failed to submit review: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Complete review (final status, not monthly check-in)
  const handleCompleteReview = async () => {
    if (!reviewData) return;
    
    if (!window.confirm('Are you sure you want to complete this review? This will finalize the review period.')) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      const reviewToComplete = {
        ...reviewData,
        status: 'Completed'
      };
      
      const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}/complete`, {
        method: 'PUT',
        headers: {
          // Changed from 'authToken' to 'token'
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewToComplete)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to complete review (Status: ${response.status})`);
      }
      
      const completedReview = await response.json();
      setReviewData(completedReview);
      alert('Review completed successfully!');
      
      // Navigate back to reviews list
      navigate('/reviews');
    } catch (error) {
      console.error('Error completing review:', error);
      alert(`Failed to complete review: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Record a monthly check-in without completing the review
  const handleMonthlyCheckIn = async () => {
    if (!reviewData) return;
    
    try {
      setSubmitting(true);
      
      // Prepare progress snapshot
      const progressSnapshot = {
        date: checkInData.date,
        managerComments: checkInData.managerComments,
        employeeComments: checkInData.employeeComments,
        goals: checkInData.goals.map(goal => ({
          goalId: goal._id,
          title: goal.title,
          progress: goal.progress,
          status: goal.status,
          notes: goal.notes
        })),
        kpis: checkInData.kpis.map(kpi => ({
          kpiId: kpi._id,
          title: kpi.title,
          currentValue: kpi.currentValue,
          target: kpi.target,
          status: kpi.status,
          notes: kpi.notes
        }))
      };
      
      // Calculate next check-in date (default to 1 month later)
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      const updatedReview = {
        ...reviewData,
        progressSnapshots: [...(reviewData.progressSnapshots || []), progressSnapshot],
        nextCheckInDate: nextMonth.toISOString()
      };
      
      const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}/checkin`, {
        method: 'POST',
        headers: {
          // Changed from 'authToken' to 'token'
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          snapshot: progressSnapshot,
          nextCheckInDate: nextMonth.toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to record check-in (Status: ${response.status})`);
      }
      
      const result = await response.json();
      setReviewData(result.review);
      setShowCheckInModal(false);
      alert('Monthly check-in recorded successfully!');
    } catch (error) {
      console.error('Error recording check-in:', error);
      alert(`Failed to record check-in: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Validate required fields
  const validateRequiredFields = () => {
    if (!reviewData || !reviewData.sections) return false;
    
    let isValid = true;
    const missingFields = [];
    
    // Check required questions
    reviewData.sections.forEach((section) => {
      section.questions.forEach((question) => {
        if (question.required && (!question.response || question.response.trim() === '')) {
          isValid = false;
          missingFields.push(`"${question.text}" in section "${section.title}"`);
        }
      });
    });
    
    if (!isValid) {
      alert(`Please complete the following required fields:\n${missingFields.join('\n')}`);
    }
    
    return isValid;
  };
  
  // Goal management functions
  const handleAddGoal = () => {
    setIsEditingGoal(false);
    setCurrentGoal(null);
    setGoalForm({
      title: '',
      description: '',
      targetDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
      linkedKpi: '',
      status: 'Not Started',
      progress: 0,
      notes: ''
    });
    setShowGoalModal(true);
  };
  
  const handleEditGoal = (goal) => {
    setIsEditingGoal(true);
    setCurrentGoal(goal);
    
    // Format date for the form
    const targetDate = goal.targetDate 
      ? new Date(goal.targetDate).toISOString().split('T')[0]
      : '';
    
    setGoalForm({
      title: goal.title,
      description: goal.description || '',
      targetDate,
      linkedKpi: goal.linkedKpi?._id || goal.linkedKpi || '',
      status: goal.status || 'Not Started',
      progress: goal.progress || 0,
      notes: goal.notes || ''
    });
    
    setShowGoalModal(true);
  };
  
  const handleGoalInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGoalForm({
      ...goalForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleProgressChange = (e) => {
    const value = parseInt(e.target.value);
    setGoalForm({
      ...goalForm,
      progress: value,
      // Update status automatically based on progress
      status: value >= 100 ? 'Completed' : value > 0 ? 'In Progress' : 'Not Started'
    });
  };
  
  const handleSaveGoal = async () => {
    if (!reviewData || !reviewData.employee) {
      alert('Cannot save goal: Missing employee information');
      return;
    }
    
    try {
      // Validate form
      if (!goalForm.title) {
        alert('Please enter a goal title');
        return;
      }
      
      // Prepare goal data
      const goalData = {
        ...goalForm,
        progress: parseInt(goalForm.progress),
        employeeId: reviewData.employee._id,
        reviewId: reviewId
      };
      
      // Save goal
      const url = isEditingGoal 
        ? `${API_BASE_URL}/api/goals/${currentGoal._id}`
        : `${API_BASE_URL}/api/goals`;
      
      const method = isEditingGoal ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          // Changed from 'authToken' to 'token'
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(goalData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save goal (Status: ${response.status})`);
      }
      
      const savedGoal = await response.json();
      
      // Update goals in review data
      let updatedGoals;
      if (isEditingGoal) {
        updatedGoals = (reviewData.goals || []).map(g => 
          g._id === savedGoal._id ? savedGoal : g
        );
      } else {
        updatedGoals = [...(reviewData.goals || []), savedGoal];
      }
      
      setReviewData({
        ...reviewData,
        goals: updatedGoals
      });
      
      // Close modal
      setShowGoalModal(false);
      
    } catch (error) {
      console.error('Error saving goal:', error);
      alert(`An error occurred while saving the goal: ${error.message}`);
    }
  };
  
  const handleDeleteGoal = async (goal) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/goals/${goal._id}`, {
        method: 'DELETE',
        headers: {
          // Changed from 'authToken' to 'token'
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete goal (Status: ${response.status})`);
      }
      
      // Update goals in review data
      const updatedGoals = (reviewData.goals || []).filter(g => g._id !== goal._id);
      
      setReviewData({
        ...reviewData,
        goals: updatedGoals
      });
      
    } catch (error) {
      console.error('Error deleting goal:', error);
      alert(`An error occurred while deleting the goal: ${error.message}`);
    }
  };
  
  // Open monthly check-in modal
  const handleOpenCheckInModal = () => {
    if (!reviewData) return;
    
    // Prepare check-in data from current review and goals
    setCheckInData({
      managerComments: '',
      employeeComments: '',
      date: new Date().toISOString().split('T')[0],
      goals: reviewData.goals || [],
      kpis: (reviewData.kpis || []).map(k => ({
        ...k,
        currentValue: '',
        notes: ''
      }))
    });
    
    setShowCheckInModal(true);
  };
  
  // Handle check-in input change
  const handleCheckInInputChange = (e) => {
    const { name, value } = e.target;
    setCheckInData({
      ...checkInData,
      [name]: value
    });
  };
  
  // Handle KPI value change in check-in
  const handleKpiValueChange = (index, field, value) => {
    const updatedKpis = [...checkInData.kpis];
    updatedKpis[index] = {
      ...updatedKpis[index],
      [field]: value
    };
    
    setCheckInData({
      ...checkInData,
      kpis: updatedKpis
    });
  };
  
  // Handle goal update in check-in
  const handleCheckInGoalUpdate = (index, field, value) => {
    const updatedGoals = [...checkInData.goals];
    updatedGoals[index] = {
      ...updatedGoals[index],
      [field]: field === 'progress' ? parseInt(value) : value
    };
    
    setCheckInData({
      ...checkInData,
      goals: updatedGoals
    });
  };
  
  // Helper functions
  const getStatusBadgeClass = (status) => {
    if (!status) return 'status-badge';
    
    switch (status) {
      case 'Completed': return 'status-badge completed';
      case 'In Progress': return 'status-badge in-progress';
      case 'Not Started': return 'status-badge not-started';
      case 'At Risk': return 'status-badge at-risk';
      default: return 'status-badge';
    }
  };
  
  const getKpiName = (kpiId) => {
    if (!kpiId) return 'Unknown KPI';
    
    const kpi = kpis.find(k => k._id === kpiId);
    return kpi ? kpi.title : 'Unknown KPI';
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'No date set';
    
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Render goal modal
  const renderGoalModal = () => {
    if (!showGoalModal) return null;
    
    return (
      <div className="modal-overlay">
        <div className="modal-content goal-modal">
          <div className="modal-header">
            <h2>{isEditingGoal ? 'Edit Goal' : 'Add New Goal'}</h2>
            <button className="close-button" onClick={() => setShowGoalModal(false)}>
              <FaTimes />
            </button>
          </div>
          
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="goal-title">Goal Title <span className="required">*</span></label>
              <input
                id="goal-title"
                type="text"
                name="title"
                value={goalForm.title}
                onChange={handleGoalInputChange}
                className="form-control"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="goal-description">Description</label>
              <textarea
                id="goal-description"
                name="description"
                value={goalForm.description}
                onChange={handleGoalInputChange}
                className="form-control"
                rows="3"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="goal-target-date">Target Date</label>
                <input
                  id="goal-target-date"
                  type="date"
                  name="targetDate"
                  value={goalForm.targetDate}
                  onChange={handleGoalInputChange}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="goal-linked-kpi">Linked KPI</label>
                <select
                  id="goal-linked-kpi"
                  name="linkedKpi"
                  value={goalForm.linkedKpi}
                  onChange={handleGoalInputChange}
                  className="form-control"
                >
                  <option value="">-- Not linked to a KPI --</option>
                  {kpis.map(kpi => (
                    <option key={kpi._id} value={kpi._id}>
                      {kpi.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="goal-status">Status</label>
                <select
                  id="goal-status"
                  name="status"
                  value={goalForm.status}
                  onChange={handleGoalInputChange}
                  className="form-control"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="At Risk">At Risk</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="goal-progress">
                  Progress: {goalForm.progress}%
                </label>
                <input
                  id="goal-progress"
                  type="range"
                  name="progress"
                  value={goalForm.progress}
                  onChange={handleProgressChange}
                  min="0"
                  max="100"
                  step="5"
                  className="form-control progress-slider"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="goal-notes">Notes</label>
              <textarea
                id="goal-notes"
                name="notes"
                value={goalForm.notes}
                onChange={handleGoalInputChange}
                className="form-control"
                rows="3"
              />
            </div>
          </div>
          
          <div className="modal-footer">
            <button
              type="button"
              className="cancel-button"
              onClick={() => setShowGoalModal(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="save-button"
              onClick={handleSaveGoal}
            >
              {isEditingGoal ? 'Update Goal' : 'Add Goal'}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Render check-in modal
  const renderCheckInModal = () => {
    if (!showCheckInModal) return null;
    
    return (
      <div className="modal-overlay">
        <div className="modal-content checkin-modal">
          <div className="modal-header">
            <h2>Monthly Check-In</h2>
            <button className="close-button" onClick={() => setShowCheckInModal(false)}>
              <FaTimes />
            </button>
          </div>
          
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="checkin-date">Check-In Date</label>
                <input
                  id="checkin-date"
                  type="date"
                  name="date"
                  value={checkInData.date}
                  onChange={handleCheckInInputChange}
                  className="form-control"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="manager-comments">Manager Comments</label>
              <textarea
                id="manager-comments"
                name="managerComments"
                value={checkInData.managerComments}
                onChange={handleCheckInInputChange}
                className="form-control"
                rows="3"
                placeholder="Provide feedback on progress and performance this month..."
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="employee-comments">Employee Comments (Optional)</label>
              <textarea
                id="employee-comments"
                name="employeeComments"
                value={checkInData.employeeComments}
                onChange={handleCheckInInputChange}
                className="form-control"
                rows="3"
                placeholder="Employee can add comments on their progress..."
              />
            </div>
            
            {/* Goals Progress Update */}
            {checkInData.goals && checkInData.goals.length > 0 && (
              <div className="checkin-section">
                <h3>Goal Progress Updates</h3>
                
                <div className="checkin-goals">
                  {checkInData.goals.map((goal, index) => (
                    <div key={goal._id || index} className="checkin-goal-item">
                      <div className="goal-header">
                        <h4>{goal.title}</h4>
                        <span className={getStatusBadgeClass(goal.status)}>
                          {goal.status || 'Not Started'}
                        </span>
                      </div>
                      
                      <div className="goal-progress-update">
                        <label>Current Progress: {goal.progress || 0}%</label>
                        <input
                          type="range"
                          value={goal.progress || 0}
                          onChange={(e) => handleCheckInGoalUpdate(index, 'progress', e.target.value)}
                          min="0"
                          max="100"
                          step="5"
                          className="progress-slider"
                        />
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label>Status:</label>
                          <select
                            value={goal.status || 'Not Started'}
                            onChange={(e) => handleCheckInGoalUpdate(index, 'status', e.target.value)}
                            className="form-control"
                          >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="At Risk">At Risk</option>
                          </select>
                        </div>
                        
                        <div className="form-group">
                          <label>Notes on progress:</label>
                          <input
                            type="text"
                            value={goal.notes || ''}
                            onChange={(e) => handleCheckInGoalUpdate(index, 'notes', e.target.value)}
                            className="form-control"
                            placeholder="Notes on progress..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* KPIs Update */}
            {checkInData.kpis && checkInData.kpis.length > 0 && (
              <div className="checkin-section">
                <h3>KPI Updates</h3>
                
                <div className="checkin-kpis">
                  {checkInData.kpis.map((kpi, index) => (
                    <div key={kpi._id || index} className="checkin-kpi-item">
                      <h4>{kpi.title}</h4>
                      <div className="kpi-target">{kpi.target}</div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label>Current Value:</label>
                          <input
                            type="text"
                            value={kpi.currentValue || ''}
                            onChange={(e) => handleKpiValueChange(index, 'currentValue', e.target.value)}
                            className="form-control"
                            placeholder="Current achievement..."
                          />
                        </div>
                        
                        <div className="form-group">
                          <label>Status:</label>
                          <select
                            value={kpi.status || 'In Progress'}
                            onChange={(e) => handleKpiValueChange(index, 'status', e.target.value)}
                            className="form-control"
                          >
                            <option value="On Track">On Track</option>
                            <option value="At Risk">At Risk</option>
                            <option value="Behind">Behind</option>
                            <option value="Achieved">Achieved</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label>Notes:</label>
                        <input
                          type="text"
                          value={kpi.notes || ''}
                          onChange={(e) => handleKpiValueChange(index, 'notes', e.target.value)}
                          className="form-control"
                          placeholder="Notes on KPI progress..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="modal-footer">
            <button
              type="button"
              className="cancel-button"
              onClick={() => setShowCheckInModal(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="save-button"
              onClick={handleMonthlyCheckIn}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Record Check-In'}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Render previous check-ins
  const renderProgressHistory = () => {
    if (!reviewData || !reviewData.progressSnapshots || reviewData.progressSnapshots.length === 0) {
      return (
        <div className="empty-history">
          <p>No check-ins recorded yet. Use the "Monthly Check-In" button to record progress.</p>
        </div>
      );
    }
    
    // Sort snapshots by date, most recent first
    const sortedSnapshots = [...reviewData.progressSnapshots].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    
    return (
      <div className="progress-history">
        {sortedSnapshots.map((snapshot, index) => (
          <div key={index} className="progress-snapshot">
            <div className="snapshot-header">
              <h4>Check-In: {formatDate(snapshot.date)}</h4>
            </div>
            
            <div className="snapshot-comments">
              <div className="manager-comments">
                <strong>Manager Comments:</strong>
                <p>{snapshot.managerComments || 'No comments provided'}</p>
              </div>
              
              {snapshot.employeeComments && (
                <div className="employee-comments">
                  <strong>Employee Comments:</strong>
                  <p>{snapshot.employeeComments}</p>
                </div>
              )}
            </div>
            
            {snapshot.goals && snapshot.goals.length > 0 && (
              <div className="snapshot-goals">
                <h5>Goals Progress</h5>
                <div className="snapshot-goals-grid">
                  {snapshot.goals.map((goal, idx) => (
                    <div key={idx} className="snapshot-goal">
                      <div className="snapshot-goal-header">
                        <span className="goal-title">{goal.title}</span>
                        <span className={getStatusBadgeClass(goal.status)}>
                          {goal.status}
                        </span>
                      </div>
                      <div className="progress-bar-container">
                        <div 
                          className="progress-bar" 
                          style={{ width: `${goal.progress || 0}%` }}
                        ></div>
                        <span className="progress-text">{goal.progress || 0}%</span>
                      </div>
                      {goal.notes && <div className="goal-notes">{goal.notes}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {snapshot.kpis && snapshot.kpis.length > 0 && (
              <div className="snapshot-kpis">
                <h5>KPI Updates</h5>
                <div className="snapshot-kpis-grid">
                  {snapshot.kpis.map((kpi, idx) => (
                    <div key={idx} className="snapshot-kpi">
                      <div className="snapshot-kpi-header">
                        <span className="kpi-title">{kpi.title}</span>
                        <span className={`kpi-status-badge ${(kpi.status || '').toLowerCase().replace(' ', '-')}`}>
                          {kpi.status || 'Not evaluated'}
                        </span>
                      </div>
                      <div className="kpi-values">
                        <div><strong>Target:</strong> {kpi.target || 'Not specified'}</div>
                        <div><strong>Current:</strong> {kpi.currentValue || 'Not recorded'}</div>
                      </div>
                      {kpi.notes && <div className="kpi-notes">{kpi.notes}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  // Render main component UI
  if (loading) {
    return (
      <SidebarLayout user={user}>
        <div className="loading-container">
          <p>Loading review data...</p>
        </div>
      </SidebarLayout>
    );
  }
  
  if (error) {
    return (
      <SidebarLayout user={user}>
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => navigate('/reviews')}>Back to Reviews</button>
        </div>
      </SidebarLayout>
    );
  }
  
  if (!reviewData) {
    return (
      <SidebarLayout user={user}>
        <div className="error-container">
          <p>Review data not found. It may have been deleted or you don't have permission to view it.</p>
          <button onClick={() => navigate('/reviews')}>Back to Reviews</button>
        </div>
      </SidebarLayout>
    );
  }
  
  return (
    <SidebarLayout user={user}>
      <div className="review-container">
        <div className="review-header">
          <button 
            className="back-button"
            onClick={() => navigate('/reviews')}
          >
            <FaArrowLeft /> Back to Reviews
          </button>
          
          <div className="review-title">
            <h1>
              {reviewData.reviewType || 'Performance'} Review: {reviewData.employee?.firstName || ''} {reviewData.employee?.lastName || ''}
            </h1>
            <div className="review-meta">
              <span className={`status-badge ${(reviewData.status || '').toLowerCase()}`}>
                {reviewData.status || 'Draft'}
              </span>
              <span className="review-period">
                {formatDate(reviewData.reviewPeriod?.start)} - {formatDate(reviewData.reviewPeriod?.end)}
              </span>
              {reviewData.nextCheckInDate && (
                <span className="next-checkin">
                  Next check-in: {formatDate(reviewData.nextCheckInDate)}
                </span>
              )}
            </div>
          </div>
          
          <div className="review-actions">
            {reviewData.status !== 'Completed' && reviewData.status !== 'Acknowledged' && (
              <>
                <button
                  className="save-button"
                  onClick={handleSaveReview}
                  disabled={submitting}
                >
                  <FaSave /> {submitting ? 'Saving...' : 'Save'}
                </button>
                
                <button
                  className="month-checkin-button"
                  onClick={handleOpenCheckInModal}
                  disabled={submitting}
                >
                  <FaCalendarCheck /> Monthly Check-In
                </button>
                
                {reviewData.status === 'Draft' && (
                  <button
                    className="submit-button"
                    onClick={handleSubmitReview}
                    disabled={submitting}
                  >
                    <FaCheck /> Submit Review
                  </button>
                )}
                
                {reviewData.status === 'InProgress' && (
                  <button
                    className="complete-button"
                    onClick={handleCompleteReview}
                    disabled={submitting}
                  >
                    <FaCheck /> Complete Review Cycle
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        
        <div className="review-content">
          <div className="review-tabs">
            <button 
              className={`tab-button ${activeTab === 'questions' ? 'active' : ''}`}
              onClick={() => setActiveTab('questions')}
            >
              Review Questions
            </button>
            <button 
              className={`tab-button ${activeTab === 'goals' ? 'active' : ''}`}
              onClick={() => setActiveTab('goals')}
            >
              Goals Tracking
            </button>
            <button 
              className={`tab-button ${activeTab === 'kpis' ? 'active' : ''}`}
              onClick={() => setActiveTab('kpis')}
            >
              KPIs
            </button>
            <button 
              className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              Check-In History
            </button>
          </div>
          
          {/* Questions Tab */}
          {activeTab === 'questions' && reviewData.sections && (
            <div className="questions-tab">
              {reviewData.sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="review-section">
                  <h2 className="section-title">{section.title}</h2>
                  {section.description && (
                    <p className="section-description">{section.description}</p>
                  )}
                  
                  <div className="section-questions">
                    {section.questions.map((question, questionIndex) => (
                      <div key={questionIndex} className="question-item">
                        <label className="question-text">
                          {question.text}
                          {question.required && <span className="required">*</span>}
                        </label>
                        
                        {question.type === 'text' && (
                          <textarea
                            value={question.response || ''}
                            onChange={(e) => handleInputChange(e, sectionIndex, questionIndex)}
                            className="question-response"
                            rows="3"
                            disabled={reviewData.status === 'Completed' || reviewData.status === 'Acknowledged'}
                          />
                        )}
                        
                        {question.type === 'rating' && (
                          <div className="rating-input">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <label key={rating} className="rating-label">
                                <input
                                  type="radio"
                                  name={`question-${sectionIndex}-${questionIndex}`}
                                  value={rating}
                                  checked={question.response === rating.toString()}
                                  onChange={(e) => handleInputChange(e, sectionIndex, questionIndex)}
                                  disabled={reviewData.status === 'Completed' || reviewData.status === 'Acknowledged'}
                                />
                                {rating}
                              </label>
                            ))}
                          </div>
                        )}
                        
                        {question.type === 'yesno' && (
                          <div className="yesno-input">
                            <label className="yesno-label">
                              <input
                                type="radio"
                                name={`question-${sectionIndex}-${questionIndex}`}
                                value="Yes"
                                checked={question.response === 'Yes'}
                                onChange={(e) => handleInputChange(e, sectionIndex, questionIndex)}
                                disabled={reviewData.status === 'Completed' || reviewData.status === 'Acknowledged'}
                              />
                              Yes
                            </label>
                            <label className="yesno-label">
                              <input
                                type="radio"
                                name={`question-${sectionIndex}-${questionIndex}`}
                                value="No"
                                checked={question.response === 'No'}
                                onChange={(e) => handleInputChange(e, sectionIndex, questionIndex)}
                                disabled={reviewData.status === 'Completed' || reviewData.status === 'Acknowledged'}
                              />
                              No
                            </label>
                          </div>
                        )}
                        
                        {question.type === 'multiple-choice' && question.options && (
                          <select
                            value={question.response || ''}
                            onChange={(e) => handleInputChange(e, sectionIndex, questionIndex)}
                            className="question-response select"
                            disabled={reviewData.status === 'Completed' || reviewData.status === 'Acknowledged'}
                          >
                            <option value="">-- Select an option --</option>
                            {question.options.map((option, optionIndex) => (
                              <option key={optionIndex} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {reviewData.ratings && (
                <div className="review-section ratings-section">
                  <h2 className="section-title">Performance Ratings</h2>
                  
                  <div className="ratings-grid">
                    <div className="rating-item">
                      <label>Overall Performance</label>
                      <div className="rating-input">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <label key={rating} className="rating-label">
                            <input
                              type="radio"
                              name="overallRating"
                              value={rating}
                              checked={reviewData.ratings.overallRating === rating}
                              onChange={(e) => handleRatingChange(e, 'overallRating')}
                              disabled={reviewData.status === 'Completed' || reviewData.status === 'Acknowledged'}
                            />
                            {rating}
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div className="rating-item">
                      <label>Communication</label>
                      <div className="rating-input">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <label key={rating} className="rating-label">
                            <input
                              type="radio"
                              name="communicationRating"
                              value={rating}
                              checked={reviewData.ratings.communicationRating === rating}
                              onChange={(e) => handleRatingChange(e, 'communicationRating')}
                              disabled={reviewData.status === 'Completed' || reviewData.status === 'Acknowledged'}
                            />
                            {rating}
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div className="rating-item">
                      <label>Teamwork</label>
                      <div className="rating-input">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <label key={rating} className="rating-label">
                            <input
                              type="radio"
                              name="teamworkRating"
                              value={rating}
                              checked={reviewData.ratings.teamworkRating === rating}
                              onChange={(e) => handleRatingChange(e, 'teamworkRating')}
                              disabled={reviewData.status === 'Completed' || reviewData.status === 'Acknowledged'}
                            />
                            {rating}
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div className="rating-item">
                      <label>Technical Skills</label>
                      <div className="rating-input">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <label key={rating} className="rating-label">
                            <input
                              type="radio"
                              name="technicalSkillsRating"
                              value={rating}
                              checked={reviewData.ratings.technicalSkillsRating === rating}
                              onChange={(e) => handleRatingChange(e, 'technicalSkillsRating')}
                              disabled={reviewData.status === 'Completed' || reviewData.status === 'Acknowledged'}
                            />
                            {rating}
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div className="rating-item">
                      <label>Leadership</label>
                      <div className="rating-input">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <label key={rating} className="rating-label">
                            <input
                              type="radio"
                              name="leadershipRating"
                              value={rating}
                              checked={reviewData.ratings.leadershipRating === rating}
                              onChange={(e) => handleRatingChange(e, 'leadershipRating')}
                              disabled={reviewData.status === 'Completed' || reviewData.status === 'Acknowledged'}
                            />
                            {rating}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {reviewData.feedback && (
                <div className="review-section feedback-section">
                  <h2 className="section-title">Feedback</h2>
                  
                  <div className="feedback-form">
                    <div className="form-group">
                      <label htmlFor="strengths">Strengths</label>
                      <textarea
                        id="strengths"
                        value={reviewData.feedback.strengths || ''}
                        onChange={(e) => handleFeedbackChange(e, 'strengths')}
                        className="form-control"
                        rows="4"
                        placeholder="Describe the employee's key strengths and accomplishments..."
                        disabled={reviewData.status === 'Completed' || reviewData.status === 'Acknowledged'}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="areasForImprovement">Areas for Improvement</label>
                      <textarea
                        id="areasForImprovement"
                        value={reviewData.feedback.areasForImprovement || ''}
                        onChange={(e) => handleFeedbackChange(e, 'areasForImprovement')}
                        className="form-control"
                        rows="4"
                        placeholder="Describe areas where the employee can improve..."
                        disabled={reviewData.status === 'Completed' || reviewData.status === 'Acknowledged'}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="comments">Additional Comments</label>
                      <textarea
                        id="comments"
                        value={reviewData.feedback.comments || ''}
                        onChange={(e) => handleFeedbackChange(e, 'comments')}
                        className="form-control"
                        rows="4"
                        placeholder="Any additional comments or feedback..."
                        disabled={reviewData.status === 'Completed' || reviewData.status === 'Acknowledged'}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Goals Tab */}
          {activeTab === 'goals' && (
            <div className="goals-tab">
              <div className="goals-header">
                <h2 className="tab-title">Goals</h2>
                
                {reviewData.status !== 'Completed' && reviewData.status !== 'Acknowledged' && (
                  <div className="goals-actions">
                    <button 
                      className="add-goal-button"
                      onClick={handleAddGoal}
                    >
                      <FaPlus /> Add Goal
                    </button>
                    
                    <button 
                      className="advanced-tracking-button"
                      onClick={() => navigate(`/goals/tracking/${reviewId}`)}
                    >
                      <FaChartLine /> Advanced Goal Tracking
                    </button>
                  </div>
                )}
              </div>
              
              {(!reviewData.goals || reviewData.goals.length === 0) ? (
                <div className="empty-goals">
                  <p>No goals have been set for this review period.</p>
                  {reviewData.status !== 'Completed' && reviewData.status !== 'Acknowledged' && (
                    <p>Click "Add Goal" to set goals for this employee.</p>
                  )}
                </div>
              ) : (
                <div className="goals-grid">
                  {reviewData.goals.map(goal => (
                    <div key={goal._id} className="goal-card">
                      <div className="goal-header">
                        <h3 className="goal-title">{goal.title}</h3>
                        <span className={getStatusBadgeClass(goal.status)}>
                          {goal.status || 'Not Started'}
                        </span>
                      </div>
                      
                      <p className="goal-description">{goal.description}</p>
                      
                      <div className="goal-meta">
                        <div className="goal-date">
                          <strong>Target:</strong> {formatDate(goal.targetDate)}
                        </div>
                        {goal.linkedKpi && (
                          <div className="goal-kpi">
                            <strong>KPI:</strong> {typeof goal.linkedKpi === 'object' ? goal.linkedKpi.title : getKpiName(goal.linkedKpi)}
                          </div>
                        )}
                      </div>
                      
                      <div className="goal-progress-container">
                        <div 
                          className="goal-progress-bar" 
                          style={{ 
                            width: `${goal.progress || 0}%`,
                            backgroundColor: 
                              goal.status === 'Completed' ? '#4caf50' : 
                              goal.status === 'At Risk' ? '#ff9800' : 
                              (goal.progress || 0) < 30 ? '#ff5722' : 
                              (goal.progress || 0) < 70 ? '#2196f3' : '#4caf50'
                          }}
                        ></div>
                      </div>
                      <div className="goal-progress-text">{goal.progress || 0}% complete</div>
                      
                      {goal.notes && (
                        <div className="goal-notes">
                          <strong>Notes:</strong> {goal.notes}
                        </div>
                      )}
                      
                      {reviewData.status !== 'Completed' && reviewData.status !== 'Acknowledged' && (
                        <div className="goal-actions">
                          <button 
                            className="edit-button"
                            onClick={() => handleEditGoal(goal)}
                          >
                            <FaEdit /> Edit
                          </button>
                          <button 
                            className="delete-button"
                            onClick={() => handleDeleteGoal(goal)}
                          >
                            <FaTrash /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* KPIs Tab */}
          {activeTab === 'kpis' && (
            <div className="kpis-tab">
              <div className="kpis-header">
                <h2 className="tab-title">Key Performance Indicators</h2>
                
                {reviewData.status !== 'Completed' && reviewData.status !== 'Acknowledged' && (
                  <div className="kpis-actions">
                    <button 
                      className="manage-kpis-button"
                      onClick={() => navigate('/kpis')}
                    >
                      <FaChartLine /> Manage KPIs
                    </button>
                  </div>
                )}
              </div>
              
              {kpis.length === 0 ? (
                <div className="empty-kpis">
                  <p>No KPIs have been defined yet.</p>
                  {reviewData.status !== 'Completed' && reviewData.status !== 'Acknowledged' && (
                    <p>Click "Manage KPIs" to set up KPIs for tracking.</p>
                  )}
                </div>
              ) : (
                <div className="kpis-grid">
                  {kpis.map(kpi => (
                    <div key={kpi._id} className="kpi-card">
                      <h3 className="kpi-title">{kpi.title}</h3>
                      <div className="kpi-category">{kpi.category}</div>
                      <div className="kpi-target">{kpi.target}</div>
                      
                      {kpi.description && (
                        <div className="kpi-description">{kpi.description}</div>
                      )}
                      
                      <div className="kpi-meta">
                        <div>Frequency: {kpi.frequency}</div>
                        {kpi.department && (
                          <div>Department: {typeof kpi.department === 'object' ? kpi.department.name : 'Department'}</div>
                        )}
                      </div>
                      
                      {/* Show latest value if available in progress snapshots */}
                      {reviewData.progressSnapshots && reviewData.progressSnapshots.length > 0 && 
                       reviewData.progressSnapshots[0].kpis && 
                       reviewData.progressSnapshots[0].kpis.find(k => k.kpiId === kpi._id) && (
                        <div className="kpi-current-value">
                          <div className="current-value">
                            <strong>Current Value:</strong> {
                              reviewData.progressSnapshots[0].kpis.find(k => k.kpiId === kpi._id).currentValue || 'Not recorded'
                            }
                          </div>
                          <div className="kpi-status">
                            <strong>Status:</strong> {
                              reviewData.progressSnapshots[0].kpis.find(k => k.kpiId === kpi._id).status || 'Not evaluated'
                            }
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Check-In History Tab */}
          {activeTab === 'history' && (
            <div className="history-tab">
              <div className="history-header">
                <h2 className="tab-title">Monthly Check-In History</h2>
              </div>
              
              {renderProgressHistory()}
            </div>
          )}
        </div>
      </div>
      
      {/* Modals */}
      {renderGoalModal()}
      {renderCheckInModal()}
    </SidebarLayout>
  );
}

export default ViewEvaluation;