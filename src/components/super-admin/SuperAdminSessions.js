import React from 'react';
import { useAuth } from '../../context/AuthContext';
import SidebarLayout from '../SidebarLayout';

function SuperAdminSessions() {
  // Get current user for SidebarLayout
  const { currentUser } = useAuth();
  
  // Create user object for SidebarLayout
  const user = currentUser ? {
    firstName: currentUser.firstName || currentUser.username || 'User',
    lastName: currentUser.lastName || '',
    role: currentUser.role || 'SUPER_ADMIN'
  } : null;

  return (
    <SidebarLayout user={user} activeView="super-admin">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Active Sessions</h1>
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
          <p className="text-yellow-800">
            This is a placeholder for the Super Admin Sessions page. 
            This page will display active user sessions across all customer organizations and allow managing them.
          </p>
        </div>
      </div>
    </SidebarLayout>
  );
}

export default SuperAdminSessions;