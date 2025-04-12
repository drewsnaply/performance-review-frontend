import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/TemplateBuilder.css';

function TemplateBuilder() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [templates, setTemplates] = useState([]);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [currentSection, setCurrentSection] = useState(null);
  const [showSectionEditor, setShowSectionEditor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  
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
        
        // If editing existing template
        if (id) {
          const template = data.find(t => t._id === id);
          if (template) {
            const formattedTemplate = {
              ...template,
              sections: template.sections || []
            };
            setCurrentTemplate(formattedTemplate);
          } else {
            throw new Error('Template not found');
          }
        } else {
          // Create a new template with default values
          setCurrentTemplate({
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
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching templates:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchTemplates();
  }, [id]);
  
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
      alert(`Template ${currentTemplate._id ? 'updated' : 'created'} successfully`);
      navigate('/templates');
      
    } catch (err) {
      console.error('Error saving template:', err);
      setError(err.message);
      setLoading(false);
      alert(`Error: ${err.message}`);
    }
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
    // Validate section
    if (!currentSection.title) {
      alert('Section title is required');
      return;
    }
    
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
    
    // Normalize weights to ensure they sum to 100%
    const totalWeight = defaultSections.reduce((sum, section) => sum + section.weight, 0);
    if (totalWeight !== 100 && defaultSections.length > 0) {
      // Adjust weights proportionally
      defaultSections = defaultSections.map(section => ({
        ...section,
        weight: Math.round((section.weight / totalWeight) * 100)
      }));
      
      // Handle any rounding errors by adjusting the last section
      const newTotalWeight = defaultSections.reduce((sum, section) => sum + section.weight, 0);
      if (newTotalWeight !== 100 && defaultSections.length > 0) {
        const diff = 100 - newTotalWeight;
        defaultSections[defaultSections.length - 1].weight += diff;
      }
    }
    
    // Update template with default sections
    setCurrentTemplate({
      ...currentTemplate,
      sections: defaultSections
    });
  };
  
  // Calculate total weight of all sections
  const calculateTotalWeight = () => {
    if (!currentTemplate || !currentTemplate.sections) return 0;
    return currentTemplate.sections.reduce((sum, section) => sum + (section.weight || 0), 0);
  };
  
  // Render section editor
  const renderSectionEditor = () => {
    if (!showSectionEditor) return null;
    
    return (
      <div className="section-editor-overlay">
        <div className="section-editor-content">
          <h3>{currentSection.index !== undefined ? 'Edit Section' : 'Add Section'}</h3>
          
          <div className="form-group">
            <label>Section Title <span className="required">*</span></label>
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
              placeholder="Provide a brief description of this section"
            />
          </div>
          
          <div className="form-group">
            <label>Weight (%) <span className="required">*</span></label>
            <div className="weight-input-container">
              <input
                type="number"
                className="form-control"
                value={currentSection.weight}
                onChange={(e) => setCurrentSection({...currentSection, weight: Number(e.target.value)})}
                min="0"
                max="100"
              />
              <div className="weight-info">
                <small>The combined weight of all sections should equal 100%</small>
              </div>
            </div>
          </div>
          
          <div className="questions-container">
            <div className="questions-header">
              <h4>Questions</h4>
              <button onClick={addQuestion} className="add-question-button">
                <span className="button-icon">+</span> Add Question
              </button>
            </div>
            
            {currentSection.questions.length === 0 ? (
              <div className="no-questions">
                <p>No questions added yet. Add questions to build your section.</p>
              </div>
            ) : (
              <div className="questions-list">
                {currentSection.questions.map((question, index) => (
                  <div key={index} className="question-item">
                    <div className="question-header">
                      <h5>Question {index + 1}</h5>
                      <button 
                        onClick={() => deleteQuestion(index)}
                        className="delete-button"
                        title="Delete Question"
                      >
                        <span className="button-icon">×</span>
                      </button>
                    </div>
                    
                    <div className="form-group">
                      <label>Question Text <span className="required">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        value={question.text}
                        onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                        placeholder="Enter question text"
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
                        <small>Enter multiple options separated by commas</small>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
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
  
  // Step navigation
  const goToNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Step 1: Template Details
  const renderStep1 = () => {
    return (
      <div className="step-content">
        <div className="form-group">
          <label>Template Name <span className="required">*</span></label>
          <input 
            type="text" 
            value={currentTemplate.name} 
            onChange={(e) => setCurrentTemplate({...currentTemplate, name: e.target.value})}
            className="form-control"
            placeholder="e.g. Annual Performance Review"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <textarea 
            value={currentTemplate.description} 
            onChange={(e) => setCurrentTemplate({...currentTemplate, description: e.target.value})}
            className="form-control"
            placeholder="Provide a brief description of this template"
            rows="3"
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Frequency <span className="required">*</span></label>
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
        
        <div className="step-actions">
          <button onClick={() => navigate('/templates')} className="cancel-button">
            Cancel
          </button>
          <button 
            onClick={goToNextStep} 
            className="next-button"
            disabled={!currentTemplate.name}
          >
            Next: Review Components
          </button>
        </div>
      </div>
    );
  };
  
  // Step 2: Review Components
  const renderStep2 = () => {
    return (
      <div className="step-content">
        <div className="review-components-container">
          <p className="step-description">
            Select which components to include in your review template. 
            These components will determine the structure and capabilities of your reviews.
          </p>
          
          <div className="component-grid">
            <div className={`component-card ${currentTemplate.includesManagerReview ? 'selected' : ''}`}>
              <div className="component-header">
                <h4>Manager Review</h4>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={currentTemplate.includesManagerReview}
                    onChange={(e) => setCurrentTemplate({...currentTemplate, includesManagerReview: e.target.checked})}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <p>Standard manager evaluation of employee performance.</p>
            </div>
            
            <div className={`component-card ${currentTemplate.includesSelfReview ? 'selected' : ''}`}>
              <div className="component-header">
                <h4>Self Review</h4>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={currentTemplate.includesSelfReview}
                    onChange={(e) => setCurrentTemplate({...currentTemplate, includesSelfReview: e.target.checked})}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <p>Allows employees to evaluate their own performance.</p>
            </div>
            
            <div className={`component-card ${currentTemplate.includes360Review ? 'selected' : ''}`}>
              <div className="component-header">
                <h4>360° Peer Review</h4>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={currentTemplate.includes360Review}
                    onChange={(e) => setCurrentTemplate({...currentTemplate, includes360Review: e.target.checked})}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <p>Collect feedback from colleagues and team members.</p>
            </div>
            
            <div className={`component-card ${currentTemplate.includesGoals ? 'selected' : ''}`}>
              <div className="component-header">
                <h4>Goal Setting</h4>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={currentTemplate.includesGoals}
                    onChange={(e) => setCurrentTemplate({...currentTemplate, includesGoals: e.target.checked})}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <p>Set, track, and evaluate goals over the review period.</p>
            </div>
            
            {currentTemplate.includesGoals && (
              <div className={`component-card ${currentTemplate.includesKPIs ? 'selected' : ''}`}>
                <div className="component-header">
                  <h4>KPI Tracking</h4>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={currentTemplate.includesKPIs}
                      onChange={(e) => setCurrentTemplate({...currentTemplate, includesKPIs: e.target.checked})}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <p>Link goals to key performance indicators for measurable outcomes.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="step-actions">
          <button onClick={goToPreviousStep} className="back-button">
            Back
          </button>
          <button onClick={goToNextStep} className="next-button">
            Next: Sections
          </button>
        </div>
      </div>
    );
  };
  
  // Step 3: Sections
  const renderStep3 = () => {
    const totalWeight = calculateTotalWeight();
    const isWeightValid = totalWeight === 100;
    
    return (
      <div className="step-content">
        <div className="sections-header">
          <div>
            <h4>Template Sections</h4>
            <p className="step-description">
              Sections organize your review into meaningful groups of questions. 
              Each section can have a different weight toward the overall review score.
            </p>
          </div>
          
          <button 
            onClick={generateDefaultSections}
            className="generate-button"
            title="Create suggested sections based on the template settings"
          >
            Generate Default Sections
          </button>
        </div>
        
        <div className="weight-summary">
          <div className="weight-meter">
            <div 
              className={`weight-progress ${isWeightValid ? 'valid' : 'invalid'}`} 
              style={{ width: `${Math.min(totalWeight, 100)}%` }}
            ></div>
          </div>
          <div className="weight-text">
            Total Weight: <span className={isWeightValid ? 'valid' : 'invalid'}>{totalWeight}%</span>
            {!isWeightValid && (
              <span className="weight-error">
                {totalWeight < 100 ? `(${100 - totalWeight}% remaining)` : `(${totalWeight - 100}% excess)`}
              </span>
            )}
          </div>
        </div>
        
        {currentTemplate.sections && currentTemplate.sections.length > 0 ? (
          <div className="sections-list">
            {currentTemplate.sections.map((section, index) => (
              <div key={index} className="section-item">
                <div className="section-main">
                  <div className="section-header">
                    <h5>{section.title || `Section ${index + 1}`}</h5>
                    <span className="section-weight">Weight: {section.weight}%</span>
                  </div>
                  <p className="section-description">{section.description || 'No description provided'}</p>
                  <p className="section-questions">{section.questions.length} question{section.questions.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="section-actions">
                  <button onClick={() => editSection(index)} className="edit-button">Edit</button>
                  <button onClick={() => deleteSection(index)} className="delete-button">Delete</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-sections">
            <div className="empty-state-message">
              <p>No sections added. Add sections to build your template or use Generate Default Sections.</p>
              <button onClick={addSection} className="add-section-btn">Add First Section</button>
            </div>
          </div>
        )}
        
        {currentTemplate.sections.length > 0 && (
          <button onClick={addSection} className="add-section-btn">Add Section</button>
        )}
        
        <div className="step-actions">
          <div className="left-actions">
            <button onClick={goToPreviousStep} className="back-button">
              Back
            </button>
          </div>
          
          <div className="right-actions">
            <button 
              onClick={() => setPreviewMode(!previewMode)} 
              className="preview-button"
            >
              {previewMode ? 'Close Preview' : 'Preview'}
            </button>
            <button 
              onClick={saveTemplate} 
              className="save-button"
              disabled={!isWeightValid || currentTemplate.sections.length === 0}
            >
              Save Template
            </button>
          </div>
        </div>
        
        {!isWeightValid && currentTemplate.sections.length > 0 && (
          <div className="warning-message">
            Total section weight must equal 100% to save the template.
          </div>
        )}
        
        {currentTemplate.sections.length === 0 && (
          <div className="warning-message">
            At least one section is required to save the template.
          </div>
        )}
      </div>
    );
  };
  
  // Preview mode
  const renderPreview = () => {
    if (!previewMode) return null;
    
    return (
      <div className="preview-overlay">
        <div className="preview-content">
          <div className="preview-header">
            <h3>Template Preview: {currentTemplate.name}</h3>
            <button onClick={() => setPreviewMode(false)} className="close-preview-button">×</button>
          </div>
          
          <div className="preview-body">
            <div className="preview-meta">
              <p><strong>Type:</strong> {currentTemplate.frequency} Review</p>
              <p><strong>Description:</strong> {currentTemplate.description || 'No description provided'}</p>
              
              <div className="preview-features">
                <p><strong>Features:</strong></p>
                <ul>
                  {currentTemplate.includesManagerReview && <li>Manager Review</li>}
                  {currentTemplate.includesSelfReview && <li>Self Review</li>}
                  {currentTemplate.includes360Review && <li>360° Peer Review</li>}
                  {currentTemplate.includesGoals && <li>Goal Setting</li>}
                  {currentTemplate.includesKPIs && <li>KPI Tracking</li>}
                </ul>
              </div>
            </div>
            
            <div className="preview-sections">
              <h4>Sections</h4>
              
              {currentTemplate.sections.map((section, index) => (
                <div key={index} className="preview-section">
                  <div className="preview-section-header">
                    <h5>{section.title} ({section.weight}%)</h5>
                  </div>
                  <p>{section.description}</p>
                  
                  <div className="preview-questions">
                    {section.questions.map((question, qIndex) => (
                      <div key={qIndex} className="preview-question">
                        <div className="question-label">
                          {question.text} {question.required && <span className="required">*</span>}
                        </div>
                        
                        {question.type === 'text' && (
                          <div className="question-preview-input">
                            <textarea className="form-control" disabled placeholder="Text response..." rows="2" />
                          </div>
                        )}
                        
                        {question.type === 'rating' && (
                          <div className="rating-preview">
                            <div className="rating-options">
                              <span>1</span>
                              <span>2</span>
                              <span>3</span>
                              <span>4</span>
                              <span>5</span>
                            </div>
                            <div className="rating-labels">
                              <span>Poor</span>
                              <span>Excellent</span>
                            </div>
                          </div>
                        )}
                        
                        {question.type === 'yesno' && (
                          <div className="yesno-preview">
                            <label className="radio-label">
                              <input type="radio" name={`yesno-${index}-${qIndex}`} disabled /> Yes
                            </label>
                            <label className="radio-label">
                              <input type="radio" name={`yesno-${index}-${qIndex}`} disabled /> No
                            </label>
                          </div>
                        )}
                        
                        {question.type === 'multiple-choice' && (
                          <div className="multiple-choice-preview">
                            {question.options.length > 0 ? (
                              question.options.map((option, oIndex) => (
                                <label key={oIndex} className="radio-label">
                                  <input type="radio" name={`mc-${index}-${qIndex}`} disabled /> {option}
                                </label>
                              ))
                            ) : (
                              <p className="no-options">No options defined</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Main render
  if (loading && !currentTemplate) {
    return (
      <div className="template-builder loading-state">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }
  
  if (error && !currentTemplate) {
    return (
      <div className="template-builder error-state">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={() => navigate('/templates')} className="cancel-button">
            Back to Templates
          </button>
        </div>
      </div>
    );
  }
  
  if (!currentTemplate) {
    return (
      <div className="template-builder error-state">
        <div className="error-message">
          <h3>Template Not Found</h3>
          <p>Unable to load template data.</p>
          <button onClick={() => navigate('/templates')} className="cancel-button">
            Back to Templates
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="template-builder">
      <div className="template-builder-header">
        <h2>{currentTemplate._id ? "Edit Template" : "Create New Template"}</h2>
        <button onClick={() => navigate('/templates')} className="back-to-templates">
          Back to Templates
        </button>
      </div>
      
      <div className="template-steps">
        <div className={`step ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">Template Details</div>
        </div>
        <div className="step-connector"></div>
        <div className={`step ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">Review Components</div>
        </div>
        <div className="step-connector"></div>
        <div className={`step ${currentStep === 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">Sections & Questions</div>
        </div>
      </div>
      
      <div className="template-builder-content">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>
      
      {renderSectionEditor()}
      {renderPreview()}
      
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">Saving...</div>
        </div>
      )}
    </div>
  );
}

export default TemplateBuilder;