// components/Templates.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook
import SidebarLayout from '../components/SidebarLayout'; // Import SidebarLayout

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    title: '',
    type: 'self',
    frequency: 'quarterly',
    sections: [{ title: 'Performance', questions: [{ text: '', type: 'text' }] }]
  });

  // Get current user for SidebarLayout
  const { currentUser } = useAuth();
  
  // Create user object for SidebarLayout
  const user = currentUser ? {
    firstName: currentUser.firstName || currentUser.username || 'User',
    lastName: currentUser.lastName || '',
    role: currentUser.role || 'USER'
  } : null;

  useEffect(() => {
    // Load templates from localStorage
    const storedTemplates = localStorage.getItem('templates');
    if (storedTemplates) {
      try {
        setTemplates(JSON.parse(storedTemplates));
      } catch (error) {
        console.error('Error parsing templates:', error);
        setTemplates([]);
      }
    } else {
      // Initialize with some default templates if none exist
      const defaultTemplates = [
        {
          id: '1',
          title: 'Quarterly Performance Review',
          type: 'self',
          frequency: 'quarterly',
          sections: [
            {
              title: 'Goals Achievement',
              questions: [
                { text: 'What goals did you accomplish this quarter?', type: 'text' },
                { text: 'Rate your overall performance', type: 'rating' }
              ]
            },
            {
              title: 'Skills Development',
              questions: [
                { text: 'What new skills have you developed?', type: 'text' },
                { text: 'What areas would you like to improve?', type: 'text' }
              ]
            }
          ]
        },
        {
          id: '2',
          title: 'Annual Manager Assessment',
          type: 'manager',
          frequency: 'annual',
          sections: [
            {
              title: 'Leadership',
              questions: [
                { text: 'How effectively does this employee lead their team?', type: 'rating' },
                { text: 'Provide examples of leadership qualities observed', type: 'text' }
              ]
            },
            {
              title: 'Performance Metrics',
              questions: [
                { text: 'Did the employee meet their KPIs?', type: 'yesno' },
                { text: 'Overall assessment of employee performance', type: 'text' }
              ]
            }
          ]
        }
      ];
      setTemplates(defaultTemplates);
      localStorage.setItem('templates', JSON.stringify(defaultTemplates));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTemplate({ ...newTemplate, [name]: value });
  };

  const addSection = () => {
    const updatedTemplate = { ...newTemplate };
    updatedTemplate.sections.push({ title: '', questions: [{ text: '', type: 'text' }] });
    setNewTemplate(updatedTemplate);
  };

  const updateSectionTitle = (index, title) => {
    const updatedTemplate = { ...newTemplate };
    updatedTemplate.sections[index].title = title;
    setNewTemplate(updatedTemplate);
  };

  const addQuestion = (sectionIndex) => {
    const updatedTemplate = { ...newTemplate };
    updatedTemplate.sections[sectionIndex].questions.push({ text: '', type: 'text' });
    setNewTemplate(updatedTemplate);
  };

  const updateQuestion = (sectionIndex, questionIndex, field, value) => {
    const updatedTemplate = { ...newTemplate };
    updatedTemplate.sections[sectionIndex].questions[questionIndex][field] = value;
    setNewTemplate(updatedTemplate);
  };

  const saveTemplate = () => {
    // Create a new template
    const templateToSave = {
      ...newTemplate,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    // Add to the templates array
    const updatedTemplates = [...templates, templateToSave];
    setTemplates(updatedTemplates);

    // Save to localStorage
    localStorage.setItem('templates', JSON.stringify(updatedTemplates));

    // Reset form and hide it
    setNewTemplate({
      title: '',
      type: 'self',
      frequency: 'quarterly',
      sections: [{ title: 'Performance', questions: [{ text: '', type: 'text' }] }]
    });
    setShowCreateForm(false);
  };

  const deleteTemplate = (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      const updatedTemplates = templates.filter(template => template.id !== id);
      setTemplates(updatedTemplates);
      localStorage.setItem('templates', JSON.stringify(updatedTemplates));
    }
  };

  // Function to render the Templates content
  const renderTemplatesContent = () => {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>Evaluation Templates</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            {showCreateForm ? 'Cancel' : 'Create Template'}
          </button>
        </div>
  
        {showCreateForm && (
          <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '2rem' }}>
            <h3 style={{ marginTop: 0 }}>Create New Template</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Template Title:
              </label>
              <input
                type="text"
                name="title"
                value={newTemplate.title}
                onChange={handleInputChange}
                placeholder="Enter a descriptive title"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '0.25rem',
                  border: '1px solid #cbd5e0'
                }}
              />
            </div>
  
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Evaluation Type:
                </label>
                <select
                  name="type"
                  value={newTemplate.type}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '0.25rem',
                    border: '1px solid #cbd5e0'
                  }}
                >
                  <option value="self">Self Assessment</option>
                  <option value="manager">Manager Assessment</option>
                  <option value="peer">Peer Review</option>
                  <option value="360">360° Review</option>
                </select>
              </div>
              
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Frequency:
                </label>
                <select
                  name="frequency"
                  value={newTemplate.frequency}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '0.25rem',
                    border: '1px solid #cbd5e0'
                  }}
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="semi-annual">Semi-Annual</option>
                  <option value="annual">Annual</option>
                </select>
              </div>
            </div>
  
            <h4 style={{ marginTop: '1.5rem' }}>Sections</h4>
            
            {newTemplate.sections.map((section, sectionIndex) => (
              <div 
                key={sectionIndex}
                style={{ 
                  backgroundColor: 'white', 
                  padding: '1rem', 
                  borderRadius: '0.25rem',
                  marginBottom: '1rem',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                    Section Title:
                  </label>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateSectionTitle(sectionIndex, e.target.value)}
                    placeholder="e.g., Performance Goals"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '0.25rem',
                      border: '1px solid #cbd5e0'
                    }}
                  />
                </div>
  
                <h5 style={{ marginTop: '1rem' }}>Questions</h5>
                
                {section.questions.map((question, questionIndex) => (
                  <div 
                    key={questionIndex}
                    style={{ 
                      padding: '0.75rem', 
                      backgroundColor: '#f9fafb',
                      borderRadius: '0.25rem',
                      marginBottom: '0.75rem'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                      <div style={{ flex: 3 }}>
                        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' }}>
                          Question:
                        </label>
                        <input
                          type="text"
                          value={question.text}
                          onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'text', e.target.value)}
                          placeholder="Enter your question"
                          style={{
                            width: '100%',
                            padding: '0.375rem',
                            borderRadius: '0.25rem',
                            border: '1px solid #cbd5e0',
                            fontSize: '0.875rem'
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' }}>
                          Type:
                        </label>
                        <select
                          value={question.type}
                          onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'type', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.375rem',
                            borderRadius: '0.25rem',
                            border: '1px solid #cbd5e0',
                            fontSize: '0.875rem'
                          }}
                        >
                          <option value="text">Text</option>
                          <option value="rating">Rating (1-5)</option>
                          <option value="yesno">Yes/No</option>
                          <option value="multiple">Multiple Choice</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
  
                <button
                  type="button"
                  onClick={() => addQuestion(sectionIndex)}
                  style={{
                    padding: '0.375rem 0.75rem',
                    backgroundColor: '#edf2f7',
                    color: '#4a5568',
                    border: '1px solid #cbd5e0',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  + Add Question
                </button>
              </div>
            ))}
  
            <button
              type="button"
              onClick={addSection}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#e2e8f0',
                color: '#4a5568',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                marginRight: '0.75rem'
              }}
            >
              + Add Section
            </button>
  
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#e2e8f0',
                  color: '#4a5568',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  marginRight: '0.75rem'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveTemplate}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer'
                }}
              >
                Save Template
              </button>
            </div>
          </div>
        )}
  
        <div style={{ marginTop: '1.5rem' }}>
          {templates.length > 0 ? (
            <div>
              {templates.map((template) => (
                <div 
                  key={template.id}
                  style={{ 
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem',
                    overflow: 'hidden'
                  }}
                >
                  <div 
                    style={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      backgroundColor: '#f8fafc',
                      borderBottom: '1px solid #e2e8f0'
                    }}
                  >
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{template.title}</h3>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                        <span style={{ 
                          fontSize: '0.875rem',
                          backgroundColor: '#edf2f7',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          color: '#4a5568'
                        }}>
                          {template.type === 'self' ? 'Self Assessment' : 
                           template.type === 'manager' ? 'Manager Assessment' :
                           template.type === 'peer' ? 'Peer Review' : '360° Review'}
                        </span>
                        <span style={{ 
                          fontSize: '0.875rem',
                          backgroundColor: '#edf2f7',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          color: '#4a5568'
                        }}>
                          {template.frequency === 'monthly' ? 'Monthly' :
                           template.frequency === 'quarterly' ? 'Quarterly' :
                           template.frequency === 'semi-annual' ? 'Semi-Annual' : 'Annual'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={() => deleteTemplate(template.id)}
                        style={{
                          padding: '0.375rem 0.75rem',
                          backgroundColor: '#feb2b2',
                          color: '#c53030',
                          border: 'none',
                          borderRadius: '0.25rem',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div style={{ padding: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.75rem 0', color: '#4a5568' }}>Sections</h4>
                    <div>
                      {template.sections.map((section, index) => (
                        <div 
                          key={index}
                          style={{ 
                            marginBottom: '0.75rem',
                            padding: '0.75rem',
                            backgroundColor: '#f9fafb',
                            borderRadius: '0.25rem'
                          }}
                        >
                          <h5 style={{ margin: '0 0 0.5rem 0', color: '#4a5568' }}>{section.title}</h5>
                          <div>
                            <span style={{ fontSize: '0.875rem', color: '#718096' }}>
                              {section.questions.length} question{section.questions.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
              <p style={{ color: '#718096' }}>No templates found. Create your first template to get started.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Wrap the Templates content with SidebarLayout
  return (
    <SidebarLayout user={user} activeView="templates">
      {renderTemplatesContent()}
    </SidebarLayout>
  );
};

export default Templates;