import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useDepartments } from '../context/DepartmentContext';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css'; // Reuse existing styles
import '../styles/Settings.css'; // Settings-specific styles

function Settings() {
  const navigate = useNavigate();
  const { currentUser, hasPermission } = useAuth();
  const { 
    employees,
    departments, 
    addDepartment, 
    updateDepartment, 
    deleteDepartment,
    isLoading,
    error,
    canPerformAction,
    handleActionWithFeedback
  } = useDepartments();

  // Log employee data to see its structure
  console.log('Detailed first employee:', employees[0]);
  
  const [activeTab, setActiveTab] = useState('departments');
  const [isAddDepartmentModalOpen, setIsAddDepartmentModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Clear messages after 5 seconds
  useEffect(() => {
    if (errorMessage || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
        setSuccessMessage('');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [errorMessage, successMessage]);

  // Check if the current user has access to settings
  // Redirect to unauthorized if they don't have access
  if (!currentUser || 
      (currentUser.role !== 'admin' && 
       currentUser.role !== 'superadmin' && 
       currentUser.role !== 'manager')) {
    return <Navigate to="/unauthorized" replace />;
  }

  const handleAddDepartment = async (departmentData) => {
    if (!canPerformAction('add_department')) {
      setErrorMessage('You do not have permission to add departments');
      return;
    }
    
    const result = await handleActionWithFeedback('add_department', { departmentData });
    
    if (result) {
      setSuccessMessage('Department added successfully');
      setIsAddDepartmentModalOpen(false);
    } else {
      setErrorMessage(error || 'Failed to add department');
    }
  };

  const handleEditDepartment = (department) => {
    if (!canPerformAction('edit_department')) {
      setErrorMessage('You do not have permission to edit departments');
      return;
    }
    
    setSelectedDepartment(department);
    setIsAddDepartmentModalOpen(true);
  };

  const handleUpdateDepartment = async (departmentId, updatedData) => {
    if (!canPerformAction('edit_department')) {
      setErrorMessage('You do not have permission to update departments');
      return;
    }
    
    const result = await handleActionWithFeedback('update_department', { 
      departmentId, 
      departmentData: updatedData 
    });
    
    if (result) {
      setSuccessMessage('Department updated successfully');
      setIsAddDepartmentModalOpen(false);
    } else {
      setErrorMessage(error || 'Failed to update department');
    }
  };

  const openDeleteConfirmation = (departmentId) => {
    if (!canPerformAction('delete_department')) {
      setErrorMessage('You do not have permission to delete departments');
      return;
    }
    
    setDepartmentToDelete(departmentId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteDepartment = async () => {
    const result = await handleActionWithFeedback('delete_department', { 
      departmentId: departmentToDelete 
    });
    
    if (result) {
      setSuccessMessage('Department deleted successfully');
    } else {
      setErrorMessage(error || 'Failed to delete department. Make sure it has no active employees.');
    }
    
    setIsDeleteModalOpen(false);
    setDepartmentToDelete(null);
  };

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setActiveDropdown(null);
  };

  const canUserAccessTab = (tabName) => {
    switch(tabName) {
      case 'departments':
        return canPerformAction('view_departments');
        
      case 'company-info':
        return currentUser.role === 'admin' || currentUser.role === 'superadmin';
        
      case 'system-settings':
      case 'integrations':
      case 'audit-log':
        return currentUser.role === 'admin' || currentUser.role === 'superadmin';
        
      default:
        return false;
    }
  };

  const renderDepartmentsTab = () => (
    <div className="settings-departments">
      <div className="settings-header">
        <h2>Department Management</h2>
        {canPerformAction('add_department') && (
          <button 
            className="primary-button"
            onClick={() => {
              setSelectedDepartment(null);
              setIsAddDepartmentModalOpen(true);
            }}
          >
            Add Department
          </button>
        )}
      </div>
      
      <div className="table-container">
        <table className="settings-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Manager</th>
              <th>Employees</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map(dept => (
              <tr key={dept._id || dept.id}>
                <td className="dept-name">{dept.name}</td>
                <td>{dept.description}</td>
                <td>{dept.manager || 'Not Assigned'}</td>
                <td>{employees.filter(employee => employee.department === dept.name).length || 0}</td>
                <td className="action-buttons">
                  {/* Check if current user is admin or superadmin */}
                  {(currentUser.role === 'admin' || currentUser.role === 'superadmin') && (
                    <>
                      <button 
                        className="edit-button"
                        onClick={() => handleEditDepartment(dept)}
                      >
                        Edit
                      </button>
                      <button 
                        className="delete-button"
                        onClick={() => openDeleteConfirmation(dept._id || dept.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {departments.length === 0 && (
        <div className="empty-state">
          <p>No departments found. Create a department to get started.</p>
        </div>
      )}
    </div>
  );

  const renderSystemSettingsTab = () => (
    <div className="settings-system">
      <div className="settings-header">
        <h2>System Settings</h2>
        <button className="primary-button save-settings">Save Changes</button>
      </div>
      
      <div className="settings-grid">
        <div className="settings-card">
          <h3>Review Cycle Configuration</h3>
          <div className="settings-form-group">
            <label>Default Review Frequency</label>
            <select className="form-select">
              <option>Annually</option>
              <option>Semi-Annually</option>
              <option>Quarterly</option>
              <option>Monthly</option>
            </select>
          </div>
          
          <div className="settings-form-group">
            <label>Default Review Period</label>
            <select className="form-select">
              <option>Calendar Year</option>
              <option>Fiscal Year</option>
              <option>Anniversary Based</option>
            </select>
          </div>
          
          <div className="settings-form-group">
            <label>Reminder Notifications</label>
            <div className="toggle-group">
              <label className="toggle">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
              <span>Send email reminders for upcoming reviews</span>
            </div>
          </div>
          
          <div className="settings-form-group">
            <label>Reminder Timing (days before due)</label>
            <input type="number" className="form-input" defaultValue={7} min={1} max={30} />
          </div>
        </div>
        
        <div className="settings-card">
          <h3>User Management</h3>
          <div className="settings-form-group">
            <label>Default New User Role</label>
            <select className="form-select">
              <option>Employee</option>
              <option>Manager</option>
              {(currentUser.role === 'admin' || currentUser.role === 'superadmin') && (
                <option>Admin</option>
              )}
              {currentUser.role === 'superadmin' && (
                <option>Super Admin</option>
              )}
            </select>
          </div>
          
          <div className="settings-form-group">
            <label>Password Policy</label>
            <div className="toggle-group">
              <label className="toggle">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
              <span>Require strong passwords</span>
            </div>
          </div>
          
          <div className="settings-form-group">
            <label>Password Expiry (days)</label>
            <input type="number" className="form-input" defaultValue={90} min={30} max={365} />
          </div>
          
          <div className="settings-form-group">
            <label>Session Timeout (minutes)</label>
            <input type="number" className="form-input" defaultValue={30} min={5} max={120} />
          </div>
        </div>
        
        <div className="settings-card">
          <h3>Workflow Configuration</h3>
          <div className="settings-form-group">
            <label>Review Approval Flow</label>
            <select className="form-select">
              <option>Manager → Department Head → HR</option>
              <option>Manager → HR</option>
              <option>Manager Only</option>
              <option>Custom</option>
            </select>
          </div>
          
          <div className="settings-form-group">
            <label>Self-Assessment</label>
            <div className="toggle-group">
              <label className="toggle">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
              <span>Enable employee self-assessment</span>
            </div>
          </div>
          
          <div className="settings-form-group">
            <label>Peer Reviews</label>
            <div className="toggle-group">
              <label className="toggle">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
              <span>Enable peer feedback collection</span>
            </div>
          </div>
          
          <div className="settings-form-group">
            <label>Goal Tracking</label>
            <div className="toggle-group">
              <label className="toggle">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
              <span>Enable OKR/goal integration</span>
            </div>
          </div>
        </div>
        
        <div className="settings-card">
          <h3>Notifications</h3>
          <div className="settings-form-group">
            <label>Email Notifications</label>
            <div className="toggle-group">
              <label className="toggle">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
              <span>Send email notifications</span>
            </div>
          </div>
          
          <div className="settings-form-group">
            <label>In-App Notifications</label>
            <div className="toggle-group">
              <label className="toggle">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
              <span>Enable in-app notifications</span>
            </div>
          </div>
          
          <div className="settings-form-group">
            <label>Notification Events</label>
            <div className="checkbox-list">
              <label className="checkbox-item">
                <input type="checkbox" defaultChecked /> Review assignments
              </label>
              <label className="checkbox-item">
                <input type="checkbox" defaultChecked /> Review submissions
              </label>
              <label className="checkbox-item">
                <input type="checkbox" defaultChecked /> Review approvals
              </label>
              <label className="checkbox-item">
                <input type="checkbox" defaultChecked /> Upcoming deadlines
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntegrationsTab = () => (
    <div className="settings-integrations">
      <div className="settings-header">
        <h2>Integrations</h2>
      </div>
      
      <div className="integrations-grid">
        <div className="integration-card">
          <div className="integration-logo">
            <span className="integration-icon">HRMS</span>
          </div>
          <div className="integration-details">
            <h3>HR Management System</h3>
            <p>Connect to your HR system to sync employee data</p>
            <button className="connect-button">Connect</button>
          </div>
          <div className="integration-status">
            <span className="status-badge disconnected">Disconnected</span>
          </div>
        </div>
        
        <div className="integration-card">
          <div className="integration-logo">
            <span className="integration-icon">SSO</span>
          </div>
          <div className="integration-details">
            <h3>Single Sign-On</h3>
            <p>Set up SSO with your identity provider</p>
            <button className="connect-button">Configure</button>
          </div>
          <div className="integration-status">
            <span className="status-badge disconnected">Disconnected</span>
          </div>
        </div>
        
        <div className="integration-card">
          <div className="integration-logo">
            <span className="integration-icon">CRM</span>
          </div>
          <div className="integration-details">
            <h3>CRM Integration</h3>
            <p>Connect with your CRM for sales performance metrics</p>
            <button className="connect-button">Connect</button>
          </div>
          <div className="integration-status">
            <span className="status-badge disconnected">Disconnected</span>
          </div>
        </div>
        
        <div className="integration-card">
          <div className="integration-logo">
            <span className="integration-icon">API</span>
          </div>
          <div className="integration-details">
            <h3>API Access</h3>
            <p>Generate API keys for custom integrations</p>
            <button className="connect-button">Manage Keys</button>
          </div>
          <div className="integration-status">
            <span className="status-badge active">Active</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompanyInfoTab = () => (
    <div className="settings-company">
      <div className="settings-header">
        <h2>Company Information</h2>
        <button className="primary-button save-settings">Save Changes</button>
      </div>
      
      <div className="company-info-grid">
        <div className="settings-card">
          <h3>General Information</h3>
          <form>
            <div className="settings-form-group">
              <label>Company Name</label>
              <input type="text" className="form-input" defaultValue="Acme Corporation" />
            </div>
            
            <div className="settings-form-group">
              <label>Industry</label>
              <select className="form-select">
                <option>Technology</option>
                <option>Healthcare</option>
                <option>Finance</option>
                <option>Manufacturing</option>
                <option>Retail</option>
                <option>Education</option>
                <option>Other</option>
              </select>
            </div>
            
            <div className="settings-form-group">
              <label>Company Size</label>
              <select className="form-select">
                <option>1-50 employees</option>
                <option>51-200 employees</option>
                <option>201-500 employees</option>
                <option>501-1000 employees</option>
                <option>1000+ employees</option>
              </select>
            </div>
            
            <div className="settings-form-group">
              <label>Company Logo</label>
              <div className="logo-upload">
                <div className="logo-preview">
                  <div className="placeholder-logo">Logo</div>
                </div>
                <button type="button" className="upload-button">Upload Logo</button>
              </div>
            </div>
          </form>
        </div>
        
        <div className="settings-card">
          <h3>Contact Information</h3>
          <form>
            <div className="settings-form-group">
              <label>Address</label>
              <input type="text" className="form-input" placeholder="Street Address" />
            </div>
            
            <div className="address-grid">
              <div className="settings-form-group">
                <label>City</label>
                <input type="text" className="form-input" />
              </div>
              
              <div className="settings-form-group">
                <label>State/Province</label>
                <input type="text" className="form-input" />
              </div>
              
              <div className="settings-form-group">
                <label>Postal Code</label>
                <input type="text" className="form-input" />
              </div>
              
              <div className="settings-form-group">
                <label>Country</label>
                <select className="form-select">
                  <option>United States</option>
                  <option>Canada</option>
                  <option>United Kingdom</option>
                  <option>Australia</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            
            <div className="settings-form-group">
              <label>Phone Number</label>
              <input type="tel" className="form-input" />
            </div>
            
            <div className="settings-form-group">
              <label>Email</label>
              <input type="email" className="form-input" />
            </div>
            
            <div className="settings-form-group">
              <label>Website</label>
              <input type="url" className="form-input" placeholder="https://" />
            </div>
          </form>
        </div>
        
        <div className="settings-card">
          <h3>Fiscal Year Configuration</h3>
          <form>
            <div className="settings-form-group">
              <label>Fiscal Year Start Month</label>
              <select className="form-select">
                <option>January</option>
                <option>February</option>
                <option>March</option>
                <option>April</option>
                <option>May</option>
                <option>June</option>
                <option>July</option>
                <option>August</option>
                <option>September</option>
                <option>October</option>
                <option>November</option>
                <option>December</option>
              </select>
            </div>
            
            <div className="settings-form-group">
              <label>Performance Period Definition</label>
              <select className="form-select">
                <option>Calendar Year</option>
                <option>Fiscal Year</option>
                <option>Custom Period</option>
              </select>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  const renderAuditLogTab = () => (
    <div className="settings-audit">
      <div className="settings-header">
        <h2>Audit Log</h2>
        <div className="audit-actions">
          <select className="form-select filter-select">
            <option>All Activities</option>
            <option>User Management</option>
            <option>Department Changes</option>
            <option>Review Activities</option>
            <option>System Settings</option>
          </select>
          <button className="secondary-button">Export Log</button>
        </div>
      </div>
      
      <div className="table-container">
        <table className="settings-table audit-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Category</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2025-04-06 09:32:15</td>
              <td>Admin User</td>
              <td>Updated department</td>
              <td>Department Changes</td>
              <td>Marketing department manager changed to Bob Smith</td>
            </tr>
            <tr>
              <td>2025-04-05 16:45:22</td>
              <td>HR Manager</td>
              <td>Created review cycle</td>
              <td>Review Activities</td>
              <td>Q2 2025 Performance Review cycle created</td>
            </tr>
            <tr>
              <td>2025-04-05 11:20:18</td>
              <td>System</td>
              <td>User login</td>
              <td>User Management</td>
              <td>Admin user logged in from 192.168.1.105</td>
            </tr>
            <tr>
              <td>2025-04-04 14:37:49</td>
              <td>Admin User</td>
              <td>Added user</td>
              <td>User Management</td>
              <td>New employee John Doe added to Engineering</td>
            </tr>
            <tr>
              <td>2025-04-04 10:15:32</td>
              <td>Admin User</td>
              <td>Changed system setting</td>
              <td>System Settings</td>
              <td>Changed default review frequency from Annually to Semi-Annually</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderRoleManagementTab = () => {
    // Only super admins and admins can access this tab
    if (currentUser.role !== 'superadmin' && currentUser.role !== 'admin') {
      return <div className="unauthorized-message">You don't have permission to view this page.</div>;
    }
    
    return (
      <div className="settings-roles">
        <div className="settings-header">
          <h2>Role Management</h2>
          {currentUser.role === 'superadmin' && (
            <button className="primary-button">Add User</button>
          )}
        </div>
        
        <div className="table-container">
          <table className="settings-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Current Role</th>
                <th>Department</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp._id || emp.id}>
                  <td>{emp.firstName} {emp.lastName}</td>
                  <td>{emp.email}</td>
                  <td>{emp.role || 'Employee'}</td>
                  <td>{emp.department}</td>
                  <td className="action-buttons">
                    {/* Super admins can change any role */}
                    {currentUser.role === 'superadmin' && (
                      <select 
                        className="role-select"
                        defaultValue={emp.role}
                        onChange={(e) => handleRoleChange(emp._id, e.target.value)}
                      >
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                        <option value="superadmin">Super Admin</option>
                      </select>
                    )}
                    
                    {/* Admins can promote to manager or employee only */}
                    {currentUser.role === 'admin' && (
                      <select 
                        className="role-select"
                        defaultValue={emp.role}
                        onChange={(e) => handleRoleChange(emp._id, e.target.value)}
                        disabled={emp.role === 'admin' || emp.role === 'superadmin'}
                      >
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                      </select>
                    )}
                    
                    <button 
                      className="reset-button"
                      onClick={() => handlePasswordReset(emp._id)}
                    >
                      Reset Password
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const handleRoleChange = (userId, newRole) => {
    // This would be implemented to call an API to update the user's role
    console.log(`Changing role for user ${userId} to ${newRole}`);
    // In a real implementation, you would call an API here
  };

  const handlePasswordReset = (userId) => {
    // This would be implemented to call an API to reset the user's password
    console.log(`Resetting password for user ${userId}`);
    // In a real implementation, you would call an API here
  };

  const renderActiveTab = () => {
    switch(activeTab) {
      case 'departments': return renderDepartmentsTab();
      case 'company-info': return renderCompanyInfoTab();
      case 'system-settings': return renderSystemSettingsTab();
      case 'integrations': return renderIntegrationsTab();
      case 'audit-log': return renderAuditLogTab();
      case 'role-management': return renderRoleManagementTab();
      default: return renderDepartmentsTab();
    }
  };

  // Determine which menu items should be visible based on user role
  const getVisibleMenuItems = () => {
    const items = [];
    
    // Organization menu
    if (canUserAccessTab('departments') || canUserAccessTab('company-info')) {
      items.push({
        key: 'organization',
        label: 'Organization',
        subItems: [
          canUserAccessTab('departments') ? { key: 'departments', label: 'Departments' } : null,
          canUserAccessTab('company-info') ? { key: 'company-info', label: 'Company Info' } : null,
        ].filter(Boolean)
      });
    }
    
    // Configuration menu
    if (canUserAccessTab('system-settings') || canUserAccessTab('integrations')) {
      items.push({
        key: 'configuration',
        label: 'Configuration',
        subItems: [
          canUserAccessTab('system-settings') ? { key: 'system-settings', label: 'System Settings' } : null,
          canUserAccessTab('integrations') ? { key: 'integrations', label: 'Integrations' } : null,
        ].filter(Boolean)
      });
    }
    
    // Administration menu
    if (canUserAccessTab('audit-log') || currentUser.role === 'admin' || currentUser.role === 'superadmin') {
      items.push({
        key: 'administration',
        label: 'Administration',
        subItems: [
          canUserAccessTab('audit-log') ? { key: 'audit-log', label: 'Audit Log' } : null,
          (currentUser.role === 'admin' || currentUser.role === 'superadmin') ? 
            { key: 'role-management', label: 'Role Management' } : null,
        ].filter(Boolean)
      });
    }
    
    return items;
  };

  const visibleMenuItems = getVisibleMenuItems();

  return (
    <div className="settings-container-top-nav">
      {/* Message display */}
      {errorMessage && (
        <div className="error-notification">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage('')}>×</button>
        </div>
      )}
      
      {successMessage && (
        <div className="success-notification">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage('')}>×</button>
        </div>
      )}
    
      {/* Top Navigation */}
      <div className="settings-top-nav">
        <div className="settings-nav-categories">
          {visibleMenuItems.map(item => (
            <div className="settings-nav-category" key={item.key}>
              <button 
                className={`settings-nav-dropdown-button ${activeDropdown === item.key ? 'active' : ''}`}
                onClick={() => toggleDropdown(item.key)}
              >
                {item.label} <span className="dropdown-arrow">{activeDropdown === item.key ? '▲' : '▼'}</span>
              </button>
              {activeDropdown === item.key && (
                <div className="settings-nav-dropdown">
                  {item.subItems.map(subItem => (
                    <button 
                      key={subItem.key}
                      className={activeTab === subItem.key ? 'active' : ''}
                      onClick={() => handleTabClick(subItem.key)}
                    >
                      {subItem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Current Tab Indicator */}
        <div className="current-tab-indicator">
          {activeTab === 'departments' && 'Departments'}
          {activeTab === 'company-info' && 'Company Info'}
          {activeTab === 'system-settings' && 'System Settings'}
          {activeTab === 'integrations' && 'Integrations'}
          {activeTab === 'audit-log' && 'Audit Log'}
          {activeTab === 'role-management' && 'Role Management'}
        </div>
      </div>
      
      {/* Content Area */}
      <div className="settings-content">
        {isLoading ? (
          <div className="loading-spinner">Loading...</div>
        ) : (
          renderActiveTab()
        )}
      </div>
      
      {/* Department Modal */}
      {isAddDepartmentModalOpen && (
        <DepartmentModal 
          department={selectedDepartment}
          onSave={handleAddDepartment}
          onUpdate={(updatedDept) => handleUpdateDepartment(updatedDept._id || updatedDept.id, updatedDept)}
          onCancel={() => setIsAddDepartmentModalOpen(false)}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content delete-modal">
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete this department? This action cannot be undone.</p>
            <p className="warning-text">
              Note: You cannot delete departments with active employees. 
              Please reassign or remove employees first.
            </p>
            <div className="modal-actions">
              <button 
                className="cancel-button" 
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="delete-button" 
                onClick={handleDeleteDepartment}
              >
                Delete Department
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Department Modal Component
const DepartmentModal = ({ department, onSave, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState({
    name: department ? department.name : '',
    description: department ? department.description : '',
    manager: department ? department.manager : '',
    location: department ? department.location : '',
    budget: department ? department.budget : '',
    headCount: department ? department.headCount : ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (department) {
      // Update existing department
      onUpdate({...department, ...formData});
    } else {
      // Add new department
      onSave(formData);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{department ? 'Edit Department' : 'Add New Department'}</h2>
          <button className="close-button" onClick={onCancel}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Department Name</label>
              <input 
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea 
                className="form-textarea"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label>Manager</label>
              <input 
                type="text"
                className="form-input"
                value={formData.manager}
                onChange={(e) => setFormData({...formData, manager: e.target.value})}
              />
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Location</label>
                <input 
                  type="text"
                  className="form-input"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Budget</label>
                <input 
                  type="text"
                  className="form-input"
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: e.target.value})}
                  placeholder="$"
                />
              </div>
              
              <div className="form-group">
                <label>Head Count</label>
                <input 
                  type="number"
                  className="form-input"
                  value={formData.headCount}
                  onChange={(e) => setFormData({...formData, headCount: e.target.value})}
                  min="0"
                />
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="cancel-button" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="save-button">
              {department ? 'Update' : 'Add'} Department
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;