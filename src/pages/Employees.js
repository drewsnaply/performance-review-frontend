import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Employees.css';
import { 
  MdEdit, 
  MdDelete, 
  MdLock, 
  MdPersonAdd, 
  MdVisibility, 
  MdVisibilityOff, 
  MdSearch, 
  MdClose, 
  MdAdd,
  MdArrowUpward,
  MdArrowDownward
} from 'react-icons/md';

function Employees() {
  const { currentUser } = useAuth();
  
  // State for employee data
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for UI controls
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // State for employee form
  const [isCreatingEmployee, setIsCreatingEmployee] = useState(false);
  const [isEditingEmployee, setIsEditingEmployee] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState('personal');
  const [showPassword, setShowPassword] = useState(false);
  
  // State for storing form data
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
    phone: '',
    title: '',
    department: '',
    status: 'active',
    hireDate: '',
    salary: '',
    street: '',
    street2: '',
    city: '',
    state: '',
    zip: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    password: '',
    notes: '',
    dateOfBirth: '',
    ssn: '',
    gender: '',
    maritalStatus: '',
    education: '',
    startDate: '',
    position: '',
    manager: '',
    workLocation: '',
    employmentType: 'full-time',
    payType: 'salary',
    payRate: '',
    payFrequency: 'biweekly',
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    healthInsurance: false,
    dentalInsurance: false,
    visionInsurance: false,
    retirement401k: false,
    ptoAllowance: '',
    sickDaysAllowance: ''
  });
  
  // State for form validation
  const [formErrors, setFormErrors] = useState({});
  
  // Fetch employees data from API
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        // Use a timeout to simulate API call
        setTimeout(() => {
          // Mock data for testing
          const mockEmployees = [
            { 
              id: '1',
              employeeId: 'EMP001',
              name: 'John Doe', 
              email: 'john.doe@example.com',
              phone: '555-123-4567',
              title: 'Senior Developer',
              department: 'Engineering',
              status: 'active',
              hireDate: '2022-03-15',
              salary: '85000',
              street: '123 Main St',
              street2: 'Apt 4B',
              city: 'Anytown',
              state: 'CA',
              zip: '90210',
              emergencyContactName: 'Jane Doe',
              emergencyContactPhone: '555-987-6543',
              emergencyContactRelation: 'Spouse',
              notes: 'Team lead for Project X'
            },
            { 
              id: '2',
              employeeId: 'EMP002',
              name: 'Jane Smith', 
              email: 'jane.smith@example.com',
              phone: '555-234-5678',
              title: 'Marketing Manager',
              department: 'Marketing',
              status: 'on_leave',
              hireDate: '2021-06-22',
              salary: '78000',
              street: '456 Oak Ave',
              street2: '',
              city: 'Somewhere',
              state: 'NY',
              zip: '10001',
              emergencyContactName: 'John Smith',
              emergencyContactPhone: '555-876-5432',
              emergencyContactRelation: 'Spouse',
              notes: 'On maternity leave until July 2023'
            },
            { 
              id: '3',
              employeeId: 'EMP003',
              name: 'Robert Johnson', 
              email: 'robert.johnson@example.com',
              phone: '555-345-6789',
              title: 'Financial Analyst',
              department: 'Finance',
              status: 'active',
              hireDate: '2023-01-10',
              salary: '72000',
              street: '789 Pine St',
              street2: 'Suite 300',
              city: 'Anytown',
              state: 'CA',
              zip: '90210',
              emergencyContactName: 'Sarah Johnson',
              emergencyContactPhone: '555-765-4321',
              emergencyContactRelation: 'Sister',
              notes: 'Handles quarterly reporting'
            }
          ];
          
          setEmployees(mockEmployees);
          setError(null);
          setLoading(false);
        }, 500);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError(err.message || 'Failed to fetch employees');
        setLoading(false);
      }
    };
    
    fetchEmployees();
  }, []);
  
  // Extract unique departments for filtering
  const departments = [...new Set(employees.map(emp => emp.department))].filter(Boolean);
  
  // Filter employees based on active tab and search query
  const filteredEmployees = employees.filter(employee => {
    // Filter by status tab
    if (activeTab !== 'all' && employee.status !== activeTab) {
      return false;
    }
    
    // Filter by department
    if (departmentFilter !== 'all' && employee.department !== departmentFilter) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        employee.name.toLowerCase().includes(query) ||
        employee.email.toLowerCase().includes(query) ||
        employee.title.toLowerCase().includes(query) ||
        employee.department.toLowerCase().includes(query) ||
        employee.employeeId.toLowerCase().includes(query)
      );
    }
    
    return true;
  });
  
  // Sort employees based on the selected field and direction
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    let aValue = a[sortField] || '';
    let bValue = b[sortField] || '';
    
    // Handle string comparison
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
  
  // Handle sort column clicking
  const handleSort = (field) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Generate a random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    setFormData(prev => ({ ...prev, password }));
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  // Validate form data
  const validateForm = () => {
    const errors = {};
    
    // Validate required fields
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    if (!formData.title.trim()) errors.title = 'Job title is required';
    if (!formData.department.trim()) errors.department = 'Department is required';
    
    // Validate address fields
    if (!formData.street.trim()) errors.street = 'Street address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.zip.trim()) errors.zip = 'ZIP code is required';
    
    // Validate if creating new employee
    if (isCreatingEmployee && !formData.password) {
      errors.password = 'Password is required for new employees';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle employee creation
  const handleCreateEmployee = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      // Generate a new employee ID if not provided
      const employeeId = formData.employeeId || `EMP${Date.now().toString().slice(-6)}`;
      
      // For testing UI - simulate successful creation
      const newEmployee = {
        ...formData,
        id: Date.now().toString(),
        employeeId: employeeId
      };
      
      setEmployees(prev => [...prev, newEmployee]);
      
      // Reset form data
      setFormData({
        employeeId: '',
        name: '',
        email: '',
        phone: '',
        title: '',
        department: '',
        status: 'active',
        hireDate: '',
        salary: '',
        street: '',
        street2: '',
        city: '',
        state: '',
        zip: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelation: '',
        password: '',
        notes: '',
        dateOfBirth: '',
        ssn: '',
        gender: '',
        maritalStatus: '',
        education: '',
        startDate: '',
        position: '',
        manager: '',
        workLocation: '',
        employmentType: 'full-time',
        payType: 'salary',
        payRate: '',
        payFrequency: 'biweekly',
        bankName: '',
        accountNumber: '',
        routingNumber: '',
        healthInsurance: false,
        dentalInsurance: false,
        visionInsurance: false,
        retirement401k: false,
        ptoAllowance: '',
        sickDaysAllowance: ''
      });
      
      setIsCreatingEmployee(false);
      setActiveFormTab('personal');
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('Error creating employee:', err);
      setError(err.message || 'Failed to create employee');
      setLoading(false);
    }
  };
  
  // Handle employee update
  const handleUpdateEmployee = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      // For testing UI - simulate successful update
      setEmployees(prev => 
        prev.map(emp => (emp.id === formData.id ? formData : emp))
      );
      
      // Reset form data
      setFormData({
        employeeId: '',
        name: '',
        email: '',
        phone: '',
        title: '',
        department: '',
        status: 'active',
        hireDate: '',
        salary: '',
        street: '',
        street2: '',
        city: '',
        state: '',
        zip: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelation: '',
        password: '',
        notes: '',
        dateOfBirth: '',
        ssn: '',
        gender: '',
        maritalStatus: '',
        education: '',
        startDate: '',
        position: '',
        manager: '',
        workLocation: '',
        employmentType: 'full-time',
        payType: 'salary',
        payRate: '',
        payFrequency: 'biweekly',
        bankName: '',
        accountNumber: '',
        routingNumber: '',
        healthInsurance: false,
        dentalInsurance: false,
        visionInsurance: false,
        retirement401k: false,
        ptoAllowance: '',
        sickDaysAllowance: ''
      });
      
      setIsEditingEmployee(false);
      setActiveFormTab('personal');
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('Error updating employee:', err);
      setError(err.message || 'Failed to update employee');
      setLoading(false);
    }
  };
  
  // Handle employee deletion
  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      // For testing UI - simulate successful deletion
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('Error deleting employee:', err);
      setError(err.message || 'Failed to delete employee');
      setLoading(false);
    }
  };
  
  // Handle editing an employee
  const handleEditEmployee = (employee) => {
    setFormData({
      ...employee,
      // Ensure password is empty when editing
      password: ''
    });
    
    setIsEditingEmployee(true);
    setActiveFormTab('personal');
  };
  
  // Cancel form and return to list view
  const handleCancelForm = () => {
    // Reset form data
    setFormData({
      employeeId: '',
      name: '',
      email: '',
      phone: '',
      title: '',
      department: '',
      status: 'active',
      hireDate: '',
      salary: '',
      street: '',
      street2: '',
      city: '',
      state: '',
      zip: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelation: '',
      password: '',
      notes: '',
      dateOfBirth: '',
      ssn: '',
      gender: '',
      maritalStatus: '',
      education: '',
      startDate: '',
      position: '',
      manager: '',
      workLocation: '',
      employmentType: 'full-time',
      payType: 'salary',
      payRate: '',
      payFrequency: 'biweekly',
      bankName: '',
      accountNumber: '',
      routingNumber: '',
      healthInsurance: false,
      dentalInsurance: false,
      visionInsurance: false,
      retirement401k: false,
      ptoAllowance: '',
      sickDaysAllowance: ''
    });
    
    // Reset UI state
    setIsCreatingEmployee(false);
    setIsEditingEmployee(false);
    setActiveFormTab('personal');
    setFormErrors({});
  };
  
  // Render employee form
  const renderEmployeeForm = () => {
    return (
      <div className="employee-form-container">
        <h2 className="form-title">
          {isCreatingEmployee ? 'Add New Employee' : 'Edit Employee'}
        </h2>
        
        <div className="form-tabs">
          <button 
            className={`form-tab ${activeFormTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveFormTab('personal')}
          >
            Personal Info
          </button>
          <button 
            className={`form-tab ${activeFormTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveFormTab('contact')}
          >
            Contact Details
          </button>
          <button 
            className={`form-tab ${activeFormTab === 'job' ? 'active' : ''}`}
            onClick={() => setActiveFormTab('job')}
          >
            Job Details
          </button>
          <button 
            className={`form-tab ${activeFormTab === 'compensation' ? 'active' : ''}`}
            onClick={() => setActiveFormTab('compensation')}
          >
            Compensation
          </button>
          <button 
            className={`form-tab ${activeFormTab === 'benefits' ? 'active' : ''}`}
            onClick={() => setActiveFormTab('benefits')}
          >
            Benefits
          </button>
          <button 
            className={`form-tab ${activeFormTab === 'additional' ? 'active' : ''}`}
            onClick={() => setActiveFormTab('additional')}
          >
            Additional Info
          </button>
        </div>
        
        <div className="form-content">
          {activeFormTab === 'personal' && (
            <div className="form-section">
              <div className="form-group">
                <label htmlFor="employeeId">Employee ID</label>
                <input
                  type="text"
                  id="employeeId"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  placeholder="e.g. EMP001 (Auto-generated if left blank)"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={formErrors.name ? 'error' : ''}
                />
                {formErrors.name && <div className="error-message">{formErrors.name}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="ssn">Social Security Number</label>
                <input
                  type="text"
                  id="ssn"
                  name="ssn"
                  value={formData.ssn}
                  onChange={handleInputChange}
                  placeholder="XXX-XX-XXXX"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="maritalStatus">Marital Status</label>
                <select
                  id="maritalStatus"
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleInputChange}
                >
                  <option value="">Select Status</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="education">Education Level</label>
                <select
                  id="education"
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                >
                  <option value="">Select Education</option>
                  <option value="high-school">High School</option>
                  <option value="associate">Associate's Degree</option>
                  <option value="bachelor">Bachelor's Degree</option>
                  <option value="master">Master's Degree</option>
                  <option value="phd">PhD or Doctorate</option>
                </select>
              </div>
              
              {isCreatingEmployee && (
                <div className="form-group password-group">
                  <label htmlFor="password">
                    Password {isCreatingEmployee && '*'}
                  </label>
                  <div className="password-input-container">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={formErrors.password ? 'error' : ''}
                    />
                    <button 
                      type="button" 
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                    </button>
                    <button 
                      type="button" 
                      className="generate-password"
                      onClick={generatePassword}
                    >
                      <MdLock /> Generate
                    </button>
                  </div>
                  {formErrors.password && <div className="error-message">{formErrors.password}</div>}
                </div>
              )}
            </div>
          )}
          
          {activeFormTab === 'contact' && (
            <div className="form-section">
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={formErrors.email ? 'error' : ''}
                />
                {formErrors.email && <div className="error-message">{formErrors.email}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(555) 123-4567"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="street">Street Address *</label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  className={formErrors.street ? 'error' : ''}
                />
                {formErrors.street && <div className="error-message">{formErrors.street}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="street2">Street Address Line 2</label>
                <input
                  type="text"
                  id="street2"
                  name="street2"
                  value={formData.street2}
                  onChange={handleInputChange}
                  placeholder="Apartment, suite, unit, building, floor, etc."
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="city">City *</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={formErrors.city ? 'error' : ''}
                />
                {formErrors.city && <div className="error-message">{formErrors.city}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="state">State/Province *</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className={formErrors.state ? 'error' : ''}
                />
                {formErrors.state && <div className="error-message">{formErrors.state}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="zip">ZIP/Postal Code *</label>
                <input
                  type="text"
                  id="zip"
                  name="zip"
                  value={formData.zip}
                  onChange={handleInputChange}
                  className={formErrors.zip ? 'error' : ''}
                />
                {formErrors.zip && <div className="error-message">{formErrors.zip}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="emergencyContactName">Emergency Contact Name</label>
                <input
                  type="text"
                  id="emergencyContactName"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="emergencyContactPhone">Emergency Contact Phone</label>
                <input
                  type="tel"
                  id="emergencyContactPhone"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleInputChange}
                  placeholder="(555) 123-4567"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="emergencyContactRelation">Relationship to Employee</label>
                <input
                  type="text"
                  id="emergencyContactRelation"
                  name="emergencyContactRelation"
                  value={formData.emergencyContactRelation}
                  onChange={handleInputChange}
                  placeholder="Spouse, Parent, Sibling, etc."
                />
              </div>
            </div>
          )}
          
          {activeFormTab === 'job' && (
            <div className="form-section">
              <div className="form-group">
                <label htmlFor="title">Job Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={formErrors.title ? 'error' : ''}
                />
                {formErrors.title && <div className="error-message">{formErrors.title}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="position">Position</label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="department">Department *</label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className={formErrors.department ? 'error' : ''}
                  list="department-list"
                />
                <datalist id="department-list">
                  {departments.map(dept => (
                    <option key={dept} value={dept} />
                  ))}
                </datalist>
                {formErrors.department && <div className="error-message">{formErrors.department}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="manager">Manager</label>
                <input
                  type="text"
                  id="manager"
                  name="manager"
                  value={formData.manager}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="workLocation">Work Location</label>
                <input
                  type="text"
                  id="workLocation"
                  name="workLocation"
                  value={formData.workLocation}
                  onChange={handleInputChange}
                  placeholder="Office, Remote, Hybrid, etc."
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="status">Employment Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="active">Active</option>
                  <option value="on_leave">On Leave</option>
                  <option value="probation">Probation</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="employmentType">Employment Type</label>
                <select
                  id="employmentType"
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleInputChange}
                >
                  <option value="full-time">Full-Time</option>
                  <option value="part-time">Part-Time</option>
                  <option value="contract">Contract</option>
                  <option value="temporary">Temporary</option>
                  <option value="intern">Intern</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="startDate">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="hireDate">Hire Date</label>
                <input
                  type="date"
                  id="hireDate"
                  name="hireDate"
                  value={formData.hireDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}
          
          {activeFormTab === 'compensation' && (
            <div className="form-section">
              <div className="form-group">
                <label htmlFor="payType">Pay Type</label>
                <select
                  id="payType"
                  name="payType"
                  value={formData.payType}
                  onChange={handleInputChange}
                >
                  <option value="salary">Salary</option>
                  <option value="hourly">Hourly</option>
                  <option value="commission">Commission</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="payRate">
                  {formData.payType === 'salary' ? 'Annual Salary ($)' : 
                   formData.payType === 'hourly' ? 'Hourly Rate ($)' : 
                   'Commission Rate (%)'}
                </label>
                <input
                  type="number"
                  id="payRate"
                  name="payRate"
                  value={formData.payRate}
                  onChange={handleInputChange}
                  min="0"
                  step={formData.payType === 'salary' ? '1000' : '0.01'}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="payFrequency">Pay Frequency</label>
                <select
                  id="payFrequency"
                  name="payFrequency"
                  value={formData.payFrequency}
                  onChange={handleInputChange}
                >
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-Weekly</option>
                  <option value="semimonthly">Semi-Monthly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="bankName">Bank Name</label>
                <input
                  type="text"
                  id="bankName"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="accountNumber">Account Number</label>
                <input
                  type="text"
                  id="accountNumber"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="routingNumber">Routing Number</label>
                <input
                  type="text"
                  id="routingNumber"
                  name="routingNumber"
                  value={formData.routingNumber}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}
          
          {activeFormTab === 'benefits' && (
            <div className="form-section">
              <div className="form-group checkbox-group">
                <label>Benefits Enrolled</label>
                <div className="checkbox-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="healthInsurance"
                      checked={formData.healthInsurance}
                      onChange={handleCheckboxChange}
                    />
                    Health Insurance
                  </label>
                  
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="dentalInsurance"
                      checked={formData.dentalInsurance}
                      onChange={handleCheckboxChange}
                    />
                    Dental Insurance
                  </label>
                  
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="visionInsurance"
                      checked={formData.visionInsurance}
                      onChange={handleCheckboxChange}
                    />
                    Vision Insurance
                  </label>
                  
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="retirement401k"
                      checked={formData.retirement401k}
                      onChange={handleCheckboxChange}
                    />
                    401(k) Retirement Plan
                  </label>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="ptoAllowance">PTO Allowance (days/year)</label>
                <input
                  type="number"
                  id="ptoAllowance"
                  name="ptoAllowance"
                  value={formData.ptoAllowance}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="sickDaysAllowance">Sick Days Allowance (days/year)</label>
                <input
                  type="number"
                  id="sickDaysAllowance"
                  name="sickDaysAllowance"
                  value={formData.sickDaysAllowance}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
            </div>
          )}
          
          {activeFormTab === 'additional' && (
            <div className="form-section">
              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="4"
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <button 
            type="button"
            className="btn btn-secondary"
            onClick={handleCancelForm}
          >
            Cancel
          </button>
          
          <button 
            type="button"
            className="btn btn-primary"
            onClick={isCreatingEmployee ? handleCreateEmployee : handleUpdateEmployee}
          >
            {isCreatingEmployee ? 'Create Employee' : 'Update Employee'}
          </button>
        </div>
      </div>
    );
  };
  
  // Render employee table with data
  const renderEmployeeTable = () => {
    if (loading) {
      return (
        <div className="employee-loading">
          <p>Loading employees...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="employee-error">
          <p>Error: {error}</p>
        </div>
      );
    }
    
    if (employees.length === 0) {
      return (
        <div className="employee-empty">
          <p>No employees found.</p>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setIsCreatingEmployee(true);
              setActiveFormTab('personal');
            }}
          >
            <MdPersonAdd /> Add Your First Employee
          </button>
        </div>
      );
    }
    
    return (
      <div className="employee-table-container">
        <table className="employee-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('employeeId')}>
                ID {sortField === 'employeeId' && (
                  sortDirection === 'asc' ? <MdArrowUpward /> : <MdArrowDownward />
                )}
              </th>
              <th onClick={() => handleSort('name')}>
                Name {sortField === 'name' && (
                  sortDirection === 'asc' ? <MdArrowUpward /> : <MdArrowDownward />
                )}
              </th>
              <th onClick={() => handleSort('title')}>
                Title {sortField === 'title' && (
                  sortDirection === 'asc' ? <MdArrowUpward /> : <MdArrowDownward />
                )}
              </th>
              <th onClick={() => handleSort('department')}>
                Department {sortField === 'department' && (
                  sortDirection === 'asc' ? <MdArrowUpward /> : <MdArrowDownward />
                )}
              </th>
              <th onClick={() => handleSort('email')}>
                Email {sortField === 'email' && (
                  sortDirection === 'asc' ? <MdArrowUpward /> : <MdArrowDownward />
                )}
              </th>
              <th onClick={() => handleSort('status')}>
                Status {sortField === 'status' && (
                  sortDirection === 'asc' ? <MdArrowUpward /> : <MdArrowDownward />
                )}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedEmployees.map(employee => (
              <tr key={employee.id} className={`status-${employee.status}`}>
                <td>{employee.employeeId}</td>
                <td>{employee.name}</td>
                <td>{employee.title}</td>
                <td>{employee.department}</td>
                <td>{employee.email}</td>
                <td>
                  <span className={`status-badge status-${employee.status}`}>
                    {employee.status === 'active' && 'Active'}
                    {employee.status === 'on_leave' && 'On Leave'}
                    {employee.status === 'probation' && 'Probation'}
                    {employee.status === 'terminated' && 'Terminated'}
                  </span>
                </td>
                <td className="action-buttons">
                  <button 
                    className="btn-icon" 
                    onClick={() => handleEditEmployee(employee)}
                    title="Edit Employee"
                  >
                    <MdEdit />
                  </button>
                  <button 
                    className="btn-icon danger" 
                    onClick={() => handleDeleteEmployee(employee.id)}
                    title="Delete Employee"
                  >
                    <MdDelete />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Handle card click to filter employees
  const handleCardClick = (filterType) => {
    switch(filterType) {
      case 'total':
        setActiveTab('all');
        break;
      case 'active':
        setActiveTab('active');
        break;
      case 'on_leave':
        setActiveTab('on_leave');
        break;
      case 'new':
        // For new this month, we keep the current tab but sort by hire date
        setSortField('hireDate');
        setSortDirection('desc');
        break;
      default:
        setActiveTab('all');
    }
  };
  
  // Render the entire employees page content
  const renderEmployeesContent = () => {
    if (isCreatingEmployee || isEditingEmployee) {
      return renderEmployeeForm();
    }
    
    return (
      <>
        <div className="employees-navbar">
          <div className="search-filter-container">
            <div className="search-box">
              <MdSearch />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="clear-search"
                  onClick={() => setSearchQuery('')}
                >
                  <MdClose />
                </button>
              )}
            </div>
          </div>
          
          <button 
            className="btn btn-primary btn-icon"
            onClick={() => {
              setIsCreatingEmployee(true);
              setActiveFormTab('personal');
            }}
          >
            <MdPersonAdd /> Add Employee
          </button>
        </div>
        
        <div className="employee-stats">
          <div 
            className="stat-card"
            onClick={() => handleCardClick('total')}
            role="button"
            aria-label="View all employees"
            tabIndex="0"
          >
            <h3>Total Employees</h3>
            <p className="stat-value">{employees.length}</p>
          </div>
          <div 
            className="stat-card"
            onClick={() => handleCardClick('active')}
            role="button"
            aria-label="View active employees"
            tabIndex="0"
          >
            <h3>Active</h3>
            <p className="stat-value">{employees.filter(emp => emp.status === 'active').length}</p>
          </div>
          <div 
            className="stat-card"
            onClick={() => handleCardClick('on_leave')}
            role="button"
            aria-label="View employees on leave"
            tabIndex="0"
          >
            <h3>On Leave</h3>
            <p className="stat-value">{employees.filter(emp => emp.status === 'on_leave').length}</p>
          </div>
          <div 
            className="stat-card"
            onClick={() => handleCardClick('new')}
            role="button"
            aria-label="View new employees this month"
            tabIndex="0"
          >
            <h3>New This Month</h3>
            <p className="stat-value">
              {employees.filter(emp => {
                const hireDate = new Date(emp.hireDate);
                const now = new Date();
                return hireDate.getMonth() === now.getMonth() && 
                       hireDate.getFullYear() === now.getFullYear();
              }).length}
            </p>
          </div>
        </div>
        
        {renderEmployeeTable()}
        
        <div className="fixed-action-button">
          <button 
            className="btn btn-primary btn-floating"
            onClick={() => {
              setIsCreatingEmployee(true);
              setActiveFormTab('personal');
            }}
            title="Add Employee"
          >
            <MdAdd />
          </button>
        </div>
      </>
    );
  };
  
  // Main component render
  return (
    <div className="employees-container">
      {renderEmployeesContent()}
    </div>
  );
}

export default Employees;