// components/EvaluationManagement.js
import React, { useState } from 'react';
import ActiveEvaluations from './ActiveEvaluations';
import Templates from './Templates';
import Assignments from './Assignments';

function EvaluationManagement({ initialActiveTab = "active-evaluations" }) {
  const [activeTab, setActiveTab] = useState(initialActiveTab);

  const renderTabContent = () => {
    switch (activeTab) {
      case "templates":
        return <Templates />;
      case "assignments":
        return <Assignments />;
      case "active-evaluations":
      default:
        return <ActiveEvaluations />;
    }
  };

  return (
    <div>
      <h1 style={{ color: '#4a5568', marginBottom: '1.5rem' }}>Evaluation Management</h1>
      
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '1rem' }}>
        <button
          className={`tab-button ${activeTab === "active-evaluations" ? "active" : ""}`}
          onClick={() => setActiveTab("active-evaluations")}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: activeTab === "active-evaluations" ? '#fff' : 'transparent',
            borderBottom: activeTab === "active-evaluations" ? '2px solid #6366f1' : 'none',
            color: activeTab === "active-evaluations" ? '#4a5568' : '#718096',
            fontWeight: activeTab === "active-evaluations" ? '600' : 'normal',
            cursor: 'pointer',
            border: 'none',
            outline: 'none'
          }}
        >
          Active Evaluations
        </button>
        <button
          className={`tab-button ${activeTab === "assignments" ? "active" : ""}`}
          onClick={() => setActiveTab("assignments")}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: activeTab === "assignments" ? '#fff' : 'transparent',
            borderBottom: activeTab === "assignments" ? '2px solid #6366f1' : 'none',
            color: activeTab === "assignments" ? '#4a5568' : '#718096',
            fontWeight: activeTab === "assignments" ? '600' : 'normal',
            cursor: 'pointer',
            border: 'none',
            outline: 'none'
          }}
        >
          Assignments
        </button>
        <button
          className={`tab-button ${activeTab === "templates" ? "active" : ""}`}
          onClick={() => setActiveTab("templates")}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: activeTab === "templates" ? '#fff' : 'transparent',
            borderBottom: activeTab === "templates" ? '2px solid #6366f1' : 'none',
            color: activeTab === "templates" ? '#4a5568' : '#718096',
            fontWeight: activeTab === "templates" ? '600' : 'normal',
            cursor: 'pointer',
            border: 'none',
            outline: 'none'
          }}
        >
          Templates
        </button>
      </div>
      
      <div style={{ padding: '1rem 0' }}>
        {renderTabContent()}
      </div>
    </div>
  );
}

export default EvaluationManagement;