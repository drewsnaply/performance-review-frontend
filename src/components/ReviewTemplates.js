import React, { useState, useEffect } from 'react';
import { useDepartments } from '../context/DepartmentContext';
import '../styles/ReviewTemplates.css';

function ReviewTemplates() {
  const { employees } = useDepartments();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

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
      // Workflow Configuration
      reviewFrequency: 'Annually',
      approvalFlow: 'Manager → Department Head → HR',
      enableSelfAssessment: true,
      enablePeerReviews: false,
      enableGoalTracking: true,
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
      // Workflow Configuration
      reviewFrequency: 'Semi-Annually',
      approvalFlow: 'Manager → HR',
      enableSelfAssessment: false,
      enablePeerReviews: true,
      enableGoalTracking: true,
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
    setIsEditing(false);
  };

  const handleCreateTemplate = () => {
    const newTemplate = {
      id: templates.length + 1,
      name: 'New Review Template',
      description: 'Custom review template',
      sections: [],
      // Default Workflow Configuration
      reviewFrequency: 'Annually',
      approvalFlow: 'Manager → Department Head → HR',
      enableSelfAssessment: true,
      enablePeerReviews: false,
      enableGoalTracking: false,
      lastUpdated: new Date().toISOString(),
      isActive: true
    };

    setEditingTemplate(newTemplate);
    setIsEditing(true);
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate({...template});
    setIsEditing(true);
  };

  const handleDeleteTemplate = (templateId) => {
    const updatedTemplates = templates.filter(template => template.id !== templateId);
    setTemplates(updatedTemplates);
    localStorage.setItem('reviewTemplates', JSON.stringify(updatedTemplates));
    
    if (selectedTemplate && selectedTemplate.id === templateId) {
      setSelectedTemplate(null);
    }
  };

  const handleTemplateSave = (updatedTemplate) => {
    const isNew = !templates.find(t => t.id === updatedTemplate.id);
    let updatedTemplates;
    
    if (isNew) {
      updatedTemplates = [...templates, updatedTemplate];
    } else {
      updatedTemplates = templates.map(template => 
        template.id === updatedTemplate.id ? updatedTemplate : template
      );
    }
    
    setTemplates(updatedTemplates);
    localStorage.setItem('reviewTemplates', JSON.stringify(updatedTemplates));
    setIsEditing(false);
    setSelectedTemplate(updatedTemplate);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingTemplate(null);
  };

  // Template editor component
  const TemplateEditor = ({ template, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      ...template,
      lastUpdated: new Date().toISOString()
    });
    
    const [newSection, setNewSection] = useState({ title: '', questions: [''] });
    
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value
      });
    };
    
    const handleToggleChange = (field) => {
      setFormData({
        ...formData,
        [field]: !formData[field]
      });
    };
    
    const handleSectionTitleChange = (index, value) => {
      const updatedSections = [...formData.sections];
      updatedSections[index].title = value;
      setFormData({
        ...formData,
        sections: updatedSections
      });
    };
    
    const handleQuestionChange = (sectionIndex, questionIndex, value) => {
      const updatedSections = [...formData.sections];
      updatedSections[sectionIndex].questions[questionIndex] = value;
      setFormData({
        ...formData,
        sections: updatedSections
      });
    };
    
    const handleAddQuestion = (sectionIndex) => {
      const updatedSections = [...formData.sections];
      updatedSections[sectionIndex].questions.push('');
      setFormData({
        ...formData,
        sections: updatedSections
      });
    };
    
    const handleRemoveQuestion = (sectionIndex, questionIndex) => {
      const updatedSections = [...formData.sections];
      updatedSections[sectionIndex].questions.splice(questionIndex, 1);
      setFormData({
        ...formData,
        sections: updatedSections
      });
    };
    
    const handleNewSectionTitleChange = (e) => {
      setNewSection({
        ...newSection,
        title: e.target.value
      });
    };
    
    const handleNewQuestionChange = (index, value) => {
      const updatedQuestions = [...newSection.questions];
      updatedQuestions[index] = value;
      setNewSection({
        ...newSection,
        questions: updatedQuestions
      });
    };
    
    const handleAddNewQuestion = () => {
      setNewSection({
        ...newSection,
        questions: [...newSection.questions, '']
      });
    };
    
    const handleRemoveNewQuestion = (index) => {
      const updatedQuestions = [...newSection.questions];
      updatedQuestions.splice(index, 1);
      setNewSection({
        ...newSection,
        questions: updatedQuestions
      });
    };
    
    const handleAddSection = () => {
      if (newSection.title && newSection.questions.some(q => q.trim() !== '')) {
        const filteredQuestions = newSection.questions.filter(q => q.trim() !== '');
        setFormData({
          ...formData,
          sections: [...formData.sections, {
            title: newSection.title,
            questions: filteredQuestions
          }]
        });
        setNewSection({ title: '', questions: [''] });
      }
    };
    
    const handleRemoveSection = (index) => {
      const updatedSections = [...formData.sections];
      updatedSections.splice(index, 1);
      setFormData({
        ...formData,
        sections: updatedSections
      });
    };
    
    const handleSave = () => {
      onSave(formData);
    };
    
    return (
      <div className="template-editor">
        <h2>{template.id ? 'Edit Template' : 'Create New Template'}</h2>
        
        <div className="editor-section">
          <h3>Template Information</h3>
          <div className="form-group">
            <label htmlFor="name">Template Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="form-textarea"
              rows="3"
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="isActive">Status</label>
            <div className="toggle-group">
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={() => handleToggleChange('isActive')}
                />
                <span className="toggle-slider"></span>
              </label>
              <span>{formData.isActive ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
        </div>
        
        {/* Workflow Configuration */}
        <div className="editor-section">
          <h3>Workflow Configuration</h3>
          
          <div className="form-group">
            <label htmlFor="reviewFrequency">Review Frequency</label>
            <select
              id="reviewFrequency"
              name="reviewFrequency"
              value={formData.reviewFrequency}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="Annually">Annually</option>
              <option value="Semi-Annually">Semi-Annually</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="approvalFlow">Approval Flow</label>
            <select
              id="approvalFlow"
              name="approvalFlow"
              value={formData.approvalFlow}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="Manager → Department Head → HR">Manager → Department Head → HR</option>
              <option value="Manager → HR">Manager → HR</option>
              <option value="Manager Only">Manager Only</option>
              <option value="Custom">Custom</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Self-Assessment</label>
            <div className="toggle-group">
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={formData.enableSelfAssessment}
                  onChange={() => handleToggleChange('enableSelfAssessment')}
                />
                <span className="toggle-slider"></span>
              </label>
              <span>Enable employee self-assessment</span>
            </div>
          </div>
          
          <div className="form-group">
            <label>Peer Reviews</label>
            <div className="toggle-group">
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={formData.enablePeerReviews}
                  onChange={() => handleToggleChange('enablePeerReviews')}
                />
                <span className="toggle-slider"></span>
              </label>
              <span>Enable peer feedback collection</span>
            </div>
          </div>
          
          <div className="form-group">
            <label>Goal Tracking</label>
            <div className="toggle-group">
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={formData.enableGoalTracking}
                  onChange={() => handleToggleChange('enableGoalTracking')}
                />
                <span className="toggle-slider"></span>
              </label>
              <span>Enable OKR/goal integration</span>
            </div>
          </div>
        </div>
        
        {/* Template Sections */}
        <div className="editor-section">
          <h3>Evaluation Sections</h3>
          
          {formData.sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="template-section-editor">
              <div className="section-header">
                <div className="form-group">
                  <label>Section Title</label>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => handleSectionTitleChange(sectionIndex, e.target.value)}
                    className="form-input"
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => handleRemoveSection(sectionIndex)}
                >
                  Remove Section
                </button>
              </div>
              
              <div className="questions-list">
                {section.questions.map((question, questionIndex) => (
                  <div key={questionIndex} className="question-editor">
                    <div className="form-group">
                      <label>Question {questionIndex + 1}</label>
                      <div className="question-input-group">
                        <input
                          type="text"
                          value={question}
                          onChange={(e) => handleQuestionChange(sectionIndex, questionIndex, e.target.value)}
                          className="form-input"
                        />
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleRemoveQuestion(sectionIndex, questionIndex)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => handleAddQuestion(sectionIndex)}
              >
                Add Question
              </button>
            </div>
          ))}
          
          {/* Add New Section */}
          <div className="new-section-editor">
            <h4>Add New Section</h4>
            <div className="form-group">
              <label>Section Title</label>
              <input
                type="text"
                value={newSection.title}
                onChange={handleNewSectionTitleChange}
                className="form-input"
                placeholder="Enter section title"
              />
            </div>
            
            <div className="questions-list">
              {newSection.questions.map((question, index) => (
                <div key={index} className="question-editor">
                  <div className="form-group">
                    <label>Question {index + 1}</label>
                    <div className="question-input-group">
                      <input
                        type="text"
                        value={question}
                        onChange={(e) => handleNewQuestionChange(index, e.target.value)}
                        className="form-input"
                        placeholder="Enter question"
                      />
                      {newSection.questions.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleRemoveNewQuestion(index)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleAddNewQuestion}
              >
                Add Question
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAddSection}
                disabled={!newSection.title || !newSection.questions.some(q => q.trim() !== '')}
              >
                Add Section
              </button>
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
          >
            Save Template
          </button>
        </div>
      </div>
    );
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
      
      {!isEditing ? (
        <>
          <div className="templates-list">
            {templates.map(template => (
              <div 
                key={template.id} 
                className="template-card"
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="template-card-header">
                  <h2>{template.name}</h2>
                  <div className="template-actions">
                    <button 
                      className="btn btn-edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTemplate(template);
                      }}
                    >
                      Edit
                    </button>
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
                </div>
                <p>{template.description}</p>
                <div className="template-meta">
                  <span className="meta-item">
                    <strong>Frequency:</strong> {template.reviewFrequency || 'Not specified'}
                  </span>
                  <span className="meta-item">
                    <strong>Workflow:</strong> {template.approvalFlow || 'Standard'}
                  </span>
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
              
              {/* Workflow Configuration Summary */}
              <div className="template-workflow">
                <h3>Workflow Configuration</h3>
                <div className="workflow-details">
                  <div className="workflow-item">
                    <strong>Review Frequency:</strong> {selectedTemplate.reviewFrequency || 'Not specified'}
                  </div>
                  <div className="workflow-item">
                    <strong>Approval Flow:</strong> {selectedTemplate.approvalFlow || 'Standard'}
                  </div>
                  <div className="workflow-item">
                    <strong>Self-Assessment:</strong> {selectedTemplate.enableSelfAssessment ? 'Enabled' : 'Disabled'}
                  </div>
                  <div className="workflow-item">
                    <strong>Peer Reviews:</strong> {selectedTemplate.enablePeerReviews ? 'Enabled' : 'Disabled'}
                  </div>
                  <div className="workflow-item">
                    <strong>Goal Tracking:</strong> {selectedTemplate.enableGoalTracking ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              </div>
              
              {/* Template Sections */}
              <h3>Evaluation Sections</h3>
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
              
              <div className="template-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setSelectedTemplate(null)}
                >
                  Close Details
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => handleEditTemplate(selectedTemplate)}
                >
                  Edit Template
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <TemplateEditor 
          template={editingTemplate} 
          onSave={handleTemplateSave} 
          onCancel={handleCancelEdit} 
        />
      )}
    </div>
  );
}

export default ReviewTemplates;