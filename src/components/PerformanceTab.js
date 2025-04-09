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
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/performance/${employeeId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch performance data');
        }

        const data = await response.json();
        setPerformanceData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching performance data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    if (employeeId) fetchPerformanceData();
  }, [employeeId]);

  if (loading) return <div>Loading performance metrics...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  // Mock data (you'll replace this with actual backend data)
  const mockPerformanceData = {
    overallRating: 4.2,
    reviewCount: 3,
    goalCompletionRate: 85,
    recentAchievements: [
      { title: "Exceeded Q1 Sales Target", date: "2025-03-31" },
      { title: "Customer Satisfaction Improvement", date: "2025-02-15" }
    ],
    skillGrowth: [
      { skill: "Sales", level: 4, trend: 20 },
      { skill: "Customer Success", level: 3, trend: 15 }
    ]
  };

  return (
    <div className="performance-tab">
      <div className="performance-overview">
        <div className="performance-metrics-grid">
          <PerformanceMetricCard 
            icon={<FaTrophy />}
            title="Overall Performance Rating"
            value={mockPerformanceData.overallRating.toFixed(1)}
            trend={5}
          />
          <PerformanceMetricCard 
            icon={<FaCheckCircle />}
            title="Goal Completion Rate"
            value={`${mockPerformanceData.goalCompletionRate}%`}
            trend={10}
          />
          <PerformanceMetricCard 
            icon={<FaTimesCircle />}
            title="Total Reviews"
            value={mockPerformanceData.reviewCount}
          />
        </div>

        <div className="performance-sections">
          <div className="achievements-section">
            <h3>Recent Achievements</h3>
            {mockPerformanceData.recentAchievements.map((achievement, index) => (
              <div key={index} className="achievement-card">
                <FaBullseye className="achievement-icon" />
                <div>
                  <h4>{achievement.title}</h4>
                  <p>Achieved on {new Date(achievement.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="skill-growth-section">
            <h3>Skill Growth Trajectory</h3>
            {mockPerformanceData.skillGrowth.map((skillData, index) => (
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceTab;