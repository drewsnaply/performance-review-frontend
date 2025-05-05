// components/Templates.js - COMPLETE REPLACEMENT WITH SPACING FIX
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Templates.css';

function Templates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    // Simulate loading templates from API
    const fetchTemplates = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          const mockTemplates = [
            {
              id: '1',
              name: 'Customer Success',
              description: 'No description',
              frequency: 'Annually',
              sections: 1,
              status: 'inactive',
              reviewTypes: []
            },
            {
              id: '2',
              name: 'Customer Success Monthly',
              description: 'this is designed for CSMs to track monthly goals to help them work towards company KPIs',
              frequency: 'Monthly',
              sections: 3,
              status: 'active',
              reviewTypes: ['Self Review', 'Manager Review']
            },
            {
              id: '3',
              name: 'CS Monthly',
              description: 'No description',
              frequency: 'Monthly',
              sections: 3,
              status: 'active',
              reviewTypes: ['Self Review', 'Manager Review', 'Goal Setting', 'KPI Tracking']
            },
            {
              id: '4',
              name: 'CS Test',
              description: 'No description',
              frequency: 'Monthly',
              sections: 3,
              status: 'active',
              reviewTypes: ['Self Review', 'Manager Review', 'Goal Setting']
            }
          ];
          setTemplates(mockTemplates);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching templates:', error);
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleCreateTemplate = () => {
    setIsCreatingTemplate(true);
  };

  const handleEditTemplate = (template) => {
    setCurrentTemplate(template);
    setIsEditingTemplate(true);
  };

  const handleDeleteTemplate = (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      setTemplates(templates.filter(t => t.id !== templateId));
    }
  };

  const handleSubmit = (templateData) => {
    if (isEditingTemplate) {
      // Update existing template
      setTemplates(templates.map(t => 
        t.id === currentTemplate.id ? { ...t, ...templateData } : t
      ));
      setIsEditingTemplate(false);
    } else {
      // Create new template
      setTemplates([
        ...templates, 
        { 
          id: Date.now().toString(),
          ...templateData,
          status: 'active'
        }
      ]);
      setIsCreatingTemplate(false);
    }
    setCurrentTemplate(null);
  };

  const handleCancel = () => {
    setIsCreatingTemplate(false);
    setIsEditingTemplate(false);
    setCurrentTemplate(null);
  };

  // Render template form or template list
  const renderContent = () => {
    if (isCreatingTemplate || isEditingTemplate) {
      return (
        <div className="template-form-container">
          <h2 className="form-title">
            {isCreatingTemplate ? 'Create Template' : 'Edit Template'}
          </h2>
          <form className="template-form">
            {/* Template form fields would go here */}
            <div className="form-group">
              <label htmlFor="name">Template Name</label>
              <input 
                type="text" 
                id="name" 
                defaultValue={currentTemplate?.name || ''}
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea 
                id="description" 
                defaultValue={currentTemplate?.description || ''}
              />
            </div>
            <div className="form-group">
              <label htmlFor="frequency">Frequency</label>
              <select 
                id="frequency" 
                defaultValue={currentTemplate?.frequency || 'Monthly'}
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Bi-Annually">Bi-Annually</option>
                <option value="Annually">Annually</option>
              </select>
            </div>
            <div className="form-actions">
              <button 
                type="button" 
                className="btn-cancel" 
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-primary" 
                onClick={() => handleSubmit({
                  name: document.getElementById('name').value,
                  description: document.getElementById('description').value,
                  frequency: document.getElementById('frequency').value,
                  sections: currentTemplate?.sections || 1
                })}
              >
                {isCreatingTemplate ? 'Create' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      );
    }

    return (
      <div className="templates-content">
        <div className="templates-header">
          <h1>Review Templates</h1>
          <button 
            className="btn-create" 
            onClick={handleCreateTemplate}
          >
            Create Template
          </button>
        </div>
        <div className="templates-grid">
          {templates.map(template => (
            <div className="template-card" key={template.id}>
              <div className="template-card-header">
                <h3 className="template-card-title">{template.name}</h3>
                <span className={`status-badge ${template.status}`}>
                  {template.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="template-card-body">
                <p className="template-description">
                  {template.description}
                </p>
                <div className="template-details">
                  <p>Frequency: <span>{template.frequency}</span></p>
                  <p>Sections: <span>{template.sections}</span></p>
                </div>
                {template.reviewTypes && template.reviewTypes.length > 0 && (
                  <div className="template-review-types">
                    {template.reviewTypes.map((type, index) => (
                      <span key={index} className="review-type-badge">{type}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="template-card-actions">
                <button 
                  className="btn-edit" 
                  onClick={() => handleEditTemplate(template)}
                >
                  Edit
                </button>
                <button 
                  className="btn-delete" 
                  onClick={() => handleDeleteTemplate(template.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="templates-container">
      {loading ? (
        <div className="loading">Loading templates...</div>
      ) : (
        renderContent()
      )}
    </div>
  );
}

export default Templates;