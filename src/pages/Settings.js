import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useDepartments } from '../context/DepartmentContext';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css'; // Reuse existing styles
import '../styles/Settings.css'; // Settings-specific styles

function Settings() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { 
    departments, 
    addDepartment, 
    updateDepartment, 
    deleteDepartment 
  } = useDepartments();
  
  const [activeTab, setActiveTab] = useState('departments');
  const [isAddDepartmentModalOpen, setIsAddDepartmentModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Check if the current user role is manager (for development)
  if (currentUser?.role?.toLowerCase() !== 'manager') {
    return <Navigate to="/unauthorized" replace />;
  }

  const handleAddDepartment = (departmentData) => {
    addDepartment(departmentData);
    setIsAddDepartmentModalOpen(false);
  };

  const handleEditDepartment = (department) => {
    setSelectedDepartment(department);
    setIsAddDepartmentModalOpen(true);
  };

  const openDeleteConfirmation = (departmentId) => {
    setDepartmentToDelete(departmentId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteDepartment = () => {
    deleteDepartment(departmentToDelete);
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

  const renderDepartmentsTab = () => (
    <div className="settings-departments">
      <div className="settings-header">
        <h2>Department Management</h2>
        <button 
          className="primary-button"
          onClick={() => {
            setSelectedDepartment(null);
            setIsAddDepartmentModalOpen(true);
          }}
        >
          Add Department
        </button>
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
              <tr key={dept.id}>
                <td className="dept-name">{dept.name}</td>
                <td>{dept.description}</td>
                <td>{dept.manager || 'Not Assigned'}</td>
                <td>{dept.employeeCount || 0}</td>
                <td className="action-buttons">
                  <button 
                    className="edit-button"
                    onClick={() => handleEditDepartment(dept)}
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-button"
                    onClick={() => openDeleteConfirmation(dept.id)}
                  >
                    Delete
                  </button>
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
              <option>Admin</option>
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

  const renderActiveTab = () => {
    switch(activeTab) {
      case 'departments': return renderDepartmentsTab();
      case 'company-info': return renderCompanyInfoTab();
      case 'system-settings': return renderSystemSettingsTab();
      case 'integrations': return renderIntegrationsTab();
      case 'audit-log': return renderAuditLogTab();
      default: return renderDepartmentsTab();
    }
  };

  return (
    <div className="settings-container-top-nav">
      {/* Top Navigation */}
      <div className="settings-top-nav">
        <div className="settings-nav-categories">
          {/* Organization Dropdown */}
          <div className="settings-nav-category">
            <button 
              className={`settings-nav-dropdown-button ${activeDropdown === 'organization' ? 'active' : ''}`}
              onClick={() => toggleDropdown('organization')}
            >
              Organization <span className="dropdown-arrow">{activeDropdown === 'organization' ? '▲' : '▼'}</span>
            </button>
            {activeDropdown === 'organization' && (
              <div className="settings-nav-dropdown">
                <button 
                  className={activeTab === 'departments' ? 'active' : ''}
                  onClick={() => handleTabClick('departments')}
                >
                  Departments
                </button>
                <button 
                  className={activeTab === 'company-info' ? 'active' : ''}
                  onClick={() => handleTabClick('company-info')}
                >
                  Company Info
                </button>
              </div>
            )}
          </div>
          
          {/* Configuration Dropdown */}
          <div className="settings-nav-category">
            <button 
              className={`settings-nav-dropdown-button ${activeDropdown === 'configuration' ? 'active' : ''}`}
              onClick={() => toggleDropdown('configuration')}
            >
              Configuration <span className="dropdown-arrow">{activeDropdown === 'configuration' ? '▲' : '▼'}</span>
            </button>
            {activeDropdown === 'configuration' && (
              <div className="settings-nav-dropdown">
                <button 
                  className={activeTab === 'system-settings' ? 'active' : ''}
                  onClick={() => handleTabClick('system-settings')}
                >
                  System Settings
                </button>
                <button 
                  className={activeTab === 'integrations' ? 'active' : ''}
                  onClick={() => handleTabClick('integrations')}
                >
                  Integrations
                </button>
              </div>
            )}
          </div>
          
          {/* Administration Dropdown */}
          <div className="settings-nav-category">
            <button 
              className={`settings-nav-dropdown-button ${activeDropdown === 'administration' ? 'active' : ''}`}
              onClick={() => toggleDropdown('administration')}
            >
              Administration <span className="dropdown-arrow">{activeDropdown === 'administration' ? '▲' : '▼'}</span>
            </button>
            {activeDropdown === 'administration' && (
              <div className="settings-nav-dropdown">
                <button 
                  className={activeTab === 'audit-log' ? 'active' : ''}
                  onClick={() => handleTabClick('audit-log')}
                >
                  Audit Log
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Current Tab Indicator */}
        <div className="current-tab-indicator">
          {activeTab === 'departments' && 'Departments'}
          {activeTab === 'company-info' && 'Company Info'}
          {activeTab === 'system-settings' && 'System Settings'}
          {activeTab === 'integrations' && 'Integrations'}
          {activeTab === 'audit-log' && 'Audit Log'}
        </div>
      </div>
      
      {/* Content Area */}
      <div className="settings-content">
        {renderActiveTab()}
      </div>
      
      {/* Department Modal */}
      {isAddDepartmentModalOpen && (
        <DepartmentModal 
          department={selectedDepartment}
          onSave={handleAddDepartment}
          onUpdate={updateDepartment}
          onCancel={() => setIsAddDepartmentModalOpen(false)}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content delete-modal">
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete this department? This action cannot be undone.</p>
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
    onCancel();
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