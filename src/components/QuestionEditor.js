import React, { useState } from 'react';

function QuestionEditor({ question, onSave, onCancel }) {
  const [formData, setFormData] = useState(question || {
    text: '',
    type: 'rating',
    required: true,
    options: [],
    minRating: 1,
    maxRating: 5
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...formData.options];
    updatedOptions[index] = value;
    setFormData({
      ...formData,
      options: updatedOptions
    });
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...(formData.options || []), '']
    });
  };

  const removeOption = (index) => {
    const updatedOptions = [...formData.options];
    updatedOptions.splice(index, 1);
    setFormData({
      ...formData,
      options: updatedOptions
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="question-editor">
      <h2>{question ? 'Edit Question' : 'Add Question'}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <div className="form-label-container">
            <label htmlFor="text">Question Text</label>
            {formData.required && (
              <span className="required-badge">Required</span>
            )}
          </div>
          <input
            type="text"
            id="text"
            name="text"
            value={formData.text}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="type">Question Type</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="form-control"
          >
            <option value="rating">Rating Scale</option>
            <option value="text">Text Response</option>
            <option value="multipleChoice">Multiple Choice</option>
          </select>
        </div>
        
        {formData.type === 'rating' && (
          <div className="rating-options">
            <div className="form-group">
              <label htmlFor="minRating">Minimum Rating</label>
              <input
                type="number"
                id="minRating"
                name="minRating"
                value={formData.minRating}
                onChange={handleChange}
                className="form-control"
                min="1"
                max="10"
              />
            </div>
            <div className="form-group">
              <label htmlFor="maxRating">Maximum Rating</label>
              <input
                type="number"
                id="maxRating"
                name="maxRating"
                value={formData.maxRating}
                onChange={handleChange}
                className="form-control"
                min="1"
                max="10"
              />
            </div>
          </div>
        )}
        
        {formData.type === 'multipleChoice' && (
          <div className="multiple-choice-options">
            <label>Options</label>
            {formData.options && formData.options.map((option, index) => (
              <div key={index} className="option-item">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="form-control"
                  placeholder={`Option ${index + 1}`}
                />
                <button
                  type="button"
                  className="remove-option-btn"
                  onClick={() => removeOption(index)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="add-option-btn"
              onClick={addOption}
            >
              Add Option
            </button>
          </div>
        )}
        
        <div className="required-setting-container">
          <div className="form-group required-toggle">
            <label className={`toggle-label ${formData.required ? 'is-required' : ''}`}>
              <input
                type="checkbox"
                name="required"
                checked={formData.required}
                onChange={handleChange}
              />
              <span className="toggle-text">Required Question</span>
            </label>
            <div className="required-info">
              {formData.required ? 
                "Respondents must answer this question to complete the evaluation." :
                "Respondents can skip this question if needed."}
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="primary-button">
            Save Question
          </button>
        </div>
      </form>
    </div>
  );
}

export default QuestionEditor;
