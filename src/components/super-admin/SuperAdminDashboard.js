import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaSearch, FaUserShield, FaBuilding, FaUsers, FaChartLine, FaFilter } from 'react-icons/fa';

// Import styles
import '../../styles/SuperAdmin.css';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout, isImpersonating, impersonateCustomer, exitImpersonation } = useAuth();
  
  // State for customer data
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  
  // State for metrics
  const [metrics, setMetrics] = useState({
    organizations: 0,
    employees: 0,
    activeReviews: 0
  });
  
  // State for modals
  const [showImpersonationModal, setShowImpersonationModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // Debug function
  const debugAuthState = () => {
    console.log('=== DEBUG AUTH STATE ===');
    console.log('token:', localStorage.getItem('authToken') ? 'exists' : 'missing');
    console.log('user:', localStorage.getItem('user'));
    console.log('currentUser from context:', currentUser);
    console.log('current path:', window.location.pathname);
    console.log('========================');
  };
  
  // CRITICAL: Clear any redirect flags on mount
  useEffect(() => {
    // Clear any manual redirect flag that might be stuck
    localStorage.removeItem('manual_redirect_in_progress');
    
    // Debug auth state
    debugAuthState();
    
    // Mark as initialized to prevent multiple data fetches
    if (!initialized) {
      fetchCustomers();
      setInitialized(true);
    }
  }, [initialized]);
  
  // Check if user is authorized - with safety checks
  useEffect(() => {
    // CRITICAL: Check token directly first
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    // Debug checks for troubleshooting
    console.log('SuperAdminDashboard auth check:');
    console.log('- Token exists:', !!token);
    console.log('- User data exists:', !!userData);
    
    // Only redirect if we're sure the user isn't authorized
    if (!token) {
      console.log('No auth token, redirecting to login');
      navigate('/login');
      return;
    }
    
    // Handle user data check
    if (userData) {
      try {
        const user = JSON.parse(userData);
        const role = user.role ? user.role.toLowerCase() : null;
        console.log('- User role from localStorage:', role);
        
        // Allow access if localStorage has superadmin role
        if (role === 'superadmin' || role === 'super_admin') {
          console.log('User is superadmin according to localStorage');
          return; // Continue with component render
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    // If execution reaches here, user is not a superadmin
    console.log('User is not authorized as superadmin, redirecting to unauthorized');
    navigate('/unauthorized');
  }, [navigate]);
  
  // Fetch customers data
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      
      // Fetch API call would go here
      // For now, using mock data
      const mockCustomers = [
        {
          id: 1,
          name: 'Acme Corporation',
          email: 'admin@example.com',
          industry: 'Technology',
          plan: 'Enterprise',
          employees: 2,
          reviews: { active: 4, completed: 0 },
          status: 'Active'
        }
      ];
      
      setCustomers(mockCustomers);
      
      // Set metrics
      setMetrics({
        organizations: mockCustomers.length,
        employees: mockCustomers.reduce((sum, customer) => sum + customer.employees, 0),
        activeReviews: mockCustomers.reduce((sum, customer) => sum + customer.reviews.active, 0)
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customer data');
      setLoading(false);
    }
  };
  
  // Handle access button click
  const handleAccessCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowImpersonationModal(true);
  };
  
  // Handle customer details
  const handleCustomerDetails = (customerId) => {
    navigate(`/super-admin/customers/${customerId}/details`);
  };
  
  // Handle impersonation confirmation
  const handleConfirmImpersonation = async () => {
    if (!selectedCustomer) return;
    
    try {
      console.log('Impersonating customer:', selectedCustomer);
      
      // CRITICAL: Store customer information for impersonation BEFORE calling API
      // This ensures other components know impersonation is active
      localStorage.setItem('impersonatedCustomer', JSON.stringify({
        id: selectedCustomer.id,
        name: selectedCustomer.name
      }));
      
      // Call the impersonateCustomer function from auth context
      await impersonateCustomer(selectedCustomer.id);
      
      // Close the modal
      setShowImpersonationModal(false);
      
      // CRITICAL: Use direct navigation for reliability, window.location.href
      // ensures a full page reload which resets any problematic state
      console.log('Impersonation successful, navigating to dashboard');
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error impersonating customer:', error);
      
      // If API call fails but we already set impersonation data, use fallback navigation
      if (localStorage.getItem('impersonatedCustomer')) {
        console.log('Using fallback impersonation navigation');
        setShowImpersonationModal(false);
        window.location.href = '/dashboard';
      } else {
        alert('Failed to access customer account. Please try again.');
      }
    }
  };
  
  // Render customer table
  const renderCustomerTable = () => {
    if (loading) return <p>Loading...</p>;
    if (error) return <p className="error-message">{error}</p>;
    
    return (
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Organization</th>
              <th>Industry</th>
              <th>Plan</th>
              <th>Employees</th>
              <th>Reviews</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <tr key={customer.id}>
                <td>
                  {customer.name}
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{customer.email}</div>
                </td>
                <td>{customer.industry}</td>
                <td>{customer.plan}</td>
                <td>{customer.employees}</td>
                <td>
                  {customer.reviews.active} active
                  <br />
                  {customer.reviews.completed} completed
                </td>
                <td>
                  <span className={`badge-${customer.status.toLowerCase()}`}>
                    {customer.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="button-access"
                      onClick={() => handleAccessCustomer(customer)}
                    >
                      Access
                    </button>
                    <button 
                      className="button-details"
                      onClick={() => handleCustomerDetails(customer.id)}
                    >
                      Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  // Render metrics cards
  const renderMetricsCards = () => {
    return (
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
              <FaBuilding />
            </div>
            <h3 className="stat-card-title">Organizations</h3>
          </div>
          <p className="stat-card-value">{metrics.organizations}</p>
          <p className="stat-card-subtext">{metrics.organizations} active</p>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ backgroundColor: '#f0fdf4', color: '#22c55e' }}>
              <FaUsers />
            </div>
            <h3 className="stat-card-title">Employees</h3>
          </div>
          <p className="stat-card-value">{metrics.employees}</p>
          <p className="stat-card-subtext">Across all orgs</p>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ backgroundColor: '#f0f9ff', color: '#0ea5e9' }}>
              <FaChartLine />
            </div>
            <h3 className="stat-card-title">Active Reviews</h3>
          </div>
          <p className="stat-card-value">{metrics.activeReviews}</p>
          <p className="stat-card-subtext">{metrics.activeReviews} completed</p>
        </div>
      </div>
    );
  };
  
  // Render impersonation modal
  const renderImpersonationModal = () => {
    if (!showImpersonationModal || !selectedCustomer) return null;
    
    return (
      <div className="modal-overlay">
        <div className="modal-container">
          <div className="modal-header">
            <h2>Impersonate Organization</h2>
            <button 
              className="modal-close-button"
              onClick={() => setShowImpersonationModal(false)}
            >
              ×
            </button>
          </div>
          <div className="modal-content">
            <p>You are about to access <strong>{selectedCustomer.name}</strong> as an administrator.</p>
            <p>This will allow you to view and manage their account as if you were logged in as their admin.</p>
          </div>
          <div className="modal-footer">
            <button 
              className="button-secondary"
              onClick={() => setShowImpersonationModal(false)}
            >
              Cancel
            </button>
            <button 
              className="button-primary"
              onClick={handleConfirmImpersonation}
            >
              Continue as Admin
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Render super admin content
  const renderSuperAdminContent = () => {
    return (
      <>
        <h1 className="page-title">Customer Organizations</h1>
        {renderMetricsCards()}
        
        <div className="org-management-header">
          <div>
            <h2 className="page-title">Organization Management</h2>
            <p className="page-subtitle">Manage all customer accounts and access their data.</p>
          </div>
          
          <div className="search-filter-container">
            <div className="search-box">
              <span className="search-icon"><FaSearch /></span>
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search by name, admin email..."
              />
            </div>
            
            <button className="filter-button">
              <FaFilter />
              Filters
            </button>
          </div>
        </div>
        
        {renderCustomerTable()}
      </>
    );
  };
  
  return (
    <div className="dashboard-container">
      <div className="super-admin-container">
        {renderSuperAdminContent()}
        {renderImpersonationModal()}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;