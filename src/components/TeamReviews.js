import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEdit, FaUser, FaExclamationTriangle } from 'react-icons/fa';

function TeamReviews() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [teamReviews, setTeamReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    searchTerm: '',
  });

  const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : 'https://performance-review-backend-ab8z.onrender.com';

  useEffect(() => {
    const fetchTeamReviews = async () => {
      try {
        setLoading(true);
        console.log("Attempting to fetch team reviews from API");
        
        const response = await fetch(`${API_BASE_URL}/api/reviews/team`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch team reviews: ${response.status}`);
        }

        const data = await response.json();
        setTeamReviews(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching team reviews:', err);
        setError('Failed to load team reviews. Please try again later.');
        
        // Use mock data as fallback
        console.log("Using mock data as fallback due to API error");
        
        // Mock data for development/demo purposes
        const mockData = [
          {
            _id: "mock-review-1",
            employee: { firstName: "Dana", lastName: "Bear", position: "Software Engineer" },
            reviewer: { firstName: user?.firstName || "Manager", lastName: user?.lastName || "User" },
            reviewPeriod: { 
              start: "2024-10-12T00:00:00.000Z", 
              end: "2025-04-10T00:00:00.000Z" 
            },
            status: "completed",
            score: 92,
            lastUpdated: "2025-03-02T14:30:00.000Z"
          },
          {
            _id: "mock-review-2",
            employee: { firstName: "Michael", lastName: "Wilson", position: "UX Designer" },
            reviewer: { firstName: user?.firstName || "Manager", lastName: user?.lastName || "User" },
            reviewPeriod: { 
              start: "2024-10-12T00:00:00.000Z", 
              end: "2025-04-10T00:00:00.000Z" 
            },
            status: "inProgress",
            lastUpdated: "2025-03-10T09:15:00.000Z"
          },
          {
            _id: "mock-review-3",
            employee: { firstName: "Sarah", lastName: "Johnson", position: "Product Manager" },
            reviewer: { firstName: user?.firstName || "Manager", lastName: user?.lastName || "User" },
            reviewPeriod: { 
              start: "2024-10-12T00:00:00.000Z", 
              end: "2025-04-10T00:00:00.000Z" 
            },
            status: "pending",
            lastUpdated: null
          },
          {
            _id: "mock-review-4",
            employee: { firstName: "James", lastName: "Thompson", position: "QA Engineer" },
            reviewer: { firstName: user?.firstName || "Manager", lastName: user?.lastName || "User" },
            reviewPeriod: { 
              start: "2024-10-01T00:00:00.000Z", 
              end: "2025-03-01T00:00:00.000Z" 
            },
            status: "overdue",
            lastUpdated: "2025-02-28T16:45:00.000Z"
          }
        ];
        
        setTeamReviews(mockData);
        setLoading(false);
      }
    };

    fetchTeamReviews();
  }, [API_BASE_URL, user]);

  const handleReviewClick = (reviewId) => {
    navigate(`/reviews/edit/${reviewId}`);
  };

  const handleCreateNewReview = () => {
    navigate('/manager/reviews/new');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getStatusBadgeStyle = (status) => {
    let backgroundColor, color;
    
    switch(status) {
      case 'completed':
        backgroundColor = 'rgba(76, 175, 80, 0.1)';
        color = '#4CAF50';
        break;
      case 'inProgress':
        backgroundColor = 'rgba(33, 150, 243, 0.1)';
        color = '#2196F3';
        break;
      case 'pending':
        backgroundColor = 'rgba(255, 152, 0, 0.1)';
        color = '#FF9800';
        break;
      case 'overdue':
        backgroundColor = 'rgba(244, 67, 54, 0.1)';
        color = '#F44336';
        break;
      default:
        backgroundColor = 'rgba(158, 158, 158, 0.1)';
        color = '#9E9E9E';
    }
    
    return {
      display: 'inline-block',
      padding: '5px 10px',
      borderRadius: '4px',
      fontSize: '13px',
      fontWeight: '500',
      backgroundColor,
      color
    };
  };
  
  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    
    // Convert camelCase to Title Case with spaces
    const formattedStatus = status.replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
    
    return formattedStatus;
  };
  
  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Never updated';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 30) {
      return `${diffInDays} days ago`;
    } else {
      return formatDate(dateString);
    }
  };

  // Filter reviews based on selected filters
  const filteredReviews = teamReviews.filter(review => {
    // Filter by status
    if (filters.status !== 'all' && review.status !== filters.status) {
      return false;
    }
    
    // Filter by search term
    if (filters.searchTerm) {
      const employeeName = `${review.employee?.firstName || ''} ${review.employee?.lastName || ''}`.toLowerCase();
      const position = review.employee?.position?.toLowerCase() || '';
      const searchTerm = filters.searchTerm.toLowerCase();
      
      return employeeName.includes(searchTerm) || position.includes(searchTerm);
    }
    
    return true;
  });

  // Styles
  const containerStyle = {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto'
  };
  
  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  };
  
  const filtersContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
  };
  
  const filterGroupStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  };
  
  const tableStyle = {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0 10px'
  };
  
  const tableHeaderStyle = {
    padding: '10px 15px',
    textAlign: 'left',
    color: '#666',
    fontWeight: '600',
    fontSize: '14px'
  };
  
  const tableCellStyle = {
    padding: '15px',
    backgroundColor: 'white',
    border: 'none',
    fontSize: '14px',
    color: '#333'
  };
  
  const firstCellStyle = {
    ...tableCellStyle,
    borderTopLeftRadius: '8px',
    borderBottomLeftRadius: '8px'
  };
  
  const lastCellStyle = {
    ...tableCellStyle,
    borderTopRightRadius: '8px',
    borderBottomRightRadius: '8px',
    textAlign: 'right'
  };
  
  const overdueCellStyle = {
    backgroundColor: 'rgba(244, 67, 54, 0.05)'
  };
  
  const buttonStyle = {
    padding: '10px 15px',
    backgroundColor: '#5a189a',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };
  
  const selectStyle = {
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    backgroundColor: 'white',
    minWidth: '150px'
  };
  
  const searchInputStyle = {
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    minWidth: '250px'
  };
  
  const actionButtonStyle = {
    padding: '8px 12px',
    backgroundColor: '#5a189a',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px'
  };
  
  const overdueIndicatorStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#F44336',
    fontWeight: '500'
  };
  
  const emptyStateStyle = {
    padding: '40px 20px',
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    margin: '40px 0'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={{ margin: 0, color: '#333' }}>Team Reviews</h1>
        <button 
          style={buttonStyle}
          onClick={handleCreateNewReview}
        >
          <FaEdit />
          Create New Review
        </button>
      </div>
      
      <div style={filtersContainerStyle}>
        <div style={filterGroupStyle}>
          <label htmlFor="status-filter">Status:</label>
          <select 
            id="status-filter"
            style={selectStyle}
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="inProgress">In Progress</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        
        <div style={filterGroupStyle}>
          <input 
            type="text"
            placeholder="Search by name or position..."
            style={searchInputStyle}
            value={filters.searchTerm}
            onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
          />
        </div>
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #5a189a',
            borderRadius: '50%',
            margin: '0 auto 20px',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p>Loading team reviews...</p>
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#F44336' }}>
          <FaExclamationTriangle size={50} style={{ marginBottom: '20px' }} />
          <p>{error}</p>
          <button 
            style={{...buttonStyle, marginTop: '20px'}}
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div style={emptyStateStyle}>
          <FaUser size={50} style={{ color: '#999', marginBottom: '20px' }} />
          <h3>No Reviews Found</h3>
          <p style={{ color: '#666' }}>
            {filters.status !== 'all' || filters.searchTerm
              ? 'Try changing your search filters to see more results.'
              : 'Start by creating a new review for your team members.'}
          </p>
          <button 
            style={{...buttonStyle, marginTop: '20px'}}
            onClick={handleCreateNewReview}
          >
            <FaEdit />
            Create New Review
          </button>
        </div>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>Employee</th>
              <th style={tableHeaderStyle}>Position</th>
              <th style={tableHeaderStyle}>Review Period</th>
              <th style={tableHeaderStyle}>Status</th>
              <th style={tableHeaderStyle}>Last Updated</th>
              <th style={{...tableHeaderStyle, textAlign: 'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviews.map(review => {
              const isOverdue = review.status === 'overdue';
              const rowStyles = isOverdue ? overdueCellStyle : {};
              
              return (
                <tr key={review._id} className="review-row">
                  <td style={{...firstCellStyle, ...rowStyles}}>
                    {`${review.employee?.firstName || ''} ${review.employee?.lastName || ''}`}
                  </td>
                  <td style={{...tableCellStyle, ...rowStyles}}>
                    {review.employee?.position || 'N/A'}
                  </td>
                  <td style={{...tableCellStyle, ...rowStyles}}>
                    {review.reviewPeriod ? 
                      `${formatDate(review.reviewPeriod.start)} - ${formatDate(review.reviewPeriod.end)}`
                      : 'N/A'
                    }
                  </td>
                  <td style={{...tableCellStyle, ...rowStyles}}>
                    <span style={getStatusBadgeStyle(review.status)}>
                      {formatStatus(review.status)}
                    </span>
                  </td>
                  <td style={{...tableCellStyle, ...rowStyles}}>
                    {isOverdue ? (
                      <div style={overdueIndicatorStyle}>
                        <FaExclamationTriangle />
                        <span>Overdue</span>
                      </div>
                    ) : (
                      getTimeAgo(review.lastUpdated)
                    )}
                  </td>
                  <td style={{...lastCellStyle, ...rowStyles}}>
                    <button 
                      style={actionButtonStyle}
                      onClick={() => handleReviewClick(review._id)}
                    >
                      {review.status === 'completed' ? 'View' : 'Edit'} Review
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TeamReviews;