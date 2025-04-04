import React from 'react';

const LogoutButton = () => {
  const handleLogout = (e) => {
    e.preventDefault();
    console.log('Direct logout triggered');
    
    // Clear all local storage to ensure full logout
    localStorage.clear();
    
    // Force redirect to login page
    window.location.replace('/login');
  };

  return (
    <button
      className="logout-button"
      onClick={handleLogout}
    >
      LOGOUT
    </button>
  );
};

export default LogoutButton;