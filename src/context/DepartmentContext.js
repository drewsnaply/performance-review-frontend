import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const DepartmentContext = createContext();

export const DepartmentProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userLoaded, setUserLoaded] = useState(false);

  // New effect to track when user is loaded
  useEffect(() => {
    if (user) {
      console.log("User loaded in DepartmentContext:", user);
      setUserLoaded(true);
    }
  }, [user]);

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
        setDepartments(departmentsData);

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
        
        // Set empty arrays if fetch fails
        setDepartments([]);
        setEmployees([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  // Updated Role-based permission checking with more debugging
  const canPerformAction = (action) => {
    // Detailed logging for debugging
    console.log('Permission Check:', {
      action: action,
      user: user,
      userRole: user?.role,
      userLoaded: userLoaded
    });

    // First check if user is loaded (for debugging)
    if (!userLoaded) {
      console.log('User not fully loaded yet in canPerformAction');
    }

    // CRITICAL FIX: For admins attempting to add departments, bypass user check
    if (action === 'add_department' || action === 'edit_department') {
      // Get token and directly check role from token if possible
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          // Try to extract role from token payload (if your token structure allows)
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload && (payload.role === 'admin' || payload.role === 'superadmin')) {
            console.log('Admin permission granted from token payload');
            return true;
          }
        } catch (e) {
          console.log('Could not extract role from token:', e);
        }
      }
      
      // Fall back to user object if available
      if (user && (user.role === 'admin' || user.role === 'superadmin')) {
        console.log('Admin permission granted from user object');
        return true;
      }
    }

    if (!user) {
      console.log('No user found, permission denied');
      return false;
    }
    
    const role = user.role;
    
    // Super admin can do anything
    if (role === 'superadmin') {
      console.log('Superadmin, full access granted');
      return true;
    }
    
    // Admin can do most things
    if (role === 'admin') {
      console.log('Admin attempting action:', action);
      
      // Explicitly list all allowed actions for admin
      const adminActions = [
        'view_departments',
        'add_department',  // Make sure add_department is explicitly allowed
        'edit_department',
        'delete_department',
        'manage_admin',
        'view_employees',
        'add_employee',
        'edit_employee'
      ];
      
      if (adminActions.includes(action)) {
        console.log(`Admin action '${action}' permitted`);
        return true;
      }
      
      // Only deny managing superadmin
      if (action === 'manage_superadmin') {
        return false;
      }
      
      // Any other actions default to true for admin
      console.log('Admin action permitted by default');
      return true;
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
        case 'add_department': // Explicitly deny add_department for managers
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
    
    console.log('No specific permission found, access denied');
    return false;
  };

  const addDepartment = async (newDepartment) => {
    console.log('Attempting to add department:', newDepartment);
    console.log('Current user role:', user?.role);
    
    // IMPORTANT: Skip permission check for department creation
    // We'll rely on backend permissions instead
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Making API request to add department');
      const response = await fetch(`${API_BASE_URL}/api/departments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newDepartment)
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('You do not have permission to add departments');
        }
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`Failed to add department: ${errorText}`);
      }

      const addedDepartment = await response.json();
      console.log('Department added successfully:', addedDepartment);
      
      // Update the departments state with the new department
      const departmentData = addedDepartment.data || addedDepartment;
      setDepartments([...departments, departmentData]);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error adding department:', error);
      setError(error.message);
      setIsLoading(false);
      return false;
    }
  };

  const updateDepartment = async (departmentId, updatedData) => {
    console.log('Attempting to update department:', departmentId, updatedData);
    console.log('Current user role:', user?.role);
    
    // IMPORTANT: Skip permission check for department updates
    // We'll rely on backend permissions instead
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Making API request to update department');
      const response = await fetch(`${API_BASE_URL}/api/departments/${departmentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('You do not have permission to update this department');
        }
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`Failed to update department: ${errorText}`);
      }

      const updatedDepartment = await response.json();
      console.log('Department updated successfully:', updatedDepartment);
      
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
          console.log('Handling add_department action with params:', params);
          // Skip permission check for add_department
          result = await addDepartment(params.departmentData);
          break;
        case 'update_department':
          console.log('Handling update_department action with params:', params);
          // Skip permission check for update_department
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
      handleActionWithFeedback,
      userLoaded
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