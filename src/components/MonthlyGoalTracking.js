import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SidebarLayout from './SidebarLayout';
import { useAuth } from '../context/AuthContext';
import { FaArrowLeft, FaPlus, FaSave, FaCheck, FaExclamationTriangle, FaTrash, FaEdit, FaTimes } from 'react-icons/fa';
import '../styles/MonthlyGoalTracking.css';

function MonthlyGoalTracking() {
  const { reviewId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [goals, setGoals] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [currentGoal, setCurrentGoal] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
  );
  
  // API base URL
  const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : 'https://performance-review-backend-ab8z.onrender.com';
  
  // Form data for goal modal
  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    targetDate: '',
    linkedKpi: '',
    status: 'Not Started',
    progress: 0,
    notes: ''
  });
  
  // Fetch goals and KPIs data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch goals
        const goalsResponse = await fetch(`${API_BASE_URL}/api/goals${reviewId ? `?reviewId=${reviewId}` : ''}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!goalsResponse.ok) {
          // If the goals API endpoint doesn't exist or fails, use localStorage as fallback
          console.warn('Goals API not available, using localStorage');
          const storedGoals = localStorage.getItem('goals');
          if (storedGoals) {
            setGoals(JSON.parse(storedGoals));
          } else {
            // Initialize with sample goals if none exist
            const sampleGoals = [
              {
                id: '1',
                title: 'Complete project documentation',
                description: 'Finalize all documentation for the client project',
                targetDate: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(),
                status: 'In Progress',
                progress: 60,
                linkedKpi: '1',
                notes: 'Need to review section 3 with team'
              },
              {
                id: '2',
                title: 'Improve code review process',
                description: 'Implement new code review guidelines to improve quality',
                targetDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
                status: 'Not Started',
                progress: 0,
                linkedKpi: '2',
                notes: ''
              }
            ];
            setGoals(sampleGoals);
            localStorage.setItem('goals', JSON.stringify(sampleGoals));
          }
        } else {
          // If API call succeeds
          const goalsData = await goalsResponse.json();
          setGoals(goalsData);
        }
        
        // Fetch KPIs
        const kpisResponse = await fetch(`${API_BASE_URL}/api/kpis`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!kpisResponse.ok) {
          // If the KPIs API endpoint doesn't exist or fails, use localStorage as fallback
          console.warn('KPIs API not available, using localStorage');
          const storedKpis = localStorage.getItem('kpis');
          if (storedKpis) {
            setKpis(JSON.parse(storedKpis));
          } else {
            // Initialize with sample KPIs if none exist
            const sampleKpis = [
              {
                id: '1',
                title: 'Customer Satisfaction',
                target: 'Maintain score above 4.5/5',
                category: 'Customer'
              },
              {
                id: '2',
                title: 'Code Quality',
                target: 'Reduce bugs by 20%',
                category: 'Development'
              },
              {
                id: '3',
                title: 'Team Collaboration',
                target: 'Weekly knowledge sharing sessions',
                category: 'Team'
              }
            ];
            setKpis(sampleKpis);
            localStorage.setItem('kpis', JSON.stringify(sampleKpis));
          }
        } else {
          // If API call succeeds
          const kpisData = await kpisResponse.json();
          setKpis(kpisData);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load goals and KPIs');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [reviewId]);
  
  // Handle opening the add goal modal
  const handleAddGoal = () => {
    setIsEditing(false);
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
  
  // Handle opening the edit goal modal
  const handleEditGoal = (goal) => {
    setIsEditing(true);
    setCurrentGoal(goal);
    
    // Format date for the form
    const targetDate = goal.targetDate 
      ? new Date(goal.targetDate).toISOString().split('T')[0]
      : '';
    
    setGoalForm({
      title: goal.title,
      description: goal.description || '',
      targetDate,
      linkedKpi: goal.linkedKpi || '',
      status: goal.status || 'Not Started',
      progress: goal.progress || 0,
      notes: goal.notes || ''
    });
    
    setShowGoalModal(true);
  };
  
  // Handle input change in the goal form
  const handleGoalInputChange = (e) => {
    const { name, value } = e.target;
    setGoalForm({
      ...goalForm,
      [name]: value
    });
  };
  
  // Handle progress input change
  const handleProgressChange = (e) => {
    const value = parseInt(e.target.value);
    setGoalForm({
      ...goalForm,
      progress: value,
      // Update status automatically based on progress
      status: value >= 100 ? 'Completed' : value > 0 ? 'In Progress' : 'Not Started'
    });
  };
  
  // Handle saving a goal
  const handleSaveGoal = async () => {
    try {
      // Validate form
      if (!goalForm.title) {
        alert('Please enter a goal title');
        return;
      }
      
      // Prepare goal data
      const goalData = {
        ...goalForm,
        progress: parseInt(goalForm.progress)
      };
      
      // Try to use the API first
      try {
        const url = isEditing 
          ? `${API_BASE_URL}/api/goals/${currentGoal.id || currentGoal._id}`
          : `${API_BASE_URL}/api/goals`;
        
        const method = isEditing ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...goalData,
            reviewId: reviewId || null
          })
        });
        
        if (!response.ok) {
          throw new Error('API not available, using localStorage');
        }
        
        const savedGoal = await response.json();
        
        // Update goals list
        if (isEditing) {
          setGoals(goals.map(g => 
            (g.id === currentGoal.id || g._id === currentGoal._id) ? savedGoal : g
          ));
        } else {
          setGoals([...goals, savedGoal]);
        }
      } catch (apiError) {
        console.warn('API error, using localStorage:', apiError);
        
        // Fallback to localStorage
        if (isEditing) {
          const updatedGoals = goals.map(g => 
            (g.id === currentGoal.id || g._id === currentGoal._id) 
              ? { ...currentGoal, ...goalData }
              : g
          );
          setGoals(updatedGoals);
          localStorage.setItem('goals', JSON.stringify(updatedGoals));
        } else {
          const newGoal = {
            ...goalData,
            id: Date.now().toString(),
            createdAt: new Date().toISOString()
          };
          const updatedGoals = [...goals, newGoal];
          setGoals(updatedGoals);
          localStorage.setItem('goals', JSON.stringify(updatedGoals));
        }
      }
      
      // Close modal
      setShowGoalModal(false);
    } catch (error) {
      console.error('Error saving goal:', error);
      alert('An error occurred while saving the goal');
    }
  };
  
  // Handle deleting a goal
  const handleDeleteGoal = async (goal) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) {
      return;
    }
    
    try {
      // Try API first
      try {
        const response = await fetch(`${API_BASE_URL}/api/goals/${goal.id || goal._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('API not available, using localStorage');
        }
      } catch (apiError) {
        console.warn('API error, using localStorage:', apiError);
      }
      
      // Update state and localStorage
      const updatedGoals = goals.filter(g => g.id !== goal.id && g._id !== goal._id);
      setGoals(updatedGoals);
      localStorage.setItem('goals', JSON.stringify(updatedGoals));
      
    } catch (error) {
      console.error('Error deleting goal:', error);
      alert('An error occurred while deleting the goal');
    }
  };
  
  // Handle updating goal progress directly
  const handleUpdateGoalProgress = async (goal, newProgress) => {
    try {
      // Calculate new status based on progress
      const newStatus = newProgress >= 100 
        ? 'Completed' 
        : newProgress > 0 
          ? 'In Progress' 
          : 'Not Started';
      
      // Try API first
      try {
        const response = await fetch(`${API_BASE_URL}/api/goals/${goal.id || goal._id}/progress`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            progress: newProgress,
            status: newStatus
          })
        });
        
        if (!response.ok) {
          throw new Error('API not available, using localStorage');
        }
        
        const updatedGoal = await response.json();
        
        // Update goals list
        setGoals(goals.map(g => 
          (g.id === goal.id || g._id === goal._id) ? updatedGoal : g
        ));
      } catch (apiError) {
        console.warn('API error, using localStorage:', apiError);
        
        // Update locally
        const updatedGoals = goals.map(g => 
          (g.id === goal.id || g._id === goal._id) 
            ? { ...g, progress: newProgress, status: newStatus }
            : g
        );
        
        setGoals(updatedGoals);
        localStorage.setItem('goals', JSON.stringify(updatedGoals));
      }
    } catch (error) {
      console.error('Error updating goal progress:', error);
      alert('An error occurred while updating the goal progress');
    }
  };
  
  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Completed': return 'status-badge completed';
      case 'In Progress': return 'status-badge in-progress';
      case 'Not Started': return 'status-badge not-started';
      case 'At Risk': return 'status-badge at-risk';
      default: return 'status-badge';
    }
  };
  
  // Get the name of a KPI by ID
  const getKpiName = (kpiId) => {
    const kpi = kpis.find(k => k.id === kpiId || k._id === kpiId);
    return kpi ? kpi.title : 'Unknown KPI';
  };
  
  // Group goals by status
  const groupedGoals = goals.reduce((acc, goal) => {
    const status = goal.status || 'Not Started';
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(goal);
    return acc;
  }, {});
  
  // Format date for display
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
            <h2>{isEditing ? 'Edit Goal' : 'Add New Goal'}</h2>
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
                    <option key={kpi.id || kpi._id} value={kpi.id || kpi._id}>
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
              {isEditing ? 'Update Goal' : 'Add Goal'}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Render goal card
  const renderGoalCard = (goal) => {
    return (
      <div key={goal.id || goal._id} className="goal-card">
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
              <strong>KPI:</strong> {getKpiName(goal.linkedKpi)}
            </div>
          )}
        </div>
        
        <div className="goal-progress-container">
          <div 
            className="goal-progress-bar" 
            style={{ 
              width: `${goal.progress}%`,
              backgroundColor: 
                goal.status === 'Completed' ? '#4caf50' : 
                goal.status === 'At Risk' ? '#ff9800' : 
                goal.progress < 30 ? '#ff5722' : 
                goal.progress < 70 ? '#2196f3' : '#4caf50'
            }}
          ></div>
        </div>
        <div className="goal-progress-text">{goal.progress}% complete</div>
        
        <div className="goal-progress-update">
          <label>Update Progress:</label>
          <input
            type="range"
            value={goal.progress}
            onChange={(e) => handleUpdateGoalProgress(goal, parseInt(e.target.value))}
            min="0"
            max="100"
            step="5"
            className="progress-slider"
          />
        </div>
        
        {goal.notes && (
          <div className="goal-notes">
            <strong>Notes:</strong> {goal.notes}
          </div>
        )}
        
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
      </div>
    );
  };
  
  return (
    <SidebarLayout user={user}>
      <div className="goal-tracking-container">
        <div className="goal-tracking-header">
          {reviewId && (
            <button 
              className="back-button"
              onClick={() => navigate(`/reviews/edit/${reviewId}`)}
            >
              <FaArrowLeft /> Back to Review
            </button>
          )}
          
          <div>
            <h1 className="page-title">Monthly Goals Tracking</h1>
            <div className="current-month">{currentMonth}</div>
          </div>
          
          <button 
            className="add-goal-button"
            onClick={handleAddGoal}
          >
            <FaPlus /> Add New Goal
          </button>
        </div>
        
        {loading ? (
          <div className="loading-state">Loading goals...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : (
          <div className="goal-tracking-content">
            {/* KPIs Section */}
            {kpis.length > 0 && (
              <div className="kpis-section">
                <h2>Key Performance Indicators</h2>
                <div className="kpis-grid">
                  {kpis.map(kpi => (
                    <div key={kpi.id || kpi._id} className="kpi-card">
                      <h3 className="kpi-title">{kpi.title}</h3>
                      <div className="kpi-target">{kpi.target}</div>
                      <div className="kpi-category">{kpi.category}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Goals Section */}
            <div className="goals-section">
              <h2>Goals</h2>
              
              {goals.length === 0 ? (
                <div className="empty-goals">
                  <p>No goals have been added yet. Click "Add New Goal" to get started.</p>
                </div>
              ) : (
                <>
                  {/* In Progress Goals */}
                  {groupedGoals['In Progress'] && groupedGoals['In Progress'].length > 0 && (
                    <div className="goals-group">
                      <h3>In Progress</h3>
                      <div className="goals-grid">
                        {groupedGoals['In Progress'].map(renderGoalCard)}
                      </div>
                    </div>
                  )}
                  
                  {/* Not Started Goals */}
                  {groupedGoals['Not Started'] && groupedGoals['Not Started'].length > 0 && (
                    <div className="goals-group">
                      <h3>Not Started</h3>
                      <div className="goals-grid">
                        {groupedGoals['Not Started'].map(renderGoalCard)}
                      </div>
                    </div>
                  )}
                  
                  {/* Completed Goals */}
                  {groupedGoals['Completed'] && groupedGoals['Completed'].length > 0 && (
                    <div className="goals-group">
                      <h3>Completed</h3>
                      <div className="goals-grid">
                        {groupedGoals['Completed'].map(renderGoalCard)}
                      </div>
                    </div>
                  )}
                  
                  {/* At Risk Goals */}
                  {groupedGoals['At Risk'] && groupedGoals['At Risk'].length > 0 && (
                    <div className="goals-group">
                      <h3>At Risk</h3>
                      <div className="goals-grid">
                        {groupedGoals['At Risk'].map(renderGoalCard)}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
        
        {renderGoalModal()}
      </div>
    </SidebarLayout>
  );
}

export default MonthlyGoalTracking;