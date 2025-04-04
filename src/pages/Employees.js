import React, { useState, useEffect } from 'react';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState(null);

  // Fetch employees on component mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem('authToken'); // Retrieve the token
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/employees`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in headers
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch employees: ${response.statusText}`);
        }

        const data = await response.json();
        setEmployees(data);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError(err.message);
      }
    };

    fetchEmployees();
  }, []);

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <h1>Employees</h1>
      <ul>
        {employees.map((employee) => (
          <li key={employee.id}>{employee.name}</li> // Ensure key is unique
        ))}
      </ul>
    </div>
  );
};

export default Employees;