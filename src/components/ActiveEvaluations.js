// components/ActiveEvaluations.js
import React, { useState, useEffect } from 'react';

function ActiveEvaluations() {
  const [evaluations, setEvaluations] = useState([]);
  const [filteredEvaluations, setFilteredEvaluations] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    // Fetch evaluations from localStorage
    const fetchEvaluations = async () => {
      try {
        const storedReviews = localStorage.getItem('reviews');
        
        if (storedReviews) {
          const parsedReviews = JSON.parse(storedReviews);
          setEvaluations(parsedReviews);
          setFilteredEvaluations(parsedReviews);
        } else {
          // If no reviews in localStorage, set empty arrays
          setEvaluations([]);
          setFilteredEvaluations([]);
        }
      } catch (error) {
        console.error('Error fetching evaluations:', error);
        // Set empty arrays to avoid errors
        setEvaluations([]);
        setFilteredEvaluations([]);
      }
    };
    
    fetchEvaluations();
  }, []);
  
  useEffect(() => {
    // Filter evaluations based on status and search term
    let filtered = [...evaluations];
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(evaluation => 
        evaluation.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    if (searchTerm) {
      filtered = filtered.filter(evaluation => 
        (evaluation.employeeName && evaluation.employeeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (evaluation.reviewCycle && evaluation.reviewCycle.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredEvaluations(filtered);
  }, [evaluations, statusFilter, searchTerm]);

  // Function for direct navigation (no React Router)
  const goToEvaluation = (id) => {
    window.location.href = `/evaluation/${id}`;
  };
  
  return (
    <div>
      <h2>Active Evaluations</h2>
      
      <div>
        <input 
          type="text" 
          placeholder="Search evaluations..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginBottom: '10px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ marginBottom: '10px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      
      {filteredEvaluations.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '1px solid #eee' }}>Employee</th>
              <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '1px solid #eee' }}>Review Cycle</th>
              <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '1px solid #eee' }}>Due Date</th>
              <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '1px solid #eee' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '1px solid #eee' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvaluations.map((evaluation) => (
              <tr key={evaluation.id}>
                <td style={{ padding: '12px 8px', borderBottom: '1px solid #eee' }}>{evaluation.employeeName}</td>
                <td style={{ padding: '12px 8px', borderBottom: '1px solid #eee' }}>{evaluation.reviewCycle}</td>
                <td style={{ padding: '12px 8px', borderBottom: '1px solid #eee' }}>{evaluation.dueDate ? new Date(evaluation.dueDate).toLocaleDateString() : 'N/A'}</td>
                <td style={{ padding: '12px 8px', borderBottom: '1px solid #eee' }}>
                  <span style={{ 
                    display: 'inline-block',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    backgroundColor: evaluation.status?.toLowerCase() === 'pending' ? '#fef3c7' : 
                                    evaluation.status?.toLowerCase() === 'completed' ? '#dcfce7' : '#dbeafe',
                    color: evaluation.status?.toLowerCase() === 'pending' ? '#92400e' : 
                           evaluation.status?.toLowerCase() === 'completed' ? '#166534' : '#1e40af',
                    fontSize: '0.85rem',
                    fontWeight: '500'
                  }}>
                    {evaluation.status?.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '12px 8px', borderBottom: '1px solid #eee' }}>
                  <button 
                    onClick={() => goToEvaluation(evaluation.id)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#6366f1',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          <p>No active evaluations found matching your filters.</p>
        </div>
      )}
    </div>
  );
}

export default ActiveEvaluations;