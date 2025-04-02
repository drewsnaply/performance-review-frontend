// Utility to generate mock data for development and testing

const mockDataGenerator = {
    // Generate mock employees
    generateEmployees: (count = 10) => {
      const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Product', 'Design'];
      const titles = {
        'Engineering': ['Software Engineer', 'Senior Developer', 'Tech Lead', 'QA Engineer'],
        'Marketing': ['Marketing Specialist', 'Content Writer', 'SEO Analyst', 'Marketing Manager'],
        'Sales': ['Sales Representative', 'Account Manager', 'Sales Director', 'Business Developer'],
        'HR': ['HR Specialist', 'Recruiter', 'HR Manager', 'Talent Acquisition'],
        'Finance': ['Accountant', 'Financial Analyst', 'Finance Manager', 'Auditor'],
        'Product': ['Product Manager', 'Product Owner', 'Business Analyst', 'Product Director'],
        'Design': ['UI Designer', 'UX Designer', 'Graphic Designer', 'Creative Director']
      };
      
      const employees = [];
      
      for (let i = 1; i <= count; i++) {
        const department = departments[Math.floor(Math.random() * departments.length)];
        const title = titles[department][Math.floor(Math.random() * titles[department].length)];
        const yearsOfService = Math.floor(Math.random() * 10) + 1;
        
        employees.push({
          id: i,
          firstName: `FirstName${i}`,
          lastName: `LastName${i}`,
          email: `employee${i}@example.com`,
          department: department,
          title: title,
          hireDate: new Date(Date.now() - (yearsOfService * 365 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
          manager: i > 5 ? Math.floor(Math.random() * 5) + 1 : null,
          isActive: Math.random() > 0.1, // 90% active
        });
      }
      
      return employees;
    },
    
    // Generate mock reviews
    generateReviews: (employeeCount = 10, cycleCount = 3) => {
      const statuses = ['Draft', 'Submitted', 'In Review', 'Completed'];
      const ratings = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
      const cycles = [];
      const reviews = [];
      
      // Generate review cycles
      for (let i = 1; i <= cycleCount; i++) {
        const year = 2022 + i;
        cycles.push({
          id: i,
          name: `Annual Review ${year}`,
          startDate: `${year}-01-01`,
          endDate: `${year}-12-31`,
          status: i < cycleCount ? 'Completed' : 'Active'
        });
      }
      
      // Generate reviews for each employee in each cycle
      let reviewId = 1;
      for (let employeeId = 1; employeeId <= employeeCount; employeeId++) {
        for (let cycleId = 1; cycleId <= cycleCount; cycleId++) {
          const isCurrent = cycleId === cycleCount;
          const status = isCurrent ? statuses[Math.floor(Math.random() * 3)] : 'Completed';
          const hasRating = status === 'Completed';
          
          reviews.push({
            id: reviewId++,
            employeeId: employeeId,
            cycleId: cycleId,
            cycleName: cycles.find(c => c.id === cycleId).name,
            status: status,
            submissionDate: !isCurrent ? `${2022 + cycleId}-11-${10 + Math.floor(Math.random() * 20)}` : null,
            managerRating: hasRating ? ratings[Math.floor(Math.random() * ratings.length)] : null,
            selfRating: hasRating ? ratings[Math.floor(Math.random() * ratings.length)] : null,
            overallRating: hasRating ? ratings[Math.floor(Math.random() * ratings.length)] : null,
            comments: hasRating ? 'Sample review comments for performance evaluation.' : ''
          });
        }
      }
      
      return { cycles, reviews };
    },
    
    // Generate mock review templates
    generateReviewTemplates: (count = 5) => {
      const templates = [];
      
      const templateTypes = [
        'Annual Performance Review',
        'Mid-Year Evaluation',
        'Peer Review',
        'Self Assessment',
        'Skills Evaluation',
        'Project Completion Review',
        'Management Effectiveness'
      ];
      
      for (let i = 1; i <= count; i++) {
        const questions = Math.floor(Math.random() * 15) + 5;
        const sections = Math.floor(Math.random() * 4) + 2;
        
        templates.push({
          id: i,
          name: templateTypes[Math.floor(Math.random() * templateTypes.length)],
          description: `Template for evaluating employee performance and setting goals.`,
          isActive: Math.random() > 0.2,
          createdAt: new Date(Date.now() - (Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString(),
          questionCount: questions,
          sectionCount: sections
        });
      }
      
      return templates;
    }
  };
  
  // Add the getMockData function that your components expect
  const getMockData = (type) => {
    switch (type) {
      case 'employees':
        return mockDataGenerator.generateEmployees();
      case 'teamReviews':
        return mockDataGenerator.generateReviews().reviews;
      case 'reviewTemplates':
        return mockDataGenerator.generateReviewTemplates();
      default:
        return [];
    }
  };
  
  export { getMockData };
  export default mockDataGenerator;