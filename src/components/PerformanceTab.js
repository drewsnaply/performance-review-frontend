import React, { useState, useEffect } from 'react';
import { 
  FaChartLine, 
  FaTrophy, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaBullseye 
} from 'react-icons/fa';

const PerformanceMetricCard = ({ icon, title, value, trend }) => (
  <div className="performance-metric-card">
    <div className="metric-header">
      {icon}
      <h4>{title}</h4>
    </div>
    <div className="metric-content">
      <div className="metric-value">{value}</div>
      {trend && (
        <div className={`metric-trend ${trend > 0 ? 'positive' : 'negative'}`}>
          {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  </div>
);

const PerformanceTab = ({ employeeId }) => {
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : 'https://performance-review-backend-ab8z.onrender.com';

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        console.log('Fetching performance data for employeeId:', employeeId);
        console.log('API Base URL:', API_BASE_URL);
        
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/performance/${employeeId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to fetch performance data:', errorText);
          throw new Error(`Failed to fetch performance data: ${errorText}`);
        }

        const data = await response.json();
        console.log('Fetched performance data:', data);
        
        setPerformanceData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching performance data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    if (employeeId) fetchPerformanceData();
  }, [employeeId, API_BASE_URL]);

  // Fallback data for demonstration
  const fallbackData = {
    overallRating: 4.2,
    reviewCount: 3,
    goalCompletionRate: 85,
    recentAchievements: [
      { title: "Demonstrated Strong Communication Skills", date: "2025-03-31" },
      { title: "Contributed to Team Project Success", date: "2025-02-15" }
    ],
    skillGrowth: [
      { skill: "Customer Success", level: 4, trend: 20 },
      { skill: "Sales Strategies", level: 3, trend: 15 }
    ]
  };

  if (loading) {
    return <div className="loading">Loading performance metrics...</div>;
  }

  if (error) {
    return (
      <div className="performance-error">
        <p>Error loading performance data:</p>
        <p>{error}</p>
        <p>Using sample data for demonstration</p>
      </div>
    );
  }

  // Use fetched data or fallback data
  const data = performanceData || fallbackData;

  return (
    <div className="performance-tab">
      <div className="performance-overview">
        <div className="performance-metrics-grid">
          <PerformanceMetricCard 
            icon={<FaTrophy />}
            title="Overall Performance Rating"
            value={(data.overallRating || 0).toFixed(1)}
            trend={5}
          />
          <PerformanceMetricCard 
            icon={<FaCheckCircle />}
            title="Goal Completion Rate"
            value={`${data.goalCompletionRate || 0}%`}
            trend={10}
          />
          <PerformanceMetricCard 
            icon={<FaTimesCircle />}
            title="Total Reviews"
            value={data.reviewCount || 0}
          />
        </div>

        <div className="performance-sections">
          <div className="achievements-section">
            <h3>Recent Achievements</h3>
            {(data.recentAchievements || []).length > 0 ? (
              data.recentAchievements.map((achievement, index) => (
                <div key={index} className="achievement-card">
                  <FaBullseye className="achievement-icon" />
                  <div>
                    <h4>{achievement.title}</h4>
                    <p>Achieved on {new Date(achievement.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">No recent achievements</div>
            )}
          </div>

          <div className="skill-growth-section">
            <h3>Skill Growth Trajectory</h3>
            {(data.skillGrowth || []).length > 0 ? (
              data.skillGrowth.map((skillData, index) => (
                <div key={index} className="skill-growth-card">
                  <div className="skill-info">
                    <span>{skillData.skill}</span>
                    <span className={`skill-level level-${skillData.level}`}>
                      Level {skillData.level}/5
                    </span>
                  </div>
                  <div className={`skill-trend ${skillData.trend > 0 ? 'positive' : 'negative'}`}>
                    {skillData.trend > 0 ? '▲' : '▼'} {Math.abs(skillData.trend)}% Growth
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">No skill growth data</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceTab;