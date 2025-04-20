import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const { user, token, fetchWithAuth } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState([]);
  const [reviewStatistics, setReviewStatistics] = useState({
    completed: 0,
    inProgress: 0,
    pending: 0,
    overdue: 0,
  });
  const [reviewsData, setReviewsData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchManagerData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Set mock data for development/demo purposes
        // In production, you would fetch this data from your API
        setTeamMembers([
          { id: 1, name: 'John Doe', role: 'Software Engineer', reviewStatus: 'completed', performance: 85 },
          { id: 2, name: 'Jane Smith', role: 'UX Designer', reviewStatus: 'in-progress', performance: 78 },
          { id: 3, name: 'Mike Johnson', role: 'Product Manager', reviewStatus: 'pending', performance: 92 },
          { id: 4, name: 'Sarah Williams', role: 'QA Engineer', reviewStatus: 'overdue', performance: 65 },
          { id: 5, name: 'David Brown', role: 'Frontend Developer', reviewStatus: 'completed', performance: 88 },
        ]);
        
        setReviewStatistics({
          completed: 2,
          inProgress: 1,
          pending: 1,
          overdue: 1,
        });
        
        setReviewsData([
          { id: 1, employeeName: 'John Doe', reviewType: 'Annual', dueDate: '2025-05-15', status: 'completed' },
          { id: 2, employeeName: 'Jane Smith', reviewType: 'Quarterly', dueDate: '2025-04-30', status: 'in-progress' },
          { id: 3, employeeName: 'Mike Johnson', reviewType: 'Annual', dueDate: '2025-05-10', status: 'pending' },
          { id: 4, employeeName: 'Sarah Williams', reviewType: 'Quarterly', dueDate: '2025-04-05', status: 'overdue' },
          { id: 5, employeeName: 'David Brown', reviewType: 'Annual', dueDate: '2025-06-01', status: 'completed' },
        ]);
        
        // If API integration is implemented, replace the above with actual API calls:
        /*
        // Fetch team members
        const teamResponse = await fetchWithAuth('/api/manager/team-members');
        if (teamResponse.ok) {
          const teamData = await teamResponse.json();
          setTeamMembers(teamData);
          
          // Calculate statistics based on team members
          let completed = 0;
          let inProgress = 0;
          let pending = 0;
          let overdue = 0;
          
          teamData.forEach(member => {
            if (member.reviewStatus === 'completed') completed++;
            else if (member.reviewStatus === 'in-progress') inProgress++;
            else if (member.reviewStatus === 'pending') pending++;
            else if (member.reviewStatus === 'overdue') overdue++;
          });
          
          setReviewStatistics({
            completed,
            inProgress,
            pending,
            overdue,
          });
        } else {
          throw new Error('Failed to fetch team members');
        }
        
        // Fetch reviews data
        const reviewsResponse = await fetchWithAuth('/api/manager/reviews');
        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();
          setReviewsData(reviewsData);
        } else {
          throw new Error('Failed to fetch reviews');
        }
        */
      } catch (error) {
        console.error('Error fetching manager data:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchManagerData();
  }, []);

  // Data for review status pie chart
  const reviewStatusData = [
    { name: 'Completed', value: reviewStatistics.completed, color: '#4CAF50' },
    { name: 'In Progress', value: reviewStatistics.inProgress, color: '#2196F3' },
    { name: 'Pending', value: reviewStatistics.pending, color: '#FF9800' },
    { name: 'Overdue', value: reviewStatistics.overdue, color: '#F44336' },
  ];
  
  // Data for team performance chart
  const performanceData = teamMembers.map(member => ({
    name: member.name.split(' ')[0], // Just use first name for display
    performance: member.performance || Math.floor(Math.random() * 40) + 60, // Random value between 60-100 if not provided
  }));

  const handleViewReview = (reviewId) => {
    navigate(`/reviews/${reviewId}`);
  };

  const renderOverviewTab = () => {
    return (
      <div className="manager-overview-tab">
        <div className="manager-stats-container">
          <div className="manager-stat-card">
            <h3>Team Members</h3>
            <div className="manager-stat-value">{teamMembers.length}</div>
            <div className="manager-stat-description">Direct reports</div>
          </div>
          <div className="manager-stat-card">
            <h3>Completed Reviews</h3>
            <div className="manager-stat-value">{reviewStatistics.completed}</div>
            <div className="manager-stat-description">This cycle</div>
          </div>
          <div className="manager-stat-card">
            <h3>Pending Reviews</h3>
            <div className="manager-stat-value">{reviewStatistics.pending + reviewStatistics.inProgress}</div>
            <div className="manager-stat-description">Require action</div>
          </div>
          <div className="manager-stat-card">
            <h3>Overdue</h3>
            <div className="manager-stat-value manager-stat-alert">{reviewStatistics.overdue}</div>
            <div className="manager-stat-description">Need immediate attention</div>
          </div>
        </div>
        
        <div className="manager-charts-container">
          <div className="manager-chart-card">
            <h3>Review Status</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={reviewStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {reviewStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="manager-chart-card">
            <h3>Team Performance</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={performanceData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="performance" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="manager-action-cards">
          <div className="manager-action-card">
            <h3>Upcoming Deadlines</h3>
            <ul className="manager-deadline-list">
              {reviewsData
                .filter(review => review.status !== 'completed')
                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                .slice(0, 3)
                .map(review => (
                  <li key={review.id} className={review.status === 'overdue' ? 'overdue' : ''}>
                    <div className="deadline-employee">{review.employeeName}</div>
                    <div className="deadline-details">
                      <span className="deadline-type">{review.reviewType}</span>
                      <span className="deadline-date">Due: {new Date(review.dueDate).toLocaleDateString()}</span>
                    </div>
                    <button 
                      className="view-review-btn"
                      onClick={() => handleViewReview(review.id)}
                    >
                      View
                    </button>
                  </li>
                ))}
            </ul>
            <button className="see-all-btn" onClick={() => setActiveTab('reviews')}>
              See All Reviews
            </button>
          </div>
          
          <div className="manager-action-card">
            <h3>Quick Actions</h3>
            <div className="manager-quick-actions">
              <button className="manager-action-btn" onClick={() => navigate('/pending-reviews')}>
                View Pending Reviews
              </button>
              <button className="manager-action-btn" onClick={() => navigate('/team-members')}>
                Manage Team
              </button>
              <button className="manager-action-btn" onClick={() => navigate('/review-cycles')}>
                Review Cycles
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTeamTab = () => {
    return (
      <div className="manager-team-tab">
        <div className="manager-section-header">
          <h2>Team Members</h2>
          <button 
            className="manager-action-btn primary"
            onClick={() => navigate('/team-members')}
          >
            Manage Team
          </button>
        </div>
        
        <div className="manager-team-table-container">
          <table className="manager-team-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Review Status</th>
                <th>Performance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map(member => (
                <tr key={member.id}>
                  <td>{member.name}</td>
                  <td>{member.role}</td>
                  <td>
                    <span className={`status-badge ${member.reviewStatus}`}>
                      {member.reviewStatus.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </td>
                  <td>
                    <div className="performance-bar-container">
                      <div 
                        className="performance-bar" 
                        style={{ 
                          width: `${member.performance || 0}%`,
                          backgroundColor: member.performance >= 80 ? '#4CAF50' : 
                                          member.performance >= 70 ? '#8BC34A' :
                                          member.performance >= 60 ? '#FFC107' : '#F44336'
                        }}
                      ></div>
                      <span className="performance-value">{member.performance || 0}/100</span>
                    </div>
                  </td>
                  <td>
                    <div className="team-member-actions">
                      <button 
                        className="manager-action-btn"
                        onClick={() => navigate(`/team-members/${member.id}`)}
                      >
                        View
                      </button>
                      <button 
                        className="manager-action-btn primary"
                        onClick={() => navigate(`/reviews/new?employeeId=${member.id}`)}
                        disabled={member.reviewStatus === 'completed' || member.reviewStatus === 'in-progress'}
                      >
                        {member.reviewStatus === 'completed' ? 'Completed' : 
                         member.reviewStatus === 'in-progress' ? 'In Progress' : 'Start Review'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderReviewsTab = () => {
    return (
      <div className="manager-reviews-tab">
        <div className="manager-section-header">
          <h2>Reviews</h2>
        </div>
        
        <div className="manager-reviews-filters">
          <div className="filter-group">
            <label>Status:</label>
            <select defaultValue="all">
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Type:</label>
            <select defaultValue="all">
              <option value="all">All Types</option>
              <option value="annual">Annual</option>
              <option value="quarterly">Quarterly</option>
              <option value="probation">Probation</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Sort By:</label>
            <select defaultValue="dueDate">
              <option value="dueDate">Due Date</option>
              <option value="employeeName">Employee Name</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
        
        <div className="manager-reviews-table-container">
          <table className="manager-reviews-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Review Type</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviewsData.map(review => (
                <tr key={review.id}>
                  <td>{review.employeeName}</td>
                  <td>{review.reviewType}</td>
                  <td>{new Date(review.dueDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${review.status}`}>
                      {review.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="manager-action-btn primary"
                      onClick={() => handleViewReview(review.id)}
                    >
                      {review.status === 'completed' ? 'View Results' : 
                       review.status === 'in-progress' ? 'Continue' : 
                       review.status === 'pending' ? 'Start' : 'Urgent Review'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="manager-dashboard-container">
      <div className="manager-dashboard-header">
        <h1>Manager Dashboard</h1>
        <div className="manager-tabs">
          <button 
            className={`manager-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`manager-tab ${activeTab === 'team' ? 'active' : ''}`}
            onClick={() => setActiveTab('team')}
          >
            Team Members
          </button>
          <button 
            className={`manager-tab ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="manager-loading">
          <div className="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      ) : error ? (
        <div className="manager-error">
          <p>{error}</p>
          <button 
            className="manager-action-btn"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="manager-dashboard-content">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'team' && renderTeamTab()}
          {activeTab === 'reviews' && renderReviewsTab()}
        </div>
      )}
      
      <style jsx="true">{`
        /* Manager Dashboard Container Styles */
        .manager-dashboard-container {
          padding: 20px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        
        .manager-dashboard-header {
          margin-bottom: 24px;
        }
        
        .manager-dashboard-header h1 {
          margin-bottom: 16px;
          color: #333;
          font-size: 24px;
          font-weight: 600;
        }
        
        /* Manager Tabs Styles */
        .manager-tabs {
          display: flex;
          border-bottom: 1px solid #e0e0e0;
          margin-bottom: 24px;
        }
        
        .manager-tab {
          padding: 12px 24px;
          border: none;
          background: none;
          font-size: 16px;
          font-weight: 500;
          color: #666;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }
        
        .manager-tab:hover {
          color: #2196F3;
        }
        
        .manager-tab.active {
          color: #2196F3;
        }
        
        .manager-tab.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: #2196F3;
        }
        
        /* Loading and Error States */
        .manager-loading, .manager-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 50px 0;
          text-align: center;
        }
        
        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top: 4px solid #2196F3;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .manager-error p {
          color: #f44336;
          margin-bottom: 16px;
        }
        
        /* Dashboard Content Styles */
        .manager-dashboard-content {
          min-height: 300px;
        }
        
        /* Stats Cards */
        .manager-stats-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }
        
        .manager-stat-card {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          padding: 20px;
          border: 1px solid #e0e0e0;
        }
        
        .manager-stat-card h3 {
          font-size: 14px;
          color: #666;
          margin-bottom: 8px;
          font-weight: 500;
        }
        
        .manager-stat-value {
          font-size: 32px;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }
        
        .manager-stat-alert {
          color: #f44336;
        }
        
        .manager-stat-description {
          font-size: 12px;
          color: #888;
        }
        
        /* Charts */
        .manager-charts-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }
        
        .manager-chart-card {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          padding: 20px;
          border: 1px solid #e0e0e0;
        }
        
        .manager-chart-card h3 {
          font-size: 16px;
          color: #333;
          margin-bottom: 16px;
          font-weight: 500;
        }
        
        .chart-container {
          height: 250px;
        }
        
        /* Action Cards */
        .manager-action-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }
        
        .manager-action-card {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          padding: 20px;
          border: 1px solid #e0e0e0;
        }
        
        .manager-action-card h3 {
          font-size: 16px;
          color: #333;
          margin-bottom: 16px;
          font-weight: 500;
        }
        
        /* Deadline List */
        .manager-deadline-list {
          list-style: none;
          padding: 0;
          margin: 0;
          margin-bottom: 16px;
        }
        
        .manager-deadline-list li {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .manager-deadline-list li:last-child {
          border-bottom: none;
        }
        
        .manager-deadline-list li.overdue {
          background-color: rgba(244, 67, 54, 0.05);
        }
        
        .deadline-employee {
          font-weight: 500;
          color: #333;
          flex: 1;
        }
        
        .deadline-details {
          flex: 2;
          display: flex;
          flex-direction: column;
        }
        
        .deadline-type {
          font-size: 12px;
          color: #666;
        }
        
        .deadline-date {
          font-size: 12px;
          color: #888;
        }
        
        .deadline-date.overdue {
          color: #f44336;
          font-weight: 500;
        }
        
        .view-review-btn {
          background-color: #f0f0f0;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          color: #333;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
        }
        
        .view-review-btn:hover {
          background-color: #e0e0e0;
        }
        
        .see-all-btn {
          width: 100%;
          background-color: transparent;
          border: 1px solid #e0e0e0;
          padding: 8px;
          border-radius: 4px;
          color: #2196F3;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .see-all-btn:hover {
          background-color: rgba(33, 150, 243, 0.05);
          border-color: #2196F3;
        }
        
        /* Quick Actions */
        .manager-quick-actions {
          display: grid;
          gap: 12px;
        }
        
        .manager-action-btn {
          background-color: #f0f0f0;
          border: none;
          padding: 12px;
          border-radius: 4px;
          color: #333;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
          text-align: left;
        }
        
        .manager-action-btn:hover {
          background-color: #e0e0e0;
        }
        
        .manager-action-btn.primary {
          background-color: #2196F3;
          color: white;
        }
        
        .manager-action-btn.primary:hover {
          background-color: #1976D2;
        }
        
        /* Team Tab Styles */
        .manager-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .manager-section-header h2 {
          font-size: 20px;
          color: #333;
          font-weight: 600;
        }
        
        .manager-team-table-container, .manager-reviews-table-container {
          overflow-x: auto;
          margin-bottom: 24px;
        }
        
        .manager-team-table, .manager-reviews-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .manager-team-table th, .manager-reviews-table th {
          background-color: #f9f9f9;
          padding: 12px 16px;
          text-align: left;
          font-weight: 500;
          color: #333;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .manager-team-table td, .manager-reviews-table td {
          padding: 12px 16px;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .status-badge.completed {
          background-color: rgba(76, 175, 80, 0.1);
          color: #4CAF50;
        }
        
        .status-badge.in-progress {
          background-color: rgba(33, 150, 243, 0.1);
          color: #2196F3;
        }
        
        .status-badge.pending {
          background-color: rgba(255, 152, 0, 0.1);
          color: #FF9800;
        }
        
        .status-badge.overdue {
          background-color: rgba(244, 67, 54, 0.1);
          color: #F44336;
        }
        
        /* Performance Bar */
        .performance-bar-container {
          width: 100%;
          height: 8px;
          background-color: #f0f0f0;
          border-radius: 4px;
          overflow: hidden;
          position: relative;
        }
        
        .performance-bar {
          height: 100%;
          border-radius: 4px;
        }
        
        .performance-value {
          position: absolute;
          right: 0;
          top: -18px;
          font-size: 12px;
          color: #666;
        }
        
        .team-member-actions {
          display: flex;
          gap: 8px;
        }
        
        /* Reviews Tab */
        .manager-reviews-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 20px;
        }
        
        .filter-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .filter-group label {
          font-size: 14px;
          color: #666;
        }
        
        .filter-group select {
          padding: 8px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          background-color: #fff;
          min-width: 120px;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
          .manager-stats-container {
            grid-template-columns: 1fr;
          }
          
          .manager-charts-container, .manager-action-cards {
            grid-template-columns: 1fr;
          }
          
          .manager-tab {
            padding: 12px 16px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default ManagerDashboard;