// src/pages/EmployeeFormPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EmployeeForm from '../components/EmployeeForm';
import { FaArrowLeft } from 'react-icons/fa';
import '../styles/EmployeeFormPage.css';

const EmployeeFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(id ? true : false);
  const [error, setError] = useState(null);
  
  // Define the API base URL based on environment
  const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : 'https://performance-review-backend-ab8z.onrender.com';
  
  useEffect(() => {
    // If editing an existing employee, fetch their data
    if (id) {
      const fetchEmployee = async () => {
        try {
          setLoading(true);
          const response = await fetch(`${API_BASE_URL}/api/employees/${id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch employee data');
          }
          
          const data = await response.json();
          setEmployee(data);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching employee:', error);
          setError(error.message);
          setLoading(false);
        }
      };
      
      fetchEmployee();
    }
  }, [id, API_BASE_URL]);
  
  const handleSave = async (employeeData) => {
    try {
      console.log('Saving employee data:', employeeData);
      setLoading(true);
      
      if (id) {
        // Update existing employee
        const response = await fetch(`${API_BASE_URL}/api/employees/${id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(employeeData)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error updating employee:', errorText);
          throw new Error('Failed to update employee');
        }
        
        // Show success message
        alert('Employee updated successfully');
      } else {
        // Add new employee
        const response = await fetch(`${API_BASE_URL}/api/employees`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(employeeData)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error creating employee:', errorText);
          throw new Error('Failed to add employee');
        }
        
        const result = await response.json();
        
        // Show success message with email status
        if (employeeData.sendWelcomeEmail) {
          if (result.emailSent) {
            alert(`Employee added successfully. Welcome email sent to ${employeeData.email}`);
          } else {
            alert(`Employee added successfully, but the welcome email could not be sent. Please check your email configuration.`);
          }
        } else {
          alert('Employee added successfully');
        }
      }
      
      // Navigate back to employees list
      navigate('/employees');
    } catch (error) {
      console.error('Error saving employee:', error);
      setError(error.message);
      setLoading(false);
      // Show error message
      alert(`Error: ${error.message}`);
    }
  };
  
  const handleCancel = () => {
    navigate('/employees');
  };
  
  if (loading && !employee) {
    return (
      <div className="page-container">
        <div className="loading-indicator">Loading employee data...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="page-container">
        <div className="error-message">Error: {error}</div>
        <button onClick={() => navigate('/employees')} className="back-button">
          <FaArrowLeft /> Back to Employees
        </button>
      </div>
    );
  }
  
  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={handleCancel} className="back-button">
          <FaArrowLeft /> Back to Employees
        </button>
        <h1>{id ? 'Edit Employee' : 'Add New Employee'}</h1>
      </div>
      
      <div className="page-content">
        <EmployeeForm 
          employee={employee}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default EmployeeFormPage;