import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

function ExitImpersonation() {
  const { exitImpersonation } = useAuth();
  const exitProcessed = useRef(false);
  
  useEffect(() => {
    const handleExit = async () => {
      if (exitProcessed.current) return;
      exitProcessed.current = true;
      
      try {
        console.log('ExitImpersonation: Starting exit process');
        
        // First get the original user data (if available)
        const originalUserData = localStorage.getItem('originalUser');
        const authToken = localStorage.getItem('authToken');
        
        // Set special flag for AUTH bypass
        localStorage.setItem('exiting_impersonation', 'true');
        localStorage.setItem('superadmin_return', 'true');
        
        // First restore original user data
        if (originalUserData) {
          localStorage.setItem('user', originalUserData);
        }
        
        // Clear ALL impersonation-related data
        localStorage.removeItem('impersonatedCustomer');
        localStorage.removeItem('impersonation_active');
        localStorage.removeItem('impersonationToken');
        localStorage.removeItem('manual_redirect_in_progress');
        
        // Call the exitImpersonation method from context
        if (typeof exitImpersonation === 'function') {
          await exitImpersonation();
        }
        
        // Short delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Navigate to superadmin page with a hard refresh
        window.location.replace('/super-admin/customers');
      } catch (error) {
        console.error('Error during exit impersonation:', error);
        window.location.href = '/super-admin/customers';
      }
    };
    
    handleExit();
    
    return () => {
      // Cleanup
    };
  }, [exitImpersonation]);

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