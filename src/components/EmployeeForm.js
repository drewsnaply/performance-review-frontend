import React, { useState, useEffect } from 'react';
import { useDepartments } from '../context/DepartmentContext';

const EmployeeForm = ({ employee, onSave, onCancel }) => {
  // Use the departments from context
  const { departments } = useDepartments();

  // Initialize form state with employee data or empty values for new employee
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    title: '', // Changed from 'position' to match the current implementation
    isActive: true,
    hireDate: new Date().toISOString().split('T')[0],
    manager: ''
  });

  const [errors, setErrors] = useState({});

  // Populate form when employee data is provided (for editing)
  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        email: employee.email || '',
        department: employee.department || '',
        title: employee.title || '', // Consistent with form state
        isActive: employee.isActive !== undefined ? employee.isActive : true,
        hireDate: employee.hireDate || new Date().toISOString().split('T')[0],
        manager: employee.manager || ''
      });
    }
  }, [employee]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }
    
    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <div className="employee-form-container">
      <h2>{employee ? 'Edit Employee' : 'Add New Employee'}</h2>
      <form onSubmit={handleSubmit} className="employee-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={errors.firstName ? 'input-error' : ''}
            />
            {errors.firstName && <div className="error-message">{errors.firstName}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={errors.lastName ? 'input-error' : ''}
            />
            {errors.lastName && <div className="error-message">{errors.lastName}</div>}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? 'input-error' : ''}
          />
          {errors.email && <div className="error-message">{errors.email}</div>}
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="department">Department *</label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className={errors.department ? 'input-error' : ''}
              required
            >
              <option value="">Select Department</option>
              {departments && departments.map(dept => (
                <option key={dept.id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
            {errors.department && <div className="error-message">{errors.department}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="title">Job Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? 'input-error' : ''}
              required
            />
            {errors.title && <div className="error-message">{errors.title}</div>}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="hireDate">Hire Date</label>
            <input
              type="date"
              id="hireDate"
              name="hireDate"
              value={formData.hireDate}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              Active Employee
            </label>
          </div>
        </div>
        
        <div className="form-buttons">
          <button type="button" className="button-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="button-primary">
            {employee ? 'Update Employee' : 'Add Employee'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;