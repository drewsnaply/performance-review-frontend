import React, { createContext, useState, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Create a context for departments and employees
const DepartmentContext = createContext();

// Initial default departments
const DEFAULT_DEPARTMENTS = [
    { id: "1", name: 'Engineering', manager: 'Alice Johnson', managerId: 'emp001', description: 'Software development and engineering', status: 'active' },
    { id: "2", name: 'Marketing', manager: 'Bob Smith', managerId: 'emp002', description: 'Marketing and brand management', status: 'active' },
    { id: "3", name: 'Sales', manager: 'Carol Williams', managerId: 'emp003', description: 'Sales and customer relations', status: 'active' },
    { id: "4", name: 'Human Resources', manager: 'David Miller', managerId: 'emp004', description: 'Personnel management', status: 'active' },
    { id: "5", name: 'Finance', manager: 'Eve Davis', managerId: 'emp005', description: 'Financial operations', status: 'active' }
];

// Context Provider Component
export const DepartmentProvider = ({ children }) => {
  const [departments, setDepartments] = useState(() => {
    // Try to get departments from localStorage first
    const savedDepartments = localStorage.getItem('departments');
    
    try {
      const parsedDepartments = savedDepartments ? JSON.parse(savedDepartments) : null;
      
      // If parsed departments exist and have length, use them
      if (parsedDepartments && parsedDepartments.length > 0) {
        console.log('Loaded departments from localStorage:', parsedDepartments);
        return parsedDepartments;
      }
      
      // Otherwise, use default departments
      console.log('Using default departments');
      return DEFAULT_DEPARTMENTS;
    } catch (error) {
      console.error('Error loading departments:', error);
      return DEFAULT_DEPARTMENTS;
    }
  });

  const [employees, setEmployees] = useState(() => {
    try {
      const savedEmployees = localStorage.getItem('employees');
      return savedEmployees ? JSON.parse(savedEmployees) : []; 
    } catch (error) {
      console.error('Error loading employees:', error);
      return []; 
    }
  });

  // Save departments to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('departments', JSON.stringify(departments));
      console.log('Saved departments to localStorage:', departments);
    } catch (error) {
      console.error('Error saving departments:', error);
    }
  }, [departments]);

  // Save employees to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('employees', JSON.stringify(employees));
      console.log('Saved employees to localStorage:', employees);
    } catch (error) {
      console.error('Error saving employees:', error);
    }
  }, [employees]);

  // Existing department methods
  const addDepartment = (department) => {
    // Ensure the new department has an ID
    const newId = department.id || 
      (Math.max(...departments.map(dept => parseInt(dept.id, 10)), 0) + 1).toString();

    const newDepartment = { 
      ...department, 
      id: newId,
      status: department.status || 'active' // Default to active if not specified
    };
    
    // Check if department already exists
    const existingDepartment = departments.find(dept => dept.name === newDepartment.name);
    
    if (existingDepartment) {
      console.warn(`Department ${newDepartment.name} already exists`);
      return existingDepartment;
    }

    const updatedDepartments = [...departments, newDepartment];
    setDepartments(updatedDepartments);
    console.log('Added new department:', newDepartment);
    return newDepartment;
  };

  const updateDepartment = (updatedDepartment) => {
    const updatedDepartments = departments.map(dept => 
      dept.id === updatedDepartment.id ? updatedDepartment : dept
    );
    setDepartments(updatedDepartments);
    console.log('Updated department:', updatedDepartment);
  };

  const deleteDepartment = (id) => {
    const updatedDepartments = departments.filter(dept => dept.id !== id);
    setDepartments(updatedDepartments);
    console.log('Deleted department with id:', id);
  };

  // New employee methods
  const addEmployee = (employee) => {
    const employeeToAdd = {
      ...employee,
      id: employee.id || uuidv4(),
      employeeId: employee.employeeId || `EMP${(employees.length + 1).toString().padStart(3, '0')}`
    };
    
    setEmployees(prevEmployees => [...prevEmployees, employeeToAdd]);
    return employeeToAdd;
  };

  const updateEmployee = (updatedEmployee) => {
    setEmployees(prevEmployees => 
      prevEmployees.map(emp => 
        emp.id === updatedEmployee.id ? updatedEmployee : emp
      )
    );
  };

  const deleteEmployee = (employeeId) => {
    setEmployees(prevEmployees => 
      prevEmployees.filter(emp => emp.id !== employeeId)
    );
  };

  return (
    <DepartmentContext.Provider 
      value={{ 
        departments, 
        setDepartments, 
        addDepartment, 
        updateDepartment, 
        deleteDepartment,
        employees,
        setEmployees,
        addEmployee,
        updateEmployee,
        deleteEmployee
      }}
    >
      {children}
    </DepartmentContext.Provider>
  );
};

// Custom hook to use department context
export const useDepartments = () => {
  const context = useContext(DepartmentContext);
  if (context === undefined) {
    throw new Error('useDepartments must be used within a DepartmentProvider');
  }
  return context;
};

export default DepartmentContext;