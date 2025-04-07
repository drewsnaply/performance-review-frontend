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
  const { user, isAuthenticated } = useAuth();
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

  // Role-based permission checking
  const canPerformAction = (action) => {
    if (!user) return false;
    
    const role = user.role;
    
    // Super admin can do anything
    if (role === 'superadmin') return true;
    
    // Admin can do most things
    if (role === 'admin') {
      return action !== 'manage_superadmin'; // Admins can't manage super admins
    }
    
    // Manager permissions
    if (role === 'manager') {
      switch(action) {
        case 'view_departments':
        case 'view_own_department':
        case 'view_managed_employees':
        case 'edit_department':
        case 'add_employee':
        case 'edit_employee':
          return true;
        case 'delete_department':
        case 'manage_admin':
          return false;
        default:
          return false;
      }
    }
    
    // Employee permissions
    if (role === 'employee') {
      switch(action) {
        case 'view_own_department':
        case 'view_own_data':
          return true;
        default:
          return false;
      }
    }
    
    return false;
  };

  const addDepartment = async (newDepartment) => {
    // Check if user has permission
    if (!canPerformAction('add_department')) {
      setError('You do not have permission to add departments');
      return false;
    }
    
    try {
      setIsLoading(true);
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
        if (response.status === 403) {
          throw new Error('You do not have permission to add departments');
        }
        const errorText = await response.text();
        throw new Error(`Failed to add department: ${errorText}`);
      }

      const addedDepartment = await response.json();
      setDepartments([...departments, addedDepartment]);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error adding department:', error);
      setError(error.message);
      setIsLoading(false);
      return false;
    }
  };

  const deleteDepartment = async (departmentId) => {
    // Check if user has permission
    if (!canPerformAction('delete_department')) {
      setError('You do not have permission to delete departments');
      return false;
    }
    
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
        if (response.status === 403) {
          throw new Error('You do not have permission to delete departments');
        }
        if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Cannot delete department with active employees');
        }
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

  const updateDepartment = async (departmentId, updatedData) => {
    // Check if user has permission
    if (!canPerformAction('edit_department')) {
      setError('You do not have permission to update departments');
      return false;
    }
    
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/api/departments/${departmentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('You do not have permission to update this department');
        }
        const errorText = await response.text();
        throw new Error(`Failed to update department: ${errorText}`);
      }

      const updatedDepartment = await response.json();
      
      // Update departments state with the updated department
      setDepartments(departments.map(dept => 
        dept._id === departmentId ? updatedDepartment : dept
      ));
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error updating department:', error);
      setError(error.message);
      setIsLoading(false);
      return false;
    }
  };

  const assignManager = async (departmentId, managerId) => {
    // Check if user has permission
    if (!canPerformAction('edit_department')) {
      setError('You do not have permission to assign department managers');
      return false;
    }
    
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/api/departments/${departmentId}/manager`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ managerId })
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('You do not have permission to assign department managers');
        }
        const errorText = await response.text();
        throw new Error(`Failed to assign department manager: ${errorText}`);
      }

      const result = await response.json();
      
      // Update departments state with the updated department
      setDepartments(departments.map(dept => 
        dept._id === departmentId ? result.data.department : dept
      ));
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error assigning department manager:', error);
      setError(error.message);
      setIsLoading(false);
      return false;
    }
  };

  // Function to display user-friendly error messages for department actions
  const handleActionWithFeedback = async (action, params = {}) => {
    setError(null);
    setIsLoading(true);
    
    try {
      let result;
      
      switch (action) {
        case 'add_department':
          result = await addDepartment(params.departmentData);
          break;
        case 'update_department':
          result = await updateDepartment(params.departmentId, params.departmentData);
          break;
        case 'delete_department':
          result = await deleteDepartment(params.departmentId);
          break;
        case 'assign_manager':
          result = await assignManager(params.departmentId, params.managerId);
          break;
        default:
          throw new Error('Unknown action');
      }
      
      setIsLoading(false);
      return result;
    } catch (error) {
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
      deleteDepartment,
      updateDepartment,
      assignManager,
      canPerformAction,
      handleActionWithFeedback
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