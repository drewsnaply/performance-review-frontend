import React, { useState, useEffect } from 'react';
import { useDepartments } from '../context/DepartmentContext';
import '../styles/EmployeeForm.css';
import { 
  FaUserAlt, FaEnvelope, FaBuilding, FaIdBadge, FaCalendarAlt, 
  FaVenusMars, FaUserTag, FaPhone, FaMapMarkerAlt, FaGlobe, 
  FaUserGraduate, FaLanguage, FaPassport, FaPeopleArrows, 
  FaUserFriends, FaIdCard, FaUsers, FaFirstAid
} from 'react-icons/fa';

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
  const [activeTab, setActiveTab] = useState('basic');
  
  // Get current user role from localStorage
  const getCurrentUserRole = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.role;
      }
    } catch (e) {
      console.error('Error getting user role:', e);
    }
    return 'admin'; // Default fallback
  };
  
  const currentUserRole = getCurrentUserRole();
  const isSuperAdmin = currentUserRole === 'superadmin' || currentUserRole === 'super_admin' || currentUserRole === 'super-admin';
  
  const [formData, setFormData] = useState({
    // Basic Info
    firstName: '',
    lastName: '',
    middleName: '',
    preferredName: '',
    email: '',
    username: '',
    
    // Employment Details
    department: '',
    title: '',
    position: '',
    jobTitle: '',
    role: 'employee',
    isActive: true,
    hireDate: new Date().toISOString().split('T')[0],
    manager: '',
    employmentType: '',
    employeeId: '',
    
    // Personal Details
    dateOfBirth: '',
    gender: '',
    pronouns: '',
    maritalStatus: '',
    
    // Contact Information
    contactNumber: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    
    // Additional Info
    ethnicity: '',
    citizenship: '',
    workAuthorization: '',
    visaStatus: '',
    visaExpiryDate: '',
    education: '',
    languages: '',
  });

  const [errors, setErrors] = useState({});
  const [customUsername, setCustomUsername] = useState(false);
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);

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
        visaExpiryDate: formatDateForInput(employee.visaExpiryDate) || '',
        
        // Ensure username is set correctly
        username: employee.username || (employee.email ? employee.email.split('@')[0] : ''),
        
        // Default fallback for role
        role: employee.role || 'employee',
        
        // Set active status
        isActive: employee.isActive !== undefined ? employee.isActive : 
                  (employee.status === 'Active'),
        
        // Initialize emergency contact if it doesn't exist
        emergencyContact: employee.emergencyContact || {
          name: '',
          relationship: '',
          phone: ''
        },
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
        middleName: '',
        preferredName: '',
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
        city: '',
        state: '',
        postalCode: '',
        country: '',
        gender: '',
        pronouns: '',
        maritalStatus: '',
        employeeId: '',
        ethnicity: '',
        citizenship: '',
        workAuthorization: '',
        visaStatus: '',
        visaExpiryDate: '',
        education: '',
        languages: '',
        emergencyContact: {
          name: '',
          relationship: '',
          phone: ''
        }
      });
      setCustomUsername(false);
      setSendWelcomeEmail(true);
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    // Handle nested objects like emergencyContact
    if (name.includes('.')) {
      const [parentKey, childKey] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parentKey]: {
          ...prev[parentKey],
          [childKey]: newValue
        }
      }));
    } else {
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
        status: formData.isActive ? 'Active' : 'Inactive',
        
        // Add send welcome email option if creating a new employee
        sendWelcomeEmail: !employee && sendWelcomeEmail
      };
      
      console.log('Data being sent to onSave:', dataToSave);
      
      onSave(dataToSave);
    }
  };

  return (
    <div className="employee-form-container">
      <div className="employee-form-header">
        <h2>{employee ? 'Edit Employee' : 'Add New Employee'}</h2>
        <p>Enter employee information. Fields marked with * are required.</p>
      </div>
      
      <div className="form-tabs">
        <button 
          type="button"
          className={`tab-button ${activeTab === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          <FaUserAlt className="tab-icon" /> Basic Info
        </button>
        <button 
          type="button"
          className={`tab-button ${activeTab === 'employment' ? 'active' : ''}`}
          onClick={() => setActiveTab('employment')}
        >
          <FaBuilding className="tab-icon" /> Employment
        </button>
        <button 
          type="button"
          className={`tab-button ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          <FaIdCard className="tab-icon" /> Personal
        </button>
        <button 
          type="button"
          className={`tab-button ${activeTab === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          <FaPhone className="tab-icon" /> Contact
        </button>
        <button 
          type="button"
          className={`tab-button ${activeTab === 'additional' ? 'active' : ''}`}
          onClick={() => setActiveTab('additional')}
        >
          <FaUserGraduate className="tab-icon" /> Additional
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="employee-form">
        {/* Basic Information Tab - Now includes address fields */}
        {activeTab === 'basic' && (
          <div className="tab-content">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">
                  <FaUserAlt className="form-icon" /> First Name *
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
                <label htmlFor="middleName">
                  <FaUserAlt className="form-icon" /> Middle Name
                </label>
                <input
                  type="text"
                  id="middleName"
                  name="middleName"
                  value={formData.middleName || ''}
                  onChange={handleChange}
                  placeholder="Enter middle name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName">
                  <FaUserAlt className="form-icon" /> Last Name *
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
                <label htmlFor="preferredName">
                  <FaUserAlt className="form-icon" /> Preferred Name
                </label>
                <input
                  type="text"
                  id="preferredName"
                  name="preferredName"
                  value={formData.preferredName || ''}
                  onChange={handleChange}
                  placeholder="Enter preferred name/nickname"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">
                  <FaEnvelope className="form-icon" /> Email *
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
            
            {/* Address Information Section - Added to Basic Info tab */}
            <div className="form-section-title">
              <FaMapMarkerAlt />
              <span>Address Information</span>
            </div>
            
            <div className="form-row">
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
                  placeholder="Enter street address"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">
                  <FaMapMarkerAlt className="form-icon" /> City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city || ''}
                  onChange={handleChange}
                  placeholder="Enter city"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="state">
                  <FaMapMarkerAlt className="form-icon" /> State/Province
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state || ''}
                  onChange={handleChange}
                  placeholder="Enter state or province"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="postalCode">
                  <FaMapMarkerAlt className="form-icon" /> Postal Code
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode || ''}
                  onChange={handleChange}
                  placeholder="Enter postal code"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="country">
                  <FaGlobe className="form-icon" /> Country
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country || ''}
                  onChange={handleChange}
                  placeholder="Enter country"
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Employment Tab */}
        {activeTab === 'employment' && (
          <div className="tab-content">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="employeeId">
                  <FaIdCard className="form-icon" /> Employee ID
                </label>
                <input
                  type="text"
                  id="employeeId"
                  name="employeeId"
                  value={formData.employeeId || ''}
                  onChange={handleChange}
                  placeholder="Enter employee ID"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="department">
                  <FaBuilding className="form-icon" /> Department *
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
                  <FaIdBadge className="form-icon" /> Job Title *
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
                  <FaUsers className="form-icon" /> Role *
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
                  {/* Only show Super Admin option if current user is a Super Admin */}
                  {isSuperAdmin && (
                    <option value="superadmin">Super Admin</option>
                  )}
                </select>
                {errors.role && <div className="error-message">{errors.role}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="employmentType">
                  <FaIdBadge className="form-icon" /> Employment Type *
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
                  <option value="Temporary">Temporary</option>
                  <option value="Intern">Intern</option>
                  <option value="Consultant">Consultant</option>
                </select>
                {errors.employmentType && <div className="error-message">{errors.employmentType}</div>}
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
            
            {/* Show welcome email option only when creating a new employee */}
            {!employee && (
              <div className="form-group">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    name="sendWelcomeEmail"
                    checked={sendWelcomeEmail}
                    onChange={() => setSendWelcomeEmail(!sendWelcomeEmail)}
                  />
                  <span className="checkmark"></span>
                  Send welcome email with password setup link
                </label>
              </div>
            )}
          </div>
        )}
        
        {/* Personal Tab */}
        {activeTab === 'personal' && (
          <div className="tab-content">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dateOfBirth">
                  <FaCalendarAlt className="form-icon" /> Date of Birth *
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
                  <FaVenusMars className="form-icon" /> Gender *
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
                  <option value="Prefer Not To Say">Prefer Not To Say</option>
                </select>
                {errors.gender && <div className="error-message">{errors.gender}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="pronouns">
                  <FaVenusMars className="form-icon" /> Pronouns
                </label>
                <select
                  id="pronouns"
                  name="pronouns"
                  value={formData.pronouns || ''}
                  onChange={handleChange}
                >
                  <option value="">Select Pronouns</option>
                  <option value="He/Him">He/Him</option>
                  <option value="She/Her">She/Her</option>
                  <option value="They/Them">They/Them</option>
                  <option value="Other">Other</option>
                  <option value="Prefer Not To Say">Prefer Not To Say</option>
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="maritalStatus">
                  <FaPeopleArrows className="form-icon" /> Marital Status
                </label>
                <select
                  id="maritalStatus"
                  name="maritalStatus"
                  value={formData.maritalStatus || ''}
                  onChange={handleChange}
                >
                  <option value="">Select Marital Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Domestic Partnership">Domestic Partnership</option>
                  <option value="Prefer Not To Say">Prefer Not To Say</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="ethnicity">
                  <FaUserFriends className="form-icon" /> Ethnicity
                </label>
                <select
                  id="ethnicity"
                  name="ethnicity"
                  value={formData.ethnicity || ''}
                  onChange={handleChange}
                >
                  <option value="">Select Ethnicity</option>
                  <option value="Asian">Asian</option>
                  <option value="Black or African American">Black or African American</option>
                  <option value="Hispanic or Latino">Hispanic or Latino</option>
                  <option value="Native American">Native American</option>
                  <option value="Pacific Islander">Pacific Islander</option>
                  <option value="White">White</option>
                  <option value="Two or More Races">Two or More Races</option>
                  <option value="Other">Other</option>
                  <option value="Prefer Not To Say">Prefer Not To Say</option>
                </select>
              </div>
            </div>
          </div>
        )}
        
        {/* Contact Tab - Address fields removed, just contact info now */}
        {activeTab === 'contact' && (
          <div className="tab-content">
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
            </div>
            
            <div className="form-section-title">
              <FaFirstAid /> Emergency Contact
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="emergencyContactName">
                  <FaUserAlt className="form-icon" /> Name
                </label>
                <input
                  type="text"
                  id="emergencyContactName"
                  name="emergencyContact.name"
                  value={formData.emergencyContact?.name || ''}
                  onChange={handleChange}
                  placeholder="Enter emergency contact name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="emergencyContactRelationship">
                  <FaUserFriends className="form-icon" /> Relationship
                </label>
                <input
                  type="text"
                  id="emergencyContactRelationship"
                  name="emergencyContact.relationship"
                  value={formData.emergencyContact?.relationship || ''}
                  onChange={handleChange}
                  placeholder="Enter relationship"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="emergencyContactPhone">
                  <FaPhone className="form-icon" /> Phone
                </label>
                <input
                  type="text"
                  id="emergencyContactPhone"
                  name="emergencyContact.phone"
                  value={formData.emergencyContact?.phone || ''}
                  onChange={handleChange}
                  placeholder="Enter emergency contact phone"
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Additional Tab */}
        {activeTab === 'additional' && (
          <div className="tab-content">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="education">
                  <FaUserGraduate className="form-icon" /> Education
                </label>
                <select
                  id="education"
                  name="education"
                  value={formData.education || ''}
                  onChange={handleChange}
                >
                  <option value="">Select Education Level</option>
                  <option value="High School">High School</option>
                  <option value="Associate's Degree">Associate's Degree</option>
                  <option value="Bachelor's Degree">Bachelor's Degree</option>
                  <option value="Master's Degree">Master's Degree</option>
                  <option value="Doctorate">Doctorate</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="languages">
                  <FaLanguage className="form-icon" /> Languages
                </label>
                <input
                  type="text"
                  id="languages"
                  name="languages"
                  value={formData.languages || ''}
                  onChange={handleChange}
                  placeholder="Enter languages (e.g., English, Spanish)"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="citizenship">
                  <FaPassport className="form-icon" /> Citizenship
                </label>
                <input
                  type="text"
                  id="citizenship"
                  name="citizenship"
                  value={formData.citizenship || ''}
                  onChange={handleChange}
                  placeholder="Enter citizenship"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="workAuthorization">
                  <FaIdCard className="form-icon" /> Work Authorization
                </label>
                <select
                  id="workAuthorization"
                  name="workAuthorization"
                  value={formData.workAuthorization || ''}
                  onChange={handleChange}
                >
                  <option value="">Select Work Authorization</option>
                  <option value="US Citizen">US Citizen</option>
                  <option value="Permanent Resident">Permanent Resident</option>
                  <option value="H1B Visa">H1B Visa</option>
                  <option value="L1 Visa">L1 Visa</option>
                  <option value="F1/OPT">F1/OPT</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="visaStatus">
                  <FaPassport className="form-icon" /> Visa Status
                </label>
                <input
                  type="text"
                  id="visaStatus"
                  name="visaStatus"
                  value={formData.visaStatus || ''}
                  onChange={handleChange}
                  placeholder="Enter visa status if applicable"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="visaExpiryDate">
                  <FaCalendarAlt className="form-icon" /> Visa Expiry Date
                </label>
                <input
                  type="date"
                  id="visaExpiryDate"
                  name="visaExpiryDate"
                  value={formData.visaExpiryDate || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        )}
        
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