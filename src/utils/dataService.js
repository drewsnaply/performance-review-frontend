// Simple data service for handling API requests and data operations

// Define the service functions
const getReviewCycles = async () => {
    // Simulated async API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { 
            id: 1, 
            name: 'Annual Review 2024', 
            status: 'Active', 
            startDate: '2024-01-01', 
            endDate: '2024-12-31' 
          },
          { 
            id: 2, 
            name: 'Mid-Year Review 2024', 
            status: 'Pending', 
            startDate: '2024-06-01', 
            endDate: '2024-07-15' 
          },
          { 
            id: 3, 
            name: 'Q1 Performance Check', 
            status: 'Completed', 
            startDate: '2024-01-01', 
            endDate: '2024-03-31' 
          }
        ]);
      }, 500);
    });
  };
  
  // Add functions needed by Dashboard
  const getEmployees = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            department: 'Engineering',
            title: 'Senior Developer',
            isActive: true
          },
          {
            id: 2,
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            department: 'Marketing',
            title: 'Marketing Manager',
            isActive: true
          },
          {
            id: 3,
            firstName: 'Bob',
            lastName: 'Johnson',
            email: 'bob.johnson@example.com',
            department: 'HR',
            title: 'HR Specialist',
            isActive: true
          }
        ]);
      }, 500);
    });
  };
  
  const getReviews = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Make sure we're returning an array
        const reviewsArray = [
          {
            id: 1,
            employeeName: 'John Doe',
            employeeId: 1,
            reviewCycle: 'Annual Review 2023',
            cycleId: 1,
            status: 'Completed',
            submissionDate: '2023-12-15',
            overallRating: 4.2
          },
          {
            id: 2,
            employeeName: 'Jane Smith',
            employeeId: 2,
            reviewCycle: 'Annual Review 2023',
            cycleId: 1,
            status: 'Completed',
            submissionDate: '2023-12-10',
            overallRating: 4.5
          },
          {
            id: 3,
            employeeName: 'Bob Johnson',
            employeeId: 3,
            reviewCycle: 'Annual Review 2023',
            cycleId: 1,
            status: 'Pending Manager Review',
            submissionDate: '2023-12-15',
            overallRating: null
          },
          {
            id: 4,
            employeeName: 'John Doe',
            employeeId: 1,
            reviewCycle: 'Mid-Year Review 2023',
            cycleId: 2,
            status: 'Completed',
            submissionDate: '2023-06-15',
            overallRating: 4.0
          },
          {
            id: 5,
            employeeName: 'Jane Smith',
            employeeId: 2,
            reviewCycle: 'Mid-Year Review 2023',
            cycleId: 2,
            status: 'Completed',
            submissionDate: '2023-06-12',
            overallRating: 4.3
          },
          {
            id: 6,
            employeeName: 'Bob Johnson',
            employeeId: 3,
            reviewCycle: 'Mid-Year Review 2023',
            cycleId: 2,
            status: 'Completed',
            submissionDate: '2023-06-14',
            overallRating: 3.8
          }
        ];
        
        resolve(reviewsArray); // Make sure we're resolving with the array
      }, 500);
    });
  };
  
  // Add the fetchReviewCycles function that your components expect
  const fetchReviewCycles = async () => {
    return getReviewCycles();
  };
  
  const getUserReviews = async (userId) => {
    // Simulated async API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            reviewCycle: 'Annual Review 2023',
            status: 'Completed',
            submissionDate: '2023-12-15',
            overallRating: 4.2
          },
          {
            id: 2,
            reviewCycle: 'Mid-Year Review 2023',
            status: 'Completed',
            submissionDate: '2023-06-30',
            overallRating: 4.0
          },
          {
            id: 3,
            reviewCycle: 'Annual Review 2024',
            status: 'In Progress',
            submissionDate: null,
            overallRating: null
          }
        ]);
      }, 500);
    });
  };
  
  const getTeamReviews = async (managerId) => {
    // This would normally fetch from an API, but for now return mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            employeeName: 'Jane Smith',
            reviewCycle: 'Annual Review 2023',
            status: 'Completed',
            submissionDate: '2023-12-10',
            overallRating: 4.5
          },
          {
            id: 2,
            employeeName: 'John Doe',
            reviewCycle: 'Annual Review 2023',
            status: 'Completed',
            submissionDate: '2023-12-12',
            overallRating: 3.8
          },
          {
            id: 3,
            employeeName: 'Alice Johnson',
            reviewCycle: 'Annual Review 2023',
            status: 'Pending Manager Review',
            submissionDate: '2023-12-15',
            overallRating: null
          }
        ]);
      }, 500);
    });
  };
  
  const getReviewTemplates = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            name: 'Standard Performance Review',
            description: 'Default template for annual performance reviews',
            sections: 5,
            questions: 20,
            lastUpdated: '2023-10-15'
          },
          {
            id: 2,
            name: 'Manager Evaluation',
            description: 'Template for evaluating management performance',
            sections: 4,
            questions: 15,
            lastUpdated: '2023-11-20'
          },
          {
            id: 3,
            name: 'Technical Skills Assessment',
            description: 'Focused on technical capabilities and growth',
            sections: 3,
            questions: 12,
            lastUpdated: '2024-01-05'
          }
        ]);
      }, 500);
    });
  };
  
  // Create the service object
  const dataService = {
    getReviewCycles,
    getUserReviews,
    getTeamReviews,
    getReviewTemplates,
    getEmployees,
    getReviews
  };
  
  // Export both the default service object and named functions
  export { fetchReviewCycles, getEmployees, getReviews };
  export default dataService;