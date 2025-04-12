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

  // Styles to match Dashboard
  const styles = {
    container: {
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    tabs: {
      display: 'flex',
      marginBottom: '20px'
    },
    tab: {
      padding: '8px 16px',
      backgroundColor: 'white',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      color: '#64748b'
    },
    activeTab: {
      backgroundColor: '#f1f5f9',
      fontWeight: 'bold',
      color: '#0369a1'
    },
    heading: {
      margin: '0 0 20px 0',
      fontSize: '1.5rem',
      fontWeight: '500',
      color: '#333'
    },
    newButton: {
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '8px 16px',
      marginBottom: '20px',
      cursor: 'pointer',
      fontWeight: '500'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    th: {
      textAlign: 'left',
      padding: '12px 16px',
      borderBottom: '2px solid #e2e8f0',
      color: '#64748b',
      fontWeight: '500',
      fontSize: '0.9rem'
    },
    td: {
      padding: '16px',
      borderBottom: '1px solid #e2e8f0',
      color: '#1e293b'
    },
    statusBadge: {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '0.85rem',
      fontWeight: '500'
    },
    editButton: {
      backgroundColor: '#3B82F6',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '6px 12px',
      marginRight: '8px',
      cursor: 'pointer',
      fontSize: '0.85rem'
    },
    deleteButton: {
      backgroundColor: '#EF4444',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '6px 12px',
      cursor: 'pointer',
      fontSize: '0.85rem'
    },
    viewButton: {
      backgroundColor: '#3B82F6',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '6px 12px',
      cursor: 'pointer',
      fontSize: '0.85rem'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    },
    modalContent: {
      backgroundColor: 'white',
      padding: '24px',
      borderRadius: '8px',
      width: '500px',
      maxWidth: '90%'
    },
    formGroup: {
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '500',
      color: '#64748b'
    },
    input: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #e2e8f0',
      borderRadius: '4px',
      fontSize: '0.9rem'
    },
    formActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '16px',
      marginTop: '24px'
    },
    cancelButton: {
      backgroundColor: '#f1f5f9',
      color: '#64748b',
      border: 'none',
      borderRadius: '4px',
      padding: '8px 16px',
      cursor: 'pointer',
      fontWeight: '500'
    },
    saveButton: {
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '8px 16px',
      cursor: 'pointer',
      fontWeight: '500'
    },
    filterContainer: {
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    filterLabel: {
      fontWeight: '500',
      color: '#64748b'
    },
    filterSelect: {
      padding: '8px 12px',
      border: '1px solid #e2e8f0',
      borderRadius: '4px',
      backgroundColor: 'white'
    }
  };

  // Get status badge style
  const getStatusBadgeStyle = (status) => {
    let baseStyle = { ...styles.statusBadge };
    
    switch (status?.toLowerCase()) {
      case 'completed':
        return { ...baseStyle, backgroundColor: '#dcfce7', color: '#16a34a' };
      case 'inprogress':
        return { ...baseStyle, backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'active':
        return { ...baseStyle, backgroundColor: '#dcfce7', color: '#16a34a' };
      case 'inactive':
        return { ...baseStyle, backgroundColor: '#fee2e2', color: '#dc2626' };
      default:
        return { ...baseStyle, backgroundColor: '#f1f5f9', color: '#64748b' };
    }
  };

  // Render Templates tab
  const renderTemplatesTab = () => {
    return (
      <div>
        <h2 style={styles.heading}>Review Templates</h2>
        <button 
          style={styles.newButton}
          onClick={() => setShowNewTemplateForm(true)}
        >
          + New Template
        </button>
        
        {loading ? (
          <p>Loading templates...</p>
        ) : error ? (
          <p style={{ color: '#EF4444' }}>{error}</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Template Name</th>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Frequency</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map(template => (
                <tr key={template._id}>
                  <td style={styles.td}>{template.name}</td>
                  <td style={styles.td}>{template.description || 'No description'}</td>
                  <td style={styles.td}>{template.frequency}</td>
                  <td style={styles.td}>
                    <span style={getStatusBadgeStyle(template.active ? 'Active' : 'Inactive')}>
                      {template.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button style={styles.editButton}>
                      Edit
                    </button>
                    <button 
                      style={styles.deleteButton}
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
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <h3 style={{ ...styles.heading, marginBottom: '16px' }}>Create New Template</h3>
              <form onSubmit={handleCreateTemplate}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Name:</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={newTemplate.name} 
                    onChange={handleInputChange} 
                    style={styles.input}
                    required 
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Description:</label>
                  <textarea 
                    name="description" 
                    value={newTemplate.description} 
                    onChange={handleInputChange} 
                    style={{ ...styles.input, height: '100px', resize: 'vertical' }}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Frequency:</label>
                  <select 
                    name="frequency" 
                    value={newTemplate.frequency} 
                    onChange={handleInputChange}
                    style={styles.input}
                  >
                    <option value="Annual">Annual</option>
                    <option value="Semi-Annual">Semi-Annual</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      name="active" 
                      checked={newTemplate.active} 
                      onChange={handleInputChange} 
                      style={{ marginRight: '8px' }}
                    />
                    <span style={{ color: '#64748b' }}>Active</span>
                  </label>
                </div>
                <div style={styles.formActions}>
                  <button 
                    type="button" 
                    style={styles.cancelButton}
                    onClick={() => setShowNewTemplateForm(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    style={styles.saveButton}
                  >
                    Save
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
        <h2 style={styles.heading}>Template Assignments</h2>
        
        <div style={styles.filterContainer}>
          <label style={styles.filterLabel}>Status:</label>
          <select 
            style={styles.filterSelect}
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
          <p style={{ color: '#EF4444' }}>{error}</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Template</th>
                <th style={styles.th}>Employee</th>
                <th style={styles.th}>Reviewer</th>
                <th style={styles.th}>Due Date</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.map(assignment => (
                <tr key={assignment._id}>
                  <td style={styles.td}>{assignment.template?.name || 'Unknown'}</td>
                  <td style={styles.td}>{extractName(assignment.employee)}</td>
                  <td style={styles.td}>{extractName(assignment.reviewer)}</td>
                  <td style={styles.td}>{formatDate(assignment.dueDate)}</td>
                  <td style={styles.td}>
                    <span style={getStatusBadgeStyle(assignment.status)}>
                      {assignment.status || 'Pending'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button 
                      style={styles.viewButton}
                      onClick={() => handleReviewAction(assignment._id, assignment.createdReview)}
                    >
                      {assignment.createdReview ? 'View' : 'Start'}
                    </button>
                    <button style={styles.deleteButton}>
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
    <div style={styles.container}>
      <div style={styles.tabs}>
        <button 
          style={{
            ...styles.tab,
            ...(activeTab === 'templates' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('templates')}
        >
          Templates
        </button>
        <button 
          style={{
            ...styles.tab,
            ...(activeTab === 'assignments' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('assignments')}
        >
          Assignments
        </button>
      </div>
      
      {activeTab === 'templates' ? renderTemplatesTab() : renderAssignmentsTab()}
    </div>
  );
}

export default ReviewTemplates;