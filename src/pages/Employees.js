import React, { useState, useEffect, useRef } from 'react';
import { useDepartments } from '../context/DepartmentContext';

function Employees() {
  const { departments, employees, setEmployees } = useDepartments();
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  // Load employees from localStorage and replace custom `id` with `_id` if present
  useEffect(() => {
    const fetchEmployees = async () => {
      const response = await fetch('/api/employees');
      const data = await response.json();
      localStorage.setItem('employees', JSON.stringify(data));
      setEmployees(data);
    };
    fetchEmployees();
  }, []);
  
  

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
    setCurrentEmployee({});
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleSaveEmployee = async () => {
    if (!currentEmployee.firstName || !currentEmployee.lastName) {
      alert('First name and Last name are required.');
      return;
    }
  
    if (isEditing) {
      const response = await fetch(`/api/employees/${currentEmployee._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentEmployee),
      });
      const updatedEmployee = await response.json();
      setEmployees(employees.map(emp => (emp._id === updatedEmployee._id ? updatedEmployee : emp)));
    } else {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentEmployee),
      });
      const newEmployee = await response.json();
      setEmployees([...employees, newEmployee]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteEmployee = async employeeId => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      await fetch(`/api/employees/${employeeId}`, { method: 'DELETE' });
      const updatedEmployees = employees.filter(emp => emp._id !== employeeId);
      setEmployees(updatedEmployees);
      localStorage.setItem('employees', JSON.stringify(updatedEmployees));
    }
  };

  return (
    <div className="employees-container">
      <div className="employees-header">
        <h1>Employees</h1>
        <button onClick={openAddEmployeeModal}>Add Employee</button>
      </div>
      <div className="filters">
        <select value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)}>
          <option value="">All Departments</option>
          {departments.map(dept => (
            <option key={dept._id} value={dept._id}>
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
      <div className="employee-list">
        {filteredEmployees.map(emp => (
          <div key={emp._id} className="employee-item">
            <p>{emp.firstName} {emp.lastName}</p>
            <p>{emp.email}</p>
            <button onClick={() => { setIsEditing(true); setCurrentEmployee(emp); setIsModalOpen(true); }}>
              Edit
            </button>
            <button onClick={() => handleDeleteEmployee(emp._id)}>Delete</button>
          </div>
        ))}
      </div>
      {isModalOpen && (
        <div className="modal">
          <h2>{isEditing ? 'Edit Employee' : 'Add Employee'}</h2>
          <input
            type="text"
            placeholder="First Name"
            value={currentEmployee.firstName || ''}
            onChange={e => setCurrentEmployee({ ...currentEmployee, firstName: e.target.value })}
          />
          <input
            type="text"
            placeholder="Last Name"
            value={currentEmployee.lastName || ''}
            onChange={e => setCurrentEmployee({ ...currentEmployee, lastName: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            value={currentEmployee.email || ''}
            onChange={e => setCurrentEmployee({ ...currentEmployee, email: e.target.value })}
          />
          <button onClick={handleSaveEmployee}>
            {isEditing ? 'Save Changes' : 'Add Employee'}
          </button>
          <button onClick={() => setIsModalOpen(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default Employees;
