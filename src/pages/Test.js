// Test.js - Make sure it's exactly like this
import React from 'react';

// Be explicit about the function declaration and export
function Test() {
  return (
    <div style={{
      padding: '50px', 
      background: 'lightblue',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999
    }}>
      <h1 style={{color: 'red', fontSize: '32px'}}>TEST COMPONENT WORKS</h1>
      <p style={{fontSize: '20px'}}>If you can see this, React rendering is working.</p>
    </div>
  );
}

// Make sure to use this exact export format
export default Test;