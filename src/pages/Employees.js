import React, { useState, useEffect } from 'react';
import { useDepartments } from '../context/DepartmentContext';
import EmployeeForm from '../components/EmployeeForm'; // Import the EmployeeForm component

function Employees() {
  const { departments, employees, setEmployees } = useDepartments();
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null); // Use null for no employee
  const [isEditing, setIsEditing] = useState(false);

  // Define the API base URL based on environment
  const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? ''  // Empty string for development (uses relative paths)
    : 'https://performance-review-backend-ab8z.onrender.com';

  // Fetch employees on component mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/employees`);
        if (!response.ok) throw new Error('Failed to fetch employees');
        const data = await response.json();
        setEmployees(data);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };
    fetchEmployees();
  }, [setEmployees, API_BASE_URL]);

  // Filter employees based on search query and department
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch =
      searchQuery === '' ||
      emp.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment =
      selectedDepartment === '' || emp.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const openAddEmployeeModal = () => {
    setCurrentEmployee(null); // Clear current employee for adding
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleSaveEmployee = async (employeeData) => {
    try {
      if (isEditing) {
        // Update existing employee
        const response = await fetch(`${API_BASE_URL}/api/employees/${employeeData._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(employeeData),
        });
        if (!response.ok) throw new Error('Failed to update employee');
        const updatedEmployee = await response.json();
        setEmployees(employees.map(emp => (emp._id === updatedEmployee._id ? updatedEmployee : emp)));
      } else {
        // Add new employee
        const response = await fetch(`${API_BASE_URL}/api/employees`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(employeeData),
        });
        if (!response.ok) throw new Error('Failed to add employee');
        const newEmployee = await response.json();
        setEmployees([...employees, newEmployee]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('An error occurred while saving the employee.');
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/employees/${employeeId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete employee');
        const updatedEmployees = employees.filter(emp => emp._id !== employeeId);
        setEmployees(updatedEmployees);
      } catch (error) {
        console.error('Error deleting employee:', error);
        alert('An error occurred while deleting the employee.');
      }
    }
  };

  return (
    <div className="employees-container">
      <div className="employees-header">
        <h1>Employees</h1>
        <button onClick={openAddEmployeeModal} className="add-employee-btn">
          Add Employee
        </button>
      </div>
      <div className="filters">
        <select
          value={selectedDepartment}
          onChange={e => setSelectedDepartment(e.target.value)}
        >
          <option value="">All Departments</option>
          {departments.map(dept => (
            <option key={dept._id} value={dept.name}>
              {dept.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search employees..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="employee-grid">
        <div className="grid-header">
          <div>Name</div>
          <div>Email</div>
          <div>Department</div>
          <div>Role</div>
          <div>Actions</div>
        </div>
        {filteredEmployees.map(emp => (
          <div key={emp._id} className="grid-row">
            <div>{emp.firstName} {emp.lastName}</div>
            <div>{emp.email}</div>
            <div>{emp.department}</div>
            <div>{emp.role}</div>
            <div>
              <button
                onClick={() => { setIsEditing(true); setCurrentEmployee(emp); setIsModalOpen(true); }}
              >
                Edit
              </button>
              <button onClick={() => handleDeleteEmployee(emp._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      {isModalOpen && (
        <div className="modal">
          <EmployeeForm
            employee={currentEmployee}
            onSave={handleSaveEmployee}
            onCancel={() => setIsModalOpen(false)}
          />
        </div>
      )}
    </div>
  );
}

export default Employees;