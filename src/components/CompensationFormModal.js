import React, { useState } from 'react';
import { FaDollarSign, FaCalendarAlt, FaBuilding } from 'react-icons/fa';

const CompensationFormModal = ({ isOpen, onClose, onSave, employeeId }) => {
  const [formData, setFormData] = useState({
    salary: '',
    salaryType: 'Annual',
    currency: 'USD',
    effectiveDate: new Date().toISOString().split('T')[0],
    reason: 'Annual Adjustment',
    notes: ''
  });
  
  const [errors, setErrors] = useState({});
  
  if (!isOpen) return null;
  
  const validateForm = () => {
    const newErrors = {};
    if (!formData.salary || isNaN(parseFloat(formData.salary))) {
      newErrors.salary = 'Valid salary is required';
    }
    if (!formData.effectiveDate) {
      newErrors.effectiveDate = 'Effective date is required';
    }
    if (!formData.reason) {
      newErrors.reason = 'Reason is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave({
        ...formData,
        employee: employeeId,
        salary: parseFloat(formData.salary)
      });
    }
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Add Compensation Record</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="employee-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="salary">
                <FaDollarSign className="form-icon" /> Salary
              </label>
              <input
                type="number"
                id="salary"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                className={errors.salary ? 'input-error' : ''}
                placeholder="Enter salary amount"
              />
              {errors.salary && <div className="error-message">{errors.salary}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="salaryType">Salary Type</label>
              <select
                id="salaryType"
                name="salaryType"
                value={formData.salaryType}
                onChange={handleChange}
              >
                <option value="Annual">Annual</option>
                <option value="Monthly">Monthly</option>
                <option value="Hourly">Hourly</option>
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="effectiveDate">
                <FaCalendarAlt className="form-icon" /> Effective Date
              </label>
              <input
                type="date"
                id="effectiveDate"
                name="effectiveDate"
                value={formData.effectiveDate}
                onChange={handleChange}
                className={errors.effectiveDate ? 'input-error' : ''}
              />
              {errors.effectiveDate && <div className="error-message">{errors.effectiveDate}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="reason">Change Reason</label>
              <select
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className={errors.reason ? 'input-error' : ''}
              >
                <option value="Annual Adjustment">Annual Adjustment</option>
                <option value="Promotion">Promotion</option>
                <option value="Merit Increase">Merit Increase</option>
                <option value="Market Adjustment">Market Adjustment</option>
                <option value="Other">Other</option>
              </select>
              {errors.reason && <div className="error-message">{errors.reason}</div>}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="notes">Additional Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Optional additional notes about this compensation change"
              rows={4}
            />
          </div>
          
          <div className="form-buttons">
            <button type="button" className="button-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="button-primary">
              Save Compensation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompensationFormModal;