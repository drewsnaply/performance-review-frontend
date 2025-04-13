import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Fixed path
import SidebarLayout from '../SidebarLayout'; // Fixed path
import { 
  FaBuilding, 
  FaEnvelope, 
  FaPhone, 
  FaGlobe, 
  FaUser, 
  FaCalendarAlt, 
  FaEdit, 
  FaUserShield,
  FaTimes,
  FaCheck,
  FaInfoCircle
} from 'react-icons/fa';

function CustomerDetailPage() {
  const { customerId } = useParams();
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const navigate = useNavigate();
  
  // Get current user for SidebarLayout
  const { currentUser, impersonateCustomer } = useAuth();
  
  // Create user object for SidebarLayout
  const user = currentUser ? {
    firstName: currentUser.firstName || currentUser.username || 'User',
    lastName: currentUser.lastName || '',
    role: currentUser.role || 'SUPER_ADMIN'
  } : null;

  // API base URL for fetching data
  const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : 'https://performance-review-backend-ab8z.onrender.com';

  useEffect(() => {
    // Check if user is super admin
    if (currentUser && currentUser.role !== 'SUPER_ADMIN') {
      navigate('/dashboard');
      return;
    }
    
    // Fetch customer data
    fetchCustomerDetails();
  }, [currentUser, customerId, navigate]);

  const fetchCustomerDetails = async () => {
    setIsLoading(true);
    
    try {
      // Try fetching from API first
      const response = await fetch(`${API_BASE_URL}/api/customers/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCustomer(data);
        setFormData(data);
        setIsLoading(false);
        return;
      }
      
      throw new Error('Failed to fetch customer details from API');
    } catch (error) {
      console.error('Error fetching customer details from API:', error);
      
      // Use mock data if API fails
      const mockCustomer = {
        id: customerId,
        name: 'Acme Corporation',
        industry: 'Technology',
        plan: 'Enterprise',
        activeEmployees: 120,
        activeReviews: 45,
        completedReviews: 30,
        adminUser: 'admin@acme.com',
        phone: '(555) 123-4567',
        website: 'https://acme.example.com',
        address: '123 Tech Parkway, San Francisco, CA 94107',
        status: 'active',
        createdAt: '2023-10-15',
        subscription: {
          tier: 'Enterprise',
          seats: 150,
          price: '$1,500/month',
          billingCycle: 'Monthly',
          nextBillingDate: '2025-05-15'
        },
        settings: {
          ssoEnabled: true,
          customDomain: true,
          apiAccessEnabled: true,
          dataRetentionDays: 365
        },
        contacts: [
          {
            id: 'c1',
            name: 'John Smith',
            title: 'HR Director',
            email: 'john.smith@acme.example.com',
            phone: '(555) 123-4567',
            isPrimary: true
          },
          {
            id: 'c2',
            name: 'Lisa Johnson',
            title: 'CTO',
            email: 'lisa.johnson@acme.example.com',
            phone: '(555) 987-6543',
            isPrimary: false
          }
        ]
      };
      
      setCustomer(mockCustomer);
      setFormData(mockCustomer);
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // In a real app, send updated data to API
      // const response = await fetch(`${API_BASE_URL}/api/customers/${customerId}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(formData)
      // });
      
      // if (response.ok) {
      //   const updatedCustomer = await response.json();
      //   setCustomer(updatedCustomer);
      //   setIsEditing(false);
      //   return;
      // }
      
      // For now, just update the local state
      setCustomer(formData);
      setIsEditing(false);
      alert('Customer details updated successfully!');
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('Failed to update customer details. Please try again.');
    }
  };

  const handleToggleStatus = async () => {
    try {
      const newStatus = customer.status === 'active' ? 'inactive' : 'active';
      
      // In a real app, send status update to API
      // const response = await fetch(`${API_BASE_URL}/api/customers/${customerId}/status`, {
      //   method: 'PUT',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ status: newStatus })
      // });
      
      // if (response.ok) {
      //   const updatedCustomer = await response.json();
      //   setCustomer(updatedCustomer);
      //   setConfirmDeactivate(false);
      //   return;
      // }
      
      // For now, just update the local state
      setCustomer({
        ...customer,
        status: newStatus
      });
      setFormData({
        ...formData,
        status: newStatus
      });
      setConfirmDeactivate(false);
      
      alert(`Customer ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error('Error toggling customer status:', error);
      alert('Failed to update customer status. Please try again.');
    }
  };

  const handleImpersonateCustomer = async () => {
    try {
      // In a real implementation, this would call your impersonation API
      await impersonateCustomer(customerId);
      
      // Store customer info in localStorage for demo purposes
      localStorage.setItem('impersonatedCustomer', JSON.stringify({
        id: customer.id,
        name: customer.name
      }));
      
      // Navigate to the customer's dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error impersonating customer:', error);
      alert('Failed to access customer account. Please try again.');
    }
  };

  // Function to render the status badge
  const renderStatusBadge = (status) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Render the customer details content
  const renderCustomerContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (!customer) {
      return (
        <div className="p-6 bg-red-50 rounded-lg text-center">
          <p className="text-red-500">Customer not found or access denied.</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => navigate('/super-admin/customers')}
          >
            Back to Customers
          </button>
        </div>
      );
    }

    if (isEditing) {
      return renderEditForm();
    }

    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">{customer.name}</h1>
            <div className="flex items-center mt-2">
              {renderStatusBadge(customer.status)}
              <span className="ml-3 text-gray-500">{customer.industry}</span>
            </div>
          </div>
          <div className="flex space-x-3">
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
              onClick={handleImpersonateCustomer}
            >
              <FaUserShield className="mr-2" />
              Access Account
            </button>
            <button 
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 flex items-center"
              onClick={() => setIsEditing(true)}
            >
              <FaEdit className="mr-2" />
              Edit
            </button>
            <button 
              className={`px-4 py-2 rounded flex items-center ${
                customer.status === 'active' 
                  ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              }`}
              onClick={() => setConfirmDeactivate(true)}
            >
              {customer.status === 'active' ? (
                <>
                  <FaTimes className="mr-2" />
                  Deactivate
                </>
              ) : (
                <>
                  <FaCheck className="mr-2" />
                  Activate
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Customer details cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Basic Information Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FaBuilding className="mr-2 text-blue-500" />
              Company Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="w-1/3 text-gray-500">Industry</div>
                <div className="w-2/3">{customer.industry}</div>
              </div>
              <div className="flex items-start">
                <div className="w-1/3 text-gray-500">Address</div>
                <div className="w-2/3">{customer.address}</div>
              </div>
              <div className="flex items-start">
                <div className="w-1/3 text-gray-500">Phone</div>
                <div className="w-2/3 flex items-center">
                  <FaPhone className="mr-2 text-gray-400" />
                  {customer.phone}
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-1/3 text-gray-500">Website</div>
                <div className="w-2/3 flex items-center">
                  <FaGlobe className="mr-2 text-gray-400" />
                  <a 
                    href={customer.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {customer.website}
                  </a>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-1/3 text-gray-500">Admin User</div>
                <div className="w-2/3 flex items-center">
                  <FaEnvelope className="mr-2 text-gray-400" />
                  {customer.adminUser}
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-1/3 text-gray-500">Created</div>
                <div className="w-2/3 flex items-center">
                  <FaCalendarAlt className="mr-2 text-gray-400" />
                  {new Date(customer.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
          
          {/* Subscription Details Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Subscription Details</h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="w-1/3 text-gray-500">Plan</div>
                <div className="w-2/3 font-medium">{customer.subscription.tier}</div>
              </div>
              <div className="flex items-start">
                <div className="w-1/3 text-gray-500">Seats</div>
                <div className="w-2/3">{customer.subscription.seats}</div>
              </div>
              <div className="flex items-start">
                <div className="w-1/3 text-gray-500">Price</div>
                <div className="w-2/3">{customer.subscription.price}</div>
              </div>
              <div className="flex items-start">
                <div className="w-1/3 text-gray-500">Billing Cycle</div>
                <div className="w-2/3">{customer.subscription.billingCycle}</div>
              </div>
              <div className="flex items-start">
                <div className="w-1/3 text-gray-500">Next Billing</div>
                <div className="w-2/3">{customer.subscription.nextBillingDate}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Additional Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contacts Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Contacts</h2>
            <div className="space-y-4">
              {customer.contacts.map((contact) => (
                <div key={contact.id} className="p-3 border border-gray-200 rounded">
                  <div className="flex justify-between">
                    <div className="font-medium flex items-center">
                      <FaUser className="mr-2 text-gray-400" />
                      {contact.name}
                      {contact.isPrimary && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                          Primary
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{contact.title}</div>
                  </div>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex items-center">
                      <FaEnvelope className="mr-2 text-gray-400" />
                      {contact.email}
                    </div>
                    <div className="flex items-center">
                      <FaPhone className="mr-2 text-gray-400" />
                      {contact.phone}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Settings & Features Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Settings & Features</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span>Single Sign-On (SSO)</span>
                  <button className="ml-1 text-gray-400 hover:text-gray-600">
                    <FaInfoCircle size={14} />
                  </button>
                </div>
                <div>
                  {customer.settings.ssoEnabled ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Enabled</span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">Disabled</span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span>Custom Domain</span>
                  <button className="ml-1 text-gray-400 hover:text-gray-600">
                    <FaInfoCircle size={14} />
                  </button>
                </div>
                <div>
                  {customer.settings.customDomain ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Enabled</span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">Disabled</span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span>API Access</span>
                  <button className="ml-1 text-gray-400 hover:text-gray-600">
                    <FaInfoCircle size={14} />
                  </button>
                </div>
                <div>
                  {customer.settings.apiAccessEnabled ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Enabled</span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">Disabled</span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span>Data Retention</span>
                  <button className="ml-1 text-gray-400 hover:text-gray-600">
                    <FaInfoCircle size={14} />
                  </button>
                </div>
                <div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    {customer.settings.dataRetentionDays} days
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Confirmation Modal */}
        {confirmDeactivate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">
                {customer.status === 'active' ? 'Deactivate' : 'Activate'} Customer
              </h2>
              <p className="mb-4">
                Are you sure you want to {customer.status === 'active' ? 'deactivate' : 'activate'} <strong>{customer.name}</strong>?
              </p>
              {customer.status === 'active' && (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md mb-4">
                  <p className="text-yellow-800 text-sm">
                    <strong>Warning:</strong> Deactivating this customer will prevent all users from accessing their account.
                  </p>
                </div>
              )}
              <div className="flex justify-end space-x-3">
                <button 
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  onClick={() => setConfirmDeactivate(false)}
                >
                  Cancel
                </button>
                <button 
                  className={`px-4 py-2 rounded text-white ${
                    customer.status === 'active' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                  }`}
                  onClick={handleToggleStatus}
                >
                  {customer.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render the edit form
  const renderEditForm = () => {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Edit Customer: {customer.name}</h1>
          <button 
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Company Information</h2>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Company Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Industry</label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Address</label>
                <textarea
                  name="address"
                  value={formData.address || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  rows="3"
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Admin Email</label>
                <input
                  type="email"
                  name="adminUser"
                  value={formData.adminUser || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>
            
            {/* Subscription Details */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Subscription Details</h2>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Plan</label>
                <select
                  name="subscription.tier"
                  value={formData.subscription?.tier || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="Standard">Standard</option>
                  <option value="Professional">Professional</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Seats</label>
                <input
                  type="number"
                  name="subscription.seats"
                  value={formData.subscription?.seats || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  min="1"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Billing Cycle</label>
                <select
                  name="subscription.billingCycle"
                  value={formData.subscription?.billingCycle || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Annually">Annually</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Next Billing Date</label>
                <input
                  type="date"
                  name="subscription.nextBillingDate"
                  value={formData.subscription?.nextBillingDate || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <h2 className="text-lg font-semibold mb-4 mt-6">Settings</h2>
              
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="settings.ssoEnabled"
                    checked={formData.settings?.ssoEnabled || false}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        ssoEnabled: e.target.checked
                      }
                    })}
                    className="mr-2"
                  />
                  Enable Single Sign-On (SSO)
                </label>
              </div>
              
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="settings.customDomain"
                    checked={formData.settings?.customDomain || false}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        customDomain: e.target.checked
                      }
                    })}
                    className="mr-2"
                  />
                  Enable Custom Domain
                </label>
              </div>
              
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="settings.apiAccessEnabled"
                    checked={formData.settings?.apiAccessEnabled || false}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        apiAccessEnabled: e.target.checked
                      }
                    })}
                    className="mr-2"
                  />
                  Enable API Access
                </label>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button 
              type="button"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 mr-3"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <SidebarLayout user={user} activeView="super-admin">
      {renderCustomerContent()}
    </SidebarLayout>
  );
}

export default CustomerDetailPage;