import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../SidebarLayout';
import { useAuth } from '../../context/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import '../../styles/Manager/ManagerDashboard.css';

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
        // Fetch team members
        const teamResponse = await fetchWithAuth('/api/manager/team-members');
        
        if (teamResponse.ok) {
          const teamData = await teamResponse.json();
          setTeamMembers(teamData);
          
          // Mock statistics calculation based on team members
          // In a real implementation, you would get this from a separate API endpoint
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
      } catch (error) {
        console.error('Error fetching manager data:', error);
        setError('Failed to load dashboard data. Please try again later.');
        
        // Set mock data for development/demo purposes
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
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchManagerData();
  }, [fetchWithAuth]);

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

  const handleStartReview = (employeeId) => {
    navigate(`/reviews/new?employeeId=${employeeId}`);
  };

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
              <button className="manager-action-btn primary" onClick={() => navigate('/reviews/new')}>
                Start New Review
              </button>
              <button className="manager-action-btn" onClick={() => navigate('/templates')}>
                View Templates
              </button>
              <button className="manager-action-btn" onClick={() => navigate('/employees')}>
                Manage Team
              </button>
              <button className="manager-action-btn" onClick={() => navigate('/settings')}>
                Review Settings
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
            onClick={() => navigate('/employees')}
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
                        onClick={() => navigate(`/employees/${member.id}`)}
                      >
                        View
                      </button>
                      <button 
                        className="manager-action-btn primary"
                        onClick={() => handleStartReview(member.id)}
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
          <button 
            className="manager-action-btn primary"
            onClick={() => navigate('/reviews/new')}
          >
            Start New Review
          </button>
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
    <SidebarLayout user={user} activeView="manager-dashboard">
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
      </div>
    </SidebarLayout>
  );
};

export default ManagerDashboard;