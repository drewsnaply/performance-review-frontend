import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ViewEvaluation() {
  const navigate = useNavigate();
  const [reviewId, setReviewId] = useState("");
  
  // Get the review ID from the URL
  useEffect(() => {
    const path = window.location.pathname;
    const id = path.split('/').pop();
    setReviewId(id);
  }, []);
  
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Review Editor</h1>
      <p>Review ID: {reviewId}</p>
      <p>This review editor is currently under maintenance. Please check back later.</p>
      <button 
        onClick={() => navigate('/pending-reviews')}
        style={{ 
          padding: '8px 16px', 
          background: '#4c75af', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px', 
          cursor: 'pointer'
        }}
      >
        Back to Pending Reviews
      </button>
    </div>
  );
}

export default ViewEvaluation;