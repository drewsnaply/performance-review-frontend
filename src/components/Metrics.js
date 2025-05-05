// src/components/Metrics.js
import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Area, ComposedChart
} from 'recharts';
import { MdRefresh, MdFileDownload } from 'react-icons/md';

const Metrics = () => {
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [timePeriod, setTimePeriod] = useState('month');
  const [department, setDepartment] = useState('all');
  const [reviewType, setReviewType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metricsData, setMetricsData] = useState(null);
  const [departments, setDepartments] = useState([]);

  // Fetch metrics data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get metrics summary
        const summaryResponse = await fetch('/api/metrics/summary?' + new URLSearchParams({
          timePeriod,
          department,
          reviewType
        }));
        
        if (!summaryResponse.ok) {
          throw new Error('Failed to fetch metrics data');
        }
        
        const summaryData = await summaryResponse.json();
        
        // Get departments for filtering
        const departmentsResponse = await fetch('/api/departments');
        let departmentsData = [];
        
        if (departmentsResponse.ok) {
          departmentsData = await departmentsResponse.json();
          setDepartments(departmentsData);
        }
        
        // Get completion trend data
        const completionResponse = await fetch('/api/metrics/completion-trends?' + new URLSearchParams({
          timePeriod,
          department,
          reviewType
        }));
        
        if (!completionResponse.ok) {
          throw new Error('Failed to fetch completion trend data');
        }
        
        const completionData = await completionResponse.json();
        
        // Get score trend data
        const scoreResponse = await fetch('/api/metrics/score-trends?' + new URLSearchParams({
          timePeriod,
          department,
          reviewType
        }));
        
        if (!scoreResponse.ok) {
          throw new Error('Failed to fetch score trend data');
        }
        
        const scoreData = await scoreResponse.json();
        
        // Get department metrics
        const deptMetricsResponse = await fetch('/api/metrics/departments?' + new URLSearchParams({
          timePeriod,
          reviewType
        }));
        
        if (!deptMetricsResponse.ok) {
          throw new Error('Failed to fetch department metrics');
        }
        
        const deptMetricsData = await deptMetricsResponse.json();
        
        setMetricsData({
          summary: summaryData,
          completionTrends: completionData,
          scoreTrends: scoreData,
          departmentMetrics: deptMetricsData
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching metrics data:', err);
        setError('There was an error loading the metrics data. Please check your connection and try again.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [timePeriod, department, reviewType]);
  
  // Export metrics data as CSV
  const handleExport = () => {
    if (!metricsData) return;
    
    // Create CSV content based on active tab
    let csvContent = '';
    let filename = '';
    
    switch (activeTab) {
      case 'overview':
        csvContent = 'Metric,Value\n';
        csvContent += `Total Employees,${metricsData.summary.totalEmployees}\n`;
        csvContent += `Reviews Completed,${metricsData.summary.reviewsCompleted}\n`;
        csvContent += `Average Score,${metricsData.summary.averageScore}\n`;
        csvContent += `Completion Rate,${metricsData.summary.completionRate * 100}%\n`;
        filename = 'metrics-overview.csv';
        break;
        
      case 'departments':
        csvContent = 'Department,Employees,Reviews Completed,Average Score,Completion Rate\n';
        metricsData.departmentMetrics.forEach(dept => {
          csvContent += `${dept.name},${dept.employeeCount},${dept.reviewsCompleted},${dept.averageScore},${dept.completionRate * 100}%\n`;
        });
        filename = 'metrics-departments.csv';
        break;
        
      case 'scoretrends':
        csvContent = 'Date,Average Score\n';
        metricsData.scoreTrends.forEach(point => {
          csvContent += `${point.date},${point.score}\n`;
        });
        filename = 'metrics-score-trends.csv';
        break;
        
      case 'completionrates':
        csvContent = 'Date,Completion Rate\n';
        metricsData.completionTrends.forEach(point => {
          csvContent += `${point.date},${point.rate * 100}%\n`;
        });
        filename = 'metrics-completion-rates.csv';
        break;
        
      default:
        return;
    }
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Handle refresh button click
  const handleRefresh = () => {
    setLoading(true);
    // Re-trigger the useEffect by changing a dependency
    const currentPeriod = timePeriod;
    setTimePeriod('refreshing');
    setTimeout(() => setTimePeriod(currentPeriod), 100);
  };
  
  // Render content based on active tab
  const renderTabContent = () => {
    if (loading) {
      return (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Loading metrics data...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div style={styles.errorContainer}>
          <div style={styles.errorIcon}>!</div>
          <p>{error}</p>
          <button style={styles.retryButton} onClick={handleRefresh}>
            <MdRefresh style={styles.buttonIcon} /> Retry
          </button>
        </div>
      );
    }
    
    if (!metricsData) {
      return (
        <div style={styles.errorContainer}>
          <p>No metrics data available.</p>
          <button style={styles.retryButton} onClick={handleRefresh}>
            <MdRefresh style={styles.buttonIcon} /> Retry
          </button>
        </div>
      );
    }
    
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'departments':
        return renderDepartmentsTab();
      case 'scoretrends':
        return renderScoreTrendsTab();
      case 'completionrates':
        return renderCompletionRatesTab();
      default:
        return renderOverviewTab();
    }
  };
  
  // Render overview tab content
  const renderOverviewTab = () => {
    const { summary } = metricsData;
    
    return (
      <div style={styles.tabContent}>
        <div style={styles.overviewGrid}>
          <div style={styles.overviewCard}>
            <h3>Total Employees</h3>
            <div style={styles.cardValue}>{summary.totalEmployees}</div>
            <div style={styles.cardTrend}>
              {summary.employeeTrend > 0 ? '↑' : '↓'} {Math.abs(summary.employeeTrend)}% from previous period
            </div>
          </div>
          
          <div style={styles.overviewCard}>
            <h3>Reviews Completed</h3>
            <div style={styles.cardValue}>{summary.reviewsCompleted}</div>
            <div style={styles.cardTrend}>
              {summary.reviewTrend > 0 ? '↑' : '↓'} {Math.abs(summary.reviewTrend)}% from previous period
            </div>
          </div>
          
          <div style={styles.overviewCard}>
            <h3>Average Score</h3>
            <div style={styles.cardValue}>{summary.averageScore.toFixed(1)}</div>
            <div style={styles.cardTrend}>
              {summary.scoreTrend > 0 ? '↑' : '↓'} {Math.abs(summary.scoreTrend.toFixed(1))} from previous period
            </div>
          </div>
          
          <div style={styles.overviewCard}>
            <h3>Completion Rate</h3>
            <div style={styles.cardValue}>{(summary.completionRate * 100).toFixed(0)}%</div>
            <div style={styles.cardTrend}>
              {summary.completionTrend > 0 ? '↑' : '↓'} {Math.abs(summary.completionTrend.toFixed(1))}% from previous period
            </div>
          </div>
        </div>
        
        <div style={styles.chartsContainer}>
          <div style={styles.chartCard}>
            <h3>Reviews by Department</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metricsData.departmentMetrics}
                  dataKey="reviewsCompleted"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {metricsData.departmentMetrics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div style={styles.chartCard}>
            <h3>Score Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={generateScoreDistribution(metricsData.summary.scoreDistribution)}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };
  
  // Render departments tab content
  const renderDepartmentsTab = () => {
    return (
      <div style={styles.tabContent}>
        <div style={styles.chartCard}>
          <h3>Department Performance Comparison</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={metricsData.departmentMetrics}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 5]} />
              <YAxis type="category" dataKey="name" width={150} />
              <Tooltip />
              <Legend />
              <Bar dataKey="averageScore" fill="#4F46E5" name="Average Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div style={styles.chartCard}>
          <h3>Department Completion Rates</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={metricsData.departmentMetrics}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 1]} tickFormatter={(tick) => `${(tick * 100).toFixed(0)}%`} />
              <YAxis type="category" dataKey="name" width={150} />
              <Tooltip formatter={(value) => `${(value * 100).toFixed(0)}%`} />
              <Legend />
              <Bar dataKey="completionRate" fill="#10B981" name="Completion Rate" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };
  
  // Render score trends tab content
  const renderScoreTrendsTab = () => {
    return (
      <div style={styles.tabContent}>
        <div style={styles.chartCard}>
          <h3>Average Score Trends</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={metricsData.scoreTrends}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={50} />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#4F46E5" activeDot={{ r: 8 }} name="Average Score" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div style={styles.chartCard}>
          <h3>Score Trends by Department</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={metricsData.scoreTrends}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={50} />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />
              {metricsData.departmentMetrics.slice(0, 5).map((dept, index) => (
                <Line 
                  key={dept.name}
                  type="monotone" 
                  dataKey={`departmentScores.${dept.name}`} 
                  stroke={colors[index % colors.length]} 
                  name={dept.name} 
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };
  
  // Render completion rates tab content
  const renderCompletionRatesTab = () => {
    return (
      <div style={styles.tabContent}>
        <div style={styles.chartCard}>
          <h3>Review Completion Rates Over Time</h3>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart
              data={metricsData.completionTrends}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={50} />
              <YAxis 
                yAxisId="left" 
                orientation="left" 
                stroke="#4F46E5" 
                domain={[0, 1]}
                tickFormatter={(tick) => `${(tick * 100).toFixed(0)}%`}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                stroke="#10B981" 
              />
              <Tooltip formatter={(value, name) => {
                if (name === "Completion Rate") return `${(value * 100).toFixed(0)}%`;
                return value;
              }} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="rate" 
                fill="#4F46E5" 
                stroke="#4F46E5"
                fillOpacity={0.3}
                yAxisId="left"
                name="Completion Rate"
              />
              <Line 
                type="monotone" 
                dataKey="totalReviews" 
                stroke="#10B981"
                yAxisId="right"
                name="Total Reviews"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        <div style={styles.chartCard}>
          <h3>On-time vs Late Submissions</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={metricsData.completionTrends}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={50} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="onTime" stackId="a" fill="#10B981" name="On Time" />
              <Bar dataKey="late" stackId="a" fill="#EF4444" name="Late" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };
  
  // Helper function to generate score distribution data
  const generateScoreDistribution = (distribution) => {
    if (!distribution) return [];
    
    return [
      { range: '0-1', count: distribution['0-1'] || 0 },
      { range: '1-2', count: distribution['1-2'] || 0 },
      { range: '2-3', count: distribution['2-3'] || 0 },
      { range: '3-4', count: distribution['3-4'] || 0 },
      { range: '4-5', count: distribution['4-5'] || 0 }
    ];
  };
  
  // Color palette for charts
  const colors = [
    '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];
  
  return (
    <div style={styles.container}>
      {/* Updated Header Section with better spacing */}
      <div style={styles.header}>
        <h1 style={styles.title}>Performance Metrics</h1>
      </div>
      
      {/* Filters Section */}
      <div style={styles.filters}>
        <div style={styles.filterGroup}>
          <span style={styles.filterLabel}>Time Period:</span>
          <select 
            style={styles.filterSelect}
            value={timePeriod} 
            onChange={(e) => setTimePeriod(e.target.value)}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
        
        <div style={styles.filterGroup}>
          <span style={styles.filterLabel}>Department:</span>
          <select 
            style={styles.filterSelect}
            value={department} 
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>
        
        <div style={styles.filterGroup}>
          <span style={styles.filterLabel}>Review Type:</span>
          <select 
            style={styles.filterSelect}
            value={reviewType} 
            onChange={(e) => setReviewType(e.target.value)}
          >
            <option value="all">All Reviews</option>
            <option value="performance">Performance</option>
            <option value="probation">Probation</option>
            <option value="peer">Peer</option>
          </select>
        </div>
        
        <div style={styles.filterActions}>
          <button style={styles.actionButton} onClick={handleRefresh}>
            <MdRefresh style={styles.buttonIcon} /> Refresh
          </button>
          <button style={styles.actionButton} onClick={handleExport}>
            <MdFileDownload style={styles.buttonIcon} /> Export
          </button>
        </div>
      </div>
      
      {/* Fixed Tabs Section - Now with proper styling for active/inactive tabs */}
      <div style={styles.tabs}>
        <button 
          style={activeTab === 'overview' ? {...styles.tab, ...styles.activeTab} : styles.tab}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          style={activeTab === 'departments' ? {...styles.tab, ...styles.activeTab} : styles.tab}
          onClick={() => setActiveTab('departments')}
        >
          Departments
        </button>
        <button 
          style={activeTab === 'scoretrends' ? {...styles.tab, ...styles.activeTab} : styles.tab}
          onClick={() => setActiveTab('scoretrends')}
        >
          Score Trends
        </button>
        <button 
          style={activeTab === 'completionrates' ? {...styles.tab, ...styles.activeTab} : styles.tab}
          onClick={() => setActiveTab('completionrates')}
        >
          Completion Rates
        </button>
      </div>
      
      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

// Inline styles with fixes for header and tab underlines
const styles = {
  container: {
    backgroundColor: '#f9fafb',
    padding: '24px 24px 32px',
    borderRadius: '8px',
    height: '100%',
    width: '100%',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    paddingTop: '8px', // Added padding to prevent header from being cut off
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  filters: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '24px',
    alignItems: 'center',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  filterLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#4B5563',
  },
  filterSelect: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #D1D5DB',
    backgroundColor: '#FFFFFF',
    color: '#111827',
    fontSize: '14px',
    minWidth: '180px',
  },
  filterActions: {
    marginLeft: 'auto',
    display: 'flex',
    gap: '8px',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid #D1D5DB',
    backgroundColor: '#FFFFFF',
    color: '#111827',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #E5E7EB',
    marginBottom: '24px',
    gap: '16px',
  },
  // Fixed tab styling to only show underline for active tab
  tab: {
    padding: '12px 16px',
    fontSize: '16px',
    fontWeight: '500',
    color: '#6B7280',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent', // Important! Make inactive tabs have transparent border
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  // Active tab styling with proper underline
  activeTab: {
    color: '#4F46E5',
    borderBottom: '2px solid #4F46E5', // Only active tab gets colored border
  },
  tabContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    flex: 1,
  },
  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
  },
  overviewCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.2s ease',
  },
  cardValue: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#111827',
    margin: '12px 0',
  },
  cardTrend: {
    fontSize: '14px',
    color: '#6B7280',
  },
  chartsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '20px',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px',
    flex: 1,
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #E5E7EB',
    borderTopColor: '#4F46E5',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px',
    gap: '16px',
    flex: 1,
  },
  errorIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#FEE2E2',
    color: '#EF4444',
    fontSize: '24px',
    fontWeight: 'bold',
  },
  retryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 20px',
    borderRadius: '6px',
    backgroundColor: '#4F46E5',
    color: '#FFFFFF',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  buttonIcon: {
    fontSize: '18px',
  },
};

export default Metrics;