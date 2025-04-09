import React, { useState } from 'react';
import { FaBriefcase, FaBuilding, FaCalendarAlt } from 'react-icons/fa';

const PositionFormModal = ({ isOpen, onClose, onSave, employeeId, departments }) => {
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    startDate: new Date().toISOString().split('T')[0],
    isCurrentPosition: true,
    changeReason: 'Hiring',
    responsibilities: ''
  });
  
  const [errors, setErrors] = useState({});
  
  if (!isOpen) return null;
  
  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Job title is required';
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.changeReason) newErrors.changeReason = 'Reason for change is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Add employee ID to form data
      onSave({
        ...formData,
        employee: employeeId
      });
    }
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Add Position</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="employee-form">
          <div className="form-group">
            <label htmlFor="title">
              <FaBriefcase className="form-icon" /> Job Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? 'input-error' : ''}
              placeholder="Enter job title"
            />
            {errors.title && <div className="error-message">{errors.title}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="department">
              <FaBuilding className="form-icon" /> Department
            </label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className={errors.department ? 'input-error' : ''}
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept._id || dept.id || `dept-${dept.name}`} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
            {errors.department && <div className="error-message">{errors.department}</div>}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">
                <FaCalendarAlt className="form-icon" /> Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={errors.startDate ? 'input-error' : ''}
              />
              {errors.startDate && <div className="error-message">{errors.startDate}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="changeReason">Change Reason</label>
              <select
                id="changeReason"
                name="changeReason"
                value={formData.changeReason}
                onChange={handleChange}
                className={errors.changeReason ? 'input-error' : ''}
              >
                <option value="Hiring">Hiring</option>
                <option value="Promotion">Promotion</option>
                <option value="Lateral Move">Lateral Move</option>
                <option value="Reorganization">Reorganization</option>
                <option value="Demotion">Demotion</option>
                <option value="Other">Other</option>
              </select>
              {errors.changeReason && <div className="error-message">{errors.changeReason}</div>}
            </div>
          </div>
          
          <div className="form-group">
            <label className="checkbox-container">
              <input
                type="checkbox"
                name="isCurrentPosition"
                checked={formData.isCurrentPosition}
                onChange={handleChange}
                id="isCurrentPosition"
              />
              <span className="checkmark"></span>
              This is their current position
            </label>
          </div>
          
          <div className="form-group">
            <label htmlFor="responsibilities">Responsibilities</label>
            <textarea
              id="responsibilities"
              name="responsibilities"
              value={formData.responsibilities}
              onChange={handleChange}
              placeholder="Describe key responsibilities and achievements in this role"
              rows={4}
            />
          </div>
          
          <div className="form-buttons">
            <button type="button" className="button-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="button-primary">
              Save Position
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PositionFormModal;