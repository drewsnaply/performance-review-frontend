import React, { useState, useEffect } from 'react';
import { useDepartments } from '../context/DepartmentContext';
import '../styles/EmployeeForm.css';

const EmployeeForm = ({ employee, onSave, onCancel }) => {
  const { departments } = useDepartments();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    title: '',
    isActive: true,
    hireDate: new Date().toISOString().split('T')[0],
    manager: '',
    dateOfBirth: '',
    employmentType: '',
    contactNumber: '',
    address: '',
    gender: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        email: employee.email || '',
        department: employee.department || '',
        title: employee.title || '',
        isActive: employee.isActive !== undefined ? employee.isActive : true,
        hireDate: employee.hireDate || new Date().toISOString().split('T')[0],
        manager: employee.manager || '',
        dateOfBirth: employee.dateOfBirth || '',
        employmentType: employee.employmentType || '',
        contactNumber: employee.contactNumber || '',
        address: employee.address || '',
        gender: employee.gender || '',
      });
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    if (!formData.title.trim()) newErrors.title = 'Job title is required';
    if (!formData.dateOfBirth.trim()) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.employmentType.trim()) newErrors.employmentType = 'Employment type is required';
    if (!formData.gender.trim()) newErrors.gender = 'Gender is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Form data being submitted:', formData); // Debugging log
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
            <label htmlFor="department">Department</label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className={errors.department ? 'input-error' : ''}
            >
              <option value="">Select Department</option>
              {departments && departments.map((dept, index) => (
                <option key={dept.id || index} value={dept.name}> {/* Ensure unique keys */}
                  {dept.name}
                </option>
              ))}
            </select>
            {errors.department && <div className="error-message">{errors.department}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="title">Job Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? 'input-error' : ''}
            />
            {errors.title && <div className="error-message">{errors.title}</div>}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dateOfBirth">Date of Birth</label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
            />
            {errors.dateOfBirth && <div className="error-message">{errors.dateOfBirth}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={errors.gender ? 'input-error' : ''}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-Binary">Non-Binary</option>
              <option value="Other">Other</option>
            </select>
            {errors.gender && <div className="error-message">{errors.gender}</div>}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="employmentType">Employment Type</label>
            <select
              id="employmentType"
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              className={errors.employmentType ? 'input-error' : ''}
            >
              <option value="">Select Type</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Contract">Contract</option>
            </select>
            {errors.employmentType && <div className="error-message">{errors.employmentType}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="contactNumber">Contact Number</label>
            <input
              type="text"
              id="contactNumber"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="address">Address</label>
          <input
            type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
          />
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