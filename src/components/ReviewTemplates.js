import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ReviewTemplates.css';

function ReviewTemplates() {
  const [activeTab, setActiveTab] = useState('templates');
  const [templates, setTemplates] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewTemplateForm, setShowNewTemplateForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    frequency: 'Annual',
    active: true
  });
  const [formError, setFormError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const navigate = useNavigate();
  
  // Client-side review completion tracking
  const [completedReviewId, setCompletedReviewId] = useState(
    sessionStorage.getItem('completedReviewId')
  );
  const [completedReviewMetadata, setCompletedReviewMetadata] = useState(() => {
    const storedMetadata = sessionStorage.getItem('completedReviewMetadata');
    return storedMetadata ? JSON.parse(storedMetadata) : null;
  });
  
  // API base URL for fetching data
  const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : 'https://performance-review-backend-ab8z.onrender.com';
  
  // Check if we're coming from a completed review
  useEffect(() => {
    const locationState = window.history.state?.state;
    const fromPendingWithCompleted = locationState?.completedReview;
    const reviewMetadata = locationState?.completedReviewMetadata;
    
    if (fromPendingWithCompleted) {
      setCompletedReviewId(fromPendingWithCompleted);
      // Store in session storage to persist across page refreshes
      sessionStorage.setItem('completedReviewId', fromPendingWithCompleted);
      
      if (reviewMetadata) {
        setCompletedReviewMetadata(reviewMetadata);
        sessionStorage.setItem('completedReviewMetadata', JSON.stringify(reviewMetadata));
      }
    }
  }, []);
  
  // Fetch templates and assignments on component mount
  useEffect(() => {
    // Call our fetch functions based on the active tab
    if (activeTab === 'templates') {
      fetchTemplates();
    } else if (activeTab === 'assignments') {
      fetchAssignments();
    }
  }, [activeTab]);
  
  // Function to fetch templates from API
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
      setError('Failed to load templates. Please try again later.');
      setLoading(false);
    }
  };
  
  // Function to fetch assignments from API
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
      let updatedAssignments = [...data];
      
      if (completedReviewId) {
        updatedAssignments = data.map(assignment => {
          if (assignment._id === completedReviewId || 
              assignment.createdReview === completedReviewId) {
            return {
              ...assignment,
              status: 'Completed'
            };
          }
          // Also check if this assignment is referenced in the completed review metadata
          if (completedReviewMetadata && 
              (assignment._id === completedReviewMetadata.assignmentId)) {
            return {
              ...assignment,
              status: 'Completed'
            };
          }
          return assignment;
        });
      }
      
      setAssignments(updatedAssignments);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setError('Failed to load assignments. Please try again later.');
      setLoading(false);
    }
  };
  
  // Handle new template form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewTemplate(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle new template form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic form validation
    if (!newTemplate.name.trim()) {
      setFormError('Template name is required');
      return;
    }
    
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
      
      // Reset form and state
      setNewTemplate({
        name: '',
        description: '',
        frequency: 'Annual',
        active: true
      });
      setShowNewTemplateForm(false);
      setFormError('');
      
      // Refresh templates list
      fetchTemplates();
    } catch (error) {
      console.error('Error creating template:', error);
      setFormError('Failed to create template. Please try again.');
    }
  };
  
  // Handle template deletion
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
      
      // Refresh templates list
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      setError('Failed to delete template. Please try again.');
    }
  };
  
  // Handle opening the review editor
  const handleOpenReview = (assignmentId, reviewId) => {
    if (reviewId) {
      // If review exists, navigate to edit it
      navigate(`/reviews/edit/${reviewId}`);
    } else {
      // Otherwise, start new review
      startNewReview(assignmentId);
    }
  };
  
  // Function to start a new review
  const startNewReview = async (assignmentId) => {
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
      
      // Navigate to new review editor
      navigate(`/reviews/edit/${data.review._id}`);
    } catch (error) {
      console.error('Error starting review:', error);
      alert('Failed to start review. Please try again.');
    }
  };
  
  // Function to handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };
  
  // Filter assignments based on status filter
  const filteredAssignments = statusFilter === 'All Status' 
    ? assignments 
    : assignments.filter(assignment => assignment.status === statusFilter);
  
  // Format date safely
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return 'Invalid Date';
    }
  };
  
  // Extract name from employee or reviewer object
  const extractName = (person) => {
    if (!person) return 'Unknown';
    const firstName = person.firstName || '';
    const lastName = person.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'Unknown';
  };
  
  // Render the templates tab content
  const renderTemplatesTab = () => {
    if (loading) {
      return <div className="loading-message">Loading templates...</div>;
    }
    
    if (error) {
      return <div className="error-message">{error}</div>;
    }
    
    return (
      <div className="templates-container">
        <div className="templates-header">
          <h2>Review Templates</h2>
          <button 
            className="new-template-button"
            onClick={() => setShowNewTemplateForm(true)}
          >
            + New Template
          </button>
        </div>
        
        {showNewTemplateForm && (
          <div className="new-template-form">
            <h3>Create New Template</h3>
            {formError && <div className="form-error">{formError}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Template Name:</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={newTemplate.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description:</label>
                <textarea 
                  id="description" 
                  name="description" 
                  value={newTemplate.description}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="frequency">Frequency:</label>
                <select 
                  id="frequency" 
                  name="frequency" 
                  value={newTemplate.frequency}
                  onChange={handleInputChange}
                >
                  <option value="Annual">Annual</option>
                  <option value="Semi-Annual">Semi-Annual</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Ad Hoc">Ad Hoc</option>
                </select>
              </div>
              
              <div className="form-group checkbox">
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
                <button type="submit" className="save-button">Save Template</button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => {
                    setShowNewTemplateForm(false);
                    setFormError('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        
        {templates.length === 0 ? (
          <div className="empty-state">
            <p>No templates found. Create a new template to get started.</p>
          </div>
        ) : (
          <table className="templates-table">
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
                  <td>
                    <span className={`status-badge ${template.active ? 'active' : 'inactive'}`}>
                      {template.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="template-actions">
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };
  
  // Render the assignments tab content
  const renderAssignmentsTab = () => {
    if (loading) {
      return <div className="loading-message">Loading assignments...</div>;
    }
    
    if (error) {
      return <div className="error-message">{error}</div>;
    }
    
    return (
      <div className="assignments-container">
        <div className="assignments-header">
          <h2>Template Assignments</h2>
          <div className="filter-container">
            <label htmlFor="status-filter">Status:</label>
            <select 
              id="status-filter" 
              value={statusFilter}
              onChange={handleStatusFilterChange}
            >
              <option value="All Status">All Status</option>
              <option value="Pending">Pending</option>
              <option value="InProgress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Canceled">Canceled</option>
            </select>
          </div>
        </div>
        
        {filteredAssignments.length === 0 ? (
          <div className="empty-state">
            <p>No assignments found.</p>
          </div>
        ) : (
          <table className="assignments-table">
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
              {filteredAssignments.map(assignment => (
                <tr key={assignment._id}>
                  <td>{assignment.template?.name || 'Unknown Template'}</td>
                  <td>{extractName(assignment.employee)}</td>
                  <td>{extractName(assignment.reviewer)}</td>
                  <td>{formatDate(assignment.dueDate)}</td>
                  <td>
                    <span className={`status-badge ${assignment.status?.toLowerCase()}`}>
                      {assignment.status || 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div className="assignment-actions">
                      <button 
                        className="review-button"
                        onClick={() => handleOpenReview(assignment._id, assignment.createdReview)}
                      >
                        {assignment.createdReview ? 'View' : 'Start'}
                      </button>
                      <button 
                        className="cancel-action"
                        onClick={() => alert('Cancel feature coming soon')}
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };
  
  return (
    <div className="review-templates-container">
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          Templates
        </button>
        <button 
          className={`tab-button ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          Assignments
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'templates' ? renderTemplatesTab() : renderAssignmentsTab()}
      </div>
    </div>
  );
}

export default ReviewTemplates;