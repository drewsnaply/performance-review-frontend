// components/TemplateBuilder.js
import React, { useState, useEffect } from 'react';
import QuestionEditor from './QuestionEditor';

function TemplateBuilder() {
  const [templates, setTemplates] = useState([]);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  
  // Sample template structure
  const newTemplateStructure = {
    id: null,
    title: '',
    description: '',
    sections: [],
    createdAt: null,
    updatedAt: null,
    isActive: true
  };
  
  const createNewTemplate = () => {
    setCurrentTemplate({
      ...newTemplateStructure,
      id: Date.now(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    setShowEditor(true);
  };
  
  const editTemplate = (template) => {
    setCurrentTemplate(template);
    setShowEditor(true);
  };
  
  return (
    <div className="template-builder">
      <div className="template-header">
        <h2>Evaluation Templates</h2>
        <button className="action-button" onClick={createNewTemplate}>Create New Template</button>
      </div>
      
      {showEditor ? (
        <div className="template-editor">
          <h3>{currentTemplate.id ? "Edit Template" : "New Template"}</h3>
          <div className="form-group">
            <label>Title</label>
            <input 
              type="text" 
              value={currentTemplate.title} 
              onChange={(e) => setCurrentTemplate({...currentTemplate, title: e.target.value})}
              className="form-control"
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
          
          <div className="sections-area">
            <h4>Sections</h4>
            {currentTemplate.sections.map((section, index) => (
              <div key={index} className="section-item">
                <h5>{section.title}</h5>
                <p>{section.questions.length} questions</p>
                <button onClick={() => {/* Edit section */}}>Edit</button>
              </div>
            ))}
            <button className="add-section-btn">Add Section</button>
          </div>
          
          <div className="template-actions">
            <button className="save-button">Save Template</button>
            <button onClick={() => setShowEditor(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="templates-list">
          {templates.length > 0 ? (
            templates.map(template => (
              <div key={template.id} className="template-card">
                <h3>{template.title}</h3>
                <p>{template.description}</p>
                <div className="template-meta">
                  <span>{template.sections.length} sections</span>
                  <span>Last updated: {new Date(template.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="template-actions">
                  <button onClick={() => editTemplate(template)}>Edit</button>
                  <button>Duplicate</button>
                  <button>Delete</button>
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
    </div>
  );
}

export default TemplateBuilder;