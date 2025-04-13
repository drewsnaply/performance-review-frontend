import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SidebarLayout from '../SidebarLayout';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaKey, FaUserShield } from 'react-icons/fa';
import '../../styles/Dashboard.css';
import '../../styles/SuperAdmin.css';

function SuperAdminUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', or 'password'
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'superadmin' // Default to superadmin for this view
  });
  const [formErrors, setFormErrors] = useState({});
  const [showOnlySuperAdmins, setShowOnlySuperAdmins] = useState(true); // Default to showing only superadmins
  
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
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
    // Confirm user is superadmin
    if (currentUser && !['superadmin', 'super_admin'].includes(currentUser.role.toLowerCase())) {
      navigate('/dashboard');
      return;
    }
    
    // Fetch users
    fetchUsers();
  }, [currentUser, navigate]);

  const fetchUsers = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        
        // Apply superadmin filter by default
        if (showOnlySuperAdmins) {
          setFilteredUsers(data.filter(user => 
            user.role.toLowerCase() === 'superadmin' || user.role.toLowerCase() === 'super_admin'
          ));
        } else {
          setFilteredUsers(data);
        }
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    applyFilters(term, showOnlySuperAdmins);
  };
  
  // Toggle superadmin filter
  const toggleSuperAdminFilter = () => {
    const newFilterValue = !showOnlySuperAdmins;
    setShowOnlySuperAdmins(newFilterValue);
    applyFilters(searchTerm, newFilterValue);
  };
  
  // Apply both search and role filters
  const applyFilters = (term, superAdminsOnly) => {
    let filtered = [...users];
    
    // Apply role filter
    if (superAdminsOnly) {
      filtered = filtered.filter(user => 
        user.role.toLowerCase() === 'superadmin' || user.role.toLowerCase() === 'super_admin'
      );
    }
    
    // Apply search filter
    if (term.trim()) {
      filtered = filtered.filter(user => 
        user.username?.toLowerCase().includes(term.toLowerCase()) ||
        user.email?.toLowerCase().includes(term.toLowerCase()) ||
        user.firstName?.toLowerCase().includes(term.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(term.toLowerCase())
      );
    }
    
    setFilteredUsers(filtered);
  };

  // Open modal for creating a new user
  const handleAddUser = () => {
    setModalMode('create');
    setSelectedUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'superadmin' // Default to superadmin in this view
    });
    setFormErrors({});
    setShowModal(true);
  };

  // Open modal for editing a user
  const handleEditUser = (user) => {
    setModalMode('edit');
    setSelectedUser(user);
    setFormData({
      username: user.username || '',
      email: user.email || '',
      password: '', // Don't set password for editing
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role || 'superadmin'
    });
    setFormErrors({});
    setShowModal(true);
  };

  // Open modal for resetting password
  const handleResetPassword = (user) => {
    setModalMode('password');
    setSelectedUser(user);
    setFormData({
      ...formData,
      password: ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  // Handle deleting a user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Remove user from state
        const updatedUsers = users.filter(u => u._id !== userId);
        setUsers(updatedUsers);
        
        // Also update filtered users
        setFilteredUsers(prevFiltered => prevFiltered.filter(u => u._id !== userId));
      } else {
        throw new Error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear validation error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.username) errors.username = 'Username is required';
    if (!formData.email) errors.email = 'Email is required';
    // Only validate password for password reset mode, not for user creation
    if (modalMode === 'password' && !formData.password) errors.password = 'New password is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      let response;
      
      if (modalMode === 'create') {
        // For new users, we don't need to send a password - the backend will generate one
        const userData = { ...formData };
        // Remove password since the backend will handle this
        delete userData.password;
        
        response = await fetch(`${API_BASE_URL}/api/users`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        });
        
        if (response.ok) {
          alert('User created successfully. A welcome email has been sent with instructions to set up their password.');
        }
      } else if (modalMode === 'edit') {
        // Update existing user
        const updateData = { ...formData };
        delete updateData.password; // Don't send password in edit mode
        
        response = await fetch(`${API_BASE_URL}/api/users/${selectedUser._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });
      } else if (modalMode === 'password') {
        // Reset password
        response = await fetch(`${API_BASE_URL}/api/users/${selectedUser._id}/reset-password`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ newPassword: formData.password })
        });
      }

      if (response.ok) {
        // Refresh user list
        fetchUsers();
        setShowModal(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Operation failed: ${error.message}`);
    }
  };

  // Render modal
  const renderModal = () => {
    if (!showModal) return null;
    
    let title = 'Add New Super Admin';
    if (modalMode === 'edit') title = 'Edit Super Admin';
    if (modalMode === 'password') title = 'Reset Password';
    
    return (
      <div className="modal-overlay">
        <div className="modal-container">
          <div className="modal-content">
            <h2 className="modal-title">{title}</h2>
            
            <form onSubmit={handleSubmit}>
              {modalMode !== 'password' && (
                <>
                  <div className="form-group">
                    <label>Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className={`form-control ${formErrors.username ? 'error' : ''}`}
                    />
                    {formErrors.username && <div className="error-message">{formErrors.username}</div>}
                  </div>
                  
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`form-control ${formErrors.email ? 'error' : ''}`}
                    />
                    {formErrors.email && <div className="error-message">{formErrors.email}</div>}
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="form-control"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="form-control"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Role</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="form-control"
                    >
                      <option value="superadmin">Super Admin</option>
                    </select>
                  </div>
                </>
              )}
              
              {modalMode === 'create' && (
                <div className="form-group">
                  <p className="text-gray-600 text-sm bg-blue-50 p-3 rounded">
                    A welcome email will be sent to the user with instructions to set up their password.
                  </p>
                </div>
              )}

              {modalMode === 'password' && (
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`form-control ${formErrors.password ? 'error' : ''}`}
                    required
                  />
                  {formErrors.password && <div className="error-message">{formErrors.password}</div>}
                </div>
              )}
              
              <div className="modal-actions">
                <button 
                  type="button"
                  className="modal-button secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="modal-button primary"
                >
                  {modalMode === 'create' ? 'Create Super Admin' : (modalMode === 'edit' ? 'Save Changes' : 'Reset Password')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Render role badge
  const renderRoleBadge = (role) => {
    let bgColor = 'bg-gray-200';
    let textColor = 'text-gray-700';
    
    switch (role) {
      case 'superadmin':
      case 'super_admin':
        bgColor = 'bg-purple-100';
        textColor = 'text-purple-800';
        break;
      case 'admin':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        break;
      case 'manager':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'employee':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        break;
      default:
        break;
    }
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${bgColor} ${textColor}`}>
        {role.toUpperCase()}
      </span>
    );
  };

  // Render main content
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      );
    }

    return (
      <>
        <h1 className="page-title">Super Admin Management</h1>
        
        <div className="admin-panel-header">
          <div className="admin-panel-title">
            <h2>System Super Admins</h2>
            <p className="text-gray-600">
              Manage user accounts with super admin privileges
            </p>
          </div>
          
          <div className="search-and-filters">
            <div className="search-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by name, username or email"
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
            </div>
            
            <button 
              className="primary-button flex items-center" 
              onClick={handleAddUser}
              style={{ gap: '8px' }}
            >
              <FaUserShield /> Add Super Admin
            </button>
          </div>
        </div>
        
        <div className="admin-panel-content">
          {filteredUsers.length === 0 ? (
            <div className="empty-state">
              <p>No super admin users found matching your search criteria.</p>
            </div>
          ) : (
            <div className="customer-table-container">
              <table className="customer-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user._id}>
                      <td className="customer-cell">
                        <div className="customer-info">
                          <div className="customer-name">
                            {user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user.username}
                          </div>
                          <div className="customer-email">{user.username}</div>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>{renderRoleBadge(user.role)}</td>
                      <td>
                        <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-button-styled edit"
                            onClick={() => handleEditUser(user)}
                            title="Edit user"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="action-button-styled reset"
                            onClick={() => handleResetPassword(user)}
                            title="Reset password"
                          >
                            <FaKey />
                          </button>
                          {currentUser._id !== user._id && (
                            <button 
                              className="action-button-styled delete"
                              onClick={() => handleDeleteUser(user._id)}
                              title="Delete user"
                            >
                              <FaTrash />
                            </button>
                          )}
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

  return (
    <SidebarLayout user={user} activeView="user-management">
      <div className="super-admin-container">
        {renderContent()}
      </div>
      {renderModal()}
      
      <style>{`
        .action-buttons {
          display: flex;
          gap: 8px;
        }
        
        .action-button-styled {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          color: white;
          font-size: 13px;
        }
        
        /* Edit button */
        .action-button-styled.edit {
          background-color: #f97316; /* Orange color to match your theme */
        }
        
        .action-button-styled.edit:hover {
          background-color: #ea580c;
        }
        
        /* Reset password button */
        .action-button-styled.reset {
          background-color: #f97316; /* Orange color to match your theme */
        }
        
        .action-button-styled.reset:hover {
          background-color: #ea580c;
        }
        
        /* Delete button */
        .action-button-styled.delete {
          background-color: #ef4444; /* Red color for delete action */
        }
        
        .action-button-styled.delete:hover {
          background-color: #dc2626;
        }
        
        .primary-button {
          height: 40px;
          background-color: #6366f1;
          border-radius: 6px;
          padding: 0 16px;
          color: white;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .primary-button:hover {
          background-color: #4f46e5;
        }
      `}</style>
    </SidebarLayout>
  );
}

export default SuperAdminUsers;