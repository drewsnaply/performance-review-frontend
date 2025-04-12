import React from 'react';
import { useNavigate } from 'react-router-dom';

// Your original component with minimal modifications for client-side tracking
class ReviewTemplates extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 'templates',
      templates: [],
      assignments: [],
      loading: true,
      error: null,
      statusFilter: 'All Status',
      showNewTemplateForm: false,
      newTemplate: {
        name: '',
        description: '',
        frequency: 'Annual',
        active: true
      }
    };
    
    // Get completed review ID for client-side tracking
    this.completedReviewId = sessionStorage.getItem('completedReviewId');
    this.navigate = props.navigate;
  }
  
  componentDidMount() {
    this.fetchTemplates();
  }
  
  componentDidUpdate(prevProps, prevState) {
    if (prevState.activeTab !== this.state.activeTab) {
      if (this.state.activeTab === 'templates') {
        this.fetchTemplates();
      } else if (this.state.activeTab === 'assignments') {
        this.fetchAssignments();
      }
    }
  }
  
  // API base URL
  API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : 'https://performance-review-backend-ab8z.onrender.com';
  
  // Set active tab
  setActiveTab = (tab) => {
    this.setState({ activeTab: tab });
  }
  
  // Fetch templates from API
  fetchTemplates = async () => {
    try {
      this.setState({ loading: true });
      const response = await fetch(`${this.API_BASE_URL}/api/templates`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      
      const data = await response.json();
      this.setState({ templates: data, loading: false });
    } catch (error) {
      console.error('Error fetching templates:', error);
      this.setState({ error: 'Failed to fetch templates', loading: false });
    }
  }
  
  // Fetch assignments from API
  fetchAssignments = async () => {
    try {
      this.setState({ loading: true });
      const response = await fetch(`${this.API_BASE_URL}/api/templates/assignments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch assignments');
      }
      
      const data = await response.json();
      
      // Check for completed review and update status
      if (this.completedReviewId) {
        data.forEach(assignment => {
          if (assignment._id === this.completedReviewId || 
              assignment.createdReview === this.completedReviewId) {
            assignment.status = 'Completed';
          }
        });
      }
      
      this.setState({ assignments: data, loading: false });
    } catch (error) {
      console.error('Error fetching assignments:', error);
      this.setState({ error: 'Failed to fetch assignments', loading: false });
    }
  }
  
  // Handle template input change
  handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    this.setState(prevState => ({
      newTemplate: {
        ...prevState.newTemplate,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  }
  
  // Toggle new template form
  toggleNewTemplateForm = (show) => {
    this.setState({ showNewTemplateForm: show });
  }
  
  // Handle creating new template
  handleCreateTemplate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/templates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.state.newTemplate)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create template');
      }
      
      this.fetchTemplates();
      this.setState({ 
        showNewTemplateForm: false,
        newTemplate: {
          name: '',
          description: '',
          frequency: 'Annual',
          active: true
        }
      });
    } catch (error) {
      console.error('Error creating template:', error);
      this.setState({ error: 'Failed to create template' });
    }
  }
  
  // Handle deleting a template
  handleDeleteTemplate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }
    
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/templates/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete template');
      }
      
      this.fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      this.setState({ error: 'Failed to delete template' });
    }
  }
  
  // Handle opening a review
  handleOpenReview = (assignmentId, reviewId) => {
    if (reviewId) {
      this.navigate(`/reviews/edit/${reviewId}`);
    } else {
      this.startReview(assignmentId);
    }
  }
  
  // Start a new review
  startReview = async (assignmentId) => {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/templates/assignments/${assignmentId}/start`, {
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
      this.navigate(`/reviews/edit/${data.review._id}`);
    } catch (error) {
      console.error('Error starting review:', error);
      alert('Failed to start review');
    }
  }
  
  // Handle status filter change
  handleStatusFilterChange = (e) => {
    this.setState({ statusFilter: e.target.value });
  }
  
  // Format date
  formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return 'Invalid Date';
    }
  }
  
  // Extract name
  extractName = (person) => {
    if (!person) return 'Unknown';
    const firstName = person.firstName || '';
    const lastName = person.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'Unknown';
  }
  
  render() {
    const { 
      activeTab, templates, assignments, loading, error, statusFilter, 
      showNewTemplateForm, newTemplate 
    } = this.state;
    
    // Filter assignments based on status
    const filteredAssignments = statusFilter === 'All Status' 
      ? assignments 
      : assignments.filter(assignment => assignment.status === statusFilter);
    
    return (
      <>
        <div>
          <button 
            onClick={() => this.setActiveTab('templates')}
            style={{
              backgroundColor: activeTab === 'templates' ? '#ddd' : 'white',
              border: 'none',
              padding: '8px 16px',
              cursor: 'pointer'
            }}
          >
            Templates
          </button>
          <button 
            onClick={() => this.setActiveTab('assignments')}
            style={{
              backgroundColor: activeTab === 'assignments' ? '#ddd' : 'white',
              border: 'none',
              padding: '8px 16px',
              cursor: 'pointer'
            }}
          >
            Assignments
          </button>
        </div>
        
        {activeTab === 'templates' && (
          <div>
            <h2>Review Templates</h2>
            <button 
              onClick={() => this.toggleNewTemplateForm(true)}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                cursor: 'pointer'
              }}
            >
              + New Template
            </button>
            
            {loading ? (
              <p>Loading templates...</p>
            ) : error ? (
              <p style={{ color: 'red' }}>{error}</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                          onClick={() => alert('Edit feature coming soon')}
                          style={{
                            backgroundColor: '#2196F3',
                            color: 'white',
                            border: 'none',
                            padding: '4px 8px',
                            marginRight: '5px',
                            cursor: 'pointer'
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => this.handleDeleteTemplate(template._id)}
                          style={{
                            backgroundColor: '#F44336',
                            color: 'white',
                            border: 'none',
                            padding: '4px 8px',
                            cursor: 'pointer'
                          }}
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
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <div style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '5px',
                  width: '500px'
                }}>
                  <h3>Create New Template</h3>
                  <form onSubmit={this.handleCreateTemplate}>
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
                      <input 
                        type="text" 
                        name="name" 
                        value={newTemplate.name} 
                        onChange={this.handleInputChange} 
                        style={{ width: '100%', padding: '5px' }}
                        required 
                      />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', marginBottom: '5px' }}>Description:</label>
                      <textarea 
                        name="description" 
                        value={newTemplate.description} 
                        onChange={this.handleInputChange} 
                        style={{ width: '100%', padding: '5px', height: '100px' }}
                      />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', marginBottom: '5px' }}>Frequency:</label>
                      <select 
                        name="frequency" 
                        value={newTemplate.frequency} 
                        onChange={this.handleInputChange}
                        style={{ width: '100%', padding: '5px' }}
                      >
                        <option value="Annual">Annual</option>
                        <option value="Semi-Annual">Semi-Annual</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Monthly">Monthly</option>
                      </select>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input 
                          type="checkbox" 
                          name="active" 
                          checked={newTemplate.active} 
                          onChange={this.handleInputChange} 
                          style={{ marginRight: '5px' }}
                        />
                        Active
                      </label>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      <button 
                        type="button" 
                        onClick={() => this.toggleNewTemplateForm(false)}
                        style={{
                          backgroundColor: '#ccc',
                          border: 'none',
                          padding: '8px 16px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        style={{
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          cursor: 'pointer'
                        }}
                      >
                        Save
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
            
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="status-filter" style={{ marginRight: '10px' }}>Status:</label>
              <select 
                id="status-filter" 
                value={statusFilter} 
                onChange={this.handleStatusFilterChange}
                style={{ padding: '5px' }}
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
              <p style={{ color: 'red' }}>{error}</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                      <td>{this.extractName(assignment.employee)}</td>
                      <td>{this.extractName(assignment.reviewer)}</td>
                      <td>{this.formatDate(assignment.dueDate)}</td>
                      <td>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: 
                            assignment.status === 'Completed' ? '#e8f5e9' :
                            assignment.status === 'InProgress' ? '#e3f2fd' :
                            assignment.status === 'Canceled' ? '#ffebee' : '#fff8e1',
                          color: 
                            assignment.status === 'Completed' ? '#388e3c' :
                            assignment.status === 'InProgress' ? '#1565c0' :
                            assignment.status === 'Canceled' ? '#d32f2f' : '#f57f17',
                        }}>
                          {assignment.status || 'Pending'}
                        </span>
                      </td>
                      <td>
                        <button 
                          onClick={() => this.handleOpenReview(assignment._id, assignment.createdReview)}
                          style={{
                            backgroundColor: '#2196F3',
                            color: 'white',
                            border: 'none',
                            padding: '4px 8px',
                            marginRight: '5px',
                            cursor: 'pointer'
                          }}
                        >
                          {assignment.createdReview ? 'View' : 'Start'}
                        </button>
                        <button 
                          style={{
                            backgroundColor: '#F44336',
                            color: 'white',
                            border: 'none',
                            padding: '4px 8px',
                            cursor: 'pointer'
                          }}
                        >
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
      </>
    );
  }
}

// Wrapper to provide navigate
const ReviewTemplatesWrapper = (props) => {
  const navigate = useNavigate();
  return <ReviewTemplates {...props} navigate={navigate} />;
};

export default ReviewTemplatesWrapper;