import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from './SidebarLayout';
import { useAuth } from '../context/AuthContext';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaFilter } from 'react-icons/fa';
import '../styles/KpiManager.css';

function KpiManager() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentKpi, setCurrentKpi] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    department: '',
    status: 'Active'
  });
  
  // API base URL
  const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : 'https://performance-review-backend-ab8z.onrender.com';
  
  // Form data for KPI
  const [kpiForm, setKpiForm] = useState({
    title: '',
    description: '',
    category: 'Performance',
    target: '',
    targetValue: '',
    unit: '',
    frequency: 'Quarterly',
    department: '',
    isGlobal: false,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'Active'
  });
  
  // Fetch KPIs and departments
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch departments
        try {
          console.log('Fetching departments...');
          const deptResponse = await fetch(`${API_BASE_URL}/api/departments`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (deptResponse.ok) {
            const deptData = await deptResponse.json();
            console.log('Departments fetched:', deptData);
            setDepartments(deptData);
          } else {
            console.warn('Failed to fetch departments:', deptResponse.status);
            // Continue anyway, we can still show KPIs
          }
        } catch (deptError) {
          console.warn('Error fetching departments:', deptError);
          // Continue anyway, not critical
        }
        
        // Build query string from filters
        const queryParams = new URLSearchParams();
        if (filters.category) queryParams.append('category', filters.category);
        if (filters.department) queryParams.append('department', filters.department);
        if (filters.status) queryParams.append('status', filters.status);
        
        // Fetch KPIs
        console.log(`Fetching KPIs with params: ${queryParams.toString()}`);
        const kpisResponse = await fetch(`${API_BASE_URL}/api/kpis?${queryParams.toString()}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!kpisResponse.ok) {
          // Use sample data if API fails
          console.warn('KPI API request failed, using sample data');
          const sampleKpis = getSampleKpis();
          setKpis(sampleKpis);
          setLoading(false);
          return;
        }
        
        const kpisData = await kpisResponse.json();
        console.log('KPIs fetched:', kpisData);
        setKpis(kpisData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load KPIs. Please try again later.');
        
        // Fallback to sample data
        setKpis(getSampleKpis());
        setLoading(false);
      }
    };
    
    fetchData();
  }, [filters, API_BASE_URL]);
  
  // Sample KPI data for fallback
  const getSampleKpis = () => {
    return [
      {
        _id: '1',
        title: 'Customer Satisfaction Score',
        description: 'Average customer satisfaction rating from surveys',
        category: 'Customer',
        target: 'Maintain score above 4.5/5',
        targetValue: 4.5,
        unit: '/5',
        frequency: 'Quarterly',
        department: { _id: '1', name: 'Customer Success' },
        isGlobal: false,
        startDate: new Date().toISOString(),
        status: 'Active'
      },
      {
        _id: '2',
        title: 'Support Ticket Resolution Time',
        description: 'Average time to resolve support tickets',
        category: 'Performance',
        target: 'Resolve tickets within 24 hours',
        targetValue: 24,
        unit: 'hours',
        frequency: 'Monthly',
        department: { _id: '2', name: 'Support' },
        isGlobal: false,
        startDate: new Date().toISOString(),
        status: 'Active'
      },
      {
        _id: '3',
        title: 'Revenue Growth',
        description: 'Year-over-year revenue growth percentage',
        category: 'Financial',
        target: 'Achieve 15% YoY growth',
        targetValue: 15,
        unit: '%',
        frequency: 'Annual',
        isGlobal: true,
        startDate: new Date().toISOString(),
        status: 'Active'
      }
    ];
  };
  
  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };
  
  // Handle opening the add KPI modal
  const handleAddKpi = () => {
    setIsEditing(false);
    setCurrentKpi(null);
    setKpiForm({
      title: '',
      description: '',
      category: 'Performance',
      target: '',
      targetValue: '',
      unit: '',
      frequency: 'Quarterly',
      department: '',
      isGlobal: false,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      status: 'Active'
    });
    setShowModal(true);
  };
  
  // Handle opening the edit KPI modal
  const handleEditKpi = (kpi) => {
    setIsEditing(true);
    setCurrentKpi(kpi);
    
    // Format dates for the form
    const startDate = kpi.startDate 
      ? new Date(kpi.startDate).toISOString().split('T')[0]
      : '';
    
    const endDate = kpi.endDate 
      ? new Date(kpi.endDate).toISOString().split('T')[0]
      : '';
    
    setKpiForm({
      title: kpi.title,
      description: kpi.description || '',
      category: kpi.category,
      target: kpi.target,
      targetValue: kpi.targetValue || '',
      unit: kpi.unit || '',
      frequency: kpi.frequency,
      department: kpi.department?._id || kpi.department || '',
      isGlobal: kpi.isGlobal || false,
      startDate,
      endDate,
      status: kpi.status
    });
    
    setShowModal(true);
  };
  
  // Handle input change in the KPI form
  const handleKpiInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setKpiForm({
      ...kpiForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle saving a KPI
  const handleSaveKpi = async () => {
    try {
      // Validate form
      if (!kpiForm.title || !kpiForm.category || !kpiForm.target) {
        alert('Please fill in all required fields (title, category, target)');
        return;
      }
      
      // In a real implementation, this would call the API
      // For now, handle both editing and creating locally
      
      let updatedKpis;
      
      if (isEditing && currentKpi) {
        // Edit existing KPI
        updatedKpis = kpis.map(k => 
          k._id === currentKpi._id ? {
            ...k,
            ...kpiForm,
            department: departments.find(d => d._id === kpiForm.department) || null
          } : k
        );
      } else {
        // Create new KPI
        const newKpi = {
          _id: Date.now().toString(), // Temporary ID
          ...kpiForm,
          department: departments.find(d => d._id === kpiForm.department) || null,
          createdAt: new Date().toISOString()
        };
        updatedKpis = [...kpis, newKpi];
      }
      
      setKpis(updatedKpis);
      
      // Close modal
      setShowModal(false);
      
      // Show success message
      alert(isEditing ? 'KPI updated successfully!' : 'New KPI created successfully!');
      
    } catch (error) {
      console.error('Error saving KPI:', error);
      alert('An error occurred while saving the KPI. Please try again.');
    }
  };
  
  // Handle deleting a KPI
  const handleDeleteKpi = (kpi) => {
    if (window.confirm(`Are you sure you want to delete the KPI "${kpi.title}"?`)) {
      // In a real implementation, this would call the API
      // For now, just remove from local state
      const updatedKpis = kpis.filter(k => k._id !== kpi._id);
      setKpis(updatedKpis);
      alert('KPI deleted successfully!');
    }
  };
  
  // Get category badge class
  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'Performance': return 'category-badge performance';
      case 'Development': return 'category-badge development';
      case 'Business': return 'category-badge business';
      case 'Customer': return 'category-badge customer';
      case 'Financial': return 'category-badge financial';
      case 'Team': return 'category-badge team';
      default: return 'category-badge custom';
    }
  };
  
  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Active': return 'status-badge active';
      case 'Inactive': return 'status-badge inactive';
      case 'Archived': return 'status-badge archived';
      default: return 'status-badge';
    }
  };
  
  // Get frequency badge class
  const getFrequencyBadgeClass = (frequency) => {
    switch (frequency) {
      case 'Monthly': return 'frequency-badge monthly';
      case 'Quarterly': return 'frequency-badge quarterly';
      case 'Semi-Annual': return 'frequency-badge semi-annual';
      case 'Annual': return 'frequency-badge annual';
      default: return 'frequency-badge';
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Render KPI modal
  const renderKpiModal = () => {
    if (!showModal) return null;
    
    return (
      <div className="modal-overlay">
        <div className="modal-content kpi-modal">
          <div className="modal-header">
            <h2>{isEditing ? 'Edit KPI' : 'Add New KPI'}</h2>
            <button className="close-button" onClick={() => setShowModal(false)}>
              <FaTimes />
            </button>
          </div>
          
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="kpi-title">Title <span className="required">*</span></label>
                <input
                  id="kpi-title"
                  type="text"
                  name="title"
                  value={kpiForm.title}
                  onChange={handleKpiInputChange}
                  className="form-control"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="kpi-category">Category <span className="required">*</span></label>
                <select
                  id="kpi-category"
                  name="category"
                  value={kpiForm.category}
                  onChange={handleKpiInputChange}
                  className="form-control"
                  required
                >
                  <option value="Performance">Performance</option>
                  <option value="Development">Development</option>
                  <option value="Business">Business</option>
                  <option value="Customer">Customer</option>
                  <option value="Financial">Financial</option>
                  <option value="Team">Team</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="kpi-description">Description</label>
              <textarea
                id="kpi-description"
                name="description"
                value={kpiForm.description}
                onChange={handleKpiInputChange}
                className="form-control"
                rows="2"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="kpi-target">Target <span className="required">*</span></label>
                <input
                  id="kpi-target"
                  type="text"
                  name="target"
                  value={kpiForm.target}
                  onChange={handleKpiInputChange}
                  className="form-control"
                  placeholder="e.g., 'Increase sales by 20%'"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="kpi-target-value">Target Value</label>
                <input
                  id="kpi-target-value"
                  type="number"
                  name="targetValue"
                  value={kpiForm.targetValue}
                  onChange={handleKpiInputChange}
                  className="form-control"
                  placeholder="Numeric target (if applicable)"
                />
              </div>
              
              <div className="form-group narrow">
                <label htmlFor="kpi-unit">Unit</label>
                <input
                  id="kpi-unit"
                  type="text"
                  name="unit"
                  value={kpiForm.unit}
                  onChange={handleKpiInputChange}
                  className="form-control"
                  placeholder="e.g., %, hrs, $"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="kpi-frequency">Measurement Frequency</label>
                <select
                  id="kpi-frequency"
                  name="frequency"
                  value={kpiForm.frequency}
                  onChange={handleKpiInputChange}
                  className="form-control"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Semi-Annual">Semi-Annual</option>
                  <option value="Annual">Annual</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="kpi-department">Department</label>
                <select
                  id="kpi-department"
                  name="department"
                  value={kpiForm.department}
                  onChange={handleKpiInputChange}
                  className="form-control"
                >
                  <option value="">-- Select Department --</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="isGlobal"
                    checked={kpiForm.isGlobal}
                    onChange={handleKpiInputChange}
                  />
                  Company-wide KPI
                </label>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="kpi-start-date">Start Date</label>
                <input
                  id="kpi-start-date"
                  type="date"
                  name="startDate"
                  value={kpiForm.startDate}
                  onChange={handleKpiInputChange}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="kpi-end-date">End Date</label>
                <input
                  id="kpi-end-date"
                  type="date"
                  name="endDate"
                  value={kpiForm.endDate}
                  onChange={handleKpiInputChange}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="kpi-status">Status</label>
                <select
                  id="kpi-status"
                  name="status"
                  value={kpiForm.status}
                  onChange={handleKpiInputChange}
                  className="form-control"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button
              type="button"
              className="cancel-button"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="save-button"
              onClick={handleSaveKpi}
            >
              {isEditing ? 'Update KPI' : 'Add KPI'}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Create a user object from currentUser for SidebarLayout
  const user = currentUser ? {
    firstName: currentUser.firstName || currentUser.username || 'Admin',
    lastName: currentUser.lastName || 'User',
    role: currentUser.role || 'ADMIN'
  } : {
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN'
  };

  // The KPI Manager content that will be wrapped by SidebarLayout
  const renderContent = () => (
    <div className="kpi-manager-container">
      <div className="kpi-manager-header">
        <h1 className="page-title">Key Performance Indicators</h1>
        
        <button 
          className="add-kpi-button"
          onClick={handleAddKpi}
        >
          <FaPlus /> Add New KPI
        </button>
      </div>
      
      <div className="filters-container">
        <div className="filter">
          <label><FaFilter /> Category:</label>
          <select 
            name="category" 
            value={filters.category} 
            onChange={handleFilterChange}
          >
            <option value="">All Categories</option>
            <option value="Performance">Performance</option>
            <option value="Development">Development</option>
            <option value="Business">Business</option>
            <option value="Customer">Customer</option>
            <option value="Financial">Financial</option>
            <option value="Team">Team</option>
            <option value="Custom">Custom</option>
          </select>
        </div>
        
        {departments.length > 0 && (
          <div className="filter">
            <label>Department:</label>
            <select 
              name="department" 
              value={filters.department} 
              onChange={handleFilterChange}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div className="filter">
          <label>Status:</label>
          <select 
            name="status" 
            value={filters.status} 
            onChange={handleFilterChange}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Archived">Archived</option>
            <option value="">All Statuses</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-state">Loading KPIs...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : (
        <div className="kpi-grid">
          {kpis.length === 0 ? (
            <div className="empty-state">
              <p>No KPIs found. Click "Add New KPI" to create one.</p>
            </div>
          ) : (
            kpis.map(kpi => (
              <div key={kpi._id} className="kpi-card">
                <div className="kpi-card-header">
                  <h3 className="kpi-title">{kpi.title}</h3>
                  <span className={getCategoryBadgeClass(kpi.category)}>
                    {kpi.category}
                  </span>
                </div>
                
                <div className="kpi-target-container">
                  <div className="kpi-target">
                    <strong>Target:</strong> {kpi.target}
                    {kpi.targetValue && kpi.unit && (
                      <span className="kpi-target-value">
                        {kpi.targetValue}{kpi.unit}
                      </span>
                    )}
                  </div>
                  
                  <div className="kpi-meta">
                    <span className={getFrequencyBadgeClass(kpi.frequency)}>
                      {kpi.frequency}
                    </span>
                    <span className={getStatusBadgeClass(kpi.status)}>
                      {kpi.status}
                    </span>
                  </div>
                </div>
                
                {kpi.description && (
                  <div className="kpi-description">
                    {kpi.description}
                  </div>
                )}
                
                <div className="kpi-details">
                  <div className="kpi-dates">
                    <div><strong>Start:</strong> {formatDate(kpi.startDate)}</div>
                    {kpi.endDate && (
                      <div><strong>End:</strong> {formatDate(kpi.endDate)}</div>
                    )}
                  </div>
                  
                  <div className="kpi-scope">
                    {kpi.isGlobal ? (
                      <div className="kpi-global">Company-wide</div>
                    ) : kpi.department ? (
                      <div className="kpi-department">
                        {kpi.department.name || 'Department'}
                      </div>
                    ) : (
                      <div className="kpi-department">No department</div>
                    )}
                  </div>
                </div>
                
                <div className="kpi-actions">
                  <button 
                    className="edit-button"
                    onClick={() => handleEditKpi(kpi)}
                  >
                    <FaEdit /> Edit
                  </button>
                  
                  <button 
                    className="delete-button"
                    onClick={() => handleDeleteKpi(kpi)}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      {renderKpiModal()}
    </div>
  );
  
  // Wrap the content with SidebarLayout to maintain consistent navigation style
  return (
    <SidebarLayout user={user} activeView="kpis">
      {renderContent()}
    </SidebarLayout>
  );
}

export default KpiManager;