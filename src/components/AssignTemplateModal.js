import React, { useState } from 'react';
import { FaTimes, FaCalendarAlt, FaUserAlt, FaUserCheck } from 'react-icons/fa';
import '../styles/Modal.css';

// Use a direct function declaration for React 19 compatibility
function AssignTemplateModal({ template, employees, onSubmit, onClose }) {
  const [employeeId, setEmployeeId] = useState('');
  const [reviewerId, setReviewerId] = useState('');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [reviewPeriodStart, setReviewPeriodStart] = useState(
    new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [reviewPeriodEnd, setReviewPeriodEnd] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!employeeId) newErrors.employeeId = 'Employee is required';
    if (!reviewerId) newErrors.reviewerId = 'Reviewer is required';
    if (!dueDate) newErrors.dueDate = 'Due date is required';
    if (!reviewPeriodStart) newErrors.reviewPeriodStart = 'Review period start date is required';
    if (!reviewPeriodEnd) newErrors.reviewPeriodEnd = 'Review period end date is required';
    
    if (reviewPeriodStart && reviewPeriodEnd && new Date(reviewPeriodStart) > new Date(reviewPeriodEnd)) {
      newErrors.reviewPeriodEnd = 'End date must be after start date';
    }
    
    if (dueDate && new Date(dueDate) < new Date()) {
      newErrors.dueDate = 'Due date cannot be in the past';
    }
    
    if (employeeId === reviewerId) {
      newErrors.reviewerId = 'Reviewer cannot be the same as employee';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    onSubmit({
      employeeId,
      reviewerId,
      dueDate,
      reviewPeriod: {
        start: reviewPeriodStart,
        end: reviewPeriodEnd
      },
      notes
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Assign Template: {template.name}</h3>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <form className="assignment-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h4>Template Information</h4>
            <div className="template-info">
              <p><strong>Name:</strong> {template.name}</p>
              <p><strong>Type:</strong> {template.frequency} Review</p>
              <p><strong>Description:</strong> {template.description || 'No description provided'}</p>
            </div>
          </div>
          
          <div className="form-section">
            <h4>Assignment Details</h4>
            
            <div className="form-group">
              <label htmlFor="employee">
                <FaUserAlt /> Employee to Review
              </label>
              <select
                id="employee"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className={errors.employeeId ? 'error' : ''}
              >
                <option value="">Select Employee</option>
                {employees.map(employee => (
                  <option key={employee._id} value={employee._id}>
                    {employee.firstName} {employee.lastName} - {employee.position.title || 'No position'}
                  </option>
                ))}
              </select>
              {errors.employeeId && <div className="error-message">{errors.employeeId}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="reviewer">
                <FaUserCheck /> Reviewer
              </label>
              <select
                id="reviewer"
                value={reviewerId}
                onChange={(e) => setReviewerId(e.target.value)}
                className={errors.reviewerId ? 'error' : ''}
              >
                <option value="">Select Reviewer</option>
                {employees.map(employee => (
                  <option key={employee._id} value={employee._id}>
                    {employee.firstName} {employee.lastName} - {employee.position.title || 'No position'}
                  </option>
                ))}
              </select>
              {errors.reviewerId && <div className="error-message">{errors.reviewerId}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="dueDate">
                <FaCalendarAlt /> Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={errors.dueDate ? 'error' : ''}
              />
              {errors.dueDate && <div className="error-message">{errors.dueDate}</div>}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="reviewPeriodStart">Review Period Start</label>
                <input
                  type="date"
                  id="reviewPeriodStart"
                  value={reviewPeriodStart}
                  onChange={(e) => setReviewPeriodStart(e.target.value)}
                  className={errors.reviewPeriodStart ? 'error' : ''}
                />
                {errors.reviewPeriodStart && <div className="error-message">{errors.reviewPeriodStart}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="reviewPeriodEnd">Review Period End</label>
                <input
                  type="date"
                  id="reviewPeriodEnd"
                  value={reviewPeriodEnd}
                  onChange={(e) => setReviewPeriodEnd(e.target.value)}
                  className={errors.reviewPeriodEnd ? 'error' : ''}
                />
                {errors.reviewPeriodEnd && <div className="error-message">{errors.reviewPeriodEnd}</div>}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="notes">Notes (Optional)</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional instructions or context for this review..."
                rows={3}
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Assign Template
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AssignTemplateModal;