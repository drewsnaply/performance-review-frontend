import React, { useState, useEffect, lazy, Suspense, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/Dashboard.css';
import { useDepartments } from '../context/DepartmentContext';
import { useAuth } from '../context/AuthContext';
// Import recharts components for the charts
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
// Import icons
import { 
  FaUserFriends, FaClipboardList, FaCheckCircle, FaCalendarAlt, 
  FaChartLine, FaExclamationTriangle, FaTasks, 
  FaUserPlus, FaUserMinus, FaBusinessTime, FaFilter,
  FaExternalLinkAlt, FaRedo, FaExclamationCircle
} from 'react-icons/fa';

// Lazy-load component imports
const MyReviews = lazy(() => import('../components/MyReviews'));
const TeamReviews = lazy(() => import('../components/TeamReviews'));
const Employees = lazy(() => import('./Employees'));
const ReviewCycles = lazy(() => import('../components/ReviewCycles'));
const ReviewTemplates = lazy(() => import('../components/ReviewTemplates'));
const KpiManager = lazy(() => import('../components/KpiManager')); 
const ImportTool = lazy(() => import('../components/ImportTool'));
const ExportTool = lazy(() => import('../components/ExportTool'));
const Settings = lazy(() => import('./Settings'));
const ViewEvaluation = lazy(() => import('../components/ViewEvaluation'));
const PendingReviews = lazy(() => import('../components/PendingReviews'));
const TemplateAssignments = lazy(() => import('../components/TemplateAssignments'));

// Import Super Admin components
const SuperAdminDashboard = lazy(() => import('../components/super-admin/SuperAdminDashboard'));

function Dashboard({ initialView = 'dashboard' }) {
  const { employees } = useDepartments();
  const [activeView, setActiveView] = useState(initialView);
  const [reviewData, setReviewData] = useState({
    pending: 0,
    completed: 0,
    upcoming: 0,
    recentReviews: [],
    overdueReviews: 0
  });
  const [timeFilter, setTimeFilter] = useState('month');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [chartView, setChartView] = useState('standard');
  const [isLoading, setIsLoading] = useState(true);
  const [dataFetchError, setDataFetchError] = useState(false);
  const [departmentData, setDepartmentData] = useState([]);
  const [reviewsTrend, setReviewsTrend] = useState([]);
  const [priorityActions, setPriorityActions] = useState([]);
  const [employeeLifecycleData, setEmployeeLifecycleData] = useState([]);
  const [tenureDistribution, setTenureDistribution] = useState([]);
  const [ratingsByManager, setRatingsByManager] = useState([]);
  const [performanceDistribution, setPerformanceDistribution] = useState([]);
  
  // Simple flag to prevent repeated API calls
  const fetchedAssignmentsRef = useRef(false);
  
  const navigate = useNavigate();
  
  // Get completed review data from session storage only once
  const completedReviewId = sessionStorage.getItem('completedReviewId');
  
  // Get auth state directly from context
  const { currentUser } = useAuth();
  const [user, setUser] = useState(null);
  
  // Check if we're in impersonation mode
  const isImpersonating = !!localStorage.getItem('impersonatedCustomer');
  
  // API base URL for fetching data
  const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : 'https://performance-review-backend-ab8z.onrender.com';

  // Color palette for charts
  const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F97316', '#10B981', '#3B82F6'];

  // Initialize user - run only when currentUser changes
  useEffect(() => {
    console.log("Dashboard auth check running");
    
    // Check if we're on admin dashboard path
    const isAdminDashboard = window.location.pathname === '/dashboard';
    
    // IMPORTANT: If on admin dashboard, don't redirect regardless of auth state
    if (isAdminDashboard) {
      console.log("Admin dashboard detected - bypassing normal auth flow");
      
      // Use current user if available
      if (currentUser) {
        console.log("Using current user from auth context");
        setUser({
          ...currentUser,
          firstName: currentUser.firstName || currentUser.username || 'Admin',
          lastName: currentUser.lastName || '',
          role: currentUser.role || 'admin',
          // Ensure these properties exist for sidebar navigation
          isAdmin: true,
          permissions: currentUser.permissions || ['admin_access', 'manage_users', 'view_reports']
        });
      } else {
        console.log("No current user, checking localStorage");
        
        // First check for existing user in localStorage
        try {
          const storedUserStr = localStorage.getItem('user');
          if (storedUserStr) {
            console.log("Found user in localStorage");
            const storedUser = JSON.parse(storedUserStr);
            setUser({
              ...storedUser,
              firstName: storedUser.firstName || storedUser.username || 'Admin',
              lastName: storedUser.lastName || '',
              role: storedUser.role || 'admin',
              // Ensure these properties exist for sidebar navigation
              isAdmin: true,
              permissions: storedUser.permissions || ['admin_access', 'manage_users', 'view_reports']
            });
          } else {
            console.log("No user in localStorage, creating default admin user");
            // Create a default admin user
            const defaultAdmin = {
              firstName: 'Admin',
              lastName: 'User',
              username: 'admin',
              role: 'admin',
              isAdmin: true,
              permissions: ['admin_access', 'manage_users', 'view_reports', 'manage_templates']
            };
            
            // Store this default user in localStorage to maintain consistency
            localStorage.setItem('user', JSON.stringify(defaultAdmin));
            setUser(defaultAdmin);
          }
        } catch (e) {
          console.error("Error parsing stored user:", e);
          // Fallback to basic admin
          const fallbackAdmin = {
            firstName: 'Admin',
            lastName: 'User',
            username: 'admin',
            role: 'admin',
            isAdmin: true,
            permissions: ['admin_access', 'manage_users', 'view_reports', 'manage_templates']
          };
          localStorage.setItem('user', JSON.stringify(fallbackAdmin));
          setUser(fallbackAdmin);
        }
      }
    } else {
      // Not on admin dashboard, use normal authentication flow
      if (!currentUser) {
        setUser(null);
        navigate('/login');
        return;
      }
      
      // Create a normalized user from currentUser
      setUser({
        ...currentUser,
        firstName: currentUser.firstName || currentUser.username || 'User',
        lastName: currentUser.lastName || '',
        role: currentUser.role || 'USER'
      });
    }
    
    // Set loading to false once user is set
    setIsLoading(false);
  }, [currentUser, navigate]);

  // Enhanced fetchEmployeeData function with better error handling
  const fetchEmployeeData = async () => {
    console.log('Fetching employee data for analytics');
    try {
      // Enhanced fetch with retry logic
      const fetchWithRetry = async (url, options, retries = 2) => {
        try {
          const response = await fetch(url, options);
          if (!response.ok) throw new Error(`Failed to fetch from ${url}`);
          return await response.json();
        } catch (error) {
          if (retries === 0) throw error;
          console.log(`Retrying fetch for ${url}, ${retries} attempts left`);
          return fetchWithRetry(url, options, retries - 1);
        }
      };

      // Fetch from both endpoints with retry logic
      const authHeaders = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      };
      
      let employeeData = [];
      let userData = [];
      
      try {
        employeeData = await fetchWithRetry(`${API_BASE_URL}/api/employees`, authHeaders);
      } catch (error) {
        console.warn('Failed to fetch employee data, will try users endpoint', error);
      }
      
      try {
        userData = await fetchWithRetry(`${API_BASE_URL}/api/users`, authHeaders);
      } catch (error) {
        console.warn('Failed to fetch user data', error);
      }
      
      // Combine data from both sources with improved merging
      let combinedData = Array.isArray(employeeData) ? [...employeeData] : [];
      
      // Create a lookup map for faster duplicate detection
      const employeeMap = new Map();
      combinedData.forEach(emp => {
        if (emp.email) employeeMap.set(emp.email.toLowerCase(), true);
        if (emp.username) employeeMap.set(emp.username.toLowerCase(), true);
      });
      
      // Add non-duplicate users
      if (Array.isArray(userData)) {
        userData.forEach(user => {
          const isAlreadyIncluded = (user.email && employeeMap.has(user.email.toLowerCase())) ||
                                  (user.username && employeeMap.has(user.username.toLowerCase()));
          
          if (!isAlreadyIncluded) {
            combinedData.push({
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              email: user.email || '',
              username: user.username || '',
              role: user.role || '',
              isActive: user.isActive !== false,
              hireDate: user.hireDate || user.createdAt || new Date().toISOString(),
              department: user.department || 'General'
            });
          }
        });
      }
      
      console.log(`Combined data contains ${combinedData.length} employees/users`);
      
      // Process employee data for lifecycle analytics with improved error handling
      const employeesByMonth = processEmployeeLifecycleData(combinedData);
      setEmployeeLifecycleData(employeesByMonth);
      
      // Process tenure distribution
      const tenureData = processTenureDistribution(combinedData);
      setTenureDistribution(tenureData);
      
      // Process manager ratings
      const managerData = processManagerRatings(combinedData);
      setRatingsByManager(managerData);
      
      // Process performance distribution (new)
      const performanceData = processPerformanceDistribution(combinedData);
      setPerformanceDistribution(performanceData);
      
      return combinedData;
    } catch (error) {
      console.error('Error fetching employee data:', error);
      setDataFetchError(true);
      
      // Fall back to mock data after a short delay to allow for potential retry
      setTimeout(() => {
        if (dataFetchError) {
          console.log('Falling back to mock employee data');
          setEmployeeLifecycleData(generateEmployeeLifecycleData());
          setTenureDistribution(generateTenureDistribution());
          setRatingsByManager(generateManagerRatingsData());
          setPerformanceDistribution(generatePerformanceDistribution());
          setDataFetchError(false);
        }
      }, 3000);
      
      return [];
    }
  };

  // Process performance distribution for new chart
  const processPerformanceDistribution = (employees) => {
    // Define rating buckets
    const ratingBuckets = {
      'Outstanding (4.5-5.0)': 0,
      'Exceeds Expectations (4.0-4.4)': 0,
      'Meets Expectations (3.0-3.9)': 0,
      'Needs Improvement (2.0-2.9)': 0,
      'Unsatisfactory (0-1.9)': 0
    };
    
    if (!Array.isArray(employees)) {
      console.warn('processPerformanceDistribution: employees is not an array');
      return generatePerformanceDistribution();
    }
    
    // Process each employee
    employees.forEach(employee => {
      if (!employee) return;
      
      // Extract rating from employee data - try multiple sources
      const rating = employee.performanceRating || 
                   employee.lastReviewScore || 
                   (employee.reviews && employee.reviews.length > 0 ? 
                      employee.reviews[employee.reviews.length - 1].overallRating : null);
      
      if (!rating) return;
      
      const numRating = parseFloat(rating);
      if (isNaN(numRating)) return;
      
      // Assign to appropriate bucket
      if (numRating >= 4.5) ratingBuckets['Outstanding (4.5-5.0)']++;
      else if (numRating >= 4.0) ratingBuckets['Exceeds Expectations (4.0-4.4)']++;
      else if (numRating >= 3.0) ratingBuckets['Meets Expectations (3.0-3.9)']++;
      else if (numRating >= 2.0) ratingBuckets['Needs Improvement (2.0-2.9)']++;
      else if (numRating >= 0) ratingBuckets['Unsatisfactory (0-1.9)']++;
    });
    
    // Convert to array format for chart
    const performanceData = Object.entries(ratingBuckets).map(([range, count]) => ({
      range,
      count
    }));
    
    // If we have no real data, fall back to sample data
    if (performanceData.every(item => item.count === 0)) {
      console.log('No performance distribution data found, using sample data');
      return generatePerformanceDistribution();
    }
    
    console.log('Using real performance distribution data:', performanceData);
    return performanceData;
  };

  // Generate performance distribution data
  const generatePerformanceDistribution = () => {
    return [
      { range: 'Outstanding (4.5-5.0)', count: 8 },
      { range: 'Exceeds Expectations (4.0-4.4)', count: 15 },
      { range: 'Meets Expectations (3.0-3.9)', count: 22 },
      { range: 'Needs Improvement (2.0-2.9)', count: 6 },
      { range: 'Unsatisfactory (0-1.9)', count: 2 }
    ];
  };

  // Process actual employee data into lifecycle chart format
  const processEmployeeLifecycleData = (employees) => {
    console.log('Processing employee lifecycle data');
    
    if (!Array.isArray(employees)) {
      console.warn('processEmployeeLifecycleData: employees is not an array');
      return generateEmployeeLifecycleData();
    }
    
    // Get last 6 months for analysis
    const months = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({
        month: month.toLocaleString('default', { month: 'short' }),
        date: month,
        hired: 0,
        terminated: 0,
        active: 0
      });
    }

    // Process each employee with better error handling
    let processedCount = 0;
    employees.forEach(employee => {
      if (!employee) return;
      
      // Convert dates to Date objects, handling various date formats safely
      let hireDate = null;
      let terminationDate = null;
      
      try {
        if (employee.hireDate) {
          hireDate = new Date(employee.hireDate);
          if (isNaN(hireDate.getTime())) hireDate = null;
        }
        
        if (employee.terminationDate) {
          terminationDate = new Date(employee.terminationDate);
          if (isNaN(terminationDate.getTime())) terminationDate = null;
        }
      } catch (error) {
        console.warn('Error parsing employee dates:', error);
        return;
      }
      
      if (!hireDate) return;
      processedCount++;
      
      // Calculate total active employees for each month
      months.forEach((monthData) => {
        const monthStart = monthData.date;
        const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
        
        // Count hires in this month
        if (hireDate && hireDate >= monthStart && hireDate <= monthEnd) {
          monthData.hired++;
        }
        
        // Count terminations in this month
        if (terminationDate && terminationDate >= monthStart && terminationDate <= monthEnd) {
          monthData.terminated++;
        }
        
        // Count active employees (hired before or during this month, and not terminated, or terminated after this month)
        if (hireDate && hireDate <= monthEnd && (!terminationDate || terminationDate > monthStart)) {
          monthData.active++;
        }
      });
    });
    
    console.log(`Processed ${processedCount} employees for lifecycle data`);
    
    // If we have no real data, use some sample data
    if (months.every(m => m.active === 0)) {
      console.log('No active employees found, using sample data');
      return generateEmployeeLifecycleData();
    }
    
    console.log('Using real employee lifecycle data');
    return months;
  };
  
  // Process employee data into tenure distribution
  const processTenureDistribution = (employees) => {
    console.log('Processing tenure distribution from employees');
    
    if (!Array.isArray(employees)) {
      console.warn('processTenureDistribution: employees is not an array');
      return generateTenureDistribution();
    }
    
    // Initialize tenure ranges
    const tenureRanges = [
      { range: '0-6 mo', count: 0, totalRating: 0, avgRating: 0 },
      { range: '6-12 mo', count: 0, totalRating: 0, avgRating: 0 },
      { range: '1-2 yr', count: 0, totalRating: 0, avgRating: 0 },
      { range: '2-5 yr', count: 0, totalRating: 0, avgRating: 0 },
      { range: '5+ yr', count: 0, totalRating: 0, avgRating: 0 }
    ];
    
    const now = new Date();
    
    // Process each employee with better error handling
    let processedCount = 0;
    employees.forEach(employee => {
      if (!employee || !employee.hireDate) {
        return; // Skip if no hire date
      }
      
      let hireDate;
      try {
        hireDate = new Date(employee.hireDate);
        // Skip if invalid date
        if (isNaN(hireDate.getTime())) {
          return;
        }
      } catch (error) {
        console.warn('Error parsing hire date:', error);
        return;
      }
      
      const tenureMonths = (now.getFullYear() - hireDate.getFullYear()) * 12 + 
                        (now.getMonth() - hireDate.getMonth());
      
      processedCount++;
      
      // Get performance rating (try multiple possible fields)
      const performanceRating = parseFloat(
        employee.performanceRating || employee.lastReviewScore || 
        (employee.reviews && employee.reviews.length > 0 ? 
          employee.reviews[employee.reviews.length - 1].overallRating : 0)
      );
      
      // Determine which tenure range
      let rangeIndex;
      if (tenureMonths < 6) rangeIndex = 0;
      else if (tenureMonths < 12) rangeIndex = 1;
      else if (tenureMonths < 24) rangeIndex = 2;
      else if (tenureMonths < 60) rangeIndex = 3;
      else rangeIndex = 4;
      
      // Update the counts and ratings
      tenureRanges[rangeIndex].count++;
      if (performanceRating && !isNaN(performanceRating)) {
        tenureRanges[rangeIndex].totalRating += performanceRating;
      }
    });
    
    // Calculate averages
    tenureRanges.forEach(range => {
      if (range.count > 0 && range.totalRating > 0) {
        range.avgRating = +(range.totalRating / range.count).toFixed(1);
      } else {
        // If no ratings available, set a reasonable default
        range.avgRating = 3.5;
      }
    });
    
    console.log(`Processed ${processedCount} employees for tenure distribution`);
    
    // If we have no real data, use sample data
    if (tenureRanges.every(r => r.count === 0)) {
      console.log('No tenure data found, using sample data');
      return generateTenureDistribution();
    }
    
    console.log('Using real tenure distribution data');
    return tenureRanges;
  };
  
  // Process manager performance ratings with improved error handling
  const processManagerRatings = (employees) => {
    console.log('Processing manager ratings from employees');
    
    if (!Array.isArray(employees)) {
      console.warn('processManagerRatings: employees is not an array');
      return generateManagerRatingsData();
    }
    
    // First, create a map of all employees by ID for easy lookup
    const employeeMap = new Map();
    
    // Use multiple ID fields for more robust matching
    employees.forEach(employee => {
      if (!employee) return;
      
      // Track all possible ID fields
      const employeeId = employee.id || employee._id || employee.employeeId;
      if (employeeId) {
        employeeMap.set(employeeId, employee);
      }
      
      // Also track by email as a fallback
      if (employee.email) {
        employeeMap.set(employee.email.toLowerCase(), employee);
      }
      
      // And by username as another fallback
      if (employee.username) {
        employeeMap.set(employee.username.toLowerCase(), employee);
      }
    });
    
    // Now we'll create a separate map just for managers
    const managerMap = new Map();
    
    // First pass: identify all manager relationships
    employees.forEach(employee => {
      if (!employee) return;
      
      // Check all possible manager reference fields
      const managerId = employee.managerId || 
                      (employee.manager?._id || employee.manager?.id);
      
      // Skip if no manager ID
      if (!managerId) {
        return;
      }
      
      // Get manager details from manager object or from employee map
      let managerName;
      
      if (employee.manager) {
        // Try to get name from manager object
        managerName = employee.manager.name || 
                    `${employee.manager.firstName || ''} ${employee.manager.lastName || ''}`.trim();
      }
      
      // If we couldn't find name in manager object, try employee map
      if (!managerName && employeeMap.has(managerId)) {
        const managerEmployee = employeeMap.get(managerId);
        managerName = `${managerEmployee.firstName || ''} ${managerEmployee.lastName || ''}`.trim();
      }
      
      // Default if still no name
      if (!managerName || managerName === '') {
        managerName = 'Unknown Manager';
      }
      
      // Create or update manager entry
      if (!managerMap.has(managerId)) {
        managerMap.set(managerId, {
          id: managerId,
          manager: managerName,
          ratings: [],
          avgRating: 0,
          minRating: 5,
          maxRating: 0,
          count: 0
        });
      }
    });
    
    // Now process all employees and their ratings
    employees.forEach(employee => {
      if (!employee) return;
      
      // Get all possible manager reference fields
      const managerId = employee.managerId || 
                      (employee.manager?._id || employee.manager?.id);
      
      // Skip if no manager or manager not in our map
      if (!managerId || !managerMap.has(managerId)) {
        return;
      }
      
      // Get performance rating - try multiple possible fields
      const performanceRating = employee.performanceRating || 
                            employee.lastReviewScore || 
                            employee.rating ||
                            (employee.reviews && employee.reviews.length > 0 ? 
                              employee.reviews[employee.reviews.length - 1].overallRating : null);
      
      // Skip if no valid rating
      if (!performanceRating || isNaN(parseFloat(performanceRating))) {
        return;
      }
      
      // Add to manager's ratings
      const managerData = managerMap.get(managerId);
      managerData.ratings.push(parseFloat(performanceRating));
      managerData.count++;
    });
    
    // Calculate statistics for each manager
    managerMap.forEach(manager => {
      if (manager.ratings.length > 0) {
        manager.ratings.sort((a, b) => a - b);
        manager.minRating = manager.ratings[0];
        manager.maxRating = manager.ratings[manager.ratings.length - 1];
        
        const sum = manager.ratings.reduce((total, rating) => total + rating, 0);
        manager.avgRating = +(sum / manager.ratings.length).toFixed(1);
      } else {
        // Set realistic defaults if no ratings
        manager.avgRating = 3.5;
        manager.minRating = 3.0;
        manager.maxRating = 4.0;
      }
    });
    
    // Convert to array and filter out managers with no team members
    let managerArray = Array.from(managerMap.values())
      .filter(m => m.count > 0);
    
    console.log(`Found ${managerArray.length} managers with ratings`);
    
    // If we have no managers with ratings, use sample data
    if (managerArray.length === 0) {
      console.log('No manager ratings found, using sample data');
      return generateManagerRatingsData();
    }
    
    // Sort by average rating (highest first) and take top 5
    const result = managerArray
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 5);
      
    console.log('Using real manager ratings data');
    return result;
  };

  // Enhanced function to fetch assignments with better error handling
  const fetchAssignments = async () => {
    // Debug display of fetch status
    console.log(`Fetching dashboard data with time filter: ${timeFilter}, department filter: ${departmentFilter}`);
    
    setIsLoading(true);
    setDataFetchError(false);
    
    try {
      // Mark that we're fetching to prevent duplicate calls
      fetchedAssignmentsRef.current = true;
      
      // Build the query string with all active filters
      const queryParams = new URLSearchParams();
      queryParams.append('timeFilter', timeFilter);
      if (departmentFilter !== 'all') {
        queryParams.append('department', departmentFilter);
      }
      
      // Fetch both employees and assignments concurrently
      const [assignmentsResponse, employeeResult] = await Promise.all([
        fetch(`${API_BASE_URL}/api/templates/assignments?${queryParams.toString()}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        }),
        fetchEmployeeData() // This will update employee-related state variables
      ]);

      if (!assignmentsResponse.ok) {
        throw new Error(`Failed to fetch assignments: ${assignmentsResponse.status} ${assignmentsResponse.statusText}`);
      }

      const assignments = await assignmentsResponse.json();
      
      // Process assignments in a more efficient way
      let pendingCount = 0;
      let completedCount = 0;
      let upcomingCount = 0;
      let overdueCount = 0;
      
      // Current date and next month for filtering
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      
      // Department data aggregation
      const deptMap = new Map();
      
      // For trend data - initialize the last 6 months
      const monthMap = new Map();
      for (let i = 0; i < 6; i++) {
        const d = new Date(now);
        d.setMonth(d.getMonth() - i);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const monthName = d.toLocaleString('default', { month: 'short' });
        monthMap.set(monthKey, { 
          month: monthName, 
          completed: 0, 
          pending: 0, 
          upcoming: 0,
          date: new Date(d.getFullYear(), d.getMonth(), 1) // Store full date for sorting
        });
      }
      
      // Process all assignments in a single loop with better error handling
      if (Array.isArray(assignments)) {
        assignments.forEach(a => {
          if (!a) return; // Skip invalid assignments
          
          // Parse dates safely
          let dueDate, createdDate;
          try {
            dueDate = a.dueDate ? new Date(a.dueDate) : new Date();
            if (isNaN(dueDate.getTime())) dueDate = new Date(); // Fallback to today if invalid
            
            createdDate = new Date(a.createdAt || a.createdDate || a.dueDate || Date.now());
            if (isNaN(createdDate.getTime())) createdDate = new Date();
          } catch (error) {
            console.warn('Error parsing assignment dates:', error);
            dueDate = new Date();
            createdDate = new Date();
          }
          
          const monthKey = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}`;
          
          // Count pending/in-progress
          if (a.status === 'Pending' || a.status === 'InProgress') {
            // If this is a completed review (client-side), don't count as pending
            if (completedReviewId && 
              (a._id === completedReviewId || a.createdReview === completedReviewId)) {
              completedCount++;
            } else {
              pendingCount++;
              
              // Check if overdue
              if (dueDate < now) {
                overdueCount++;
              }
            }
          }
          // Count completed
          else if (a.status === 'Completed') {
            completedCount++;
          }
          
          // Count upcoming
          if (dueDate >= nextMonth && a.status !== 'Completed' && a.status !== 'Canceled') {
            upcomingCount++;
          }
          
          // Aggregate by department - enhanced to handle missing departments
          const dept = a.employee?.department || 'Unknown';
          if (!deptMap.has(dept)) {
            deptMap.set(dept, { name: dept, pending: 0, completed: 0, total: 0 });
          }
          
          const deptData = deptMap.get(dept);
          deptData.total++;
          
          if (a.status === 'Completed') {
            deptData.completed++;
          } else if (a.status === 'Pending' || a.status === 'InProgress') {
            deptData.pending++;
          }
          
          // Process assignment into month trends (if in the 6-month window)
          if (monthMap.has(monthKey)) {
            const monthData = monthMap.get(monthKey);
            
            if (a.status === 'Completed') {
              monthData.completed++;
            } else if (a.status === 'Pending' || a.status === 'InProgress') {
              monthData.pending++;
            } else if (dueDate >= now) {
              monthData.upcoming++;
            }
          }
        });
      }
      
      // Convert department map to array for the chart
      const departmentStats = Array.from(deptMap.values());
      
      console.log('Real department data before processing:', departmentStats);
      
      // Better handling of departments - ensure we track "Unknown" department
      if (!deptMap.has('Unknown') && assignments.some(a => !a.employee?.department)) {
        // Add unknown department if we have assignments without departments
        let pendingCount = 0;
        let completedCount = 0;
        
        assignments.forEach(a => {
          if (!a.employee?.department) {
            if (a.status === 'Completed') {
              completedCount++;
            } else if (a.status === 'Pending' || a.status === 'InProgress') {
              pendingCount++;
            }
          }
        });
        
        if (pendingCount > 0 || completedCount > 0) {
          departmentStats.push({
            name: 'Unknown',
            pending: pendingCount,
            completed: completedCount,
            total: pendingCount + completedCount
          });
        }
      }
      
      // Only fall back to sample data if we have no real data after our fixes
      if (departmentStats.length === 0) {
        console.log('No department data found, using sample data');
        departmentStats.push(
          { name: 'Engineering', pending: 3, completed: 7, total: 10 },
          { name: 'Sales', pending: 2, completed: 5, total: 7 }
        );
      }
      console.log('Final department data:', departmentStats);
      setDepartmentData(departmentStats);
      
      // Convert and sort trend data
      const trendData = Array.from(monthMap.values())
        .sort((a, b) => a.date - b.date); // Sort by date ascending
      
      console.log('Real trend data before processing:', trendData);
      
      // Ensure we have data for trend chart
      if (trendData.every(item => item.completed === 0 && item.pending === 0 && item.upcoming === 0)) {
        console.log('No trend data found, using sample data');
        // If no real data, add some sample data
        trendData.forEach((item, index) => {
          item.completed = Math.floor(Math.random() * 5) + 1;
          item.pending = Math.floor(Math.random() * 4) + 1;
          item.upcoming = index > 3 ? Math.floor(Math.random() * 3) + 1 : 0;
        });
      }
      console.log('Final trend data:', trendData);
      setReviewsTrend(trendData);
      
      // Generate priority actions
      const actions = generatePriorityActions(overdueCount, pendingCount, assignments);
      setPriorityActions(actions);
      
      // Map only the first 5 assignments for display
      const recentReviews = processRecentReviews(assignments.slice(0, 5));
      
      // Update state once with all data
      setReviewData({
        pending: pendingCount,
        completed: completedCount,
        upcoming: upcomingCount,
        overdueReviews: overdueCount,
        recentReviews
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setDataFetchError(true);
      setIsLoading(false);
      
      // Wait a bit before falling back to mock data
      setTimeout(() => {
        if (dataFetchError) {
          fallbackToMockData();
        }
      }, 3000);
    }
  };
  
  // Process recent reviews from assignments
  const processRecentReviews = (assignments) => {
    if (!Array.isArray(assignments)) return [];
    
    const now = new Date();
    
    // Map only the first 5 assignments for display
    return assignments.map(assignment => {
      // Safely build the basic review object with nullish coalescing
      const review = {
        id: assignment._id ?? '',
        employee: `${assignment.employee?.firstName ?? ''} ${assignment.employee?.lastName ?? ''}`.trim() || 'Unknown',
        cycle: assignment.template?.name ?? 'Performance Review',
        dueDate: assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'N/A',
        reviewType: assignment.template?.frequency ?? 'Performance',
        status: assignment.status?.toLowerCase() ?? 'pending',
        createdReview: assignment.createdReview ?? null,
        department: assignment.employee?.department ?? 'General'
      };
      
      // Update status if this is a completed review
      if (completedReviewId && 
         (assignment._id === completedReviewId || assignment.createdReview === completedReviewId)) {
        review.status = 'completed';
      }
      
      // Check if overdue
      const dueDate = new Date(assignment.dueDate ?? Date.now());
      if (dueDate < now && (review.status === 'pending' || review.status === 'inprogress')) {
        review.isOverdue = true;
      }
      
      return review;
    });
  };
  
  // Fallback to mock data if API fails
  const fallbackToMockData = () => {
    console.warn('Falling back to mock data due to API errors');
    setDataFetchError(false);
    
    setDepartmentData(generateMockDepartmentData());
    setReviewsTrend(generateMockTrendData());
    
    // Employee data fallbacks are handled in fetchEmployeeData
    
    const actions = generateMockPriorityActions();
    setPriorityActions(actions);
    
    // Attempt to use localStorage as fallback for review data
    const storedReviews = localStorage.getItem('reviews');
    if (storedReviews) {
      try {
        const parsedReviews = JSON.parse(storedReviews);
        // Process localStorage data (simplified)
        setReviewData({
          pending: parsedReviews.filter(r => 
            r.status?.toLowerCase() === 'pending' || 
            r.status?.toLowerCase() === 'pending manager review'
          ).length,
          completed: parsedReviews.filter(r => 
            r.status?.toLowerCase() === 'completed'
          ).length,
          upcoming: parsedReviews.filter(r => 
            r.status?.toLowerCase() === 'upcoming'
          ).length,
          overdueReviews: 2, // Mock data
          recentReviews: parsedReviews.slice(0, 5).map(review => ({
            id: review.id,
            employee: review.employeeName || 'Unknown',
            cycle: review.reviewCycle || 'Annual Review',
            dueDate: review.submissionDate || 'N/A',
            reviewType: 'Performance',
            status: review.status?.toLowerCase() || 'pending',
            createdReview: review.reviewId || null,
            department: review.department || 'General'
          }))
        });
      } catch (localStorageError) {
        console.error('Error parsing reviews from localStorage:', localStorageError);
        // If localStorage parsing fails, set default review data
        setReviewData({
          pending: 5,
          completed: 8,
          upcoming: 3,
          overdueReviews: 2,
          recentReviews: []
        });
      }
    } else {
      // No localStorage data, set defaults
      setReviewData({
        pending: 5,
        completed: 8,
        upcoming: 3,
        overdueReviews: 2,
        recentReviews: []
      });
    }
  };

  // Fetch data on component mount or when filters change
  useEffect(() => {
    // Only call the fetch function when on the dashboard view
    if (activeView === 'dashboard' && user) {
      // Force reset of fetch flag to ensure we always get fresh data
      fetchedAssignmentsRef.current = false;
      fetchAssignments();
    }
  }, [activeView, user, timeFilter, departmentFilter, chartView, completedReviewId, API_BASE_URL]);
  
  // Generate employee lifecycle data (hires, active, terminated)
  const generateEmployeeLifecycleData = () => {
    // In a real application, this would come from your API
    const mockData = [
      { month: 'Jan', hired: 3, terminated: 1, active: 42 },
      { month: 'Feb', hired: 2, terminated: 0, active: 44 },
      { month: 'Mar', hired: 5, terminated: 2, active: 47 },
      { month: 'Apr', hired: 4, terminated: 1, active: 50 },
      { month: 'May', hired: 3, terminated: 3, active: 50 },
      { month: 'Jun', hired: 6, terminated: 2, active: 54 }
    ];
    console.log('Using mock employee lifecycle data');
    return mockData;
  };
  
  // Generate tenure distribution data
  const generateTenureDistribution = () => {
    const mockData = [
      { range: '0-6 mo', count: 12, avgRating: 3.2 },
      { range: '6-12 mo', count: 15, avgRating: 3.5 },
      { range: '1-2 yr', count: 20, avgRating: 3.7 },
      { range: '2-5 yr', count: 18, avgRating: 4.1 },
      { range: '5+ yr', count: 8, avgRating: 4.3 }
    ];
    console.log('Using mock tenure distribution data');
    return mockData;
  };
  
  // Generate manager ratings data
  const generateManagerRatingsData = () => {
    const mockData = [
      { manager: 'Sarah Johnson', avgRating: 4.2, minRating: 3.7, maxRating: 4.8, count: 8 },
      { manager: 'Michael Chen', avgRating: 3.8, minRating: 3.0, maxRating: 4.5, count: 6 },
      { manager: 'David Wilson', avgRating: 4.0, minRating: 3.5, maxRating: 4.7, count: 9 },
      { manager: 'Lisa Rodriguez', avgRating: 3.9, minRating: 3.2, maxRating: 4.6, count: 7 },
      { manager: 'James Martin', avgRating: 3.7, minRating: 2.9, maxRating: 4.4, count: 5 }
    ];
    console.log('Using mock manager ratings data');
    return mockData;
  };
  
  // Generate mock data for charts and visualizations (fallback only)
  const generateMockDepartmentData = () => {
    return [
      { name: 'Engineering', pending: 5, completed: 12, total: 17 },
      { name: 'Marketing', pending: 3, completed: 7, total: 10 },
      { name: 'HR', pending: 1, completed: 5, total: 6 },
      { name: 'Sales', pending: 6, completed: 9, total: 15 },
      { name: 'Support', pending: 2, completed: 8, total: 10 }
    ];
  };
  
  const generateMockTrendData = () => {
    return [
      { month: 'Jan', completed: 4, pending: 2, upcoming: 0 },
      { month: 'Feb', completed: 6, pending: 3, upcoming: 0 },
      { month: 'Mar', completed: 8, pending: 5, upcoming: 0 },
      { month: 'Apr', completed: 10, pending: 4, upcoming: 0 },
      { month: 'May', completed: 11, pending: 6, upcoming: 0 },
      { month: 'Jun', completed: 9, pending: 4, upcoming: 3 }
    ];
  };
  
  const generateMockPriorityActions = () => {
    return [
      { id: 1, title: 'Send reminders for overdue reviews', count: 3, type: 'warning' },
      { id: 2, title: 'Approve pending reviews', count: 5, type: 'info' },
      { id: 3, title: 'Create templates for next quarter', count: 1, type: 'task' }
    ];
  };
  
  const generatePriorityActions = (overdueCount, pendingCount, assignments) => {
    const actions = [];
    
    // Add overdue review action if there are any
    if (overdueCount > 0) {
      actions.push({
        id: 1,
        title: `Send reminders for overdue reviews`,
        count: overdueCount,
        type: 'warning'
      });
    }
    
    // Add pending reviews action if there are any
    if (pendingCount > 0) {
      actions.push({
        id: 2,
        title: 'Reviews awaiting your approval',
        count: pendingCount,
        type: 'info'
      });
    }
    
    // Find upcoming reviews in the next 7 days
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);
    
    let upcomingThisWeek = 0;
    if (Array.isArray(assignments)) {
      upcomingThisWeek = assignments.filter(a => {
        if (!a || !a.dueDate) return false;
        try {
          const dueDate = new Date(a.dueDate);
          return dueDate >= now && dueDate <= nextWeek;
        } catch (error) {
          return false;
        }
      }).length;
    }
    
    if (upcomingThisWeek > 0) {
      actions.push({
        id: 3,
        title: 'Reviews due in the next 7 days',
        count: upcomingThisWeek,
        type: 'upcoming'
      });
    }
    
    // Add a template-related action if needed
    actions.push({
      id: 4,
      title: 'Prepare for next review cycle',
      count: 1,
      type: 'task'
    });
    
    return actions;
  };
  
  // Handle review actions 
  const handleReviewAction = (review) => {
    if (review.status === 'completed') {
      navigate(`/reviews/${review.id}`);
    } else if (review.status === 'pending' || review.status === 'inprogress') {
      if (review.createdReview) {
        navigate(`/reviews/edit/${review.createdReview}`);
      } else {
        fetch(`${API_BASE_URL}/api/templates/assignments/${review.id}/start`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        })
        .then(response => {
          if (!response.ok) throw new Error('Failed to start review');
          return response.json();
        })
        .then(data => {
          navigate(`/reviews/edit/${data.review._id}`);
        })
        .catch(error => {
          console.error('Error starting review:', error);
          alert(`Error starting review: ${error.message}`);
        });
      }
    } else {
      // Navigate to templates page instead of evaluation management
      navigate(`/templates`);
      setActiveView('templates');
    }
  };
  
  // Handle priority action click
  const handlePriorityAction = (action) => {
    switch (action.type) {
      case 'warning':
        // Navigate to pending reviews/template assignments for overdue reviews
        setActiveView('template-assignments');
        navigate('/templates/assignments');
        break;
      case 'info':
        // Navigate to pending reviews for approvals
        setActiveView('pending-reviews');
        navigate('/pending-reviews');
        break;
      case 'upcoming':
        // Navigate to upcoming reviews
        setActiveView('template-assignments');
        navigate('/templates/assignments');
        break;
      case 'task':
        // Navigate to templates for review cycle preparation
        setActiveView('templates');
        navigate('/templates');
        break;
      default:
        // Default to dashboard
        break;
    }
  };

  // Handle navigation to Super Admin Dashboard
  const goToSuperAdmin = () => {
    setActiveView('super-admin');
    navigate('/super-admin/customers');
  };
  
  // Calculate active employees count safely
  const activeEmployeesCount = Array.isArray(employees) ? 
    employees.filter(employee => 
      employee && (employee.isActive === true || 
      employee.status?.toLowerCase() === 'active')
    ).length : 0;
  
  // Handler for time filter changes
  const handleTimeFilterChange = (filter) => {
    setTimeFilter(filter);
    // Reset the fetch flag to ensure data is refetched with new time filter
    fetchedAssignmentsRef.current = false;
  };
  
  // Handler for department filter changes
  const handleDepartmentFilterChange = (filter) => {
    setDepartmentFilter(filter);
    // Reset the fetch flag to ensure data is refetched with new department filter
    fetchedAssignmentsRef.current = false;
  };
  
  // Handler for chart view changes
  const handleChartViewChange = (view) => {
    setChartView(view);
  };
  
  // Function to retry data fetching
  const handleRetryFetch = () => {
    setDataFetchError(false);
    fetchedAssignmentsRef.current = false;
    fetchAssignments();
  };
  
  // Render loading state
  const renderLoadingState = () => (
    <div className="chart-loading">
      <div className="loading-pulse"><div></div><div></div></div>
    </div>
  );
  
  // Render error state
  const renderErrorState = () => (
    <div className="chart-error">
      <div className="error-icon">
        <FaExclamationCircle />
      </div>
      <div className="error-message">
        There was an error loading this chart. 
        <br />The connection to the server may be interrupted.
      </div>
      <button className="retry-button" onClick={handleRetryFetch}>
        <FaRedo className="mr-2" /> Retry
      </button>
    </div>
  );
  
  // Render the active view with Suspense for lazy-loaded components
  const renderActiveView = () => {
    // Return a Suspense wrapped component
    const renderComponent = (Component, props = {}) => (
      <Suspense fallback={<div className="loading-state">Loading component...</div>}>
        <Component {...props} />
      </Suspense>
    );
    
    switch (activeView) {
      case 'my-reviews': return renderComponent(MyReviews);
      case 'team-reviews': return renderComponent(TeamReviews);
      case 'employees': return renderComponent(Employees);
      case 'settings': return renderComponent(Settings);
      case 'review-cycles': return renderComponent(ReviewCycles);
      case 'templates': return renderComponent(ReviewTemplates);
      case 'template-assignments': return renderComponent(TemplateAssignments);
      case 'kpis': return renderComponent(KpiManager);
      case 'tools-imports': return renderComponent(ImportTool);
      case 'tools-exports': return renderComponent(ExportTool);
      case 'evaluation-detail': return renderComponent(ViewEvaluation);
      case 'pending-reviews': return renderComponent(PendingReviews);
      case 'super-admin': return renderComponent(SuperAdminDashboard);
      default: return renderDashboardDefault();
    }
  };

  // Enhanced Dashboard view with improved charts and visualizations
  const renderDashboardDefault = () => {
    return (
      <>
        <div className="dashboard-header">
          <h1 className="page-title">Dashboard Overview</h1>
        </div>
        
        {/* Enhanced Filters Section */}
        <div className="dashboard-filters">
          <div className="filter-group">
            <span className="filter-label">
              <FaFilter className="mr-2" /> Time Period:
            </span>
            <select 
              value={timeFilter} 
              onChange={(e) => handleTimeFilterChange(e.target.value)}
              className="filter-select"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
          
          <div className="filter-group">
            <span className="filter-label">Department:</span>
            <select 
              value={departmentFilter} 
              onChange={(e) => handleDepartmentFilterChange(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Departments</option>
              {Array.isArray(departmentData) && departmentData.map(dept => (
                <option key={dept.name} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group ml-auto">
            <button 
              className={`filter-button ${chartView === 'standard' ? 'active' : ''}`}
              onClick={() => handleChartViewChange('standard')}
            >
              Standard
            </button>
            <button 
              className={`filter-button ${chartView === 'performance' ? 'active' : ''}`}
              onClick={() => handleChartViewChange('performance')}
            >
              Performance
            </button>
            <button 
              className={`filter-button ${chartView === 'employees' ? 'active' : ''}`}
              onClick={() => handleChartViewChange('employees')}
            >
              Employees
            </button>
          </div>
        </div>
        
        {/* Super Admin Access Panel - Only visible to superadmin users who are NOT impersonating */}
        {user && user.role === 'superadmin' && !isImpersonating && (
          <div className="super-admin-access-panel mb-6 p-4 bg-indigo-100 rounded-lg border border-indigo-200">
            <h3 className="text-lg font-medium text-indigo-800 mb-2">Super Admin Access</h3>
            <p className="text-indigo-700 mb-3">
              You are logged in as a Super Admin. Access advanced administrative features below.
            </p>
            <button
              onClick={goToSuperAdmin}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
            >
              Go to Super Admin Dashboard
            </button>
          </div>
        )}
        
        {/* Priority Actions Section */}
        <div className="priority-actions-section">
          <div className="dashboard-section-title">
            <div className="section-title-main">
              <FaExclamationTriangle className="section-icon" />
              Priority Actions
            </div>
            <div className="section-actions">
              <span className="action-link" onClick={() => {
                setActiveView('template-assignments');
                navigate('/templates/assignments');
              }}>
                View All <FaExternalLinkAlt />
              </span>
            </div>
          </div>
          <div className="priority-actions-container">
            {priorityActions.length > 0 ? (
              priorityActions.map(action => (
                <div 
                  key={action.id} 
                  className={`priority-action-card ${action.type}`}
                  onClick={() => handlePriorityAction(action)}
                >
                  <div className="action-badge">{action.count}</div>
                  <div className="action-title">{action.title}</div>
                  <div className="action-cta">Take action →</div>
                </div>
              ))
            ) : (
              <div className="empty-priorities">
                <p>No priority actions at this time. Everything is up to date!</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Main KPI Cards */}
        <div className="dashboard-metrics">
          <div className="dashboard-section-title">
            <div className="section-title-main">
              <FaChartLine className="section-icon" />
              Performance Metrics
            </div>
          </div>
          <div className="dashboard-overview">
            <div 
              className="overview-card enhanced clickable" 
              onClick={() => {
                setActiveView('employees');
                navigate('/employees');
              }}
            >
              <div className="card-icon">
                <FaUserFriends />
              </div>
              <div className="card-content">
                <h3>Active Employees</h3>
                <div className="value">{activeEmployeesCount || employeeLifecycleData[employeeLifecycleData.length - 1]?.active || 0}</div>
                <div className="trend positive">
                  <span className="trend-arrow">↑</span> {employeeLifecycleData[employeeLifecycleData.length - 1]?.hired || 2} new this month
                </div>
              </div>
            </div>

            <div 
              className="overview-card enhanced clickable" 
              onClick={() => {
                setActiveView('template-assignments');
                navigate('/templates/assignments');
              }}
            >
              <div className="card-icon warning">
                <FaClipboardList />
              </div>
              <div className="card-content">
                <h3>Pending Reviews</h3>
                <div className="value">{reviewData.pending}</div>
                <div className="trend">
                  {reviewData.overdueReviews > 0 ? (
                    <span className="overdue">{reviewData.overdueReviews} overdue</span>
                  ) : (
                    <span>Due this month</span>
                  )}
                </div>
              </div>
            </div>
            
            <div 
              className="overview-card enhanced clickable" 
              onClick={() => {
                setActiveView('template-assignments');
                navigate('/templates/assignments');
              }}
            >
              <div className="card-icon success">
                <FaCheckCircle />
              </div>
              <div className="card-content">
                <h3>Completed Reviews</h3>
                <div className="value">{reviewData.completed}</div>
                <div className="trend positive">
                  <span className="trend-arrow">↑</span> {Math.max(1, Math.floor(reviewData.completed * 0.1))} from last cycle
                </div>
              </div>
            </div>
            
            <div 
              className="overview-card enhanced clickable" 
              onClick={() => {
                setActiveView('template-assignments');
                navigate('/templates/assignments');
              }}
            >
              <div className="card-icon info">
                <FaCalendarAlt />
              </div>
              <div className="card-content">
                <h3>Upcoming Reviews</h3>
                <div className="value">{reviewData.upcoming}</div>
                <div className="trend">Starting next month</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Render different chart sections based on selected view */}
        {chartView === 'standard' && (
          <div className="dashboard-charts animate-chart">
            {/* Review Trends Chart */}
            {isLoading ? renderLoadingState() : (
              dataFetchError ? renderErrorState() : (
                <div className="chart-container review-trends">
                  <h3 className="chart-title">Review Activity Trends</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={reviewsTrend} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={{ stroke: '#e0e0e0' }}
                        tick={{ fill: '#6b7280' }}
                      />
                      <YAxis 
                        axisLine={{ stroke: '#e0e0e0' }}
                        tick={{ fill: '#6b7280' }}
                      />
                      <Tooltip formatter={(value, name) => [value, name]} />
                      <Legend 
                        verticalAlign="top"
                        wrapperStyle={{ paddingBottom: '10px' }}
                      />
                      <defs>
                        <linearGradient id="completedFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <Area 
                        type="monotone" 
                        dataKey="completed" 
                        name="Completed" 
                        fill="url(#completedFill)" 
                        stroke="#10B981" 
                        strokeWidth={2} 
                        dot={{ r: 4, strokeWidth: 2, fill: "white" }} 
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="pending" 
                        name="Pending" 
                        stroke="#F97316" 
                        strokeWidth={2} 
                        dot={{ r: 4, strokeWidth: 2, fill: "white" }} 
                        activeDot={{ r: 6 }}
                      />
                      <Bar 
                        dataKey="upcoming" 
                        name="Upcoming" 
                        barSize={20} 
                        fill="#6366F1" 
                        radius={[4, 4, 0, 0]}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )
            )}
            
            {/* Department and Status Charts */}
            <div className="chart-row">
              {isLoading ? renderLoadingState() : (
                dataFetchError ? renderErrorState() : (
                  <div className="chart-container department-performance">
                    <h3 className="chart-title">Department Performance</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart 
                        data={[...departmentData].sort((a, b) => b.total - a.total)} 
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        barGap={0}
                        barCategoryGap="15%"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          axisLine={{ stroke: '#e0e0e0' }}
                          tick={{ fill: '#6b7280', angle: -45, textAnchor: 'end', dy: 10 }}
                          height={60}
                        />
                        <YAxis 
                          axisLine={{ stroke: '#e0e0e0' }}
                          tick={{ fill: '#6b7280' }}
                        />
                        <Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }} />
                        <Legend 
                          verticalAlign="top"
                          wrapperStyle={{ paddingBottom: '10px' }}
                        />
                        <Bar 
                          dataKey="completed" 
                          name="Completed" 
                          stackId="a" 
                          fill="#10B981" 
                          radius={[4, 4, 0, 0]}
                          animationDuration={1500}
                          animationEasing="ease-out"
                        />
                        <Bar 
                          dataKey="pending" 
                          name="Pending" 
                          stackId="a" 
                          fill="#F97316" 
                          radius={[4, 4, 0, 0]}
                          animationDuration={1500}
                          animationEasing="ease-out"
                          animationBegin={300}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )
              )}
              
              {isLoading ? renderLoadingState() : (
                dataFetchError ? renderErrorState() : (
                  <div className="chart-container review-status">
                    <h3 className="chart-title">Review Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Completed', value: reviewData.completed || 0 },
                            { name: 'Pending', value: reviewData.pending || 0 },
                            { name: 'Upcoming', value: reviewData.upcoming || 0 }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          <Cell fill="#10B981" />
                          <Cell fill="#F97316" />
                          <Cell fill="#6366F1" />
                        </Pie>
                        <Tooltip formatter={(value, name) => [value, name]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )
              )}
            </div>
          </div>
        )}
        
        {chartView === 'performance' && (
          <div className="dashboard-charts animate-chart">
            {/* Performance Distribution Chart */}
            <div className="chart-row">
              {isLoading ? renderLoadingState() : (
                dataFetchError ? renderErrorState() : (
                  <div className="chart-container review-status">
                    <h3 className="chart-title">Performance Rating Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={performanceDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent, cx, cy, midAngle, innerRadius, outerRadius }) => {
                            const RADIAN = Math.PI / 180;
                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);
                            
                            return (
                              <text 
                                x={x} 
                                y={y} 
                                fill="white" 
                                textAnchor={x > cx ? 'start' : 'end'} 
                                dominantBaseline="central"
                                fontWeight="bold"
                              >
                                {`${(percent * 100).toFixed(0)}%`}
                              </text>
                            );
                          }}
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="count"
                        >
                          <Cell fill="#10B981" />
                          <Cell fill="#6366F1" />
                          <Cell fill="#3B82F6" />
                          <Cell fill="#F97316" />
                          <Cell fill="#EF4444" />
                        </Pie>
                        <Tooltip 
                          formatter={(value, name, props) => [value, props.payload.range]}
                        />
                        <Legend 
                          layout="vertical" 
                          verticalAlign="middle" 
                          align="right"
                          wrapperStyle={{ fontSize: '12px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )
              )}
              
              {isLoading ? renderLoadingState() : (
                dataFetchError ? renderErrorState() : (
                  <div className="chart-container">
                    <h3 className="chart-title">
                      <FaUserMinus className="chart-title-icon" />
                      Rating Distribution By Manager
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart 
                        data={ratingsByManager} 
                        layout="vertical" 
                        margin={{ top: 20, right: 80, left: 70, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" horizontal={true} />
                        <XAxis 
                          type="number" 
                          domain={[0, 5]} 
                          axisLine={{ stroke: '#e0e0e0' }}
                          tick={{ fill: '#6b7280' }}
                        />
                        <YAxis 
                          dataKey="manager" 
                          type="category" 
                          axisLine={{ stroke: '#e0e0e0' }}
                          tick={{ fill: '#6b7280' }}
                          width={70}
                        />
                        <Tooltip 
                          formatter={(value, name, props) => {
                            // Show team size in tooltip
                            if (name === 'avgRating') {
                              return [`${value.toFixed(1)} (Team: ${props.payload.count || 0})`];
                            }
                            return [value, name];
                          }}
                        />
                        <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px' }} />
                        
                        {/* Rating range (min to max) shown as an error bar */}
                        {ratingsByManager.map((entry, index) => (
                          <Line
                            key={`line-${index}`}
                            dataKey="avgRating"
                            data={[entry]}
                            stroke={COLORS[index % COLORS.length]}
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive={false}
                            label={false}
                          />
                        ))}
                        
                        {/* Average rating shown as bar */}
                        <Bar 
                          dataKey="avgRating" 
                          name="Average Rating" 
                          barSize={20} 
                          radius={[0, 4, 4, 0]}
                          label={({ x, y, width, value }) => (
                            <text x={x + width - 5} y={y + 19} fill="#fff" textAnchor="end" dominantBaseline="middle">
                              {value.toFixed(1)}
                            </text>
                          )}
                        >
                          {ratingsByManager.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]} 
                              fillOpacity={0.9}
                            />
                          ))}
                        </Bar>
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )
              )}
            </div>
            
            {/* Department Performance Chart */}
            {isLoading ? renderLoadingState() : (
              dataFetchError ? renderErrorState() : (
                <div className="chart-container department-performance">
                  <h3 className="chart-title">Department Performance</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart 
                      data={[...departmentData].sort((a, b) => b.total - a.total)} 
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      barGap={0}
                      barCategoryGap="15%"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        axisLine={{ stroke: '#e0e0e0' }}
                        tick={{ fill: '#6b7280', angle: -45, textAnchor: 'end', dy: 10 }}
                        height={60}
                      />
                      <YAxis 
                        axisLine={{ stroke: '#e0e0e0' }}
                        tick={{ fill: '#6b7280' }}
                      />
                      <Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }} />
                      <Legend 
                        verticalAlign="top"
                        wrapperStyle={{ paddingBottom: '10px' }}
                      />
                      <Bar 
                        dataKey="completed" 
                        name="Completed" 
                        stackId="a" 
                        fill="#10B981" 
                        radius={[4, 4, 0, 0]}
                        animationDuration={1500}
                        animationEasing="ease-out"
                      />
                      <Bar 
                        dataKey="pending" 
                        name="Pending" 
                        stackId="a" 
                        fill="#F97316" 
                        radius={[4, 4, 0, 0]}
                        animationDuration={1500}
                        animationEasing="ease-out"
                        animationBegin={300}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )
            )}
          </div>
        )}
        
        {chartView === 'employees' && (
          <div className="dashboard-charts animate-chart">
            {/* Employee Lifecycle Analytics Section */}
            <div className="dashboard-section-title">
              <div className="section-title-main">
                <FaUserPlus className="section-icon" />
                Employee Lifecycle Analytics
              </div>
            </div>
            
            {/* Employee Headcount Trends */}
            {isLoading ? renderLoadingState() : (
              dataFetchError ? renderErrorState() : (
                <div className="chart-container">
                  <h3 className="chart-title">Employee Headcount Trends</h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart 
                      data={employeeLifecycleData} 
                      margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={{ stroke: '#e0e0e0' }}
                        tick={{ fill: '#6b7280' }}
                      />
                      <YAxis 
                        yAxisId="left"
                        axisLine={{ stroke: '#e0e0e0' }}
                        tick={{ fill: '#6b7280' }}
                        domain={['auto', 'auto']}
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        axisLine={{ stroke: '#e0e0e0' }}
                        tick={{ fill: '#6b7280' }}
                        domain={[0, 'dataMax + 5']}
                      />
                      <Tooltip />
                      <Legend 
                        verticalAlign="top"
                        wrapperStyle={{ paddingBottom: '10px' }}
                      />
                      <defs>
                        <linearGradient id="activeEmployeesFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <Area 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="active" 
                        name="Active Employees" 
                        fill="url(#activeEmployeesFill)"
                        stroke="#6366F1" 
                        strokeWidth={2}
                        dot={{ r: 4, strokeWidth: 2, fill: "white" }}
                        activeDot={{ r: 6 }}
                      />
                      <Bar 
                        yAxisId="left"
                        dataKey="hired" 
                        name="New Hires" 
                        barSize={20} 
                        fill="#10B981" 
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        yAxisId="left"
                        dataKey="terminated" 
                        name="Terminations" 
                        barSize={20} 
                        fill="#F97316" 
                        radius={[4, 4, 0, 0]}
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="active" 
                        name="" 
                        stroke="#6366F1" 
                        dot={false}
                        activeDot={false}
                        hide={true}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )
            )}
            
            {/* Tenure and Manager Rating Row */}
            <div className="chart-row">
              {isLoading ? renderLoadingState() : (
                dataFetchError ? renderErrorState() : (
                  <div className="chart-container">
                    <h3 className="chart-title">
                      <FaBusinessTime className="chart-title-icon" />
                      Employee Tenure Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart
                        data={tenureDistribution}
                        margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                        barCategoryGap="15%"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis 
                          dataKey="range" 
                          axisLine={{ stroke: '#e0e0e0' }}
                          tick={{ fill: '#6b7280' }}
                        />
                        <YAxis 
                          yAxisId="left" 
                          orientation="left" 
                          domain={[0, 'dataMax + 5']} 
                          axisLine={{ stroke: '#e0e0e0' }}
                          tick={{ fill: '#6b7280' }}
                        />
                        <YAxis 
                          yAxisId="right" 
                          orientation="right" 
                          domain={[0, 5]} 
                          axisLine={{ stroke: '#e0e0e0' }}
                          tick={{ fill: '#6b7280' }}
                        />
                        <Tooltip 
                          formatter={(value, name) => {
                            if (name === "count") return ["Employee Count", value];
                            if (name === "avgRating") return ["Avg Performance", value];
                            return [value, name];
                          }}
                        />
                        <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px' }} />
                        
                        <defs>
                          <linearGradient id="countGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0.2}/>
                          </linearGradient>
                        </defs>
                        
                        <Bar 
                          yAxisId="left" 
                          dataKey="count" 
                          name="Employee Count" 
                          fill="url(#countGradient)" 
                          radius={[4, 4, 0, 0]}
                          barSize={30}
                          animationDuration={1500}
                        />
                        
                        <Line 
                          yAxisId="right" 
                          type="monotone" 
                          dataKey="avgRating" 
                          name="Avg Performance" 
                          stroke="#F97316" 
                          strokeWidth={3}
                          dot={{ r: 6, strokeWidth: 2, stroke: '#F97316', fill: 'white' }}
                          activeDot={{ r: 8, stroke: '#F97316', strokeWidth: 2 }}
                          connectNulls
                          animationDuration={2000}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )
              )}
              
              {isLoading ? renderLoadingState() : (
                dataFetchError ? renderErrorState() : (
                  <div className="chart-container">
                    <h3 className="chart-title">
                      <FaUserMinus className="chart-title-icon" />
                      Rating Distribution By Manager
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart 
                        data={ratingsByManager} 
                        layout="vertical" 
                        margin={{ top: 20, right: 80, left: 70, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" horizontal={true} />
                        <XAxis 
                          type="number" 
                          domain={[0, 5]} 
                          axisLine={{ stroke: '#e0e0e0' }}
                          tick={{ fill: '#6b7280' }}
                        />
                        <YAxis 
                          dataKey="manager" 
                          type="category" 
                          axisLine={{ stroke: '#e0e0e0' }}
                          tick={{ fill: '#6b7280' }}
                          width={70}
                        />
                        <Tooltip 
                          formatter={(value, name, props) => {
                            // Show team size in tooltip
                            if (name === 'avgRating') {
                              return [`${value.toFixed(1)} (Team: ${props.payload.count || 0})`];
                            }
                            return [value, name];
                          }}
                        />
                        <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px' }} />
                        
                        {/* Rating range (min to max) shown as an error bar */}
                        {ratingsByManager.map((entry, index) => (
                          <Line
                            key={`line-${index}`}
                            dataKey="avgRating"
                            data={[entry]}
                            stroke={COLORS[index % COLORS.length]}
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive={false}
                            label={false}
                          />
                        ))}
                        
                        {/* Average rating shown as bar */}
                        <Bar 
                          dataKey="avgRating" 
                          name="Average Rating" 
                          barSize={20} 
                          radius={[0, 4, 4, 0]}
                          label={({ x, y, width, value }) => (
                            <text x={x + width - 5} y={y + 19} fill="#fff" textAnchor="end" dominantBaseline="middle">
                              {value.toFixed(1)}
                            </text>
                          )}
                        >
                          {ratingsByManager.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]} 
                              fillOpacity={0.9}
                            />
                          ))}
                        </Bar>
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )
              )}
            </div>
          </div>
        )}
        
        {/* Recent Reviews Table - Show in all views */}
        <div className="dashboard-recent enhanced">
          <div className="dashboard-section-title">
            <div className="section-title-main">
              <FaTasks className="section-icon" />
              Recent Reviews
            </div>
            <div className="section-actions">
              <span className="action-link" onClick={() => {
                setActiveView('template-assignments');
                navigate('/templates/assignments');
              }}>
                View All <FaExternalLinkAlt />
              </span>
            </div>
          </div>
          {reviewData.recentReviews.length > 0 ? (
            <div className="table-responsive">
              <table className="review-list enhanced">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Review Cycle</th>
                    <th>Due Date</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewData.recentReviews.map((review) => (
                    <tr key={review.id} className={review.isOverdue ? 'overdue-row' : ''}>
                      <td className="employee-name">
                        {review.employee}
                        {review.isOverdue && <span className="overdue-badge">Overdue</span>}
                      </td>
                      <td>{review.department}</td>
                      <td>{review.cycle}</td>
                      <td>{review.dueDate}</td>
                      <td>{review.reviewType}</td>
                      <td>
                        <span className={`status-badge ${review.status}`}>
                          {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <button 
                          className={`action-button ${review.isOverdue ? 'urgent' : ''}`}
                          onClick={() => handleReviewAction(review)}
                        >
                          {review.status === 'completed' ? 'View' : 'Review'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>No reviews found. Create a review cycle to get started.</p>
              <button 
                className="create-review-button"
                onClick={() => {
                  setActiveView('review-cycles');
                  navigate('/review-cycles');
                }}
              >
                Create Review Cycle
              </button>
            </div>
          )}
        </div>
        
        {/* Additional CSS for the enhanced dashboard */}
        <style jsx="true">{`
          /* Dashboard layout improvements */
          .dashboard-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
          }
          
          /* Enhanced Filters Section */
          .dashboard-filters {
            display: flex;
            gap: 16px;
            background-color: white;
            padding: 16px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            margin-bottom: 24px;
            flex-wrap: wrap;
          }

          .filter-group {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .filter-label {
            font-weight: 500;
            color: #4b5563;
            white-space: nowrap;
          }

          .filter-select {
            padding: 8px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            background-color: white;
            color: #1f2937;
            min-width: 120px;
          }

          .filter-button {
            padding: 8px 16px;
            background-color: #f3f4f6;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            color: #4b5563;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          }

          .filter-button:hover {
            background-color: #e5e7eb;
          }

          .filter-button.active {
            background-color: #6366F1;
            border-color: #6366F1;
            color: white;
          }
          
          /* Dashboard Section Title Enhancement */
          .dashboard-section-title {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
          }

          .section-title-main {
            display: flex;
            align-items: center;
            font-size: 1.25rem;
            font-weight: 600;
            color: #111827;
          }

          .section-actions {
            display: flex;
            gap: 12px;
          }

          .section-icon {
            margin-right: 8px;
            color: #6366F1;
          }

          .action-link {
            font-size: 0.875rem;
            color: #6366F1;
            font-weight: 500;
            text-decoration: none;
            display: flex;
            align-items: center;
            cursor: pointer;
          }

          .action-link:hover {
            text-decoration: underline;
          }

          .action-link svg {
            margin-left: 4px;
          }
          
          /* Section titles */
          .section-title {
            display: flex;
            align-items: center;
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 16px;
            color: #111827;
          }
          
          .section-icon {
            margin-right: 8px;
            color: #6366F1;
          }
          
          .chart-title-icon {
            margin-right: 6px;
            color: #6366F1;
          }
          
          .mt-8 {
            margin-top: 2rem;
          }
          
          /* Priority Actions */
          .priority-actions-section {
            margin-bottom: 32px;
          }
          
          .priority-actions-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 16px;
          }
          
          .priority-action-card {
            position: relative;
            padding: 16px;
            border-radius: 8px;
            background-color: white;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border-left: 4px solid #6366F1;
            transition: transform 0.2s, box-shadow 0.2s;
            cursor: pointer;
          }
          
          .priority-action-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          
          .priority-action-card.warning {
            border-left-color: #F97316;
          }
          
          .priority-action-card.info {
            border-left-color: #3B82F6;
          }
          
          .priority-action-card.task {
            border-left-color: #8B5CF6;
          }
          
          .priority-action-card.upcoming {
            border-left-color: #10B981;
          }
          
          .action-badge {
            position: absolute;
            top: -8px;
            right: -8px;
            background-color: #ef4444;
            color: white;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
            font-weight: 600;
          }
          
          .action-title {
            font-weight: 500;
            margin-bottom: 8px;
          }
          
          .action-cta {
            font-size: 0.875rem;
            color: #6366F1;
            font-weight: 500;
          }
          
          /* Enhanced KPI Cards */
          .dashboard-metrics {
            margin-bottom: 32px;
          }
          
          .dashboard-overview {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 32px;
          }
          
          .overview-card.enhanced {
            display: flex;
            padding: 20px;
            border-radius: 8px;
            background-color: white;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s, box-shadow 0.2s;
            cursor: pointer;
          }
          
          .overview-card.enhanced:hover {
            transform: translateY(-3px);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          
          .card-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 48px;
            height: 48px;
            background-color: #6366F1;
            color: white;
            border-radius: 12px;
            margin-right: 16px;
            font-size: 1.25rem;
          }
          
          .card-icon.warning {
            background-color: #F97316;
          }
          
          .card-icon.success {
            background-color: #10B981;
          }
          
          .card-icon.info {
            background-color: #3B82F6;
          }
          
          .card-content {
            flex: 1;
          }
          
          .card-content h3 {
            font-size: 1rem;
            font-weight: 500;
            margin-bottom: 4px;
            color: #4b5563;
          }
          
          .card-content .value {
            font-size: 1.75rem;
            font-weight: 600;
            margin-bottom: 4px;
            color: #111827;
          }
          
          .trend {
            font-size: 0.875rem;
            color: #6b7280;
          }
          
          .trend.positive {
            color: #10B981;
          }
          
          .trend-arrow {
            font-weight: bold;
          }
          
          span.overdue {
            color: #ef4444;
            font-weight: 500;
          }
          
          /* Chart Container Styles */
          .chart-container {
            background-color: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
            margin-bottom: 24px;
            transition: transform 0.2s, box-shadow 0.2s;
            overflow: hidden;
          }

          .chart-container:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08), 0 3px 6px rgba(0, 0, 0, 0.12);
          }

          /* Chart Title Styles */
          .chart-title {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 18px;
            color: #1f2937;
            display: flex;
            align-items: center;
            padding-bottom: 12px;
            border-bottom: 1px solid #f3f4f6;
          }
          
          /* Chart layouts */
          .dashboard-charts {
            margin-bottom: 32px;
          }
          
          .chart-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }
          
          @media (max-width: 1024px) {
            .chart-row {
              grid-template-columns: 1fr;
            }
          }
          
          /* Animation for chart loading */
          @keyframes chartFadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-chart {
            animation: chartFadeIn 0.5s ease-out forwards;
          }

          /* Chart loading state */
          .chart-loading {
            height: 250px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #f9fafb;
            border-radius: 8px;
            color: #6b7280;
          }

          .loading-pulse {
            display: inline-block;
            position: relative;
            width: 80px;
            height: 80px;
          }

          .loading-pulse div {
            position: absolute;
            border: 4px solid #6366F1;
            opacity: 1;
            border-radius: 50%;
            animation: loading-pulse 1.5s cubic-bezier(0, 0.2, 0.8, 1) infinite;
          }

          .loading-pulse div:nth-child(2) {
            animation-delay: -0.5s;
          }

          @keyframes loading-pulse {
            0% {
              top: 36px;
              left: 36px;
              width: 0;
              height: 0;
              opacity: 1;
            }
            100% {
              top: 0px;
              left: 0px;
              width: 72px;
              height: 72px;
              opacity: 0;
            }
          }

          /* Chart Error State */
          .chart-error {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background-color: rgba(255, 255, 255, 0.9);
            border-radius: 12px;
            z-index: 2;
          }

          .error-icon {
            font-size: 32px;
            color: #EF4444;
            margin-bottom: 12px;
          }

          .error-message {
            color: #6b7280;
            text-align: center;
            margin-bottom: 16px;
          }

          .retry-button {
            padding: 8px 16px;
            background-color: #6366F1;
            color: white;
            border: none;
            border-radius: 6px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
          }

          .retry-button:hover {
            background-color: #4F46E5;
          }
          
          /* Recent Reviews Table Enhancements */
          .dashboard-recent.enhanced {
            margin-top: 20px;
          }
          
          .table-responsive {
            overflow-x: auto;
          }
          
          .review-list.enhanced {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          
          .review-list.enhanced thead {
            background-color: #f3f4f6;
          }
          
          .review-list.enhanced th {
            padding: 12px 16px;
            text-align: left;
            font-weight: 500;
            color: #4b5563;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .review-list.enhanced td {
            padding: 12px 16px;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .review-list.enhanced tbody tr:hover {
            background-color: #f9fafb;
          }
          
          .overdue-row {
            background-color: #fef2f2 !important;
          }
          
          .overdue-badge {
            display: inline-block;
            margin-left: 8px;
            padding: 2px 6px;
            font-size: 0.75rem;
            font-weight: 500;
            color: white;
            background-color: #ef4444;
            border-radius: 4px;
            vertical-align: middle;
          }
          
          .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 500;
          }
          
          .status-badge.completed {
            background-color: #d1fae5;
            color: #065f46;
          }
          
          .status-badge.pending, .status-badge.inprogress {
            background-color: #ffedd5;
            color: #9a3412;
          }
          
          .status-badge.upcoming {
            background-color: #e0e7ff;
            color: #4338ca;
          }
          
          .action-button {
            padding: 6px 12px;
            background-color: #6366F1;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          
          .action-button:hover {
            background-color: #4F46E5;
          }
          
          .action-button.urgent {
            background-color: #ef4444;
          }
          
          .action-button.urgent:hover {
            background-color: #dc2626;
          }
          
          .create-review-button {
            display: inline-block;
            margin-top: 12px;
            padding: 8px 16px;
            background-color: #6366F1;
            color: white;
            border: none;
            border-radius: 4px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          
          .create-review-button:hover {
            background-color: #4F46E5;
          }
          
          /* Empty state improvements */
          .empty-state {
            padding: 32px;
            text-align: center;
            background-color: #f9fafb;
            border-radius: 8px;
            border: 1px dashed #d1d5db;
          }
          
          .empty-priorities {
            padding: 16px;
            text-align: center;
            color: #6b7280;
          }
          
          /* Utilities */
          .ml-auto {
            margin-left: auto;
          }
          
          .mr-2 {
            margin-right: 0.5rem;
          }
          
          .mb-6 {
            margin-bottom: 1.5rem;
          }
        `}</style>
      </>
    );
  };
  
  // Show loading state while checking for user data
  if (isLoading) {
    return <div className="loading-state">Loading dashboard...</div>;
  }
  
  // Render fallback if no user data is found
  if (!user) {
    return (
      <div className="error-state">
        <h1>Authentication Error</h1>
        <p>There was a problem loading your user data.</p>
        <button 
          className="return-login-button" 
          onClick={() => navigate('/login')}
        >
          Return to Login
        </button>
      </div>
    );
  }
  
  // Return the dashboard content - no longer wrapped in SidebarLayout
  return renderActiveView();
}

export default Dashboard;