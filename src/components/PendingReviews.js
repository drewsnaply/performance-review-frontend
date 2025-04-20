import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEdit, FaCheck } from 'react-icons/fa';

// This version uses no SidebarLayout to prevent admin sidebar from showing
function PendingReviews() {
  const navigate = useNavigate();
  const { user, currentUser, fetchWithAuth } = useAuth(); 
  const [pendingReviews, setPendingReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Create a safe user reference - use current user if available, otherwise use localStorage
  const safeUser = user || currentUser || JSON.parse(localStorage.getItem('user') || '{}');
  
  useEffect(() => {
    const fetchPendingReviews = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetchWithAuth('/api/reviews/pending');
        
        if (response.ok) {
          const data = await response.json();
          setPendingReviews(data);
        } else {
          throw new Error('Failed to fetch pending reviews');
        }
      } catch (error) {
        console.error('Error fetching pending reviews:', error);
        setError('Failed to load pending reviews. Please try again later.');
        
        // Set sample data for development/demo purposes
        setPendingReviews([
          { 
            id: '1', 
            employee: 'John Doe', 
            employeeId: '1001',
            department: 'Engineering',
            position: 'Software Engineer',
            reviewType: 'Annual',
            submissionDate: '2023-04-10',
            status: 'Pending Manager Review',
            reviewPercentComplete: 100,
            overdue: false
          },
          { 
            id: '2', 
            employee: 'Jane Smith', 
            employeeId: '1002',
            department: 'Marketing',
            position: 'Marketing Specialist',
            reviewType: 'Quarterly',
            submissionDate: '2023-04-05',
            status: 'Pending Manager Review',
            reviewPercentComplete: 100,
            overdue: true
          },
          { 
            id: '3', 
            employee: 'Michael Johnson', 
            employeeId: '1003',
            department: 'Sales',
            position: 'Sales Representative',
            reviewType: 'Annual',
            submissionDate: '2023-04-12',
            status: 'In Progress',
            reviewPercentComplete: 75,
            overdue: false
          },
          { 
            id: '4', 
            employee: 'Emily Williams', 
            employeeId: '1004',
            department: 'Human Resources',
            position: 'HR Coordinator',
            reviewType: 'Quarterly',
            submissionDate: '2023-03-28',
            status: 'In Progress',
            reviewPercentComplete: 50,
            overdue: true
          },
          { 
            id: '5', 
            employee: 'David Brown', 
            employeeId: '1005',
            department: 'Finance',
            position: 'Financial Analyst',
            reviewType: 'Annual',
            submissionDate: '2023-04-08',
            status: 'Pending Self-Assessment',
            reviewPercentComplete: 30,
            overdue: false
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPendingReviews();
  }, [fetchWithAuth]);
  
  const handleReviewAction = (reviewId, status) => {
    if (status === 'Pending Manager Review') {
      navigate(`/reviews/${reviewId}`);
    } else {
      navigate(`/reviews/edit/${reviewId}`);
    }
  };
  
  // Filter reviews based on status and search term
  const filteredReviews = pendingReviews.filter(review => {
    const matchesStatus = filterStatus === 'all' || (
      filterStatus === 'overdue' ? review.overdue : 
      review.status.toLowerCase().includes(filterStatus.toLowerCase())
    );
    
    const matchesSearch = review.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          review.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          review.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });
  
  // For manager role, use the manager layout
  if (safeUser.role === 'manager') {
    return (
      <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
        <h1>Pending Reviews</h1>
        
        <div className="pending-reviews-filters">
          <div className="filter-group">
            <input 
              type="text" 
              placeholder="Search employee, department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-group">
            <label>Status:</label>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending manager review">Pending Manager Review</option>
              <option value="in progress">In Progress</option>
              <option value="pending self-assessment">Pending Self-Assessment</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="loading-indicator">Loading pending reviews...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            {filteredReviews.length > 0 ? (
              <div className="pending-reviews-table">
                <table>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Position</th>
                      <th>Review Type</th>
                      <th>Submission Date</th>
                      <th>Status</th>
                      <th>Progress</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReviews.map(review => (
                      <tr key={review.id} className={review.overdue ? 'overdue-row' : ''}>
                        <td>{review.employee}</td>
                        <td>{review.department}</td>
                        <td>{review.position}</td>
                        <td>{review.reviewType}</td>
                        <td>{new Date(review.submissionDate).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-badge ${review.status.toLowerCase().replace(/\s+/g, '-')}`}>
                            {review.status}
                          </span>
                          {review.overdue && <span className="overdue-badge">Overdue</span>}
                        </td>
                        <td>
                          <div className="progress-bar-container">
                            <div 
                              className="progress-bar" 
                              style={{ width: `${review.reviewPercentComplete}%` }}
                            ></div>
                            <span className="progress-text">{review.reviewPercentComplete}%</span>
                          </div>
                        </td>
                        <td>
                          <button 
                            className="action-button"
                            onClick={() => handleReviewAction(review.id, review.status)}
                          >
                            {review.status === 'Pending Manager Review' ? (
                              <>
                                <FaCheck /> Review
                              </>
                            ) : (
                              <>
                                <FaEdit /> Edit
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-reviews-message">
                No pending reviews match your filters.
              </div>
            )}
          </>
        )}
      </div>
    );
  }
  
  // For other roles, return the standard content without any wrapper
  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Pending Reviews</h1>
      
      <div className="pending-reviews-filters">
        <div className="filter-group">
          <input 
            type="text" 
            placeholder="Search employee, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <label>Status:</label>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending manager review">Pending Manager Review</option>
            <option value="in progress">In Progress</option>
            <option value="pending self-assessment">Pending Self-Assessment</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="loading-indicator">Loading pending reviews...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          {filteredReviews.length > 0 ? (
            <div className="pending-reviews-table">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Position</th>
                    <th>Review Type</th>
                    <th>Submission Date</th>
                    <th>Status</th>
                    <th>Progress</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReviews.map(review => (
                    <tr key={review.id} className={review.overdue ? 'overdue-row' : ''}>
                      <td>{review.employee}</td>
                      <td>{review.department}</td>
                      <td>{review.position}</td>
                      <td>{review.reviewType}</td>
                      <td>{new Date(review.submissionDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge ${review.status.toLowerCase().replace(/\s+/g, '-')}`}>
                          {review.status}
                        </span>
                        {review.overdue && <span className="overdue-badge">Overdue</span>}
                      </td>
                      <td>
                        <div className="progress-bar-container">
                          <div 
                            className="progress-bar" 
                            style={{ width: `${review.reviewPercentComplete}%` }}
                          ></div>
                          <span className="progress-text">{review.reviewPercentComplete}%</span>
                        </div>
                      </td>
                      <td>
                        <button 
                          className="action-button"
                          onClick={() => handleReviewAction(review.id, review.status)}
                        >
                          {review.status === 'Pending Manager Review' ? (
                            <>
                              <FaCheck /> Review
                            </>
                          ) : (
                            <>
                              <FaEdit /> Edit
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-reviews-message">
              No pending reviews match your filters.
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default PendingReviews;