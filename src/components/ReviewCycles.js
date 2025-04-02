import React, { useState, useEffect } from 'react';

// You can import a data fetching utility here (e.g., an API call)
import { fetchReviewCycles } from '../utils/dataService'; // Ensure this function exists

const ReviewCycles = () => {
  const [reviewCycles, setReviewCycles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate fetching user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      // Fetch review cycles after getting the user data
      const fetchData = async () => {
        try {
          // Assume `fetchReviewCycles` is a function that fetches real review cycle data
          const cycles = await fetchReviewCycles(parsedUser.id); // Example API call
          setReviewCycles(cycles);
        } catch (error) {
          console.error("Error fetching review cycles:", error);
          setError('Failed to fetch review cycles. Please try again later.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    } else {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return <div>Loading review cycles...</div>;
  }

  if (!user) {
    return <div>Please log in to view review cycles</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="review-cycles-container">
      <h2>Review Cycles</h2>
      
      {reviewCycles.length === 0 ? (
        <div className="no-review-cycles">
          <p>No review cycles found.</p>
        </div>
      ) : (
        <table className="review-cycles-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {reviewCycles.map((cycle) => (
              <tr key={cycle.id}>
                <td>{cycle.name}</td>
                <td>{cycle.startDate}</td>
                <td>{cycle.endDate}</td>
                <td>
                  <span className={`status-badge ${cycle.status.toLowerCase().replace(' ', '-')}`}>
                    {cycle.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ReviewCycles;
