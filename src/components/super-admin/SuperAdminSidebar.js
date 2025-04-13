import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaBuilding, 
  FaUsers, 
  FaUserShield, 
  FaCog, 
  FaChartLine, 
  FaClipboardList,
  FaQuestionCircle,
  FaBell,
  FaUsersCog
} from 'react-icons/fa';

const SuperAdminSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Navigation items for super admin
  const navItems = [
    {
      label: 'Customers',
      icon: <FaBuilding className="mr-3" />,
      path: '/super-admin/customers',
      active: currentPath === '/super-admin/customers' || currentPath === '/super-admin'
    },
    {
      label: 'Active Sessions',
      icon: <FaUserShield className="mr-3" />,
      path: '/super-admin/sessions',
      active: currentPath.includes('/super-admin/sessions')
    },
    {
      label: 'User Management',
      icon: <FaUsersCog className="mr-3" />,
      path: '/super-admin/users',
      active: currentPath.includes('/super-admin/users')
    },
    {
      label: 'Analytics',
      icon: <FaChartLine className="mr-3" />,
      path: '/super-admin/analytics',
      active: currentPath.includes('/super-admin/analytics')
    },
    {
      label: 'System Logs',
      icon: <FaClipboardList className="mr-3" />,
      path: '/super-admin/logs',
      active: currentPath.includes('/super-admin/logs')
    },
    {
      label: 'System Settings',
      icon: <FaCog className="mr-3" />,
      path: '/super-admin/settings',
      active: currentPath.includes('/super-admin/settings')
    }
  ];

  // If user is currently impersonating a customer, show this notice
  const impersonatedCustomer = JSON.parse(localStorage.getItem('impersonatedCustomer') || 'null');

  return (
    <div className="h-full flex flex-col bg-gray-800 text-white w-64">
      {/* Super Admin header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center">
          <div className="bg-blue-500 p-2 rounded">
            <FaUserShield className="text-white" size={20} />
          </div>
          <h2 className="ml-3 text-xl font-semibold">Super Admin</h2>
        </div>
      </div>
      
      {/* Impersonation notice if active */}
      {impersonatedCustomer && (
        <div className="mx-3 my-2 p-2 bg-yellow-600 text-white rounded text-sm">
          <div className="font-semibold">Impersonating:</div>
          <div>{impersonatedCustomer.name}</div>
          <Link 
            to="/super-admin/exit-impersonation" 
            className="text-xs mt-1 block hover:underline text-yellow-200"
          >
            Exit Impersonation
          </Link>
        </div>
      )}
      
      {/* Navigation items */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul>
          {navItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm ${
                  item.active 
                    ? 'bg-gray-700 text-white border-l-4 border-blue-500' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Help and support section */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex flex-col space-y-2">
          <Link to="/super-admin/notifications" className="flex items-center text-sm text-gray-300 hover:text-white">
            <FaBell className="mr-3" />
            Notifications
          </Link>
          <Link to="/super-admin/help" className="flex items-center text-sm text-gray-300 hover:text-white">
            <FaQuestionCircle className="mr-3" />
            Help & Support
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminSidebar;