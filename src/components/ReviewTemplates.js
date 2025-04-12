import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const [statusFilter, setStatusFilter] = useState('All Status');
  const navigate = useNavigate();
  
  // Get completed review ID from session storage for client-side status tracking
  const completedReviewId = sessionStorage.getItem('completedReviewId');
  
  // API base URL
  const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : 'https://performance-review-backend-ab8z.onrender.com';

  // Fetch appropriate data when active tab changes
  useEffect(() => {
    if (activeTab === 'templates') {
      fetchTemplates();
    } else if (activeTab === 'assignments') {
      fetchAssignments();
    }
  }, [activeTab]);

  // Fetch templates
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
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Fetch assignments
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
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError(err.message);
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

  // Create new template
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
    } catch (err) {
      console.error('Error creating template:', err);
      setError(err.message);
    }
  };

  // Delete template
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
    } catch (err) {
      console.error('Error deleting template:', err);
      setError(err.message);
    }
  };

  // Handle assignment actions
  const handleViewAssignment = (reviewId) => {
    navigate(`/reviews/edit/${reviewId}`);
  };
  
  // Start new review
  const handleStartReview = async (assignmentId) => {
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
    } catch (err) {
      console.error('Error starting review:', err);
      alert('Failed to start review');
    }
  };

  // Handle review action (view or start)
  const handleReviewAction = (assignmentId, reviewId) => {
    if (reviewId) {
      handleViewAssignment(reviewId);
    } else {
      handleStartReview(assignmentId);
    }
  };

  // Extract person name
  const extractName = (person) => {
    if (!person) return 'Unknown';
    const firstName = person.firstName || '';
    const lastName = person.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'Unknown';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Filter assignments based on status
  const filteredAssignments = statusFilter === 'All Status' 
    ? assignments 
    : assignments.filter(assignment => assignment.status === statusFilter);

  // Render Templates tab
  const renderTemplatesTab = () => {
    return (
      <div>
        <h2>Review Templates</h2>
        <button className="btn btn-primary" onClick={() => setShowNewTemplateForm(true)}>
          + New Template
        </button>
        
        {loading ? (
          <p>Loading templates...</p>
        ) : error ? (
          <p className="error">{error}</p>
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
                    <button className="btn btn-primary">Edit</button>
                    <button 
                      className="btn btn-danger"
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
    );
  };

  // Render Assignments tab
  const renderAssignmentsTab = () => {
    return (
      <div>
        <h2>Template Assignments</h2>
        
        <div className="filter-container">
          <label>Status:</label>
          <select 
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
          <p className="error">{error}</p>
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
              {filteredAssignments.map(assignment => (
                <tr key={assignment._id}>
                  <td>{assignment.template?.name || 'Unknown'}</td>
                  <td>{extractName(assignment.employee)}</td>
                  <td>{extractName(assignment.reviewer)}</td>
                  <td>{formatDate(assignment.dueDate)}</td>
                  <td>
                    <span className={`status-badge ${assignment.status?.toLowerCase() || 'pending'}`}>
                      {assignment.status || 'Pending'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleReviewAction(assignment._id, assignment.createdReview)}
                    >
                      {assignment.createdReview ? 'View' : 'Start'}
                    </button>
                    <button className="btn btn-danger">
                      Cancel
                    </button>
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
    <div>
      <div>
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
      
      <div>
        {activeTab === 'templates' ? renderTemplatesTab() : renderAssignmentsTab()}
      </div>
    </div>
  );
}

export default ReviewTemplates;