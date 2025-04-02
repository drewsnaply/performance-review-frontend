import React, { useState } from 'react';
import SectionEditor from './SectionEditor';

// Add template types
const TEMPLATE_TYPES = [
  { value: 'performance', label: 'Performance Review' },
  { value: '360', label: '360 Review' },
  { value: 'self', label: 'Self-Assessment' },
];

// Add reviewer roles
const REVIEWER_ROLES = [
  { value: 'self', label: 'Self' },
  { value: 'manager', label: 'Manager' },
  { value: 'peer', label: 'Peer' },
  { value: 'subordinate', label: 'Subordinate' },
];

function TemplateEditor({ template, onSave, onCancel }) {
  const [formData, setFormData] = useState(template || {
    type: '',
    title: '',
    description: '',
    reviewerRoles: [],
    sections: []
  });
  const [currentSection, setCurrentSection] = useState(null);
  const [showSectionEditor, setShowSectionEditor] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSectionSave = (section) => {
    let updatedSections;
    if (section.id) {
      // Update existing section
      updatedSections = formData.sections.map(s => 
        s.id === section.id ? section : s
      );
    } else {
      // Add new section with generated ID
      const newSection = {
        ...section,
        id: Date.now().toString()
      };
      updatedSections = [...formData.sections, newSection];
    }
    
    setFormData({
      ...formData,
      sections: updatedSections
    });
    setShowSectionEditor(false);
  };

  const addSection = () => {
    setCurrentSection(null);
    setShowSectionEditor(true);
  };

  const editSection = (section) => {
    setCurrentSection(section);
    setShowSectionEditor(true);
  };

  const removeSection = (sectionId) => {
    setFormData({
      ...formData,
      sections: formData.sections.filter(s => s.id !== sectionId)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  // Render section editor if active
  if (showSectionEditor) {
    return (
      <SectionEditor 
        section={currentSection}
        onSave={handleSectionSave}
        onCancel={() => setShowSectionEditor(false)}
      />
    );
  }

  return (
    <div className="template-editor">
      <h2>{template ? 'Edit Template' : 'Create New Template'}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Template Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-control"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label htmlFor="type">Template Type</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="form-control"
            required
          >
            <option value="">Select a template type</option>
            {TEMPLATE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Reviewer Roles</label>
          {REVIEWER_ROLES.map((role) => (
            <div key={role.value} className="checkbox">
              <label>
                <input
                  type="checkbox"
                  value={role.value}
                  checked={formData.reviewerRoles.includes(role.value)}
                  onChange={(e) => {
                    const roles = e.target.checked
                      ? [...formData.reviewerRoles, role.value]
                      : formData.reviewerRoles.filter((r) => r !== role.value);
                    setFormData({ ...formData, reviewerRoles: roles });
                  }}
                />
                {role.label}
              </label>
            </div>
          ))}
        </div>
        
        <div className="template-sections">
          <div className="section-header">
            <h3>Sections</h3>
            <button 
              type="button" 
              className="add-section-btn"
              onClick={addSection}
            >
              Add Section
            </button>
          </div>
          
          {formData.sections && formData.sections.length > 0 ? (
            <div className="sections-list">
              {formData.sections.map(section => (
                <div key={section.id} className="section-item">
                  <div className="section-info">
                    <h4>{section.title}</h4>
                    <p>{section.questions?.length || 0} questions</p>
                  </div>
                  <div className="section-actions">
                    <button 
                      type="button" 
                      className="edit-btn"
                      onClick={() => editSection(section)}
                    >
                      Edit
                    </button>
                    <button 
                      type="button" 
                      className="delete-btn"
                      onClick={() => removeSection(section.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-sections">
              <p>No sections added yet. Add sections to your template.</p>
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="primary-button">
            Save Template
          </button>
        </div>
      </form>
    </div>
  );
}

export default TemplateEditor;