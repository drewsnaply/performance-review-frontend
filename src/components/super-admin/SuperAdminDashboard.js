import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Updated path
import SidebarLayout from '../SidebarLayout'; // Updated path
import { FaSearch, FaUserShield, FaBuilding, FaUsers, FaChartLine } from 'react-icons/fa';

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
        setCustomers(data);
        setFilteredCustomers(data);
        setIsLoading(false);
        return;
      }
      
      throw new Error('Failed to fetch customers from API');
    } catch (error) {
      console.error('Error fetching customers from API:', error);
      
      // Use mock data if API fails
      const mockCustomers = [
        {
          id: '1',
          name: 'Acme Corporation',
          industry: 'Technology',
          plan: 'Enterprise',
          activeEmployees: 120,
          activeReviews: 45,
          completedReviews: 30,
          adminUser: 'admin@acme.com',
          status: 'active',
          createdAt: '2023-10-15'
        },
        {
          id: '2',
          name: 'Globex Inc',
          industry: 'Finance',
          plan: 'Professional',
          activeEmployees: 75,
          activeReviews: 22,
          completedReviews: 18,
          adminUser: 'admin@globex.com',
          status: 'active',
          createdAt: '2024-01-05'
        },
        {
          id: '3',
          name: 'Oceanic Airlines',
          industry: 'Transportation',
          plan: 'Standard',
          activeEmployees: 45,
          activeReviews: 15,
          completedReviews: 10,
          adminUser: 'admin@oceanic.com',
          status: 'inactive',
          createdAt: '2023-08-22'
        },
        {
          id: '4',
          name: 'Stark Industries',
          industry: 'Manufacturing',
          plan: 'Enterprise',
          activeEmployees: 200,
          activeReviews: 85,
          completedReviews: 55,
          adminUser: 'admin@stark.com',
          status: 'active',
          createdAt: '2023-11-30'
        }
      ];
      
      setCustomers(mockCustomers);
      setFilteredCustomers(mockCustomers);
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
      customer.name.toLowerCase().includes(term.toLowerCase()) ||
      customer.adminUser.toLowerCase().includes(term.toLowerCase()) ||
      customer.industry.toLowerCase().includes(term.toLowerCase())
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
      // In a real implementation, this would call your impersonation API
      // For now, we'll simulate it
      await impersonateCustomer(selectedCustomer.id);
      
      // Store customer info in localStorage for demo purposes
      localStorage.setItem('impersonatedCustomer', JSON.stringify({
        id: selectedCustomer.id,
        name: selectedCustomer.name
      }));
      
      // Navigate to the customer's dashboard
      navigate('/dashboard');
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
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded text-xs ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Function to render the user impersonation modal
  const renderImpersonationModal = () => {
    if (!showModal || !selectedCustomer) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Access Customer Account</h2>
          <p className="mb-4">
            You are about to access <strong>{selectedCustomer.name}</strong> as a super admin.
            You will have full access to their account.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md mb-4">
            <p className="text-yellow-800 text-sm">
              <strong>Note:</strong> Your actions will be logged while accessing this customer's account.
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <button 
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={handleAccessCustomer}
            >
              Access Account
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render the Super Admin content
  const renderSuperAdminContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Customer Organizations</h1>
          <p className="text-gray-600">
            Manage all customer accounts and access their data.
          </p>
        </div>
        
        {/* Search and filter section */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, admin email, or industry"
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
        
        {/* Customers list */}
        {filteredCustomers.length === 0 ? (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <p className="text-gray-500">No customers found matching your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left font-semibold">Customer</th>
                  <th className="py-3 px-4 text-left font-semibold">Industry</th>
                  <th className="py-3 px-4 text-left font-semibold">Plan</th>
                  <th className="py-3 px-4 text-left font-semibold">Employees</th>
                  <th className="py-3 px-4 text-left font-semibold">Reviews</th>
                  <th className="py-3 px-4 text-left font-semibold">Status</th>
                  <th className="py-3 px-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(customer => (
                  <tr key={customer.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.adminUser}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{customer.industry}</td>
                    <td className="py-3 px-4">{customer.plan}</td>
                    <td className="py-3 px-4">{customer.activeEmployees}</td>
                    <td className="py-3 px-4">
                      <div>
                        <div>{customer.activeReviews} active</div>
                        <div className="text-sm text-gray-500">{customer.completedReviews} completed</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {renderStatusBadge(customer.status)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button 
                          className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                          onClick={() => handleSelectCustomer(customer)}
                          title="Access customer account"
                        >
                          <FaUserShield />
                        </button>
                        <button 
                          className="p-2 bg-purple-50 text-purple-600 rounded hover:bg-purple-100"
                          onClick={() => handleNavigateToCustomer(customer.id, 'details')}
                          title="View customer details"
                        >
                          <FaBuilding />
                        </button>
                        <button 
                          className="p-2 bg-green-50 text-green-600 rounded hover:bg-green-100"
                          onClick={() => handleNavigateToCustomer(customer.id, 'employees')}
                          title="View employees"
                        >
                          <FaUsers />
                        </button>
                        <button 
                          className="p-2 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100"
                          onClick={() => handleNavigateToCustomer(customer.id, 'analytics')}
                          title="View analytics"
                        >
                          <FaChartLine />
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
    );
  };

  // Render impersonation modal
  return (
    <SidebarLayout user={user} activeView="super-admin">
      {renderSuperAdminContent()}
      {renderImpersonationModal()}
    </SidebarLayout>
  );
}

export default SuperAdminDashboard;