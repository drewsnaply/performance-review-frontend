import React, { useState, useEffect } from 'react';
import { useDepartments } from '../context/DepartmentContext';

function ReviewTemplates() {
  const { employees } = useDepartments();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Sample template data (you can replace this with actual data from your backend or context)
  const initialTemplates = [
    {
      id: 1,
      name: 'Standard Performance Review',
      description: 'Default template for annual performance reviews',
      sections: [
        {
          title: 'Job Performance',
          questions: [
            'How well does the employee meet job responsibilities?',
            'What are the employee\'s key strengths?',
            'Are there areas where the employee can improve?'
          ]
        },
        {
          title: 'Professional Development',
          questions: [
            'What training or development opportunities would benefit the employee?',
            'What are the employee\'s career goals?',
            'How can the organization support these goals?'
          ]
        }
      ],
      lastUpdated: new Date().toISOString(),
      isActive: true
    },
    {
      id: 2,
      name: 'Manager Evaluation',
      description: 'Template for evaluating management performance',
      sections: [
        {
          title: 'Leadership Skills',
          questions: [
            'How effectively does the manager lead their team?',
            'What is the manager\'s approach to team motivation?',
            'How well does the manager communicate?'
          ]
        },
        {
          title: 'Strategic Thinking',
          questions: [
            'How does the manager contribute to company strategy?',
            'What innovative approaches has the manager implemented?',
            'How well does the manager adapt to changing business needs?'
          ]
        }
      ],
      lastUpdated: new Date().toISOString(),
      isActive: true
    }
  ];

  useEffect(() => {
    // Load templates from localStorage or use initial templates
    const storedTemplates = localStorage.getItem('reviewTemplates');
    
    if (storedTemplates) {
      try {
        const parsedTemplates = JSON.parse(storedTemplates);
        setTemplates(parsedTemplates);
      } catch (error) {
        console.error('Error parsing templates:', error);
        setTemplates(initialTemplates);
        localStorage.setItem('reviewTemplates', JSON.stringify(initialTemplates));
      }
    } else {
      setTemplates(initialTemplates);
      localStorage.setItem('reviewTemplates', JSON.stringify(initialTemplates));
    }
  }, []);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
  };

  const handleCreateTemplate = () => {
    const newTemplate = {
      id: templates.length + 1,
      name: 'New Review Template',
      description: 'Custom review template',
      sections: [],
      lastUpdated: new Date().toISOString(),
      isActive: true
    };

    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    localStorage.setItem('reviewTemplates', JSON.stringify(updatedTemplates));
    setSelectedTemplate(newTemplate);
  };

  const handleDeleteTemplate = (templateId) => {
    const updatedTemplates = templates.filter(template => template.id !== templateId);
    setTemplates(updatedTemplates);
    localStorage.setItem('reviewTemplates', JSON.stringify(updatedTemplates));
    
    if (selectedTemplate && selectedTemplate.id === templateId) {
      setSelectedTemplate(null);
    }
  };

  return (
    <div className="review-templates-container">
      <div className="page-header">
        <h1 className="page-title">Review Templates</h1>
        <button 
          className="btn btn-primary"
          onClick={handleCreateTemplate}
        >
          Create New Template
        </button>
      </div>
      
      <div className="templates-list">
        {templates.map(template => (
          <div 
            key={template.id} 
            className="template-card"
            onClick={() => handleTemplateSelect(template)}
          >
            <div className="template-card-header">
              <h2>{template.name}</h2>
              <button 
                className="btn btn-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteTemplate(template.id);
                }}
              >
                Delete
              </button>
            </div>
            <p>{template.description}</p>
            <div className="template-meta">
              <span>Last Updated: {new Date(template.lastUpdated).toLocaleDateString()}</span>
              <span 
                className={`status-badge ${template.isActive ? 'active' : 'inactive'}`}
              >
                {template.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {selectedTemplate && (
        <div className="template-details">
          <h2>{selectedTemplate.name} - Details</h2>
          {selectedTemplate.sections.length > 0 ? (
            selectedTemplate.sections.map((section, index) => (
              <div key={index} className="template-section">
                <h3>{section.title}</h3>
                <ul>
                  {section.questions.map((question, qIndex) => (
                    <li key={qIndex}>{question}</li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <p>No sections defined for this template.</p>
          )}
          <button 
            className="action-button"
            onClick={() => setSelectedTemplate(null)}
          >
            Close Details
          </button>
        </div>
      )}
    </div>
  );
}

export default ReviewTemplates;