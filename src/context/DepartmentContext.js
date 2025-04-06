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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Define the API base URL based on environment
  const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000'  // Explicit local server URL
    : 'https://performance-review-backend-ab8z.onrender.com';

  useEffect(() => {
    const fetchData = async () => {
      // Only fetch if authenticated
      if (!isAuthenticated) return;

      setIsLoading(true);
      setError(null);

      try {
        // Get the auth token
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch departments
        const departmentsResponse = await fetch(`${API_BASE_URL}/api/departments`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Departments Fetch Status:', departmentsResponse.status);

        if (!departmentsResponse.ok) {
          const errorText = await departmentsResponse.text();
          console.error('Departments Fetch Error:', errorText);
          throw new Error(`Failed to fetch departments: ${errorText}`);
        }

        const departmentsData = await departmentsResponse.json();
        setDepartments(departmentsData.length > 0 ? departmentsData : DEFAULT_DEPARTMENTS);

        // Fetch employees
        const employeesResponse = await fetch(`${API_BASE_URL}/api/employees`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Employees Fetch Status:', employeesResponse.status);

        if (!employeesResponse.ok) {
          const errorText = await employeesResponse.text();
          console.error('Employees Fetch Error:', errorText);
          throw new Error(`Failed to fetch employees: ${errorText}`);
        }

        const employeesData = await employeesResponse.json();
        
        // Handle different possible response structures
        setEmployees(employeesData.data || employeesData);

        // Log successful data fetch
        console.log('Departments fetched:', departmentsData.length);
        console.log('Employees fetched:', employeesData.length);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        
        // Fallback to default departments if fetch fails
        setDepartments(DEFAULT_DEPARTMENTS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const addDepartment = async (newDepartment) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/api/departments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newDepartment)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add department: ${errorText}`);
      }

      const addedDepartment = await response.json();
      setDepartments([...departments, addedDepartment]);
    } catch (error) {
      console.error('Error adding department:', error);
      // Handle the error, show an error message, etc.
    }
  };

  // Add the missing deleteDepartment function
  const deleteDepartment = async (departmentId) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/api/departments/${departmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete department: ${errorText}`);
      }

      // Update the departments state by removing the deleted department
      setDepartments(departments.filter(dept => dept._id !== departmentId));
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error deleting department:', error);
      setError(error.message);
      setIsLoading(false);
      return false;
    }
  };

  return (
    <DepartmentContext.Provider value={{ 
      departments, 
      setDepartments,
      employees, 
      setEmployees,
      isLoading,
      error,
      addDepartment,
      deleteDepartment // Add the deleteDepartment function to the context
    }}>
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