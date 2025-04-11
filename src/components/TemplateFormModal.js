import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import '../styles/Modal.css';

// Using named function declaration for React 19 compatibility
// Use a direct function declaration for React 19 compatibility
function TemplateFormModal({ template, onSubmit, onClose }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('Annually');
  const [status, setStatus] = useState('Active');
  const [workflow, setWorkflow] = useState([
    { role: 'Manager', order: 1 },
    { role: 'HR', order: 2 }
  ]);
  const [sections, setSections] = useState([
    {
      title: 'Performance',
      description: 'Evaluate overall performance',
      order: 1,
      questions: [
        {
          text: 'How would you rate the employee\'s overall performance?',
          type: 'Rating',
          required: true,
          options: [],
          ratingScale: { min: 1, max: 5 }
        }
      ]
    }
  ]);
  const [errors, setErrors] = useState({});

  // Populate form fields if editing an existing template
  useEffect(() => {
    if (template) {
      setName(template.name || '');
      setDescription(template.description || '');
      setFrequency(template.frequency || 'Annually');
      setStatus(template.status || 'Active');
      
      if (template.workflow && template.workflow.steps) {
        setWorkflow(template.workflow.steps.sort((a, b) => a.order - b.order));
      }
      
      if (template.sections) {
        setSections(template.sections.sort((a, b) => a.order - b.order));
      }
    }
  }, [template]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) newErrors.name = 'Template name is required';
    if (workflow.length === 0) newErrors.workflow = 'At least one workflow step is required';
    if (sections.length === 0) newErrors.sections = 'At least one section is required';
    
    // Validate each section has a title
    sections.forEach((section, index) => {
      if (!section.title.trim()) {
        newErrors[`section_${index}`] = 'Section title is required';
      }
      
      // Validate each section has at least one question
      if (section.questions.length === 0) {
        newErrors[`section_questions_${index}`] = 'At least one question is required';
      }
      
      // Validate each question has text
      section.questions.forEach((question, qIndex) => {
        if (!question.text.trim()) {
          newErrors[`question_${index}_${qIndex}`] = 'Question text is required';
        }
      });
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    onSubmit({
      name,
      description,
      frequency,
      status,
      workflow: {
        steps: workflow
      },
      sections
    });
  };

  const addWorkflowStep = () => {
    setWorkflow([
      ...workflow,
      {
        role: 'Manager',
        order: workflow.length > 0 ? Math.max(...workflow.map(w => w.order)) + 1 : 1
      }
    ]);
  };

  const removeWorkflowStep = (index) => {
    if (workflow.length <= 1) {
      setErrors(prev => ({ ...prev, workflow: 'At least one workflow step is required' }));
      return;
    }
    
    const newWorkflow = [...workflow];
    newWorkflow.splice(index, 1);
    
    // Reorder remaining steps
    newWorkflow.forEach((step, i) => {
      step.order = i + 1;
    });
    
    setWorkflow(newWorkflow);
  };

  const updateWorkflowStep = (index, field, value) => {
    const newWorkflow = [...workflow];
    newWorkflow[index] = {
      ...newWorkflow[index],
      [field]: value
    };
    setWorkflow(newWorkflow);
  };

  const addSection = () => {
    setSections([
      ...sections,
      {
        title: '',
        description: '',
        order: sections.length > 0 ? Math.max(...sections.map(s => s.order)) + 1 : 1,
        questions: [
          {
            text: '',
            type: 'Rating',
            required: true,
            options: [],
            ratingScale: { min: 1, max: 5 }
          }
        ]
      }
    ]);
  };

  const removeSection = (index) => {
    if (sections.length <= 1) {
      setErrors(prev => ({ ...prev, sections: 'At least one section is required' }));
      return;
    }
    
    const newSections = [...sections];
    newSections.splice(index, 1);
    
    // Reorder remaining sections
    newSections.forEach((section, i) => {
      section.order = i + 1;
    });
    
    setSections(newSections);
  };

  const updateSection = (index, field, value) => {
    const newSections = [...sections];
    newSections[index] = {
      ...newSections[index],
      [field]: value
    };
    setSections(newSections);
  };

  const addQuestion = (sectionIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].questions.push({
      text: '',
      type: 'Rating',
      required: true,
      options: [],
      ratingScale: { min: 1, max: 5 }
    });
    setSections(newSections);
  };

  const removeQuestion = (sectionIndex, questionIndex) => {
    if (sections[sectionIndex].questions.length <= 1) {
      setErrors(prev => ({ ...prev, [`section_questions_${sectionIndex}`]: 'At least one question is required' }));
      return;
    }
    
    const newSections = [...sections];
    newSections[sectionIndex].questions.splice(questionIndex, 1);
    setSections(newSections);
  };

  const updateQuestion = (sectionIndex, questionIndex, field, value) => {
    const newSections = [...sections];
    newSections[sectionIndex].questions[questionIndex] = {
      ...newSections[sectionIndex].questions[questionIndex],
      [field]: value
    };
    setSections(newSections);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{template ? 'Edit Template' : 'Create New Template'}</h3>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <form className="template-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h4>Template Information</h4>
            
            <div className="form-group">
              <label htmlFor="name">Template Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={errors.name ? 'error' : ''}
                placeholder="Enter template name..."
              />
              {errors.name && <div className="error-message">{errors.name}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description (Optional)</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter template description..."
                rows={3}
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="frequency">Frequency</label>
                <select
                  id="frequency"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                >
                  <option value="Annually">Annually</option>
                  <option value="Semi-Annually">Semi-Annually</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <div className="section-header">
              <h4>Workflow</h4>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={addWorkflowStep}
              >
                <FaPlus /> Add Step
              </button>
            </div>
            {errors.workflow && <div className="error-message">{errors.workflow}</div>}
            
            {workflow.map((step, index) => (
              <div key={index} className="workflow-step">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor={`workflow-role-${index}`}>Role</label>
                    <select
                      id={`workflow-role-${index}`}
                      value={step.role}
                      onChange={(e) => updateWorkflowStep(index, 'role', e.target.value)}
                    >
                      <option value="Employee">Employee</option>
                      <option value="Manager">Manager</option>
                      <option value="Department Head">Department Head</option>
                      <option value="HR">HR</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor={`workflow-order-${index}`}>Order</label>
                    <input
                      type="number"
                      id={`workflow-order-${index}`}
                      value={step.order}
                      onChange={(e) => updateWorkflowStep(index, 'order', parseInt(e.target.value))}
                      min="1"
                    />
                  </div>
                  
                  <button
                    type="button"
                    className="btn btn-delete btn-sm"
                    onClick={() => removeWorkflowStep(index)}
                    title="Remove Step"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="form-section">
            <div className="section-header">
              <h4>Sections</h4>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={addSection}
              >
                <FaPlus /> Add Section
              </button>
            </div>
            {errors.sections && <div className="error-message">{errors.sections}</div>}
            
            {sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="template-section-editor">
                <div className="section-header">
                  <div className="form-group">
                    <label htmlFor={`section-title-${sectionIndex}`}>Section Title</label>
                    <input
                      type="text"
                      id={`section-title-${sectionIndex}`}
                      value={section.title}
                      onChange={(e) => updateSection(sectionIndex, 'title', e.target.value)}
                      className={errors[`section_${sectionIndex}`] ? 'error' : ''}
                      placeholder="Enter section title..."
                    />
                    {errors[`section_${sectionIndex}`] && (
                      <div className="error-message">{errors[`section_${sectionIndex}`]}</div>
                    )}
                  </div>
                  
                  <button
                    type="button"
                    className="btn btn-delete btn-sm"
                    onClick={() => removeSection(sectionIndex)}
                    title="Remove Section"
                  >
                    <FaTrash />
                  </button>
                </div>
                
                <div className="form-group">
                  <label htmlFor={`section-description-${sectionIndex}`}>Description (Optional)</label>
                  <textarea
                    id={`section-description-${sectionIndex}`}
                    value={section.description}
                    onChange={(e) => updateSection(sectionIndex, 'description', e.target.value)}
                    placeholder="Enter section description..."
                    rows={2}
                  />
                </div>
                
                <div className="questions-section">
                  <div className="section-header">
                    <h5>Questions</h5>
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-sm"
                      onClick={() => addQuestion(sectionIndex)}
                    >
                      <FaPlus /> Add Question
                    </button>
                  </div>
                  {errors[`section_questions_${sectionIndex}`] && (
                    <div className="error-message">{errors[`section_questions_${sectionIndex}`]}</div>
                  )}
                  
                  {section.questions.map((question, questionIndex) => (
                    <div key={questionIndex} className="question-editor">
                      <div className="form-group">
                        <label htmlFor={`question-text-${sectionIndex}-${questionIndex}`}>Question</label>
                        <div className="question-input-group">
                          <input
                            type="text"
                            id={`question-text-${sectionIndex}-${questionIndex}`}
                            value={question.text}
                            onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'text', e.target.value)}
                            className={errors[`question_${sectionIndex}_${questionIndex}`] ? 'error' : ''}
                            placeholder="Enter question..."
                          />
                          
                          <button
                            type="button"
                            className="btn btn-delete btn-sm"
                            onClick={() => removeQuestion(sectionIndex, questionIndex)}
                            title="Remove Question"
                          >
                            <FaTrash />
                          </button>
                        </div>
                        {errors[`question_${sectionIndex}_${questionIndex}`] && (
                          <div className="error-message">{errors[`question_${sectionIndex}_${questionIndex}`]}</div>
                        )}
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor={`question-type-${sectionIndex}-${questionIndex}`}>Question Type</label>
                          <select
                            id={`question-type-${sectionIndex}-${questionIndex}`}
                            value={question.type}
                            onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'type', e.target.value)}
                          >
                            <option value="Rating">Rating</option>
                            <option value="Text">Text</option>
                            <option value="MultipleChoice">Multiple Choice</option>
                            <option value="Checkbox">Checkbox</option>
                          </select>
                        </div>
                        
                        <div className="form-group">
                          <div className="toggle-group">
                            <label htmlFor={`question-required-${sectionIndex}-${questionIndex}`}>Required</label>
                            <label className="toggle">
                              <input
                                type="checkbox"
                                id={`question-required-${sectionIndex}-${questionIndex}`}
                                checked={question.required}
                                onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'required', e.target.checked)}
                              />
                              <span className="toggle-slider"></span>
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      {question.type === 'Rating' && (
                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor={`rating-min-${sectionIndex}-${questionIndex}`}>Min Rating</label>
                            <input
                              type="number"
                              id={`rating-min-${sectionIndex}-${questionIndex}`}
                              value={question.ratingScale?.min || 1}
                              onChange={(e) => updateQuestion(
                                sectionIndex, 
                                questionIndex, 
                                'ratingScale', 
                                { ...question.ratingScale, min: parseInt(e.target.value) }
                              )}
                              min="1"
                              max="10"
                            />
                          </div>
                          
                          <div className="form-group">
                            <label htmlFor={`rating-max-${sectionIndex}-${questionIndex}`}>Max Rating</label>
                            <input
                              type="number"
                              id={`rating-max-${sectionIndex}-${questionIndex}`}
                              value={question.ratingScale?.max || 5}
                              onChange={(e) => updateQuestion(
                                sectionIndex, 
                                questionIndex, 
                                'ratingScale', 
                                { ...question.ratingScale, max: parseInt(e.target.value) }
                              )}
                              min="2"
                              max="10"
                            />
                          </div>
                        </div>
                      )}
                      
                      {(question.type === 'MultipleChoice' || question.type === 'Checkbox') && (
                        <div className="form-group">
                          <label>Options (one per line)</label>
                          <textarea
                            value={(question.options || []).join('\n')}
                            onChange={(e) => updateQuestion(
                              sectionIndex, 
                              questionIndex, 
                              'options', 
                              e.target.value.split('\n').filter(line => line.trim() !== '')
                            )}
                            placeholder="Enter options, one per line..."
                            rows={3}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {template ? 'Update Template' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TemplateFormModal;