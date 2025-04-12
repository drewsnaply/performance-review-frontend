import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/ReviewTemplates.css';

function ReviewTemplates() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('templates');
  const [templates, setTemplates] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [showNewTemplateForm, setShowNewTemplateForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    frequency: 'Annual',
    active: true
  });
  
  // Get completed review ID from session storage
  const completedReviewId = sessionStorage.getItem('completedReviewId');
  
  // API base URL
  const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : 'https://performance-review-backend-ab8z.onrender.com';
  
  // Fetch templates and assignments
  useEffect(() => {
    if (activeTab === 'templates') {
      fetchTemplates();
    } else if (activeTab === 'assignments') {
      fetchAssignments();
    }
  }, [activeTab]);
  
  // Fetch templates from API
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/templates`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      
      const data = await response.json();
      setTemplates(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setError('Failed to fetch templates');
      setLoading(false);
    }
  };
  
  // Fetch assignments from API
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/templates/assignments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch assignments');
      }
      
      const data = await response.json();
      
      // Update assignment status if it matches the completed review ID
      if (completedReviewId) {
        const updatedAssignments = data.map(assignment => {
          if (assignment._id === completedReviewId || 
              assignment.createdReview === completedReviewId) {
            return {
              ...assignment,
              status: 'Completed'
            };
          }
          return assignment;
        });
        setAssignments(updatedAssignments);
      } else {
        setAssignments(data);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setError('Failed to fetch assignments');
      setLoading(false);
    }
  };
  
  // Handle template input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewTemplate(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle creating new template
  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/templates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTemplate)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create template');
      }
      
      fetchTemplates();
      setShowNewTemplateForm(false);
      setNewTemplate({
        name: '',
        description: '',
        frequency: 'Annual',
        active: true
      });
    } catch (error) {
      console.error('Error creating template:', error);
      setError('Failed to create template');
    }
  };
  
  // Handle deleting a template
  const handleDeleteTemplate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/templates/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete template');
      }
      
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      setError('Failed to delete template');
    }
  };
  
  // Handle opening a review
  const handleOpenReview = (assignmentId, reviewId) => {
    if (reviewId) {
      navigate(`/reviews/edit/${reviewId}`);
    } else {
      startReview(assignmentId);
    }
  };
  
  // Start a new review
  const startReview = async (assignmentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/templates/assignments/${assignmentId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to start review');
      }
      
      const data = await response.json();
      navigate(`/reviews/edit/${data.review._id}`);
    } catch (error) {
      console.error('Error starting review:', error);
      alert('Failed to start review');
    }
  };
  
  return (
    <div>
      <div className="tabs">
        <button 
          className={activeTab === 'templates' ? 'active' : ''} 
          onClick={() => setActiveTab('templates')}
        >
          Templates
        </button>
        <button 
          className={activeTab === 'assignments' ? 'active' : ''} 
          onClick={() => setActiveTab('assignments')}
        >
          Assignments
        </button>
      </div>
      
      {activeTab === 'templates' && (
        <div>
          <h2>Review Templates</h2>
          <button 
            className="new-template-button" 
            onClick={() => setShowNewTemplateForm(true)}
          >
            + New Template
          </button>
          
          {loading ? (
            <p>Loading templates...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Template Name</th>
                  <th>Description</th>
                  <th>Frequency</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.map(template => (
                  <tr key={template._id}>
                    <td>{template.name}</td>
                    <td>{template.description || 'No description'}</td>
                    <td>{template.frequency}</td>
                    <td>{template.active ? 'Active' : 'Inactive'}</td>
                    <td>
                      <button 
                        className="edit-button"
                        onClick={() => alert('Edit feature coming soon')}
                      >
                        Edit
                      </button>
                      <button 
                        className="delete-button"
                        onClick={() => handleDeleteTemplate(template._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {showNewTemplateForm && (
            <div className="modal">
              <div className="modal-content">
                <h3>Create New Template</h3>
                <form onSubmit={handleCreateTemplate}>
                  <div className="form-group">
                    <label>Name:</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={newTemplate.name} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Description:</label>
                    <textarea 
                      name="description" 
                      value={newTemplate.description} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Frequency:</label>
                    <select 
                      name="frequency" 
                      value={newTemplate.frequency} 
                      onChange={handleInputChange}
                    >
                      <option value="Annual">Annual</option>
                      <option value="Semi-Annual">Semi-Annual</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>
                      <input 
                        type="checkbox" 
                        name="active" 
                        checked={newTemplate.active} 
                        onChange={handleInputChange} 
                      />
                      Active
                    </label>
                  </div>
                  <div className="form-actions">
                    <button type="submit">Save</button>
                    <button 
                      type="button" 
                      onClick={() => setShowNewTemplateForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'assignments' && (
        <div>
          <h2>Template Assignments</h2>
          
          <div className="filter-container">
            <label htmlFor="status-filter">Status:</label>
            <select 
              id="status-filter" 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All Status">All Status</option>
              <option value="Pending">Pending</option>
              <option value="InProgress">InProgress</option>
              <option value="Completed">Completed</option>
              <option value="Canceled">Canceled</option>
            </select>
          </div>
          
          {loading ? (
            <p>Loading assignments...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Template</th>
                  <th>Employee</th>
                  <th>Reviewer</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments
                  .filter(assignment => 
                    statusFilter === 'All Status' || assignment.status === statusFilter
                  )
                  .map(assignment => (
                    <tr key={assignment._id}>
                      <td>{assignment.template?.name || 'Unknown'}</td>
                      <td>
                        {assignment.employee?.firstName || ''} {assignment.employee?.lastName || ''}
                      </td>
                      <td>
                        {assignment.reviewer?.firstName || ''} {assignment.reviewer?.lastName || ''}
                      </td>
                      <td>
                        {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td>
                        <span className={`status ${assignment.status?.toLowerCase() || 'pending'}`}>
                          {assignment.status || 'Pending'}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="edit-button"
                          onClick={() => handleOpenReview(assignment._id, assignment.createdReview)}
                        >
                          {assignment.createdReview ? 'View' : 'Start'}
                        </button>
                        <button className="delete-button">
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default ReviewTemplates;