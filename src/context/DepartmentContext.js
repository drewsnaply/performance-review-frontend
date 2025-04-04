import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const DepartmentContext = createContext();

const DEFAULT_DEPARTMENTS = [
  { id: "1", name: 'Engineering', manager: 'Alice Johnson', description: 'Software development and engineering', status: 'active' },
  { id: "2", name: 'Marketing', manager: 'Bob Smith', description: 'Marketing and brand management', status: 'active' },
  { id: "3", name: 'Sales', manager: 'Carol Williams', description: 'Sales and customer relations', status: 'active' },
  { id: "4", name: 'Human Resources', manager: 'David Miller', description: 'Personnel management', status: 'active' },
  { id: "5", name: 'Finance', manager: 'Eve Davis', description: 'Financial operations', status: 'active' },
];

export const DepartmentProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      try {
        const savedDepartments = localStorage.getItem('departments');
        setDepartments(savedDepartments ? JSON.parse(savedDepartments) : DEFAULT_DEPARTMENTS);
        console.log('Loaded departments:', departments);

        const savedEmployees = localStorage.getItem('employees');
        setEmployees(savedEmployees ? JSON.parse(savedEmployees) : []);
      } catch (error) {
        console.error('Error initializing departments/employees:', error);
        setDepartments(DEFAULT_DEPARTMENTS);
        setEmployees([]);
      }
    }
  }, [isAuthenticated]);

  return (
    <DepartmentContext.Provider value={{ departments, employees }}>
      {children}
    </DepartmentContext.Provider>
  );
};

export const useDepartments = () => {
  const context = useContext(DepartmentContext);
  if (!context) {
    throw new Error('useDepartments must be used within a DepartmentProvider');
  }
  return context;
};

export default DepartmentContext;