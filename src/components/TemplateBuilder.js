import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionEditor from './QuestionEditor';

function TemplateBuilder() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [showSectionEditor, setShowSectionEditor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // API base URL
  const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : 'https://performance-review-backend-ab8z.onrender.com';
  
  // Fetch templates on component mount
  useEffect(() => {
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
    
    fetchTemplates();
  }, []);
  
  // Sample template structure
  const newTemplateStructure = {
    name: '',
    description: '',
    frequency: 'Annual',
    sections: [],
    includesSelfReview: false,
    includes360Review: false,
    includesManagerReview: true,
    includesGoals: false,
    includesKPIs: false,
    status: 'Active'
  };
  
  // Create new template
  const createNewTemplate = () => {
    setCurrentTemplate({
      ...newTemplateStructure
    });
    setShowEditor(true);
  };
  
  // Edit existing template
  const editTemplate = (template) => {
    // Ensure template has sections array
    const formattedTemplate = {
      ...template,
      sections: template.sections || []
    };
    setCurrentTemplate(formattedTemplate);
    setShowEditor(true);
  };
  
  // Save template
  const saveTemplate = async () => {
    try {
      setLoading(true);
      
      // Validate
      if (!currentTemplate.name) {
        alert('Template name is required');
        setLoading(false);
        return;
      }
      
      // Create or update template
      const method = currentTemplate._id ? 'PUT' : 'POST';
      const url = currentTemplate._id 
        ? `${API_BASE_URL}/api/templates/${currentTemplate._id}`
        : `${API_BASE_URL}/api/templates`;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(currentTemplate)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${currentTemplate._id ? 'update' : 'create'} template`);
      }
      
      const savedTemplate = await response.json();
      
      // Update templates list
      if (currentTemplate._id) {
        setTemplates(templates.map(t => t._id === savedTemplate._id ? savedTemplate : t));
      } else {
        setTemplates([...templates, savedTemplate]);
      }
      
      setLoading(false);
      setShowEditor(false);
      
      alert(`Template ${currentTemplate._id ? 'updated' : 'created'} successfully`);
    } catch (err) {
      console.error('Error saving template:', err);
      setError(err.message);
      setLoading(false);
      alert(`Error: ${err.message}`);
    }
  };
  
  // Delete template
  const deleteTemplate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }
    
    try {
      setLoading(true);
      
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
      
      setTemplates(templates.filter(t => t._id !== id));
      setLoading(false);
      
      alert('Template deleted successfully');
    } catch (err) {
      console.error('Error deleting template:', err);
      setError(err.message);
      setLoading(false);
      alert(`Error: ${err.message}`);
    }
  };
  
  // Duplicate template
  const duplicateTemplate = (template) => {
    const duplicated = {
      ...template,
      _id: null,
      name: `${template.name} (Copy)`,
    };
    
    setCurrentTemplate(duplicated);
    setShowEditor(true);
  };
  
  // Add section to template
  const addSection = () => {
    const newSection = {
      title: '',
      description: '',
      weight: 0,
      questions: []
    };
    
    setCurrentSection(newSection);
    setShowSectionEditor(true);
  };
  
  // Edit section
  const editSection = (sectionIndex) => {
    setCurrentSection({
      ...currentTemplate.sections[sectionIndex],
      index: sectionIndex
    });
    setShowSectionEditor(true);
  };
  
  // Delete section
  const deleteSection = (sectionIndex) => {
    if (!window.confirm('Are you sure you want to delete this section?')) {
      return;
    }
    
    const updatedSections = [...currentTemplate.sections];
    updatedSections.splice(sectionIndex, 1);
    
    setCurrentTemplate({
      ...currentTemplate,
      sections: updatedSections
    });
  };
  
  // Save section
  const saveSection = () => {
    const section = { ...currentSection };
    const updatedSections = [...currentTemplate.sections];
    
    if (section.index !== undefined) {
      // Update existing section
      const index = section.index;
      delete section.index;
      updatedSections[index] = section;
    } else {
      // Add new section
      updatedSections.push(section);
    }
    
    setCurrentTemplate({
      ...currentTemplate,
      sections: updatedSections
    });
    
    setShowSectionEditor(false);
  };
  
  // Add question to section
  const addQuestion = () => {
    const newQuestion = {
      text: '',
      type: 'text',
      required: true,
      options: []
    };
    
    setCurrentSection({
      ...currentSection,
      questions: [...currentSection.questions, newQuestion]
    });
  };
  
  // Delete question
  const deleteQuestion = (questionIndex) => {
    const updatedQuestions = [...currentSection.questions];
    updatedQuestions.splice(questionIndex, 1);
    
    setCurrentSection({
      ...currentSection,
      questions: updatedQuestions
    });
  };
  
  // Update question
  const updateQuestion = (questionIndex, field, value) => {
    const updatedQuestions = [...currentSection.questions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      [field]: value
    };
    
    setCurrentSection({
      ...currentSection,
      questions: updatedQuestions
    });
  };
  
  // Generate default sections based on frequency and settings
  const generateDefaultSections = () => {
    let defaultSections = [];
    
    if (currentTemplate.frequency === 'Annual') {
      defaultSections = [
        {
          title: 'Performance Summary',
          description: 'Overall performance evaluation for the year',
          weight: 30,
          questions: [
            {
              text: 'How would you rate the overall performance for the year?',
              type: 'rating',
              required: true,
              options: []
            },
            {
              text: 'What were the major achievements?',
              type: 'text',
              required: true,
              options: []
            }
          ]
        },
        {
          title: 'Skills & Competencies',
          description: 'Evaluation of professional skills and competencies',
          weight: 40,
          questions: [
            {
              text: 'Technical skills evaluation',
              type: 'rating',
              required: true,
              options: []
            },
            {
              text: 'Communication skills',
              type: 'rating',
              required: true,
              options: []
            }
          ]
        },
        {
          title: 'Career Development',
          description: 'Future growth and development plans',
          weight: 30,
          questions: [
            {
              text: 'What are the career goals for the next year?',
              type: 'text',
              required: true,
              options: []
            }
          ]
        }
      ];
    } else if (currentTemplate.frequency === 'Quarterly') {
      defaultSections = [
        {
          title: 'Quarterly Objectives',
          description: 'Progress on quarterly objectives',
          weight: 50,
          questions: [
            {
              text: 'How would you rate progress on objectives for this quarter?',
              type: 'rating',
              required: true,
              options: []
            }
          ]
        },
        {
          title: 'Areas for Improvement',
          description: 'Focus areas for next quarter',
          weight: 50,
          questions: [
            {
              text: 'What areas should be focus of improvement next quarter?',
              type: 'text',
              required: true,
              options: []
            }
          ]
        }
      ];
    } else if (currentTemplate.frequency === 'Monthly') {
      defaultSections = [
        {
          title: 'Monthly Goals',
          description: 'Track progress on monthly goals',
          weight: 70,
          questions: [
            {
              text: 'What goals were set for this month?',
              type: 'text',
              required: true,
              options: []
            },
            {
              text: 'Rate progress toward these goals',
              type: 'rating',
              required: true,
              options: []
            }
          ]
        },
        {
          title: 'Next Month Planning',
          description: 'Goals for the next month',
          weight: 30,
          questions: [
            {
              text: 'What are your main goals for next month?',
              type: 'text',
              required: true,
              options: []
            }
          ]
        }
      ];
    }
    
    // If includes self review, add a self assessment section
    if (currentTemplate.includesSelfReview) {
      defaultSections.push({
        title: 'Self Assessment',
        description: 'Employee self-evaluation',
        weight: 20,
        questions: [
          {
            text: 'How would you rate your own performance?',
            type: 'rating',
            required: true,
            options: []
          },
          {
            text: 'What achievements are you most proud of?',
            type: 'text',
            required: true,
            options: []
          },
          {
            text: 'What areas would you like to improve?',
            type: 'text',
            required: true,
            options: []
          }
        ]
      });
    }
    
    // If includes 360 review, add a peer feedback section
    if (currentTemplate.includes360Review) {
      defaultSections.push({
        title: 'Peer Feedback',
        description: '360° evaluation from colleagues',
        weight: 20,
        questions: [
          {
            text: 'How would you rate this employee\'s teamwork?',
            type: 'rating',
            required: true,
            options: []
          },
          {
            text: 'What strengths have you observed in this employee?',
            type: 'text',
            required: true,
            options: []
          },
          {
            text: 'What areas could this employee improve?',
            type: 'text',
            required: true,
            options: []
          }
        ]
      });
    }
    
    // If includes goal tracking, ensure there's a goals section
    if (currentTemplate.includesGoals) {
      // Check if there's already a goals section
      const hasGoalsSection = defaultSections.some(
        section => section.title.toLowerCase().includes('goal')
      );
      
      if (!hasGoalsSection) {
        defaultSections.push({
          title: 'Goal Tracking',
          description: 'Track progress towards goals and KPIs',
          weight: 30,
          questions: [
            {
              text: 'What are your goals for this period?',
              type: 'text',
              required: true,
              options: []
            },
            {
              text: 'How do these goals align with team/company objectives?',
              type: 'text',
              required: true,
              options: []
            },
            {
              text: 'What metrics will be used to measure success?',
              type: 'text',
              required: true,
              options: []
            }
          ]
        });
      }
    }
    
    // Update template with default sections
    setCurrentTemplate({
      ...currentTemplate,
      sections: defaultSections
    });
  };
  
  // Render section editor
  const renderSectionEditor = () => {
    if (!showSectionEditor) return null;
    
    return (
      <div className="section-editor-overlay">
        <div className="section-editor-content">
          <h3>{currentSection.index !== undefined ? 'Edit Section' : 'Add Section'}</h3>
          
          <div className="form-group">
            <label>Section Title</label>
            <input
              type="text"
              className="form-control"
              value={currentSection.title}
              onChange={(e) => setCurrentSection({...currentSection, title: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-control"
              value={currentSection.description}
              onChange={(e) => setCurrentSection({...currentSection, description: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>Weight (%)</label>
            <input
              type="number"
              className="form-control"
              value={currentSection.weight}
              onChange={(e) => setCurrentSection({...currentSection, weight: Number(e.target.value)})}
              min="0"
              max="100"
            />
          </div>
          
          <h4>Questions</h4>
          
          {currentSection.questions.map((question, index) => (
            <div key={index} className="question-item">
              <div className="question-header">
                <h5>Question {index + 1}</h5>
                <button 
                  onClick={() => deleteQuestion(index)}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
              
              <div className="form-group">
                <label>Question Text</label>
                <input
                  type="text"
                  className="form-control"
                  value={question.text}
                  onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Question Type</label>
                  <select
                    className="form-control"
                    value={question.type}
                    onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                  >
                    <option value="text">Text Response</option>
                    <option value="rating">Rating Scale</option>
                    <option value="yesno">Yes/No</option>
                    <option value="multiple-choice">Multiple Choice</option>
                  </select>
                </div>
                
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={question.required}
                      onChange={(e) => updateQuestion(index, 'required', e.target.checked)}
                    />
                    Required
                  </label>
                </div>
              </div>
              
              {question.type === 'multiple-choice' && (
                <div className="form-group">
                  <label>Options (comma-separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={question.options.join(', ')}
                    onChange={(e) => updateQuestion(index, 'options', e.target.value.split(',').map(opt => opt.trim()))}
                    placeholder="Option 1, Option 2, Option 3"
                  />
                </div>
              )}
            </div>
          ))}
          
          <button onClick={addQuestion} className="add-button">
            Add Question
          </button>
          
          <div className="button-group">
            <button onClick={() => setShowSectionEditor(false)} className="cancel-button">
              Cancel
            </button>
            <button onClick={saveSection} className="save-button">
              Save Section
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="template-builder">
      <div className="template-header">
        <h2>Evaluation Templates</h2>
        <button className="action-button" onClick={createNewTemplate}>Create New Template</button>
      </div>
      
      {loading && <div className="loading-spinner">Loading...</div>}
      {error && <div className="error-message">{error}</div>}
      
      {showEditor ? (
        <div className="template-editor">
          <h3>{currentTemplate._id ? "Edit Template" : "New Template"}</h3>
          
          <div className="form-group">
            <label>Title</label>
            <input 
              type="text" 
              value={currentTemplate.name} 
              onChange={(e) => setCurrentTemplate({...currentTemplate, name: e.target.value})}
              className="form-control"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea 
              value={currentTemplate.description} 
              onChange={(e) => setCurrentTemplate({...currentTemplate, description: e.target.value})}
              className="form-control"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Frequency</label>
              <select
                className="form-control"
                value={currentTemplate.frequency}
                onChange={(e) => setCurrentTemplate({...currentTemplate, frequency: e.target.value})}
              >
                <option value="Annual">Annual</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Status</label>
              <select
                className="form-control"
                value={currentTemplate.status}
                onChange={(e) => setCurrentTemplate({...currentTemplate, status: e.target.value})}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          
          <div className="review-components">
            <h4>Review Components</h4>
            
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={currentTemplate.includesSelfReview}
                  onChange={(e) => setCurrentTemplate({...currentTemplate, includesSelfReview: e.target.checked})}
                />
                Include Self Review
              </label>
            </div>
            
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={currentTemplate.includes360Review}
                  onChange={(e) => setCurrentTemplate({...currentTemplate, includes360Review: e.target.checked})}
                />
                Include 360° Peer Review
              </label>
            </div>
            
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={currentTemplate.includesManagerReview}
                  onChange={(e) => setCurrentTemplate({...currentTemplate, includesManagerReview: e.target.checked})}
                />
                Include Manager Review
              </label>
            </div>
            
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={currentTemplate.includesGoals}
                  onChange={(e) => setCurrentTemplate({...currentTemplate, includesGoals: e.target.checked})}
                />
                Include Goal Setting
              </label>
            </div>
            
            {currentTemplate.includesGoals && (
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={currentTemplate.includesKPIs}
                    onChange={(e) => setCurrentTemplate({...currentTemplate, includesKPIs: e.target.checked})}
                  />
                  Link Goals to KPIs
                </label>
              </div>
            )}
          </div>
          
          <div className="sections-area">
            <div className="sections-header">
              <h4>Sections</h4>
              <button 
                onClick={generateDefaultSections}
                className="generate-button"
              >
                Generate Default Sections
              </button>
            </div>
            
            {currentTemplate.sections && currentTemplate.sections.length > 0 ? (
              <div className="sections-list">
                {currentTemplate.sections.map((section, index) => (
                  <div key={index} className="section-item">
                    <div className="section-header">
                      <h5>{section.title || `Section ${index + 1}`}</h5>
                      <span className="section-weight">Weight: {section.weight}%</span>
                    </div>
                    <p className="section-description">{section.description}</p>
                    <p className="section-questions">{section.questions.length} questions</p>
                    <div className="section-actions">
                      <button onClick={() => editSection(index)} className="edit-button">Edit</button>
                      <button onClick={() => deleteSection(index)} className="delete-button">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-sections">
                <p>No sections added. Add sections to build your template.</p>
              </div>
            )}
            
            <button onClick={addSection} className="add-section-btn">Add Section</button>
          </div>
          
          <div className="template-actions">
            <button onClick={saveTemplate} className="save-button">Save Template</button>
            <button onClick={() => setShowEditor(false)} className="cancel-button">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="templates-list">
          {templates.length > 0 ? (
            templates.map(template => (
              <div key={template._id} className="template-card">
                <div className="template-header">
                  <h3>{template.name}</h3>
                  <span className={`template-status ${template.status === 'Active' ? 'active' : 'inactive'}`}>
                    {template.status}
                  </span>
                </div>
                <p className="template-description">{template.description}</p>
                <div className="template-meta">
                  <span className="template-frequency">{template.frequency}</span>
                  <span className="template-sections">{template.sections?.length || 0} sections</span>
                  <span className="template-date">
                    Created: {new Date(template.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="template-features">
                  {template.includesSelfReview && <span className="template-feature">Self Review</span>}
                  {template.includes360Review && <span className="template-feature">360° Review</span>}
                  {template.includesGoals && <span className="template-feature">Goal Setting</span>}
                  {template.includesKPIs && <span className="template-feature">KPI Tracking</span>}
                </div>
                <div className="template-actions">
                  <button onClick={() => editTemplate(template)} className="edit-button">Edit</button>
                  <button onClick={() => duplicateTemplate(template)} className="duplicate-button">Duplicate</button>
                  <button onClick={() => deleteTemplate(template._id)} className="delete-button">Delete</button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-templates">
              <p>No templates found. Create your first template to get started.</p>
            </div>
          )}
        </div>
      )}
      
      {renderSectionEditor()}
    </div>
  );
}

export default TemplateBuilder;