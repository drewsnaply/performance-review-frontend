import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SidebarLayout from '../SidebarLayout';
import { FaSearch, FaUserShield, FaBuilding, FaUsers, FaChartLine, FaFilter } from 'react-icons/fa';
import '../../styles/Dashboard.css';
import '../../styles/SuperAdmin.css';

function SuperAdminDashboard() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  
  // Get current user for SidebarLayout
  const { currentUser, impersonateCustomer } = useAuth();
  
  // Create user object for SidebarLayout
  const user = currentUser ? {
    firstName: currentUser.firstName || currentUser.username || 'User',
    lastName: currentUser.lastName || '',
    role: currentUser.role || 'superadmin'
  } : null;

  // API base URL for fetching data
  const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : 'https://performance-review-backend-ab8z.onrender.com';

  useEffect(() => {
    // Check if user is super admin (fixed to use lowercase and case-insensitive comparison)
    if (currentUser && currentUser.role.toLowerCase() !== 'superadmin') {
      navigate('/dashboard');
      return;
    }
    
    // Fetch customers data
    fetchCustomers();
  }, [currentUser, navigate]);

  const fetchCustomers = async () => {
    setIsLoading(true);
    
    try {
      // Try fetching from API first
      const response = await fetch(`${API_BASE_URL}/api/customers`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Ensure we have an array, even if it's empty
        const customerData = Array.isArray(data) ? data : [];
        console.log('Fetched customer data:', customerData);
        
        // If we have real data, use it
        if (customerData.length > 0) {
          setCustomers(customerData);
          setFilteredCustomers(customerData);
        } else {
          // If no real data, use minimal fallback
          const fallbackCustomers = [
            {
              id: '1',
              name: 'Your Organization',
              industry: 'Technology',
              plan: 'Enterprise',
              activeEmployees: 2,
              activeReviews: 0,
              completedReviews: 0,
              adminUser: 'admin@yourcompany.com',
              status: 'active',
              createdAt: new Date().toISOString().split('T')[0]
            }
          ];
          setCustomers(fallbackCustomers);
          setFilteredCustomers(fallbackCustomers);
        }
        
        setIsLoading(false);
        return;
      }
      
      throw new Error('Failed to fetch customers from API');
    } catch (error) {
      console.error('Error fetching customers from API:', error);
      
      // Use real data model with placeholder values
      const fallbackCustomers = [
        {
          id: '1',
          name: 'Your Organization',
          industry: 'Technology',
          plan: 'Enterprise',
          activeEmployees: 2,
          activeReviews: 0,
          completedReviews: 0,
          adminUser: 'admin@yourcompany.com',
          status: 'active',
          createdAt: new Date().toISOString().split('T')[0]
        }
      ];
      
      setCustomers(fallbackCustomers);
      setFilteredCustomers(fallbackCustomers);
      setIsLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (!term.trim()) {
      setFilteredCustomers(customers);
      return;
    }
    
    const filtered = customers.filter(customer => 
      customer.name?.toLowerCase().includes(term.toLowerCase()) ||
      customer.adminUser?.toLowerCase().includes(term.toLowerCase()) ||
      customer.industry?.toLowerCase().includes(term.toLowerCase())
    );
    
    setFilteredCustomers(filtered);
  };

  // Handle customer selection
  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  // Handle access customer account
  const handleAccessCustomer = async () => {
    if (!selectedCustomer) return;
    
    try {
      // Store customer info in localStorage FIRST
      // This ensures the impersonation state is available immediately
      localStorage.setItem('impersonatedCustomer', JSON.stringify({
        id: selectedCustomer.id,
        name: selectedCustomer.name
      }));
      
      // Then call the impersonation function if it exists
      if (typeof impersonateCustomer === 'function') {
        await impersonateCustomer(selectedCustomer.id);
      }
      
      // Use window.location.href instead of navigate for a full page refresh
      // This ensures all components detect the impersonation state
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error accessing customer account:', error);
      alert('Failed to access customer account. Please try again.');
    }
  };

  // Handle customer navigation
  const handleNavigateToCustomer = (customerId, route) => {
    navigate(`/super-admin/customers/${customerId}/${route}`);
  };

  // Function to render the status badge
  const renderStatusBadge = (status) => {
    if (!status) return null;
    
    return (
      <span className={`status-badge ${status}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Function to render the user impersonation modal
  const renderImpersonationModal = () => {
    if (!showModal || !selectedCustomer) return null;
    
    return (
      <div className="modal-overlay">
        <div className="modal-container">
          <div className="modal-content">
            <h2 className="modal-title">Access Customer Account</h2>
            <p className="modal-description">
              You are about to access <strong>{selectedCustomer.name}</strong> as a super admin.
              You will have full access to their account.
            </p>
            <div className="modal-warning">
              <p>
                <strong>Note:</strong> Your actions will be logged while accessing this customer's account.
              </p>
            </div>
            <div className="modal-actions">
              <button 
                className="modal-button secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button 
                className="modal-button primary"
                onClick={handleAccessCustomer}
              >
                Access Account
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render statistics cards
  const renderStatCards = () => {
    // Calculate totals with null/undefined checks
    const totalEmployees = customers.reduce((sum, c) => sum + (c.activeEmployees || 0), 0);
    const totalActive = customers.reduce((sum, c) => sum + (c.activeReviews || 0), 0);
    const totalCompleted = customers.reduce((sum, c) => sum + (c.completedReviews || 0), 0);
    const activeOrgs = customers.filter(c => c.status === 'active').length;
    
    return (
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon"><FaBuilding /></div>
          <div className="stat-content">
            <div className="stat-value">{customers.length}</div>
            <div className="stat-label">Organizations</div>
          </div>
          <div className="stat-info">{activeOrgs} active</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon"><FaUsers /></div>
          <div className="stat-content">
            <div className="stat-value">{totalEmployees}</div>
            <div className="stat-label">Employees</div>
          </div>
          <div className="stat-info">Across all orgs</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon"><FaChartLine /></div>
          <div className="stat-content">
            <div className="stat-value">{totalActive}</div>
            <div className="stat-label">Active Reviews</div>
          </div>
          <div className="stat-info">{totalCompleted} completed</div>
        </div>
      </div>
    );
  };

  // Render the Super Admin content
  const renderSuperAdminContent = () => {
    if (isLoading) {
      return (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading organization data...</p>
        </div>
      );
    }

    // Handle the case where there are no customers
    if (customers.length === 0) {
      return (
        <>
          <h1 className="page-title">Customer Organizations</h1>
          <div className="admin-panel-content">
            <div className="empty-state">
              <FaBuilding style={{ fontSize: '3rem', color: '#cbd5e0', marginBottom: '1rem' }} />
              <h3>No Organizations Found</h3>
              <p>There are currently no organizations in the system.</p>
            </div>
          </div>
        </>
      );
    }

    return (
      <>
        <h1 className="page-title">Customer Organizations</h1>
        
        {/* Stats Cards */}
        {renderStatCards()}
        
        {/* Search and filters header */}
        <div className="admin-panel-header">
          <div className="admin-panel-title">
            <h2>Organization Management</h2>
            <p className="text-gray-600">
              Manage all customer accounts and access their data.
            </p>
          </div>
          
          <div className="search-and-filters">
            <div className="search-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by name, admin email, or industry"
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
            </div>
            
            <button className="filter-button">
              <FaFilter className="mr-2" /> Filters
            </button>
          </div>
        </div>
        
        {/* Customers list */}
        <div className="admin-panel-content">
          {filteredCustomers.length === 0 ? (
            <div className="empty-state">
              <p>No organizations found matching your search criteria.</p>
            </div>
          ) : (
            <div className="customer-table-container">
              <table className="customer-table">
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
                  {filteredCustomers.map(customer => (
                    <tr key={customer.id || Math.random().toString()}>
                      <td className="customer-cell">
                        <div className="customer-info">
                          <div className="customer-name">{customer.name || 'Unnamed Organization'}</div>
                          <div className="customer-email">{customer.adminUser || 'No admin email'}</div>
                        </div>
                      </td>
                      <td>{customer.industry || 'Not specified'}</td>
                      <td>
                        <span className="plan-badge">{customer.plan || 'Standard'}</span>
                      </td>
                      <td className="numeric-cell">{customer.activeEmployees || 0}</td>
                      <td className="reviews-cell">
                        <div className="reviews-info">
                          <div>{customer.activeReviews || 0} active</div>
                          <div className="completed-reviews">{customer.completedReviews || 0} completed</div>
                        </div>
                      </td>
                      <td>
                        {renderStatusBadge(customer.status || 'active')}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-button"
                            onClick={() => handleSelectCustomer(customer)}
                            title="Access customer account"
                          >
                            <FaUserShield className="mr-1" /> Access
                          </button>
                          <button 
                            className="action-button secondary"
                            onClick={() => handleNavigateToCustomer(customer.id, 'details')}
                            title="View customer details"
                          >
                            <FaBuilding className="mr-1" /> Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    );
  };

  // Render impersonation modal
  return (
    <SidebarLayout user={user} activeView="super-admin">
      <div className="super-admin-container">
        {renderSuperAdminContent()}
      </div>
      {/* Render the modal at the root level, outside the normal document flow */}
      {renderImpersonationModal()}
    </SidebarLayout>
  );
}

export default SuperAdminDashboard;