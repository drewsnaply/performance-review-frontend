import React, { useState, useEffect } from 'react';
import { useDepartments } from '../context/DepartmentContext';

function AssignmentManager() {
  const { employees } = useDepartments();
  const [templates, setTemplates] = useState([]);
  const [assignmentType, setAssignmentType] = useState('individual');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  // Load templates from localStorage on component mount
  useEffect(() => {
    const savedTemplates = localStorage.getItem('evaluationTemplates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    }
  }, []);
  
  // Handle assignment type change
  const handleAssignmentTypeChange = (e) => {
    const newType = e.target.value;
    setAssignmentType(newType);
    
    // Clear selections when switching type
    setSelectedEmployees([]);
    setSelectedDepartment('');
  };
  
  // Handle employee selection
  const handleEmployeeSelection = (e) => {
    const options = e.target.options;
    const selectedValues = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }
    setSelectedEmployees(selectedValues);
  };
  
  // Handle department selection
  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    // Prevent default form submission behavior
    e.preventDefault();
    
    // Force log to console
    console.log('SUBMISSION TRIGGERED');
    
    // Manually set values for debugging
    const templateToSave = selectedTemplate || 'test-template';
    const employeesToSave = selectedEmployees.length > 0 ? selectedEmployees : ['andrew-mintzel-id'];
    const startDateToSave = startDate || '2025-04-01';
    const dueDateToSave = dueDate || '2025-04-30';
    
    // Create a review object
    const newReview = {
      id: Date.now().toString(),
      employeeName: 'andrew mintzel',
      reviewCycle: 'Test Evaluation',
      submissionDate: dueDateToSave,
      status: 'pending'
    };
    
    // Retrieve existing reviews
    const existingReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    
    // Add new review
    const updatedReviews = [...existingReviews, newReview];
    
    try {
      // Forcibly save to localStorage
      localStorage.setItem('reviews', JSON.stringify(updatedReviews));
      
      // Verify save
      const savedReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
      
      console.log('Existing Reviews:', existingReviews);
      console.log('New Review:', newReview);
      console.log('Updated Reviews:', updatedReviews);
      console.log('Verified Saved Reviews:', savedReviews);
      
      alert('Evaluation saved successfully!');
    } catch (error) {
      console.error('Error saving review:', error);
      alert('Failed to save evaluation');
    }
    
    // Reset form
    setSelectedTemplate('');
    setSelectedEmployees([]);
    setSelectedDepartment('');
    setStartDate('');
    setDueDate('');
  };
  
  // Render selection label based on assignment type
  const renderSelectionLabel = () => {
    if (assignmentType === 'individual') {
      return <label htmlFor="employeeSelect">Select Employees</label>;
    } else {
      return <label htmlFor="departmentSelect">Select Department</label>;
    }
  };
  
  // Render selection component based on assignment type
  const renderSelectionComponent = () => {
    if (assignmentType === 'individual') {
      return (
        <div className="form-group">
          {renderSelectionLabel()}
          <select 
            id="employeeSelect"
            multiple
            className="form-control"
            value={selectedEmployees}
            onChange={handleEmployeeSelection}
            required
          >
            {employees.map(employee => (
              <option key={employee.id} value={employee.id}>
                {`${employee.firstName} ${employee.lastName}`}
              </option>
            ))}
          </select>
          <small className="help-text">Hold Ctrl/Cmd to select multiple employees</small>
        </div>
      );
    } else {
      return (
        <div className="form-group">
          {renderSelectionLabel()}
          <select 
            id="departmentSelect"
            className="form-control"
            value={selectedDepartment}
            onChange={handleDepartmentChange}
            required
          >
            <option value="">-- Select a department --</option>
            <option value="1">Engineering</option>
            <option value="2">Marketing</option>
            <option value="3">Sales</option>
          </select>
        </div>
      );
    }
  };
  
  return (
    <div className="assignment-section">
      <h2>Assign Evaluations</h2>
      
      <form onSubmit={handleSubmit} className="assignment-form">
        <div className="form-section">
          <h3>1. Select Evaluation Template</h3>
          <div className="form-group">
            <select 
              className="form-control"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              required
            >
              <option value="">-- Select a template --</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="form-section">
          <h3>2. Select Recipients</h3>
          
          <div className="assignment-type">
            <label>Assignment Type</label>
            <div className="radio-group">
              <label>
                <input 
                  type="radio"
                  id="individual-radio"
                  name="assignmentType"
                  value="individual"
                  checked={assignmentType === 'individual'}
                  onChange={handleAssignmentTypeChange}
                />
                <span>Individual Employees</span>
              </label>
              
              <label>
                <input 
                  type="radio"
                  id="department-radio"
                  name="assignmentType"
                  value="department"
                  checked={assignmentType === 'department'}
                  onChange={handleAssignmentTypeChange}
                />
                <span>Department/Team</span>
              </label>
            </div>
          </div>
          
          {renderSelectionComponent()}
        </div>
        
        <div className="form-section">
          <h3>3. Set Evaluation Period</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input 
                type="date" 
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input 
                type="date" 
                className="form-control"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button type="button" className="secondary-button" onClick={() => window.history.back()}>
            Cancel
          </button>
          <button 
            type="submit" 
            className="primary-button"
          >
            Assign Evaluation
          </button>
        </div>
      </form>
    </div>
  );
}

export default AssignmentManager;