import React, { useState } from 'react';
import QuestionEditor from './QuestionEditor';

function SectionEditor({ section, onSave, onCancel }) {
  const [formData, setFormData] = useState(section || {
    title: '',
    description: '',
    questions: []
  });
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showQuestionEditor, setShowQuestionEditor] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleQuestionSave = (question) => {
    let updatedQuestions;
    if (question.id) {
      // Update existing question
      updatedQuestions = formData.questions.map(q => 
        q.id === question.id ? question : q
      );
    } else {
      // Add new question with generated ID
      const newQuestion = {
        ...question,
        id: Date.now().toString()
      };
      updatedQuestions = [...(formData.questions || []), newQuestion];
    }
    
    setFormData({
      ...formData,
      questions: updatedQuestions
    });
    setShowQuestionEditor(false);
  };

  const addQuestion = () => {
    setCurrentQuestion(null);
    setShowQuestionEditor(true);
  };

  const editQuestion = (question) => {
    setCurrentQuestion(question);
    setShowQuestionEditor(true);
  };

  const removeQuestion = (questionId) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter(q => q.id !== questionId)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  // Get question type display name
  const getQuestionTypeName = (type) => {
    switch(type) {
      case 'rating': return 'Rating Scale';
      case 'text': return 'Text Response';
      case 'multipleChoice': return 'Multiple Choice';
      default: return type;
    }
  };

  // Render question editor if active
  if (showQuestionEditor) {
    return (
      <QuestionEditor 
        question={currentQuestion}
        onSave={handleQuestionSave}
        onCancel={() => setShowQuestionEditor(false)}
      />
    );
  }

  return (
    <div className="section-editor">
      <h2>{section ? 'Edit Section' : 'Create New Section'}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Section Title</label>
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
            rows="2"
          />
        </div>
        
        <div className="section-questions">
          <div className="questions-header">
            <h3>Questions</h3>
            <button 
              type="button" 
              className="add-question-btn"
              onClick={addQuestion}
            >
              Add Question
            </button>
          </div>
          
          {formData.questions && formData.questions.length > 0 ? (
            <div className="questions-list">
              {formData.questions.map(question => (
                <div key={question.id} className={`question-item ${question.required ? 'required' : ''}`}>
                  <div className="question-info">
                    <p className={question.required ? 'required-question' : ''}>
                      {question.text}
                    </p>
                    <span className="question-meta">
                      <span className="question-type">{getQuestionTypeName(question.type)}</span>
                      {question.type === 'rating' && 
                       ` (${question.minRating}-${question.maxRating})`}
                    </span>
                  </div>
                  <div className="question-actions">
                    <button 
                      type="button" 
                      className="edit-btn"
                      onClick={() => editQuestion(question)}
                    >
                      Edit
                    </button>
                    <button 
                      type="button" 
                      className="delete-btn"
                      onClick={() => removeQuestion(question.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-questions">
              <p>No questions added yet. Add questions to your section.</p>
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="primary-button">
            Save Section
          </button>
        </div>
      </form>
    </div>
  );
}

export default SectionEditor;