// components/Assignments.js (continued)
import React, { useState, useEffect } from 'react';

const Assignments = () => {
  const [templates, setTemplates] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    templateId: '',
    employeeIds: [],
    dueDate: '',
    reviewType: 'self',
    frequency: 'once'
  });
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    // Load templates from localStorage
    const storedTemplates = localStorage.getItem('templates');
    if (storedTemplates) {
      try {
        setTemplates(JSON.parse(storedTemplates));
      } catch (error) {
        console.error('Error parsing templates:', error);
      }
    }

    // Load employees from localStorage
    const storedEmployees = localStorage.getItem('employees');
    if (storedEmployees) {
      try {
        setEmployees(JSON.parse(storedEmployees));
      } catch (error) {
        console.error('Error parsing employees:', error);
      }
    } else {
      // Create default employees if none exist
      const defaultEmployees = [
        { id: '1', firstName: 'andrew', lastName: '', email: 'andrew@example.com', department: 'Engineering' },
        { id: '2', firstName: 'Tom', lastName: '', email: 'tom@example.com', department: 'Sales' }
      ];
      setEmployees(defaultEmployees);
      localStorage.setItem('employees', JSON.stringify(defaultEmployees));
    }

    // Load assignments from localStorage
    const storedAssignments = localStorage.getItem('assignments');
    if (storedAssignments) {
      try {
        setAssignments(JSON.parse(storedAssignments));
      } catch (error) {
        console.error('Error parsing assignments:', error);
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAssignment({ ...newAssignment, [name]: value });
  };

  const handleEmployeeSelection = (e) => {
    const options = e.target.options;
    const selectedEmployees = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedEmployees.push(options[i].value);
      }
    }
    setNewAssignment({ ...newAssignment, employeeIds: selectedEmployees });
  };

  const createAssignments = () => {
    // Create new assignments for each selected employee
    const newAssignments = newAssignment.employeeIds.map(employeeId => {
      const employee = employees.find(emp => emp.id === employeeId);
      const template = templates.find(tmpl => tmpl.id === newAssignment.templateId);
      
      // Create reviews in localStorage
      const review = {
        id: Date.now().toString() + '-' + employeeId,
        employeeId,
        employeeName: `${employee.firstName} ${employee.lastName}`.trim(),
        templateId: newAssignment.templateId,
        reviewCycle: template.title,
        assignedDate: new Date().toISOString(),
        dueDate: newAssignment.dueDate,
        status: 'pending',
        reviewType: newAssignment.reviewType,
        frequency: newAssignment.frequency,
        sections: template.sections.map(section => ({
          ...section,
          questions: section.questions.map(question => ({
            ...question,
            answer: ''
          }))
        }))
      };

      // Add to the reviews in localStorage
      const storedReviews = localStorage.getItem('reviews') || '[]';
      let reviews = [];
      try {
        reviews = JSON.parse(storedReviews);
      } catch (error) {
        console.error('Error parsing reviews:', error);
      }
      reviews.push(review);
      localStorage.setItem('reviews', JSON.stringify(reviews));

      // Create the assignment record
      return {
        id: Date.now().toString() + '-' + employeeId,
        employeeId,
        employeeName: `${employee.firstName} ${employee.lastName}`.trim(),
        templateId: newAssignment.templateId,
        templateTitle: template.title,
        assignedDate: new Date().toISOString(),
        dueDate: newAssignment.dueDate,
        status: 'pending',
        reviewId: review.id,
        reviewType: newAssignment.reviewType,
        frequency: newAssignment.frequency
      };
    });

    // Add to the assignments array
    const updatedAssignments = [...assignments, ...newAssignments];
    setAssignments(updatedAssignments);

    // Save to localStorage
    localStorage.setItem('assignments', JSON.stringify(updatedAssignments));

    // Reset form and hide it
    setNewAssignment({
      templateId: '',
      employeeIds: [],
      dueDate: '',
      reviewType: 'self',
      frequency: 'once'
    });
    setShowCreateForm(false);
  };

  const deleteAssignment = (id, reviewId) => {
    if (window.confirm('Are you sure you want to delete this assignment? This will also delete the associated review.')) {
      // Delete the assignment
      const updatedAssignments = assignments.filter(assignment => assignment.id !== id);
      setAssignments(updatedAssignments);
      localStorage.setItem('assignments', JSON.stringify(updatedAssignments));

      // Delete the associated review
      const storedReviews = localStorage.getItem('reviews') || '[]';
      try {
        let reviews = JSON.parse(storedReviews);
        reviews = reviews.filter(review => review.id !== reviewId);
        localStorage.setItem('reviews', JSON.stringify(reviews));
      } catch (error) {
        console.error('Error parsing or updating reviews:', error);
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Evaluation Assignments</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer'
          }}
        >
          {showCreateForm ? 'Cancel' : 'Create Assignment'}
        </button>
      </div>

      {showCreateForm && (
        <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '2rem' }}>
          <h3 style={{ marginTop: 0 }}>Create New Assignment</h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Select Template:
            </label>
            <select
              name="templateId"
              value={newAssignment.templateId}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '0.25rem',
                border: '1px solid #cbd5e0'
              }}
              required
            >
              <option value="">-- Select a template --</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.title} ({template.type === 'self' ? 'Self Assessment' : 
                                    template.type === 'manager' ? 'Manager Assessment' :
                                    template.type === 'peer' ? 'Peer Review' : '360° Review'})
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Select Employees: (Hold Ctrl/Cmd to select multiple)
            </label>
            <select
              multiple
              value={newAssignment.employeeIds}
              onChange={handleEmployeeSelection}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '0.25rem',
                border: '1px solid #cbd5e0',
                height: '150px'
              }}
              required
            >
              {employees.map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName} ({employee.department})
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Due Date:
            </label>
            <input
              type="date"
              name="dueDate"
              value={newAssignment.dueDate}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '0.25rem',
                border: '1px solid #cbd5e0'
              }}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Review Type:
              </label>
              <select
                name="reviewType"
                value={newAssignment.reviewType}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '0.25rem',
                  border: '1px solid #cbd5e0'
                }}
              >
                <option value="self">Self Assessment</option>
                <option value="manager">Manager Assessment</option>
                <option value="peer">Peer Review</option>
                <option value="360">360° Review</option>
              </select>
            </div>
            
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Frequency:
              </label>
              <select
                name="frequency"
                value={newAssignment.frequency}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '0.25rem',
                  border: '1px solid #cbd5e0'
                }}
              >
                <option value="once">One-time</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="semi-annual">Semi-Annual</option>
                <option value="annual">Annual</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#e2e8f0',
                color: '#4a5568',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                marginRight: '0.75rem'
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={createAssignments}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer'
              }}
            >
              Create Assignments
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: '1.5rem' }}>
        {assignments.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Employee</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Template</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Assigned Date</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Due Date</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Type</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Frequency</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
                    {assignment.employeeName}
                  </td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
                    {assignment.templateTitle}
                  </td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
                    {new Date(assignment.assignedDate).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
                    {new Date(assignment.dueDate).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ 
                      display: 'inline-block',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      backgroundColor: assignment.status === 'pending' ? '#fef3c7' : 
                                       assignment.status === 'completed' ? '#dcfce7' : '#dbeafe',
                      color: assignment.status === 'pending' ? '#92400e' : 
                             assignment.status === 'completed' ? '#166534' : '#1e40af',
                    }}>
                      {assignment.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
                    {assignment.reviewType === 'self' ? 'Self Assessment' : 
                     assignment.reviewType === 'manager' ? 'Manager Assessment' :
                     assignment.reviewType === 'peer' ? 'Peer Review' : '360° Review'}
                  </td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
                    {assignment.frequency === 'once' ? 'One-time' :
                     assignment.frequency === 'monthly' ? 'Monthly' :
                     assignment.frequency === 'quarterly' ? 'Quarterly' :
                     assignment.frequency === 'semi-annual' ? 'Semi-Annual' : 'Annual'}
                  </td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
                    <button
                      onClick={() => deleteAssignment(assignment.id, assignment.reviewId)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#feb2b2',
                        color: '#c53030',
                        border: 'none',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
            <p style={{ color: '#718096' }}>No assignments found. Create your first assignment to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assignments;