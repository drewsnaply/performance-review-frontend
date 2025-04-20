import React, { useState, useEffect } from 'react';
import { useDepartments } from '../context/DepartmentContext';
import EmployeeForm from '../components/EmployeeForm';
import { FaEdit, FaTrash, FaUserPlus, FaSearch, FaKey, FaSyncAlt, FaEye } from 'react-icons/fa';
import '../styles/Employees.css';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// IMPORTANT: Removed the SidebarLayout import - this was causing the double sidebar

function Employees() {
  const { departments, employees, setEmployees } = useDepartments();
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetUserId, setResetUserId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'lastName', direction: 'ascending' });
  const { currentUser } = useAuth();

  // Removed the user object for SidebarLayout since we're not using it

  // Define the API base URL based on environment
  const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000'  // Explicit local server URL
    : 'https://performance-review-backend-ab8z.onrender.com';

  // Fetch employees on component mount
  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/employees`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Employees Fetch Status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Employees Fetch Error:', errorText);
          throw new Error(`Failed to fetch employees: ${errorText}`);
        }

        const data = await response.json();
        setEmployees(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching employees:', error);
        setError('Failed to load employees. Please try again later.');
        setIsLoading(false);
      }
    };
    fetchEmployees();
  }, [setEmployees]);
  
  // Handle sorting
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Sort employees based on current sort configuration
  const sortedEmployees = React.useMemo(() => {
    let sortableEmployees = [...employees];
    if (sortConfig.key) {
      sortableEmployees.sort((a, b) => {
        // Handle nested properties (e.g., department.name)
        const aValue = sortConfig.key.includes('.')
          ? sortConfig.key.split('.').reduce((obj, key) => obj && obj[key], a)
          : a[sortConfig.key];
        const bValue = sortConfig.key.includes('.')
          ? sortConfig.key.split('.').reduce((obj, key) => obj && obj[key], b)
          : b[sortConfig.key];

        // Handle null or undefined values
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableEmployees;
  }, [employees, sortConfig]);

  // Filter employees based on search query and department
  const filteredEmployees = sortedEmployees.filter(emp => {
    const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
    const matchesSearch =
      searchQuery === '' ||
      fullName.includes(searchQuery.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment =
      selectedDepartment === '' || emp.department === selectedDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const openAddEmployeeModal = () => {
    setCurrentEmployee(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  // Enhanced function to open the edit modal with pre-processed employee data
  const openEditEmployeeModal = (employee) => {
    // Create a deep copy of the employee with explicit job title handling
    const employeeWithFixedFields = {
      ...employee,
      // Ensure jobTitle and title are both set
      jobTitle: employee.jobTitle || employee.title || '',
      title: employee.jobTitle || employee.title || '',
    };
    
    console.log('Original employee data:', employee);
    console.log('Enhanced employee data for editing:', employeeWithFixedFields);
    
    setIsEditing(true);
    setCurrentEmployee(employeeWithFixedFields);
    setIsModalOpen(true);
  };

  const handleSaveEmployee = async (employeeData) => {
    setIsLoading(true);
    try {
      // Log submission data for debugging
      console.log('Raw employee data submitted:', employeeData);
      
      if (isEditing) {
        // Update existing employee
        // Create a new object that ensures all fields are properly set
        const updatedEmployeeData = {
          ...employeeData,
          // Ensure jobTitle is explicitly set
          jobTitle: employeeData.title || employeeData.jobTitle || '',
        };
        
        console.log('Enhanced data for update:', updatedEmployeeData);

        const response = await fetch(`${API_BASE_URL}/api/employees/${employeeData._id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify(updatedEmployeeData),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Update error response:', errorText);
          throw new Error('Failed to update employee');
        }
        
        const updatedEmployee = await response.json();
        console.log('Response from server after update:', updatedEmployee);
        
        // Ensure the job title is preserved in the local state
        if (updatedEmployee.jobTitle || employeeData.title) {
          updatedEmployee.jobTitle = updatedEmployee.jobTitle || employeeData.title;
          updatedEmployee.title = updatedEmployee.jobTitle;
        }
        
        // Update the employees array with the modified employee
        setEmployees(employees.map(emp => 
          (emp._id === updatedEmployee._id ? updatedEmployee : emp)
        ));
      } else {
        // Add new employee with username and password
        const newEmployeeData = {
          ...employeeData,
          // Ensure job title is set consistently
          jobTitle: employeeData.title || employeeData.jobTitle || '',
          // Username handling
          username: employeeData.username || employeeData.email.split('@')[0],
          // Default password settings
          password: 'DefaultPass123!',
          requirePasswordChange: true
        };
        
        console.log('New employee data being sent:', newEmployeeData);
        
        const response = await fetch(`${API_BASE_URL}/api/employees`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify(newEmployeeData),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Create error response:', errorText);
          throw new Error('Failed to add employee');
        }
        
        const newEmployee = await response.json();
        console.log('Response from server after create:', newEmployee);
        
        // Ensure job title is preserved
        if (newEmployee.jobTitle || employeeData.title) {
          newEmployee.jobTitle = newEmployee.jobTitle || employeeData.title;
          newEmployee.title = newEmployee.jobTitle;
        }
        
        setEmployees([...employees, newEmployee]);
      }
      
      setIsModalOpen(false);
      setIsLoading(false);
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('An error occurred while saving the employee.');
      setIsLoading(false);
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/employees/${employeeId}`, { 
          method: 'DELETE',
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to delete employee');
        
        const updatedEmployees = employees.filter(emp => emp._id !== employeeId);
        setEmployees(updatedEmployees);
        setIsLoading(false);
      } catch (error) {
        console.error('Error deleting employee:', error);
        alert('An error occurred while deleting the employee.');
        setIsLoading(false);
      }
    }
  };

  const handlePasswordReset = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password/${userId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to reset password');
      
      alert('Password reset email sent successfully.');
      setShowResetPasswordModal(false);
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('An error occurred while attempting to reset password.');
    }
  };

  const openResetPasswordModal = (userId) => {
    setResetUserId(userId);
    setShowResetPasswordModal(true);
  };

  // Get sorting indicator
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
  };

  // Removed the renderEmployeesContent function and SidebarLayout wrapper

  // Return the content directly
  if (isLoading && employees.length === 0) {
    return <div className="loading-spinner">Loading employees...</div>;
  }

  if (error && employees.length === 0) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="employees-container">
      <div className="employees-header">
        <h1>Employees Management</h1>
        <button 
          onClick={openAddEmployeeModal} 
          className="btn btn-primary add-employee-btn"
        >
          <FaUserPlus /> Add Employee
        </button>
      </div>
      
      <div className="filters-container">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search employees by name, email, role..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="department-filter">
          <select
            value={selectedDepartment}
            onChange={e => setSelectedDepartment(e.target.value)}
            className="department-select"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept._id || dept.id || `dept-${dept.name}`} value={dept.name}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="employee-count">
        Showing {filteredEmployees.length} of {employees.length} employees
      </div>
      
      <div className="employee-table-container">
        <table className="employee-table">
          <thead>
            <tr>
              <th onClick={() => requestSort('lastName')}>
                Name {getSortIndicator('lastName')}
              </th>
              <th onClick={() => requestSort('email')}>
                Email {getSortIndicator('email')}
              </th>
              <th onClick={() => requestSort('username')}>
                Username {getSortIndicator('username')}
              </th>
              <th onClick={() => requestSort('department')}>
                Department {getSortIndicator('department')}
              </th>
              <th onClick={() => requestSort('role')}>
                Role {getSortIndicator('role')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map(emp => (
                <tr key={emp._id || `emp-${emp.email}`}>
                  <td>{emp.firstName} {emp.lastName}</td>
                  <td>{emp.email}</td>
                  <td>{emp.username || emp.email?.split('@')[0]}</td>
                  <td>{emp.department}</td>
                  <td>{emp.role}</td>
                  <td className="actions-cell">
                    <Link 
                      to={`/employees/${emp._id}`}
                      className="btn-action btn-view with-label"
                      title="View Employee Profile"
                    >
                      <FaEye />
                      <span>View</span>
                      <div className="action-tooltip">View Profile</div>
                    </Link>
                    <button
                      className="btn-action btn-edit with-label"
                      onClick={() => openEditEmployeeModal(emp)}
                      title="Edit Employee"
                    >
                      <FaEdit />
                      <span>Edit</span>
                      <div className="action-tooltip">Edit Employee</div>
                    </button>
                    <button 
                      className="btn-action btn-reset with-label"
                      onClick={() => openResetPasswordModal(emp._id)}
                      title="Reset Password"
                    >
                      <FaKey />
                      <span>Reset</span>
                      <div className="action-tooltip">Reset Password</div>
                    </button>
                    <button 
                      className="btn-action btn-delete with-label"
                      onClick={() => handleDeleteEmployee(emp._id)}
                      title="Delete Employee"
                    >
                      <FaTrash />
                      <span>Delete</span>
                      <div className="action-tooltip">Delete Employee</div>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-results">
                  No employees found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>{isEditing ? 'Edit Employee' : 'Add New Employee'}</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <EmployeeForm
              employee={currentEmployee}
              departments={departments}
              isEditing={isEditing}
              onSave={handleSaveEmployee}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
      
      {showResetPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-container reset-password-modal">
            <div className="modal-header">
              <h2>Reset Password</h2>
              <button className="modal-close" onClick={() => setShowResetPasswordModal(false)}>×</button>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to reset this employee's password?</p>
              <p>A password reset link will be sent to their email address.</p>
              <div className="modal-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowResetPasswordModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => handlePasswordReset(resetUserId)}
                >
                  <FaSyncAlt /> Send Reset Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Employees;