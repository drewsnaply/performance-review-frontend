import React, { useState, useEffect } from 'react';
import { useDepartments } from '../context/DepartmentContext';
import '../styles/EmployeeForm.css';
import { FaUserAlt, FaEnvelope, FaBuilding, FaIdBadge, FaCalendarAlt, FaVenusMars, FaUserTag, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

// Utility function to format date consistently
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return '';
    
    // Format to YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

const EmployeeForm = ({ employee, onSave, onCancel }) => {
  const { departments } = useDepartments();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    department: '',
    title: '',
    position: '', // Add position to match the backend schema
    jobTitle: '', // Also include jobTitle for consistency
    role: 'employee',
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
  const [customUsername, setCustomUsername] = useState(false);

  useEffect(() => {
    if (employee) {
      console.log('Employee data received for editing:', employee);
      
      // Get job title from any of the possible fields
      const jobTitle = employee.position || employee.jobTitle || employee.title || '';
      console.log('Job title detected:', jobTitle);
      
      const updatedFormData = {
        ...employee,
        // Ensure all job title fields are set consistently
        title: jobTitle,
        jobTitle: jobTitle,
        position: jobTitle,
        
        // Ensure dates are formatted correctly
        dateOfBirth: formatDateForInput(employee.dateOfBirth) || '',
        hireDate: formatDateForInput(employee.hireDate) || new Date().toISOString().split('T')[0],
        
        // Ensure username is set correctly
        username: employee.username || (employee.email ? employee.email.split('@')[0] : ''),
        
        // Default fallback for role
        role: employee.role || 'employee',
        
        // Set active status
        isActive: employee.isActive !== undefined ? employee.isActive : 
                  (employee.status === 'Active')
      };
      
      console.log('Prepared form data for editing:', updatedFormData);
      setFormData(updatedFormData);
      
      // Check if custom username exists
      if (employee.username && employee.email && 
          employee.username !== employee.email.split('@')[0]) {
        setCustomUsername(true);
      }
    } else {
      // Set default values for new employee
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        department: '',
        title: '',
        position: '',
        jobTitle: '',
        role: 'employee',
        isActive: true,
        hireDate: new Date().toISOString().split('T')[0],
        manager: '',
        dateOfBirth: '',
        employmentType: '',
        contactNumber: '',
        address: '',
        gender: '',
      });
      setCustomUsername(false);
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    // If changing job title field, update all job title related fields
    if (name === 'title') {
      setFormData(prev => ({
        ...prev,
        title: newValue,
        jobTitle: newValue,
        position: newValue
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: newValue }));
    }
    
    // Auto-generate username from email if not custom
    if (name === 'email' && !customUsername) {
      const username = value.split('@')[0];
      setFormData(prev => ({ ...prev, username }));
    }
    
    // Clear validation error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const toggleCustomUsername = () => {
    setCustomUsername(!customUsername);
    if (!customUsername) {
      // Keep current username when enabling custom
    } else {
      // Reset to email-based username when disabling custom
      setFormData(prev => ({
        ...prev,
        username: prev.email ? prev.email.split('@')[0] : ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.includes(' ')) {
      newErrors.username = 'Username cannot contain spaces';
    }
    
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.title.trim()) newErrors.title = 'Job title is required';
    if (!formData.role) newErrors.role = 'Role is required';
    
    // Keep your existing validations
    if (!formData.dateOfBirth.trim()) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.employmentType.trim()) newErrors.employmentType = 'Employment type is required';
    if (!formData.gender.trim()) newErrors.gender = 'Gender is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Ensure all job title fields are set for consistency
      const dataToSave = {
        ...formData,
        title: formData.title,
        jobTitle: formData.title,
        position: formData.title,
        
        // Set status based on isActive
        status: formData.isActive ? 'Active' : 'Inactive'
      };
      
      console.log('Data being sent to onSave:', dataToSave);
      
      onSave(dataToSave);
    }
  };

  return (
    <div className="employee-form-container">
      <h2>{employee ? 'Edit Employee' : 'Add New Employee'}</h2>
      <form onSubmit={handleSubmit} className="employee-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">
              <FaUserAlt className="form-icon" /> First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={errors.firstName ? 'input-error' : ''}
              placeholder="Enter first name"
            />
            {errors.firstName && <div className="error-message">{errors.firstName}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="lastName">
              <FaUserAlt className="form-icon" /> Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={errors.lastName ? 'input-error' : ''}
              placeholder="Enter last name"
            />
            {errors.lastName && <div className="error-message">{errors.lastName}</div>}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">
              <FaEnvelope className="form-icon" /> Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'input-error' : ''}
              placeholder="Enter email address"
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="username">
              <FaUserTag className="form-icon" /> Username
              <span className="custom-toggle">
                <input
                  type="checkbox"
                  id="customUsername"
                  checked={customUsername}
                  onChange={toggleCustomUsername}
                />
                <label htmlFor="customUsername" className="toggle-label">
                  Custom username
                </label>
              </span>
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={errors.username ? 'input-error' : ''}
              placeholder="Username"
              disabled={!customUsername}
            />
            {errors.username && <div className="error-message">{errors.username}</div>}
            {!customUsername && <div className="help-text">Auto-generated from email</div>}
          </div>
        </div>
        
        <div className="form-row">
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
              {departments && departments.map((dept, index) => (
                <option key={dept._id || dept.id || index} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
            {errors.department && <div className="error-message">{errors.department}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="title">
              <FaIdBadge className="form-icon" /> Job Title
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
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="role">
              <FaUserAlt className="form-icon" /> Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={errors.role ? 'input-error' : ''}
            >
              <option value="">Select Role</option>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role && <div className="error-message">{errors.role}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="employmentType">
              <FaIdBadge className="form-icon" /> Employment Type
            </label>
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
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dateOfBirth">
              <FaCalendarAlt className="form-icon" /> Date of Birth
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className={errors.dateOfBirth ? 'input-error' : ''}
            />
            {errors.dateOfBirth && <div className="error-message">{errors.dateOfBirth}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="gender">
              <FaVenusMars className="form-icon" /> Gender
            </label>
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
            <label htmlFor="contactNumber">
              <FaPhone className="form-icon" /> Contact Number
            </label>
            <input
              type="text"
              id="contactNumber"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="Enter contact number"
            />
          </div>
          <div className="form-group">
            <label htmlFor="hireDate">
              <FaCalendarAlt className="form-icon" /> Hire Date
            </label>
            <input
              type="date"
              id="hireDate"
              name="hireDate"
              value={formData.hireDate}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="address">
            <FaMapMarkerAlt className="form-icon" /> Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter address"
          />
        </div>
        
        <div className="form-group">
          <label className="checkbox-container">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            <span className="checkmark"></span>
            Active Employee
          </label>
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