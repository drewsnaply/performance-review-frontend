import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Updated path

function ExitImpersonation() {
  const { exitImpersonation, impersonating } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Exit impersonation mode
    if (impersonating) {
      exitImpersonation();
    }
    
    // Redirect to super admin dashboard
    navigate('/super-admin/customers');
  }, [exitImpersonation, impersonating, navigate]);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-xl font-bold mb-4">Exiting Impersonation Mode</h2>
        <p className="mb-4">Returning to Super Admin dashboard...</p>
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  );
}

export default ExitImpersonation;