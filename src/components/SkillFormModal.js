import React, { useState } from 'react';
import { FaGraduationCap, FaCalendarAlt, FaStar } from 'react-icons/fa';

const SkillFormModal = ({ isOpen, onClose, onSave, employeeId }) => {
  const [formData, setFormData] = useState({
    name: '',
    proficiencyLevel: 1,
    yearsOfExperience: 0,
    lastUsed: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  const [errors, setErrors] = useState({});
  
  if (!isOpen) return null;
  
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Skill name is required';
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
        employee: employeeId
      });
    }
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Add Skill</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="employee-form">
          <div className="form-group">
            <label htmlFor="name">
              <FaGraduationCap className="form-icon" /> Skill Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'input-error' : ''}
              placeholder="Enter skill name"
            />
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="proficiencyLevel">
                <FaStar className="form-icon" /> Proficiency Level
              </label>
              <select
                id="proficiencyLevel"
                name="proficiencyLevel"
                value={formData.proficiencyLevel}
                onChange={handleChange}
              >
                {[1, 2, 3, 4, 5].map(level => (
                  <option key={level} value={level}>
                    {level} - {
                      level === 1 ? 'Beginner' :
                      level === 2 ? 'Basic' :
                      level === 3 ? 'Intermediate' :
                      level === 4 ? 'Advanced' :
                      'Expert'
                    }
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="yearsOfExperience">Years of Experience</label>
              <input
                type="number"
                id="yearsOfExperience"
                name="yearsOfExperience"
                value={formData.yearsOfExperience}
                onChange={handleChange}
                min="0"
                placeholder="Years of experience"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="lastUsed">
              <FaCalendarAlt className="form-icon" /> Last Used
            </label>
            <input
              type="date"
              id="lastUsed"
              name="lastUsed"
              value={formData.lastUsed}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="notes">Additional Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Optional additional notes about the skill"
              rows={4}
            />
          </div>
          
          <div className="form-buttons">
            <button type="button" className="button-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="button-primary">
              Save Skill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SkillFormModal;