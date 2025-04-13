import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ReviewTemplates.css';
import ApiService from '../ApiService';
import { useAuth } from '../context/AuthContext'; // Add this import
import SidebarLayout from '../components/SidebarLayout'; // Add this import

function ReviewTemplates() {
  const [activeTab, setActiveTab] = useState('templates');
  const [templates, setTemplates] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [newAssignment, setNewAssignment] = useState({
    template: '',
    employee: '',
    reviewer: '',
    assignedBy: '',
    dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    reviewPeriod: {
      start: new Date().toISOString().split('T')[0],
      end: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
    }
  });
  const navigate = useNavigate();
  
  // Get user information for SidebarLayout
  const { currentUser } = useAuth();
  
  // Create user object for SidebarLayout
  const user = currentUser ? {
    firstName: currentUser.firstName || currentUser.username || 'User',
    lastName: currentUser.lastName || '',
    role: currentUser.role || 'USER'
  } : null;
  
  // Get completed review ID from session storage for client-side status tracking
  const completedReviewId = sessionStorage.getItem('completedReviewId');

  // Fetch appropriate data when active tab changes
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (activeTab === 'templates') {
          const data = await ApiService.get('/api/templates');
          if (isMounted) {
            setTemplates(Array.isArray(data) ? data : []);
            setError(null);
          }
        } else if (activeTab === 'assignments') {
          const data = await ApiService.get('/api/templates/assignments');
          if (isMounted) {
            // Update assignment status if it matches the completed review ID
            if (completedReviewId && Array.isArray(data)) {
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
              setAssignments(Array.isArray(data) ? data : []);
            }
            setError(null);
          }
        }
      } catch (err) {
        console.error(`Error fetching ${activeTab}:`, err);
        if (isMounted) {
          setError(err.message || `An error occurred while fetching ${activeTab}`);
          // Set empty arrays to ensure the component can render properly
          if (activeTab === 'templates') {
            setTemplates([]);
          } else {
            setAssignments([]);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [activeTab, completedReviewId]);

  // Fetch employees when assignment form is shown
  useEffect(() => {
    if (showAssignmentForm) {
      fetchEmployees();
    }
  }, [showAssignmentForm]);

  // Helper function to retry fetching templates
  const fetchTemplates = () => {
    setActiveTab('templates');
    // Force cache reset to get fresh data
    ApiService.clearCache('/api/templates');
  };

  // Helper function to retry fetching assignments
  const fetchAssignments = () => {
    setActiveTab('assignments');
    // Force cache reset to get fresh data
    ApiService.clearCache('/api/templates/assignments');
  };

  // Fetch employees for the assignment form
  const fetchEmployees = async () => {
    try {
      const data = await ApiService.get('/api/employees');
      setEmployees(data);
    } catch (err) {
      console.error('Error fetching employees:', err);
      alert(`Error fetching employees: ${err.message}`);
    }
  };

  // Delete template
  const handleDeleteTemplate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }
    
    try {
      await ApiService.delete(`/api/templates/${id}`);
      // Clear cache and refresh templates
      ApiService.clearCache('/api/templates');
      fetchTemplates();
    } catch (err) {
      console.error('Error deleting template:', err);
      setError(err.message || 'An error occurred while deleting the template');
      alert(`Error: ${err.message}`);
    }
  };

  // Handle assignment actions
  const handleViewAssignment = (reviewId) => {
    navigate(`/reviews/edit/${reviewId}`);
  };
  
  // Start new review
  const handleStartReview = async (assignmentId) => {
    try {
      const data = await ApiService.post(`/api/templates/assignments/${assignmentId}/start`, {});
      navigate(`/reviews/edit/${data.review._id}`);
    } catch (err) {
      console.error('Error starting review:', err);
      alert(`Failed to start review: ${err.message}`);
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

  // Navigate to template builder
  const handleCreateTemplate = () => {
    navigate('/templates/builder');
  };

  // Handle assignment form input changes
  const handleAssignmentInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('reviewPeriod.')) {
      const field = name.split('.')[1];
      setNewAssignment({
        ...newAssignment,
        reviewPeriod: {
          ...newAssignment.reviewPeriod,
          [field]: value
        }
      });
    } else {
      setNewAssignment({
        ...newAssignment,
        [name]: value
      });
    }
  };

  // Create new assignment
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      console.log('Creating new assignment:', newAssignment);
      
      // Get current user ID for assignedBy field if not specified
      const currentUser = JSON.parse(localStorage.getItem('user')) || {};
      const assignmentData = {
        ...newAssignment,
        assignedBy: newAssignment.assignedBy || currentUser._id,
      };
      
      await ApiService.post('/api/templates/assignments', assignmentData);
      
      // Reset form and fetch updated assignments
      setNewAssignment({
        template: '',
        employee: '',
        reviewer: '',
        assignedBy: '',
        dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
        reviewPeriod: {
          start: new Date().toISOString().split('T')[0],
          end: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
        }
      });
      
      setShowAssignmentForm(false);
      
      // Clear cache and refresh assignments
      ApiService.clearCache('/api/templates/assignments');
      fetchAssignments();
    } catch (err) {
      console.error('Error creating assignment:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
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
    createButton: {
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '12px 20px',
      marginBottom: '20px',
      cursor: 'pointer',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      fontSize: '1rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    emptyState: {
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      padding: '40px',
      textAlign: 'center',
      color: '#6b7280',
      marginTop: '20px'
    },
    emptyStateMessage: {
      fontSize: '1.1rem',
      marginBottom: '20px'
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
    actionsContainer: {
      display: 'flex',
      gap: '8px'
    },
    viewButton: {
      backgroundColor: '#3B82F6',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '6px 16px',
      cursor: 'pointer',
      fontSize: '0.85rem'
    },
    editButton: {
      backgroundColor: '#3B82F6',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '6px 16px',
      cursor: 'pointer',
      fontSize: '0.85rem'
    },
    deleteButton: {
      backgroundColor: '#EF4444',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '6px 16px',
      cursor: 'pointer',
      fontSize: '0.85rem'
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
    },
    templateFeature: {
      display: 'inline-block',
      padding: '2px 6px',
      backgroundColor: '#f3f4f6',
      borderRadius: '4px',
      fontSize: '0.75rem',
      color: '#4b5563',
      marginRight: '6px',
      marginTop: '6px'
    },
    templateCard: {
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px',
      backgroundColor: 'white',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    },
    templateHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px'
    },
    templateTitle: {
      fontSize: '1.2rem',
      fontWeight: '600',
      color: '#111827',
      margin: 0
    },
    templateDescription: {
      color: '#6b7280',
      marginBottom: '16px',
      fontSize: '0.95rem'
    },
    templateMeta: {
      display: 'flex',
      gap: '16px',
      marginBottom: '12px',
      flexWrap: 'wrap'
    },
    templateMetaItem: {
      display: 'flex',
      alignItems: 'center',
      color: '#6b7280',
      fontSize: '0.9rem'
    },
    templateGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '20px'
    },
    errorContainer: {
      padding: '16px',
      backgroundColor: '#fee2e2',
      borderRadius: '8px',
      color: '#b91c1c',
      marginBottom: '20px'
    },
    retryButton: {
      padding: '8px 16px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      marginTop: '12px'
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={styles.heading}>Review Templates</h2>
          <button 
            style={styles.createButton}
            onClick={handleCreateTemplate}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create Template
          </button>
        </div>
        
        {error && (
          <div style={styles.errorContainer}>
            <strong>Error:</strong> {error}
            <div>
              <button 
                style={styles.retryButton}
                onClick={fetchTemplates}
              >
                Retry
              </button>
            </div>
          </div>
        )}
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div className="loading-spinner">Loading templates...</div>
          </div>
        ) : templates.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyStateMessage}>No templates found. Create your first template to get started.</p>
            <button 
              style={styles.createButton}
              onClick={handleCreateTemplate}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Create Template
            </button>
          </div>
        ) : (
          <div style={styles.templateGrid}>
            {templates.map(template => (
              <div key={template._id} style={styles.templateCard}>
                <div style={styles.templateHeader}>
                  <h3 style={styles.templateTitle}>{template.name}</h3>
                  <span style={getStatusBadgeStyle(template.active ? 'Active' : 'Inactive')}>
                    {template.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p style={styles.templateDescription}>{template.description || 'No description'}</p>
                <div style={styles.templateMeta}>
                  <div style={styles.templateMetaItem}>
                    <span style={{ marginRight: '4px' }}>Frequency:</span>
                    <strong>{template.frequency}</strong>
                  </div>
                  <div style={styles.templateMetaItem}>
                    <span style={{ marginRight: '4px' }}>Sections:</span>
                    <strong>{template.sections?.length || 0}</strong>
                  </div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  {template.includesSelfReview && 
                    <span style={styles.templateFeature}>Self Review</span>}
                  {template.includes360Review && 
                    <span style={styles.templateFeature}>360° Review</span>}
                  {template.includesManagerReview && 
                    <span style={styles.templateFeature}>Manager Review</span>}
                  {template.includesGoals && 
                    <span style={styles.templateFeature}>Goal Setting</span>}
                  {template.includesKPIs && 
                    <span style={styles.templateFeature}>KPI Tracking</span>}
                </div>
                <div style={styles.actionsContainer}>
                  <button 
                    style={styles.editButton}
                    onClick={() => navigate(`/templates/builder/${template._id}`)}
                  >
                    Edit
                  </button>
                  <button 
                    style={styles.deleteButton}
                    onClick={() => handleDeleteTemplate(template._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render Assignments tab
  const renderAssignmentsTab = () => {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={styles.heading}>Template Assignments</h2>
          <button 
            style={styles.createButton}
            onClick={() => setShowAssignmentForm(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Assign Template
          </button>
        </div>
        
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
        
        {error && (
          <div style={styles.errorContainer}>
            <strong>Error:</strong> {error}
            <div>
              <button 
                style={styles.retryButton}
                onClick={fetchAssignments}
              >
                Retry
              </button>
            </div>
          </div>
        )}
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div className="loading-spinner">Loading assignments...</div>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyStateMessage}>
              {statusFilter === 'All Status' 
                ? 'No assignments found.' 
                : `No assignments with status "${statusFilter}" found.`}
            </p>
          </div>
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
                    <div style={styles.actionsContainer}>
                      <button 
                        style={styles.viewButton}
                        onClick={() => handleReviewAction(assignment._id, assignment.createdReview)}
                      >
                        {assignment.createdReview ? 'View' : 'Start'}
                      </button>
                      <button style={styles.deleteButton}>
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {showAssignmentForm && (
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <h3 style={{ ...styles.heading, marginBottom: '16px' }}>Assign Template</h3>
              <form onSubmit={handleCreateAssignment}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Template:</label>
                  <select 
                    name="template" 
                    value={newAssignment.template} 
                    onChange={handleAssignmentInputChange} 
                    style={styles.input}
                    required 
                  >
                    <option value="">Select Template</option>
                    {templates.map(template => (
                      <option key={template._id} value={template._id}>
                        {template.name} ({template.frequency})
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Employee:</label>
                  <select 
                    name="employee" 
                    value={newAssignment.employee} 
                    onChange={handleAssignmentInputChange} 
                    style={styles.input}
                    required 
                  >
                    <option value="">Select Employee</option>
                    {employees.map(employee => (
                      <option key={employee._id} value={employee._id}>
                        {employee.firstName} {employee.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Reviewer:</label>
                  <select 
                    name="reviewer" 
                    value={newAssignment.reviewer} 
                    onChange={handleAssignmentInputChange} 
                    style={styles.input}
                    required 
                  >
                    <option value="">Select Reviewer</option>
                    {employees.filter(emp => emp.role === 'manager' || emp.role === 'admin').map(employee => (
                      <option key={employee._id} value={employee._id}>
                        {employee.firstName} {employee.lastName} ({employee.role})
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Due Date:</label>
                  <input 
                    type="date" 
                    name="dueDate" 
                    value={newAssignment.dueDate} 
                    onChange={handleAssignmentInputChange} 
                    style={styles.input}
                    required 
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Review Period Start:</label>
                  <input 
                    type="date" 
                    name="reviewPeriod.start" 
                    value={newAssignment.reviewPeriod.start} 
                    onChange={handleAssignmentInputChange} 
                    style={styles.input}
                    required 
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Review Period End:</label>
                  <input 
                    type="date" 
                    name="reviewPeriod.end" 
                    value={newAssignment.reviewPeriod.end} 
                    onChange={handleAssignmentInputChange} 
                    style={styles.input}
                    required 
                  />
                </div>
                <div style={styles.formActions}>
                  <button 
                    type="button" 
                    style={styles.cancelButton}
                    onClick={() => setShowAssignmentForm(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    style={styles.saveButton}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Assign'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render the content of the ReviewTemplates component
  const renderReviewTemplatesContent = () => {
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
  };

  // Wrap the ReviewTemplates content with SidebarLayout
  return (
    <SidebarLayout user={user} activeView="templates">
      {renderReviewTemplatesContent()}
    </SidebarLayout>
  );
}

export default ReviewTemplates;