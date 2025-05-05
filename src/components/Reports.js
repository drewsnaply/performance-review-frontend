// src/components/Reports.js
import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Scatter, ScatterChart,
  XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Area, ComposedChart, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
  MdRefresh, MdFileDownload, MdTableChart, MdBarChart, MdPieChart, 
  MdTimeline, MdRadar, MdCompare, MdFilterAlt, MdAdd, MdRemove, MdSave,
  MdShare, MdSettings, MdPrint, MdMap
} from 'react-icons/md';
import { CSVLink } from 'react-csv';

// Define the backend URL for API calls
const BACKEND_URL = 'https://performance-review-backend-ab8z.onrender.com';

const Reports = () => {
  // State management
  const [activeReport, setActiveReport] = useState('performance');
  const [timePeriod, setTimePeriod] = useState('quarter');
  const [department, setDepartment] = useState('all');
  const [reviewType, setReviewType] = useState('all');
  const [compareMode, setCompareMode] = useState(false);
  const [comparisonPeriod, setComparisonPeriod] = useState('previous');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [visualizationType, setVisualizationType] = useState('chart'); // chart, table
  const [chartType, setChartType] = useState('bar'); // bar, line, pie, radar, scatter
  const [showFilters, setShowFilters] = useState(true);
  const [drillDownData, setDrillDownData] = useState(null);
  const [isDrillDown, setIsDrillDown] = useState(false);
  const [savedReports, setSavedReports] = useState([]);
  const [customFilters, setCustomFilters] = useState([]);
  const [customizations, setCustomizations] = useState({
    colors: {
      primary: '#4F46E5',
      secondary: '#10B981',
      tertiary: '#F59E0B',
      quaternary: '#EF4444',
      quinary: '#8B5CF6'
    },
    showLegend: true,
    showGrid: true,
    showLabels: true,
    showTooltip: true,
    stacked: false
  });

  // Fetch report data from API
  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Construct the API URL based on selected report and filters
        const params = new URLSearchParams({
          timePeriod,
          department,
          reviewType,
          compareMode: compareMode ? 'true' : 'false',
          comparisonPeriod
        });
        
        // Add any custom filters
        customFilters.forEach(filter => {
          params.append(filter.key, filter.value);
        });
        
        // Update: Use absolute backend URL instead of relative URL
        const response = await fetch(`${BACKEND_URL}/api/reports/${activeReport}?${params}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch report data');
        }
        
        const data = await response.json();
        setReportData(data);
        
        // Reset drill down if changing report type
        setIsDrillDown(false);
        setDrillDownData(null);
        
        // Get departments for filtering if not already loaded
        if (departments.length === 0) {
          // Update: Use absolute backend URL instead of relative URL
          const departmentsResponse = await fetch(`${BACKEND_URL}/api/departments`);
          if (departmentsResponse.ok) {
            const departmentsData = await departmentsResponse.json();
            setDepartments(departmentsData);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError('There was an error loading the report data. Please check your connection and try again.');
        setLoading(false);
      }
    };
    
    fetchReportData();
  }, [activeReport, timePeriod, department, reviewType, compareMode, comparisonPeriod, customFilters]);
  
  // Handle drill-down into specific data points
  const handleDrillDown = (data, index, event) => {
    if (!data || !data.payload) return;
    
    setIsDrillDown(true);
    setDrillDownData({
      title: `Drill-down: ${data.payload.name || data.payload.department || data.payload.date || 'Selected Item'}`,
      data: data.payload
    });
  };
  
  // Handle going back from drill-down view
  const handleBackFromDrillDown = () => {
    setIsDrillDown(false);
    setDrillDownData(null);
  };
  
  // Handle saving the current report configuration
  const handleSaveReport = () => {
    const newSavedReport = {
      id: Date.now(),
      name: `${activeReport.charAt(0).toUpperCase() + activeReport.slice(1)} Report - ${new Date().toLocaleDateString()}`,
      config: {
        activeReport,
        timePeriod,
        department,
        reviewType,
        compareMode,
        comparisonPeriod,
        visualizationType,
        chartType,
        customFilters
      }
    };
    
    setSavedReports([...savedReports, newSavedReport]);
  };
  
  // Handle loading a saved report
  const handleLoadReport = (reportConfig) => {
    setActiveReport(reportConfig.activeReport || 'performance');
    setTimePeriod(reportConfig.timePeriod || 'quarter');
    setDepartment(reportConfig.department || 'all');
    setReviewType(reportConfig.reviewType || 'all');
    setCompareMode(reportConfig.compareMode || false);
    setComparisonPeriod(reportConfig.comparisonPeriod || 'previous');
    setVisualizationType(reportConfig.visualizationType || 'chart');
    setChartType(reportConfig.chartType || 'bar');
    setCustomFilters(reportConfig.customFilters || []);
  };
  
  // Handle adding a custom filter
  const handleAddCustomFilter = () => {
    setCustomFilters([...customFilters, { key: '', value: '' }]);
  };
  
  // Handle removing a custom filter
  const handleRemoveCustomFilter = (index) => {
    const newFilters = [...customFilters];
    newFilters.splice(index, 1);
    setCustomFilters(newFilters);
  };
  
  // Handle updating a custom filter
  const handleUpdateCustomFilter = (index, key, value) => {
    const newFilters = [...customFilters];
    newFilters[index][key] = value;
    setCustomFilters(newFilters);
  };
  
  // Handle refresh button click
  const handleRefresh = () => {
    setLoading(true);
    // Re-trigger the useEffect by changing a dependency
    const currentTime = timePeriod;
    setTimePeriod('refreshing');
    setTimeout(() => setTimePeriod(currentTime), 100);
  };
  
  // Handle export to multiple formats
  const handleExport = (format) => {
    if (!reportData) return;
    
    switch (format) {
      case 'csv':
        // CSV export is handled by CSVLink component
        break;
      case 'pdf':
        // PDF export would be implemented here in a real app
        alert('PDF export feature would be implemented in production');
        break;
      case 'excel':
        // Excel export would be implemented here in a real app
        alert('Excel export feature would be implemented in production');
        break;
      default:
        break;
    }
  };
  
  // Toggle comparison mode
  const handleToggleCompareMode = () => {
    setCompareMode(!compareMode);
  };
  
  // Prepare CSV data for export
  const prepareCSVData = () => {
    if (!reportData) return [];
    
    switch (activeReport) {
      case 'performance':
        return reportData.performanceData || [];
      case 'completion':
        return reportData.completionData || [];
      case 'distribution':
        return reportData.distributionData || [];
      case 'trends':
        return reportData.trendsData || [];
      case 'comparison':
        return reportData.comparisonData || [];
      case 'custom':
        return reportData.customData || [];
      default:
        return [];
    }
  };
  
  // Generate header for the current report
  const getReportHeader = () => {
    switch (activeReport) {
      case 'performance':
        return 'Performance Metrics Report';
      case 'completion':
        return 'Review Completion Report';
      case 'distribution':
        return 'Scoring Distribution Report';
      case 'trends':
        return 'Performance Trends Report';
      case 'comparison':
        return 'Department Comparison Report';
      case 'custom':
        return 'Custom Performance Report';
      default:
        return 'Performance Report';
    }
  };
  
  // Prepare chart configuration based on selected type
  const getChartConfig = () => {
    const config = {
      width: '100%',
      height: 400,
      data: reportData ? 
        (activeReport === 'performance' ? reportData.performanceData : 
         activeReport === 'completion' ? reportData.completionData :
         activeReport === 'distribution' ? reportData.distributionData :
         activeReport === 'trends' ? reportData.trendsData :
         activeReport === 'comparison' ? reportData.comparisonData :
         reportData.customData || []) : [],
      margin: { top: 20, right: 30, left: 20, bottom: 60 }
    };
    
    return config;
  };
  
  // Render drill-down view
  const renderDrillDown = () => {
    if (!drillDownData) return null;
    
    return (
      <div style={styles.drillDownContainer}>
        <div style={styles.drillDownHeader}>
          <h3>{drillDownData.title}</h3>
          <button 
            style={styles.backButton}
            onClick={handleBackFromDrillDown}
          >
            Back to Report
          </button>
        </div>
        
        <div style={styles.drillDownContent}>
          {Object.entries(drillDownData.data)
            .filter(([key]) => key !== 'name' && key !== 'department' && key !== 'date')
            .map(([key, value]) => (
              <div key={key} style={styles.drillDownItem}>
                <div style={styles.drillDownKey}>{formatLabel(key)}</div>
                <div style={styles.drillDownValue}>
                  {typeof value === 'number' ? value.toFixed(2) : String(value)}
                </div>
              </div>
            ))}
        </div>
        
        <div style={styles.drillDownCharts}>
          {renderDrillDownCharts()}
        </div>
      </div>
    );
  };
  
  // Render drill-down charts
  const renderDrillDownCharts = () => {
    if (!drillDownData || !drillDownData.data) return null;
    
    const data = drillDownData.data;
    
    // Create time series data if available
    if (data.timeSeries) {
      return (
        <div style={styles.chartCard}>
          <h3>Trend Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data.timeSeries}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#4F46E5" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    }
    
    // Create score distribution chart if available
    if (data.scoreDistribution) {
      return (
        <div style={styles.chartCard}>
          <h3>Score Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data.scoreDistribution}
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
      );
    }
    
    // If no specific chart data, render generic data visualization
    return (
      <div style={styles.chartCard}>
        <h3>Detailed View</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={[data]}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {Object.keys(data)
              .filter(key => typeof data[key] === 'number' && key !== 'id')
              .map((key, index) => (
                <Bar 
                  key={key} 
                  dataKey={key} 
                  fill={getColorByIndex(index)} 
                  name={formatLabel(key)} 
                />
              ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  // Render performance report
  const renderPerformanceReport = () => {
    if (!reportData || !reportData.performanceData) {
      return renderNoData();
    }
    
    const chartConfig = getChartConfig();
    
    if (visualizationType === 'table') {
      return renderDataTable(reportData.performanceData);
    }
    
    switch (chartType) {
      case 'bar':
        return (
          <div style={styles.chartCard}>
            <h3>Performance Metrics by Department</h3>
            <ResponsiveContainer width={chartConfig.width} height={chartConfig.height}>
              <BarChart
                data={chartConfig.data}
                margin={chartConfig.margin}
                onClick={handleDrillDown}
              >
                {customizations.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                <XAxis 
                  dataKey="department" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80} 
                  tick={customizations.showLabels} 
                />
                <YAxis />
                {customizations.showTooltip && <Tooltip />}
                {customizations.showLegend && <Legend />}
                <Bar dataKey="averageScore" fill={customizations.colors.primary} name="Average Score" />
                <Bar dataKey="completionRate" fill={customizations.colors.secondary} name="Completion Rate" />
                <Bar dataKey="onTimeRate" fill={customizations.colors.tertiary} name="On-Time Rate" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
        
      case 'line':
        return (
          <div style={styles.chartCard}>
            <h3>Performance Trends</h3>
            <ResponsiveContainer width={chartConfig.width} height={chartConfig.height}>
              <LineChart
                data={chartConfig.data}
                margin={chartConfig.margin}
                onClick={handleDrillDown}
              >
                {customizations.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                <XAxis 
                  dataKey="department" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80} 
                  tick={customizations.showLabels} 
                />
                <YAxis />
                {customizations.showTooltip && <Tooltip />}
                {customizations.showLegend && <Legend />}
                <Line type="monotone" dataKey="averageScore" stroke={customizations.colors.primary} activeDot={{ r: 8 }} name="Average Score" />
                <Line type="monotone" dataKey="completionRate" stroke={customizations.colors.secondary} activeDot={{ r: 8 }} name="Completion Rate" />
                <Line type="monotone" dataKey="onTimeRate" stroke={customizations.colors.tertiary} activeDot={{ r: 8 }} name="On-Time Rate" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
        
      case 'pie':
        return (
          <div style={styles.chartCard}>
            <h3>Department Performance Distribution</h3>
            <ResponsiveContainer width={chartConfig.width} height={chartConfig.height}>
              <PieChart onClick={handleDrillDown}>
                <Pie
                  data={chartConfig.data}
                  dataKey="averageScore"
                  nameKey="department"
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
                  fill="#8884d8"
                  label={customizations.showLabels}
                >
                  {chartConfig.data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColorByIndex(index)} />
                  ))}
                </Pie>
                {customizations.showTooltip && <Tooltip />}
                {customizations.showLegend && <Legend />}
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
        
      case 'radar':
        return (
          <div style={styles.chartCard}>
            <h3>Department Performance Radar</h3>
            <ResponsiveContainer width={chartConfig.width} height={chartConfig.height}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartConfig.data} onClick={handleDrillDown}>
                <PolarGrid />
                <PolarAngleAxis dataKey="department" />
                <PolarRadiusAxis angle={30} domain={[0, 5]} />
                <Radar name="Average Score" dataKey="averageScore" stroke={customizations.colors.primary} fill={customizations.colors.primary} fillOpacity={0.6} />
                <Radar name="Completion Rate" dataKey="completionRate" stroke={customizations.colors.secondary} fill={customizations.colors.secondary} fillOpacity={0.6} />
                {customizations.showTooltip && <Tooltip />}
                {customizations.showLegend && <Legend />}
              </RadarChart>
            </ResponsiveContainer>
          </div>
        );
        
      case 'scatter':
        return (
          <div style={styles.chartCard}>
            <h3>Performance Correlation</h3>
            <ResponsiveContainer width={chartConfig.width} height={chartConfig.height}>
              <ScatterChart margin={chartConfig.margin} onClick={handleDrillDown}>
                {customizations.showGrid && <CartesianGrid />}
                <XAxis 
                  type="number" 
                  dataKey="averageScore" 
                  name="Average Score" 
                  tick={customizations.showLabels} 
                />
                <YAxis 
                  type="number" 
                  dataKey="completionRate" 
                  name="Completion Rate" 
                  tick={customizations.showLabels} 
                />
                {chartConfig.data.length > 0 && chartConfig.data[0].reviewCount && (
                  <ZAxis type="number" dataKey="reviewCount" range={[50, 400]} name="Review Count" />
                )}
                {customizations.showTooltip && <Tooltip cursor={{ strokeDasharray: '3 3' }} />}
                <Scatter 
                  name="Departments" 
                  data={chartConfig.data} 
                  fill={customizations.colors.primary} 
                  shape="circle"
                />
                {customizations.showLegend && <Legend />}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        );
        
      default:
        return renderNoData();
    }
  };
  
  // Render completion report
  const renderCompletionReport = () => {
    if (!reportData || !reportData.completionData) {
      return renderNoData();
    }
    
    const chartConfig = getChartConfig();
    
    if (visualizationType === 'table') {
      return renderDataTable(reportData.completionData);
    }
    
    switch (chartType) {
      case 'bar':
        return (
          <div style={styles.chartCard}>
            <h3>Review Completion by Department</h3>
            <ResponsiveContainer width={chartConfig.width} height={chartConfig.height}>
              <BarChart
                data={chartConfig.data}
                margin={chartConfig.margin}
                onClick={handleDrillDown}
              >
                {customizations.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                <XAxis 
                  dataKey="department" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80} 
                  tick={customizations.showLabels} 
                />
                <YAxis />
                {customizations.showTooltip && <Tooltip />}
                {customizations.showLegend && <Legend />}
                <Bar 
                  dataKey="completed" 
                  fill={customizations.colors.primary} 
                  name="Completed" 
                  stackId={customizations.stacked ? "a" : null} 
                />
                <Bar 
                  dataKey="pending" 
                  fill={customizations.colors.secondary} 
                  name="Pending" 
                  stackId={customizations.stacked ? "a" : null} 
                />
                <Bar 
                  dataKey="overdue" 
                  fill={customizations.colors.quaternary} 
                  name="Overdue" 
                  stackId={customizations.stacked ? "a" : null} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
        
      case 'line':
        return (
          <div style={styles.chartCard}>
            <h3>Completion Rate Trends</h3>
            <ResponsiveContainer width={chartConfig.width} height={chartConfig.height}>
              <LineChart
                data={chartConfig.data}
                margin={chartConfig.margin}
                onClick={handleDrillDown}
              >
                {customizations.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                <XAxis 
                  dataKey="date" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80} 
                  tick={customizations.showLabels} 
                />
                <YAxis />
                {customizations.showTooltip && <Tooltip />}
                {customizations.showLegend && <Legend />}
                <Line type="monotone" dataKey="completionRate" stroke={customizations.colors.primary} activeDot={{ r: 8 }} name="Completion Rate" />
                <Line type="monotone" dataKey="onTimeRate" stroke={customizations.colors.tertiary} activeDot={{ r: 8 }} name="On-Time Rate" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
        
      case 'pie':
        return (
          <div style={styles.chartCard}>
            <h3>Completion Status Distribution</h3>
            <ResponsiveContainer width={chartConfig.width} height={chartConfig.height}>
              <PieChart onClick={handleDrillDown}>
                <Pie
                  data={[
                    { name: 'Completed', value: calculateTotalByKey(chartConfig.data, 'completed') },
                    { name: 'Pending', value: calculateTotalByKey(chartConfig.data, 'pending') },
                    { name: 'Overdue', value: calculateTotalByKey(chartConfig.data, 'overdue') }
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
                  fill="#8884d8"
                  label={customizations.showLabels}
                >
                  <Cell fill={customizations.colors.primary} />
                  <Cell fill={customizations.colors.secondary} />
                  <Cell fill={customizations.colors.quaternary} />
                </Pie>
                {customizations.showTooltip && <Tooltip />}
                {customizations.showLegend && <Legend />}
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
        
      default:
        return renderNoData();
    }
  };
  
  // Render distribution report
  const renderDistributionReport = () => {
    if (!reportData || !reportData.distributionData) {
      return renderNoData();
    }
    
    const chartConfig = getChartConfig();
    
    if (visualizationType === 'table') {
      return renderDataTable(reportData.distributionData);
    }
    
    switch (chartType) {
      case 'bar':
        return (
          <div style={styles.chartCard}>
            <h3>Score Distribution</h3>
            <ResponsiveContainer width={chartConfig.width} height={chartConfig.height}>
              <BarChart
                data={chartConfig.data}
                margin={chartConfig.margin}
                onClick={handleDrillDown}
              >
                {customizations.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                <XAxis 
                  dataKey="range" 
                  tick={customizations.showLabels} 
                />
                <YAxis />
                {customizations.showTooltip && <Tooltip />}
                {customizations.showLegend && <Legend />}
                <Bar dataKey="count" fill={customizations.colors.primary} name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
        
      case 'pie':
        return (
          <div style={styles.chartCard}>
            <h3>Score Distribution</h3>
            <ResponsiveContainer width={chartConfig.width} height={chartConfig.height}>
              <PieChart onClick={handleDrillDown}>
                <Pie
                  data={chartConfig.data}
                  dataKey="count"
                  nameKey="range"
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
                  fill="#8884d8"
                  label={customizations.showLabels}
                >
                  {chartConfig.data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColorByIndex(index)} />
                  ))}
                </Pie>
                {customizations.showTooltip && <Tooltip />}
                {customizations.showLegend && <Legend />}
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
        
      default:
        return renderNoData();
    }
  };
  
  // Render trends report
  const renderTrendsReport = () => {
    if (!reportData || !reportData.trendsData) {
      return renderNoData();
    }
    
    const chartConfig = getChartConfig();
    
    if (visualizationType === 'table') {
      return renderDataTable(reportData.trendsData);
    }
    
    switch (chartType) {
      case 'line':
        return (
          <div style={styles.chartCard}>
            <h3>Performance Trends Over Time</h3>
            <ResponsiveContainer width={chartConfig.width} height={chartConfig.height}>
              <LineChart
                data={chartConfig.data}
                margin={chartConfig.margin}
                onClick={handleDrillDown}
              >
                {customizations.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                <XAxis 
                  dataKey="date" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80} 
                  tick={customizations.showLabels} 
                />
                <YAxis />
                {customizations.showTooltip && <Tooltip />}
                {customizations.showLegend && <Legend />}
                <Line type="monotone" dataKey="averageScore" stroke={customizations.colors.primary} activeDot={{ r: 8 }} name="Average Score" />
                <Line type="monotone" dataKey="completionRate" stroke={customizations.colors.secondary} activeDot={{ r: 8 }} name="Completion Rate" />
                <Line type="monotone" dataKey="onTimeRate" stroke={customizations.colors.tertiary} activeDot={{ r: 8 }} name="On-Time Rate" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
        
      case 'bar':
        return (
          <div style={styles.chartCard}>
            <h3>Performance Metrics Over Time</h3>
            <ResponsiveContainer width={chartConfig.width} height={chartConfig.height}>
              <BarChart
                data={chartConfig.data}
                margin={chartConfig.margin}
                onClick={handleDrillDown}
              >
                {customizations.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                <XAxis 
                  dataKey="date" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80} 
                  tick={customizations.showLabels} 
                />
                <YAxis />
                {customizations.showTooltip && <Tooltip />}
                {customizations.showLegend && <Legend />}
                <Bar dataKey="averageScore" fill={customizations.colors.primary} name="Average Score" />
                <Bar dataKey="completionRate" fill={customizations.colors.secondary} name="Completion Rate" />
                <Bar dataKey="onTimeRate" fill={customizations.colors.tertiary} name="On-Time Rate" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
        
      case 'area':
        return (
          <div style={styles.chartCard}>
            <h3>Performance Area Chart</h3>
            <ResponsiveContainer width={chartConfig.width} height={chartConfig.height}>
              <ComposedChart
                data={chartConfig.data}
                margin={chartConfig.margin}
                onClick={handleDrillDown}
              >
                {customizations.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                <XAxis 
                  dataKey="date" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80} 
                  tick={customizations.showLabels} 
                />
                <YAxis />
                {customizations.showTooltip && <Tooltip />}
                {customizations.showLegend && <Legend />}
                <Area type="monotone" dataKey="averageScore" fill={customizations.colors.primary} stroke={customizations.colors.primary} name="Average Score" />
                <Area type="monotone" dataKey="completionRate" fill={customizations.colors.secondary} stroke={customizations.colors.secondary} name="Completion Rate" />
                <Line type="monotone" dataKey="onTimeRate" stroke={customizations.colors.tertiary} name="On-Time Rate" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        );
        
      default:
        return renderNoData();
    }
  };
  
  // Render comparison report
  const renderComparisonReport = () => {
    if (!reportData || !reportData.comparisonData) {
      return renderNoData();
    }
    
    const chartConfig = getChartConfig();
    
    if (visualizationType === 'table') {
      return renderDataTable(reportData.comparisonData);
    }
    
    switch (chartType) {
      case 'bar':
        return (
          <div style={styles.chartCard}>
            <h3>Department Performance Comparison</h3>
            <ResponsiveContainer width={chartConfig.width} height={chartConfig.height}>
              <BarChart
                data={chartConfig.data}
                margin={chartConfig.margin}
                onClick={handleDrillDown}
              >
                {customizations.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                <XAxis 
                  dataKey="department" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80} 
                  tick={customizations.showLabels} 
                />
                <YAxis />
                {customizations.showTooltip && <Tooltip />}
                {customizations.showLegend && <Legend />}
                <Bar dataKey="currentScore" fill={customizations.colors.primary} name="Current Score" />
                {compareMode && (
                  <Bar dataKey="previousScore" fill={customizations.colors.secondary} name="Previous Score" />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
        
      case 'radar':
        return (
          <div style={styles.chartCard}>
            <h3>Department Performance Radar</h3>
            <ResponsiveContainer width={chartConfig.width} height={chartConfig.height}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartConfig.data} onClick={handleDrillDown}>
                <PolarGrid />
                <PolarAngleAxis dataKey="department" />
                <PolarRadiusAxis angle={30} domain={[0, 5]} />
                <Radar name="Current Score" dataKey="currentScore" stroke={customizations.colors.primary} fill={customizations.colors.primary} fillOpacity={0.6} />
                {compareMode && (
                  <Radar name="Previous Score" dataKey="previousScore" stroke={customizations.colors.secondary} fill={customizations.colors.secondary} fillOpacity={0.6} />
                )}
                {customizations.showTooltip && <Tooltip />}
                {customizations.showLegend && <Legend />}
              </RadarChart>
            </ResponsiveContainer>
          </div>
        );
        
      default:
        return renderNoData();
    }
  };
  
  // Render custom report
  const renderCustomReport = () => {
    if (!reportData || !reportData.customData) {
      return renderNoData();
    }
    
    const chartConfig = getChartConfig();
    
    if (visualizationType === 'table') {
      return renderDataTable(reportData.customData);
    }
    
    // Default to bar chart for custom data
    return (
      <div style={styles.chartCard}>
        <h3>Custom Performance Report</h3>
        <ResponsiveContainer width={chartConfig.width} height={chartConfig.height}>
          <BarChart
            data={chartConfig.data}
            margin={chartConfig.margin}
            onClick={handleDrillDown}
          >
            {customizations.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              height={80} 
              tick={customizations.showLabels} 
            />
            <YAxis />
            {customizations.showTooltip && <Tooltip />}
            {customizations.showLegend && <Legend />}
            {Object.keys(chartConfig.data[0] || {})
              .filter(key => typeof chartConfig.data[0][key] === 'number' && key !== 'id')
              .map((key, index) => (
                <Bar 
                  key={key} 
                  dataKey={key} 
                  fill={getColorByIndex(index)} 
                  name={formatLabel(key)} 
                />
              ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  // Render data table for any dataset
  const renderDataTable = (data) => {
    if (!data || data.length === 0) {
      return renderNoData();
    }
    
    // Get all unique keys from data
    const allKeys = Array.from(
      new Set(
        data.flatMap(item => Object.keys(item))
      )
    );
    
    return (
      <div style={styles.tableContainer}>
        <table style={styles.dataTable}>
          <thead>
            <tr>
              {allKeys.map(key => (
                <th key={key} style={styles.tableHeader}>{formatLabel(key)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                style={rowIndex % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd}
                onClick={() => handleDrillDown({ payload: row })}
              >
                {allKeys.map(key => (
                  <td key={`${rowIndex}-${key}`} style={styles.tableCell}>
                    {formatCellValue(row[key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Render no data message
  const renderNoData = () => {
    return (
      <div style={styles.noDataContainer}>
        <div style={styles.noDataIcon}>
          <MdBarChart size={48} color="#9CA3AF" />
        </div>
        <h3 style={styles.noDataTitle}>No Report Data Available</h3>
        <p style={styles.noDataMessage}>
          There is no data available for this report with the current filters.
          Try changing your filters or select a different report type.
        </p>
        <button 
          style={styles.retryButton}
          onClick={handleRefresh}
        >
          <MdRefresh style={styles.buttonIcon} /> Refresh
        </button>
      </div>
    );
  };
  
  // Helper function to get color by index
  const getColorByIndex = (index) => {
    const colorKeys = Object.keys(customizations.colors);
    const colorKey = colorKeys[index % colorKeys.length];
    return customizations.colors[colorKey];
  };
  
  // Helper function to format labels
  const formatLabel = (key) => {
    // Convert camelCase or snake_case to Title Case
    return key
      .replace(/([A-Z])/g, ' $1') // Insert space before capital letters
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/^\w/, c => c.toUpperCase()) // Capitalize first letter
      .trim();
  };
  
  // Helper function to format cell values
  const formatCellValue = (value) => {
    if (value === undefined || value === null) {
      return '-';
    }
    
    if (typeof value === 'number') {
      // Format percentages
      if (value >= 0 && value <= 1 && String(value).includes('.')) {
        return `${(value * 100).toFixed(1)}%`;
      }
      // Format scores
      if (value >= 0 && value <= 5 && !Number.isInteger(value)) {
        return value.toFixed(1);
      }
      // Format integers
      if (Number.isInteger(value)) {
        return value.toString();
      }
      // Format other numbers
      return value.toFixed(2);
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    return String(value);
  };
  
  // Helper function to calculate total by key
  const calculateTotalByKey = (data, key) => {
    if (!data || !data.length) return 0;
    return data.reduce((sum, item) => sum + (item[key] || 0), 0);
  };
  
  // Render content based on active report
  const renderReportContent = () => {
    if (loading) {
      return (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Loading report data...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div style={styles.errorContainer}>
          <div style={styles.errorIcon}>!</div>
          <p>{error}</p>
          <button 
            style={styles.retryButton}
            onClick={handleRefresh}
          >
            <MdRefresh style={styles.buttonIcon} /> Retry
          </button>
        </div>
      );
    }
    
    // If we're in drill-down mode, render that instead
    if (isDrillDown) {
      return renderDrillDown();
    }
    
    // Otherwise render the appropriate report
    switch (activeReport) {
      case 'performance':
        return renderPerformanceReport();
      case 'completion':
        return renderCompletionReport();
      case 'distribution':
        return renderDistributionReport();
      case 'trends':
        return renderTrendsReport();
      case 'comparison':
        return renderComparisonReport();
      case 'custom':
        return renderCustomReport();
      default:
        return renderPerformanceReport();
    }
  };
  
  // Render chart type selector
  const renderChartTypeSelector = () => {
    return (
      <div style={styles.chartTypeSelector}>
        <button
          style={visualizationType === 'chart' ? {...styles.chartTypeButton, ...styles.activeChartType} : styles.chartTypeButton}
          onClick={() => setVisualizationType('chart')}
        >
          <MdBarChart style={styles.chartTypeIcon} />
          Chart
        </button>
        <button
          style={visualizationType === 'table' ? {...styles.chartTypeButton, ...styles.activeChartType} : styles.chartTypeButton}
          onClick={() => setVisualizationType('table')}
        >
          <MdTableChart style={styles.chartTypeIcon} />
          Table
        </button>
      </div>
    );
  };
  
  // Render chart subtype selector (only shown when visualizationType is 'chart')
  const renderChartSubtypeSelector = () => {
    if (visualizationType !== 'chart') return null;
    
    const availableChartTypes = {
      performance: ['bar', 'line', 'pie', 'radar', 'scatter'],
      completion: ['bar', 'line', 'pie'],
      distribution: ['bar', 'pie'],
      trends: ['line', 'bar', 'area'],
      comparison: ['bar', 'radar'],
      custom: ['bar', 'line', 'pie']
    };
    
    const currentChartTypes = availableChartTypes[activeReport] || ['bar'];
    
    return (
      <div style={styles.chartSubtypeSelector}>
        {currentChartTypes.includes('bar') && (
          <button
            style={chartType === 'bar' ? {...styles.chartSubtypeButton, ...styles.activeChartSubtype} : styles.chartSubtypeButton}
            onClick={() => setChartType('bar')}
            title="Bar Chart"
          >
            <MdBarChart style={styles.chartSubtypeIcon} />
          </button>
        )}
        {currentChartTypes.includes('line') && (
          <button
            style={chartType === 'line' ? {...styles.chartSubtypeButton, ...styles.activeChartSubtype} : styles.chartSubtypeButton}
            onClick={() => setChartType('line')}
            title="Line Chart"
          >
            <MdTimeline style={styles.chartSubtypeIcon} />
          </button>
        )}
        {currentChartTypes.includes('pie') && (
          <button
            style={chartType === 'pie' ? {...styles.chartSubtypeButton, ...styles.activeChartSubtype} : styles.chartSubtypeButton}
            onClick={() => setChartType('pie')}
            title="Pie Chart"
          >
            <MdPieChart style={styles.chartSubtypeIcon} />
          </button>
        )}
        {currentChartTypes.includes('radar') && (
          <button
            style={chartType === 'radar' ? {...styles.chartSubtypeButton, ...styles.activeChartSubtype} : styles.chartSubtypeButton}
            onClick={() => setChartType('radar')}
            title="Radar Chart"
          >
            <MdRadar style={styles.chartSubtypeIcon} />
          </button>
        )}
        {currentChartTypes.includes('scatter') && (
          <button
            style={chartType === 'scatter' ? {...styles.chartSubtypeButton, ...styles.activeChartSubtype} : styles.chartSubtypeButton}
            onClick={() => setChartType('scatter')}
            title="Scatter Plot"
          >
            <MdMap style={styles.chartSubtypeIcon} />
          </button>
        )}
        {currentChartTypes.includes('area') && (
          <button
            style={chartType === 'area' ? {...styles.chartSubtypeButton, ...styles.activeChartSubtype} : styles.chartSubtypeButton}
            onClick={() => setChartType('area')}
            title="Area Chart"
          >
            <MdSettings style={styles.chartSubtypeIcon} />
          </button>
        )}
      </div>
    );
  };
  
  // Render comparison toggle
  const renderComparisonToggle = () => {
    return (
      <div style={styles.comparisonToggle}>
        <button
          style={compareMode ? {...styles.compareButton, ...styles.activeCompare} : styles.compareButton}
          onClick={handleToggleCompareMode}
        >
          <MdCompare style={styles.buttonIcon} />
          {compareMode ? 'Comparison On' : 'Enable Comparison'}
        </button>
        
        {compareMode && (
          <select
            style={styles.compareSelect}
            value={comparisonPeriod}
            onChange={(e) => setComparisonPeriod(e.target.value)}
          >
            <option value="previous">Previous Period</option>
            <option value="year">Previous Year</option>
            <option value="target">Target</option>
          </select>
        )}
      </div>
    );
  };
  
  // Render saved reports
  const renderSavedReports = () => {
    if (savedReports.length === 0) return null;
    
    return (
      <div style={styles.savedReportsContainer}>
        <h3 style={styles.savedReportsTitle}>Saved Reports</h3>
        <div style={styles.savedReportsList}>
          {savedReports.map(report => (
            <div key={report.id} style={styles.savedReport}>
              <span style={styles.savedReportName}>{report.name}</span>
              <button
                style={styles.loadReportButton}
                onClick={() => handleLoadReport(report.config)}
              >
                Load
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Render custom filters
  const renderCustomFilters = () => {
    return (
      <div style={styles.customFiltersContainer}>
        {customFilters.map((filter, index) => (
          <div key={index} style={styles.customFilterRow}>
            <input
              type="text"
              placeholder="Filter key"
              value={filter.key}
              onChange={(e) => handleUpdateCustomFilter(index, 'key', e.target.value)}
              style={styles.customFilterInput}
            />
            <input
              type="text"
              placeholder="Filter value"
              value={filter.value}
              onChange={(e) => handleUpdateCustomFilter(index, 'value', e.target.value)}
              style={styles.customFilterInput}
            />
            <button
              style={styles.removeFilterButton}
              onClick={() => handleRemoveCustomFilter(index)}
            >
              <MdRemove />
            </button>
          </div>
        ))}
        <button
          style={styles.addFilterButton}
          onClick={handleAddCustomFilter}
        >
          <MdAdd style={styles.buttonIcon} /> Add Custom Filter
        </button>
      </div>
    );
  };
  
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>{getReportHeader()}</h1>
        <div style={styles.headerActions}>
          <button 
            style={styles.actionButton}
            onClick={handleSaveReport}
          >
            <MdSave style={styles.buttonIcon} /> Save Report
          </button>
          
          <div style={styles.exportDropdown}>
            <button style={styles.actionButton}>
              <MdFileDownload style={styles.buttonIcon} /> Export
            </button>
            <div style={styles.exportMenu}>
              <CSVLink 
                data={prepareCSVData()} 
                filename={`${activeReport}-report.csv`}
                style={styles.exportMenuItem}
              >
                Export to CSV
              </CSVLink>
              <button 
                style={styles.exportMenuItem}
                onClick={() => handleExport('pdf')}
              >
                Export to PDF
              </button>
              <button 
                style={styles.exportMenuItem}
                onClick={() => handleExport('excel')}
              >
                Export to Excel
              </button>
            </div>
          </div>
          
          <button 
            style={styles.actionButton}
            onClick={handleRefresh}
          >
            <MdRefresh style={styles.buttonIcon} /> Refresh
          </button>
          
          <button 
            style={styles.actionButton}
            onClick={() => setShowFilters(!showFilters)}
          >
            <MdFilterAlt style={styles.buttonIcon} /> {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      </div>
      
      {/* Main Content Layout */}
      <div style={styles.contentLayout}>
        {/* Side Panel */}
        <div style={styles.sidePanel}>
          <h2 style={styles.sidePanelTitle}>Report Types</h2>
          <div style={styles.reportTypeList}>
            <button 
              style={activeReport === 'performance' ? {...styles.reportTypeButton, ...styles.activeReportType} : styles.reportTypeButton}
              onClick={() => setActiveReport('performance')}
            >
              Performance Metrics
            </button>
            <button 
              style={activeReport === 'completion' ? {...styles.reportTypeButton, ...styles.activeReportType} : styles.reportTypeButton}
              onClick={() => setActiveReport('completion')}
            >
              Review Completion
            </button>
            <button 
              style={activeReport === 'distribution' ? {...styles.reportTypeButton, ...styles.activeReportType} : styles.reportTypeButton}
              onClick={() => setActiveReport('distribution')}
            >
              Scoring Distribution
            </button>
            <button 
              style={activeReport === 'trends' ? {...styles.reportTypeButton, ...styles.activeReportType} : styles.reportTypeButton}
              onClick={() => setActiveReport('trends')}
            >
              Performance Trends
            </button>
            <button 
              style={activeReport === 'comparison' ? {...styles.reportTypeButton, ...styles.activeReportType} : styles.reportTypeButton}
              onClick={() => setActiveReport('comparison')}
            >
              Department Comparison
            </button>
            <button 
              style={activeReport === 'custom' ? {...styles.reportTypeButton, ...styles.activeReportType} : styles.reportTypeButton}
              onClick={() => setActiveReport('custom')}
            >
              Custom Report
            </button>
          </div>
          
          {renderSavedReports()}
        </div>
        
        {/* Main Content Area */}
        <div style={styles.mainContent}>
          {/* Filters Bar (Conditional) */}
          {showFilters && (
            <div style={styles.filtersBar}>
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
                  <option value="custom">Custom Range</option>
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
              
              {renderComparisonToggle()}
              
              <button 
                style={styles.expandFiltersButton}
                onClick={() => alert('Advanced filters would be shown here')}
              >
                More Filters
              </button>
            </div>
          )}
          
          {/* Visualization Tools */}
          <div style={styles.visualizationTools}>
            {renderChartTypeSelector()}
            {renderChartSubtypeSelector()}
            
            <div style={styles.customizationTools}>
              <button 
                style={styles.customizeButton}
                onClick={() => alert('Chart customization would be shown here')}
              >
                <MdSettings style={styles.buttonIcon} /> Customize
              </button>
              <button 
                style={styles.customizeButton}
                onClick={() => { setCustomizations({...customizations, stacked: !customizations.stacked}) }}
              >
                Stacked: {customizations.stacked ? 'On' : 'Off'}
              </button>
            </div>
          </div>
          
          {/* Report Content */}
          <div style={styles.reportContent}>
            {renderReportContent()}
          </div>
          
          {/* Custom Filters (only for Custom Report) */}
          {activeReport === 'custom' && (
            <div style={styles.customFiltersSection}>
              <h3 style={styles.customFiltersTitle}>Custom Filters</h3>
              {renderCustomFilters()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Inline styles
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
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    paddingTop: '8px', // Prevent header from being cut off
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
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
  exportDropdown: {
    position: 'relative',
    display: 'inline-block',
  },
  exportMenu: {
    display: 'none',
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    minWidth: '160px',
    boxShadow: '0px 8px 16px 0px rgba(0,0,0,0.1)',
    zIndex: 1,
    borderRadius: '6px',
    border: '1px solid #E5E7EB',
    top: '100%',
    right: 0,
  },
  exportMenuItem: {
    display: 'block',
    padding: '10px 16px',
    textDecoration: 'none',
    color: '#111827',
    textAlign: 'left',
    width: '100%',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
  },
  contentLayout: {
    display: 'flex',
    gap: '24px',
    height: 'calc(100% - 60px)',
  },
  sidePanel: {
    width: '250px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sidePanelTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
    marginBottom: '8px',
  },
  reportTypeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  reportTypeButton: {
    padding: '10px 16px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#4B5563',
    fontWeight: '500',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  activeReportType: {
    backgroundColor: '#EEF2FF',
    color: '#4F46E5',
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  filtersBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
    padding: '16px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
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
  comparisonToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  compareButton: {
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
  activeCompare: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
    color: '#4F46E5',
  },
  compareSelect: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #D1D5DB',
    backgroundColor: '#FFFFFF',
    color: '#111827',
    fontSize: '14px',
  },
  expandFiltersButton: {
    marginLeft: 'auto',
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid #D1D5DB',
    backgroundColor: '#FFFFFF',
    color: '#111827',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  visualizationTools: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
    padding: '12px 16px',
  },
  chartTypeSelector: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  chartTypeButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #D1D5DB',
    backgroundColor: '#FFFFFF',
    color: '#111827',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  activeChartType: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
    color: '#4F46E5',
  },
  chartTypeIcon: {
    fontSize: '18px',
  },
  chartSubtypeSelector: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  },
  chartSubtypeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '6px',
    border: '1px solid #D1D5DB',
    backgroundColor: '#FFFFFF',
    color: '#111827',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  activeChartSubtype: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
    color: '#4F46E5',
  },
  chartSubtypeIcon: {
    fontSize: '18px',
  },
  customizationTools: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  customizeButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #D1D5DB',
    backgroundColor: '#FFFFFF',
    color: '#111827',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  reportContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  chartCard: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    height: '100%',
  },
  tableContainer: {
    padding: '20px',
    width: '100%',
    overflowX: 'auto',
  },
  dataTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  tableHeader: {
    textAlign: 'left',
    padding: '12px 16px',
    backgroundColor: '#F9FAFB',
    color: '#111827',
    fontWeight: '600',
    borderBottom: '1px solid #E5E7EB',
  },
  tableRowEven: {
    backgroundColor: '#FFFFFF',
  },
  tableRowOdd: {
    backgroundColor: '#F9FAFB',
  },
  tableCell: {
    padding: '12px 16px',
    borderBottom: '1px solid #E5E7EB',
    color: '#4B5563',
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
  noDataContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px',
    gap: '16px',
    flex: 1,
    textAlign: 'center',
  },
  noDataIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#F3F4F6',
    color: '#9CA3AF',
  },
  noDataTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: '0',
  },
  noDataMessage: {
    fontSize: '14px',
    color: '#6B7280',
    maxWidth: '400px',
  },
  drillDownContainer: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  drillDownHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
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
  drillDownContent: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
    padding: '16px',
  },
  drillDownItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  drillDownKey: {
    fontSize: '14px',
    color: '#6B7280',
    fontWeight: '500',
  },
  drillDownValue: {
    fontSize: '16px',
    color: '#111827',
    fontWeight: '600',
  },
  drillDownCharts: {
    marginTop: '16px',
  },
  savedReportsContainer: {
    marginTop: '16px',
  },
  savedReportsTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    margin: '0',
    marginBottom: '8px',
  },
  savedReportsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  savedReport: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: '#F9FAFB',
    borderRadius: '6px',
    border: '1px solid #E5E7EB',
  },
  savedReportName: {
    fontSize: '14px',
    color: '#111827',
  },
  loadReportButton: {
    padding: '4px 8px',
    borderRadius: '4px',
    backgroundColor: '#EEF2FF',
    color: '#4F46E5',
    border: 'none',
    fontWeight: '500',
    cursor: 'pointer',
  },
  customFiltersSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
    padding: '16px',
    marginTop: '16px',
  },
  customFiltersTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    margin: '0',
    marginBottom: '12px',
  },
  customFiltersContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  customFilterRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  customFilterInput: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #D1D5DB',
    backgroundColor: '#FFFFFF',
    color: '#111827',
    fontSize: '14px',
    flex: 1,
  },
  removeFilterButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    border: '1px solid #D1D5DB',
    backgroundColor: '#FFFFFF',
    color: '#111827',
    cursor: 'pointer',
  },
  addFilterButton: {
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
    marginTop: '8px',
  },
};

// Make sure the exportDropdown shows the menu on hover
document.addEventListener('DOMContentLoaded', () => {
  const exportDropdowns = document.querySelectorAll(`[style*="${styles.exportDropdown}"]`);
  
  exportDropdowns.forEach(dropdown => {
    dropdown.addEventListener('mouseenter', () => {
      const menu = dropdown.querySelector(`[style*="${styles.exportMenu}"]`);
      if (menu) {
        menu.style.display = 'block';
      }
    });
    
    dropdown.addEventListener('mouseleave', () => {
      const menu = dropdown.querySelector(`[style*="${styles.exportMenu}"]`);
      if (menu) {
        menu.style.display = 'none';
      }
    });
  });
});

export default Reports;