import React, { useState, useEffect, Suspense } from 'react';
import { useDepartments } from '../context/DepartmentContext';
import { FaEdit, FaTrash, FaUsers, FaPlusCircle, FaTasks, FaCheck, FaHourglass, FaEye } from 'react-icons/fa';
// Import directly instead of lazy loading
import TemplateFormModal from './TemplateFormModal';
import AssignTemplateModal from './AssignTemplateModal';
import '../styles/ReviewTemplates.css';

function ReviewTemplates() {
  const { employees } = useDepartments();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('templates');
  const [assignments, setAssignments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : 'https://performance-review-backend-ab8z.onrender.com';

  useEffect(() => {
    fetchTemplates();
    fetchAssignments();
  }, []);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
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
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
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
      setAssignments(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  const handleEditTemplate = (template) => {
    setSelectedTemplate(template);
    setIsTemplateModalOpen(true);
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/templates/${templateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete template');
      }

      setTemplates(templates.filter(t => t._id !== templateId));
    } catch (error) {
      console.error('Error deleting template:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleAssignTemplate = (template) => {
    setSelectedTemplate(template);
    setIsAssignModalOpen(true);
  };

  const handleAssignmentSubmit = async (assignmentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/templates/assign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          templateId: selectedTemplate._id,
          ...assignmentData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create assignment');
      }

      const newAssignment = await response.json();
      setAssignments([newAssignment, ...assignments]);
      setIsAssignModalOpen(false);
      setActiveTab('assignments');
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleTemplateSubmit = async (templateData) => {
    try {
      const url = selectedTemplate
        ? `${API_BASE_URL}/api/templates/${selectedTemplate._id}`
        : `${API_BASE_URL}/api/templates`;
      
      const method = selectedTemplate ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save template');
      }

      const savedTemplate = await response.json();
      
      if (selectedTemplate) {
        setTemplates(templates.map(t => 
          t._id === savedTemplate._id ? savedTemplate : t
        ));
      } else {
        setTemplates([savedTemplate, ...templates]);
      }
      
      setIsTemplateModalOpen(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Error saving template:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleUpdateAssignmentStatus = async (assignmentId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/templates/assignments/${assignmentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update assignment status');
      }

      const updatedAssignment = await response.json();
      setAssignments(assignments.map(a => 
        a._id === updatedAssignment._id ? updatedAssignment : a
      ));
    } catch (error) {
      console.error('Error updating assignment status:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/templates/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete assignment');
      }

      setAssignments(assignments.filter(a => a._id !== assignmentId));
    } catch (error) {
      console.error('Error deleting assignment:', error);
      alert(`Error: ${error.message}`);
    }
  };

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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start review');
      }

      const { assignment, review } = await response.json();
      
      // Update the assignment in the list
      setAssignments(assignments.map(a => 
        a._id === assignment._id ? assignment : a
      ));
      
      // Redirect to the review editor
      window.location.href = `/reviews/edit/${review._id}`;
    } catch (error) {
      console.error('Error starting review:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const filteredAssignments = statusFilter === 'All'
    ? assignments
    : assignments.filter(a => a.status === statusFilter);

  const renderTemplatesTab = () => (
    <div className="templates-container">
      <div className="templates-grid">
        {templates.map(template => (
          <div key={template._id} className="template-card">
            <div className="template-header">
              <h3>{template.name}</h3>
              <div className="template-actions">
                <button 
                  className="btn-icon" 
                  onClick={() => handleEditTemplate(template)}
                  title="Edit Template"
                >
                  <FaEdit />
                </button>
                <button 
                  className="btn-icon" 
                  onClick={() => handleDeleteTemplate(template._id)}
                  title="Delete Template"
                >
                  <FaTrash />
                </button>
                <button 
                  className="btn-icon btn-assign" 
                  onClick={() => handleAssignTemplate(template)}
                  title="Assign Template"
                >
                  <FaUsers />
                </button>
              </div>
            </div>
            <div className="template-body">
              <p>{template.description || 'No description provided'}</p>
              <div className="template-meta">
                <div className="meta-item">
                  <span className="meta-label">Frequency:</span> 
                  <span className="meta-value">{template.frequency}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Status:</span> 
                  <span className={`meta-value status-${template.status.toLowerCase()}`}>
                    {template.status}
                  </span>
                </div>
              </div>
              {template.workflow && template.workflow.steps && (
                <div className="workflow-preview">
                  <span className="meta-label">Workflow:</span> 
                  <div className="workflow-steps">
                    {template.workflow.steps
                      .sort((a, b) => a.order - b.order)
                      .map((step, index, steps) => (
                        <React.Fragment key={index}>
                          <span>{step.role}</span>
                          {index < steps.length - 1 && <span className="arrow">→</span>}
                        </React.Fragment>
                      ))}
                  </div>
                </div>
              )}
            </div>
            <button 
              className="btn-assign-large" 
              onClick={() => handleAssignTemplate(template)}
            >
              <FaUsers /> Assign Template
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAssignmentsTab = () => (
    <div className="assignments-container">
      <div className="assignments-filters">
        <div className="filter-group">
          <label>Status:</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="InProgress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Canceled">Canceled</option>
          </select>
        </div>
      </div>
      
      {filteredAssignments.length === 0 ? (
        <div className="no-assignments">
          <p>No assignments found with the selected filters.</p>
          <button 
            className="btn-create" 
            onClick={() => setActiveTab('templates')}
          >
            Go to Templates to Create Assignments
          </button>
        </div>
      ) : (
        <div className="assignments-table-container">
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
                <tr key={assignment._id} className={`status-${assignment.status.toLowerCase()}`}>
                  <td>{assignment.template?.name || 'Unknown Template'}</td>
                  <td>{`${assignment.employee?.firstName} ${assignment.employee?.lastName}`}</td>
                  <td>{`${assignment.reviewer?.firstName} ${assignment.reviewer?.lastName}`}</td>
                  <td>{new Date(assignment.dueDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${assignment.status.toLowerCase()}`}>
                      {assignment.status}
                    </span>
                  </td>
                  <td className="action-buttons">
                    {assignment.status === 'Pending' && (
                      <>
                        <button 
                          className="btn-icon"
                          onClick={() => handleStartReview(assignment._id)}
                          title="Start Review"
                        >
                          <FaTasks />
                        </button>
                        <button 
                          className="btn-icon"
                          onClick={() => handleUpdateAssignmentStatus(assignment._id, 'Canceled')}
                          title="Cancel Assignment"
                        >
                          <FaTrash />
                        </button>
                      </>
                    )}
                    {assignment.status === 'InProgress' && (
                      <>
                        <button 
                          className="btn-icon"
                          onClick={() => window.location.href = `/reviews/edit/${assignment.createdReview}`}
                          title="Continue Review"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="btn-icon"
                          onClick={() => handleUpdateAssignmentStatus(assignment._id, 'Completed')}
                          title="Mark as Completed"
                        >
                          <FaCheck />
                        </button>
                      </>
                    )}
                    {assignment.status === 'Completed' && (
                      <button 
                        className="btn-icon"
                        onClick={() => window.location.href = `/reviews/${assignment.createdReview}`}
                        title="View Review"
                      >
                        <FaEye />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="review-templates-container">
      <div className="page-header">
        <h2>{activeTab === 'templates' ? 'Review Templates' : 'Template Assignments'}</h2>
        <div className="header-actions">
          {activeTab === 'templates' && (
            <button 
              className="btn-create" 
              onClick={() => {
                setSelectedTemplate(null);
                setIsTemplateModalOpen(true);
              }}
            >
              <FaPlusCircle /> Create New Template
            </button>
          )}
          <div className="tab-switcher">
            <button 
              className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
              onClick={() => setActiveTab('templates')}
            >
              Templates
            </button>
            <button 
              className={`tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}
              onClick={() => setActiveTab('assignments')}
            >
              Assignments
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="loading">Loading...</div>
      ) : error ? (
        <div className="error">Error: {error}</div>
      ) : (
        <div className="tab-content">
          {activeTab === 'templates' ? renderTemplatesTab() : renderAssignmentsTab()}
        </div>
      )}

      {isTemplateModalOpen && (
        <TemplateFormModal
          template={selectedTemplate}
          onSubmit={handleTemplateSubmit}
          onClose={() => {
            setIsTemplateModalOpen(false);
            setSelectedTemplate(null);
          }}
        />
      )}

      {isAssignModalOpen && (
        <AssignTemplateModal
          template={selectedTemplate}
          employees={employees}
          onSubmit={handleAssignmentSubmit}
          onClose={() => {
            setIsAssignModalOpen(false);
            setSelectedTemplate(null);
          }}
        />
      )}
    </div>
  );
}

export default ReviewTemplates;