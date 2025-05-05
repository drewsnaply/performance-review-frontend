import React, { useState, useEffect, lazy, Suspense, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Dashboard.css';
import { useDepartments } from '../context/DepartmentContext';
import { useAuth } from '../context/AuthContext';
// Import recharts components for the charts
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area
} from 'recharts';
// Import icons
import { 
  FaUserFriends, FaClipboardList, FaCheckCircle, FaCalendarAlt, 
  FaChartLine, FaTasks, FaExternalLinkAlt, FaRedo, FaExclamationCircle
} from 'react-icons/fa';

// Import component directly
import Metrics from '../components/Metrics';
// Import Reports component directly
import Reports from '../components/Reports';

// MODIFIED: Create component placeholders - these will prevent errors when removing MyReviews and TeamReviews
const EmptyPlaceholder = () => <div>This component is no longer available</div>;

// MODIFIED: Removed MyReviews and TeamReviews components and replaced with placeholder
// IMPORTANT: Keep all other lazy-loaded components to maintain existing functionality
const EmployeesPage = lazy(() => import('./Employees'));
const ReviewCyclesComponent = lazy(() => import('../components/ReviewCycles'));
const ReviewTemplatesComponent = lazy(() => import('../components/ReviewTemplates'));
const KpiManagerComponent = lazy(() => import('../components/KpiManager')); 
const ImportToolComponent = lazy(() => import('../components/ImportTool'));
const ExportToolComponent = lazy(() => import('../components/ExportTool'));
const SettingsPage = lazy(() => import('./Settings'));
const ViewEvaluationComponent = lazy(() => import('../components/ViewEvaluation'));
const PendingReviewsComponent = lazy(() => import('../components/PendingReviews'));
const TemplateAssignmentsComponent = lazy(() => import('../components/TemplateAssignments'));

// Import Super Admin components
const SuperAdminDashboardComponent = lazy(() => import('../components/super-admin/SuperAdminDashboard'));

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
  const [isLoading, setIsLoading] = useState(true);
  const [dataFetchError, setDataFetchError] = useState(false);
  const [departmentData, setDepartmentData] = useState([]);
  const [reviewsTrend, setReviewsTrend] = useState([]);
  const [employeeLifecycleData, setEmployeeLifecycleData] = useState([]);
  const [tenureDistribution, setTenureDistribution] = useState([]);
  const [ratingsByManager, setRatingsByManager] = useState([]);
  const [performanceDistribution, setPerformanceDistribution] = useState([]);
  
  // Simple flag to prevent repeated API calls
  const fetchedAssignmentsRef = useRef(false);
  // Add refs to track API calls and component lifecycle
  const apiCallInProgress = useRef(false);
  const componentMounted = useRef(true);
  const userInitialized = useRef(false);
  const impersonationActive = useRef(!!localStorage.getItem('impersonatedCustomer'));
  
  const navigate = useNavigate();
  const location = useLocation(); // Added for URL-based view detection
  
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

  // ADDED: Update activeView based on URL path
  useEffect(() => {
    const path = location.pathname;
    console.log('Current path:', path);
    
    // Map paths to views
    if (path === '/dashboard') {
      setActiveView('dashboard');
    } else if (path === '/employees') {
      setActiveView('employees');
    } else if (path === '/templates') {
      setActiveView('templates');
    } else if (path === '/review-cycles') {
      setActiveView('review-cycles');
    } else if (path === '/templates/assignments') {
      setActiveView('template-assignments');
    } else if (path === '/metrics') {
      console.log('Setting active view to metrics');
      setActiveView('metrics');
    } else if (path === '/reports') {
      console.log('Setting active view to reports');
      setActiveView('reports');
    } else if (path === '/kpis') {
      setActiveView('kpis');
    }
  }, [location.pathname]);

  // Component lifecycle tracking
  useEffect(() => {
    // Set mounted flag
    componentMounted.current = true;
    
    // Clear any existing API flags at component mount
    apiCallInProgress.current = false;
    
    // Check if impersonation is active
    if (localStorage.getItem('impersonatedCustomer')) {
      console.log("Dashboard: Impersonation mode detected, using special handling");
      impersonationActive.current = true;
    }
    
    return () => {
      // Mark component as unmounted when it's destroyed
      componentMounted.current = false;
      // Clear API flag on unmount
      apiCallInProgress.current = false;
    };
  }, []);

  // Initialize user - run only when currentUser changes
  useEffect(() => {
    // Skip if already initialized
    if (userInitialized.current) {
      console.log("Dashboard: User already initialized, skipping");
      return;
    }
    
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
    
    // Mark user as initialized
    userInitialized.current = true;
    
    // Set loading to false once user is set
    setIsLoading(false);
  }, [currentUser, navigate]);

  // MODIFIED: Debug logging for activeView changes
  useEffect(() => {
    console.log('Active view changed to:', activeView);
  }, [activeView]);

  // Effect to fetch data when the dashboard is first loaded
  useEffect(() => {
    // Only fetch if we haven't already and we're showing the dashboard view
    if (activeView === 'dashboard' && !fetchedAssignmentsRef.current && !apiCallInProgress.current) {
      fetchAssignments();
    }
  }, [activeView]);

  // FIXED: Special navigation handler to ensure proper page loads
  const navigateToEmployees = () => {
    // Force navigation with a page reload to ensure clean component mounting
    window.location.href = '/employees';
  };

  const navigateToTemplates = () => {
    // Force navigation with a page reload to ensure clean component mounting
    window.location.href = '/templates';
  };

  // Enhanced fetchEmployeeData function with better error handling
  const fetchEmployeeData = async () => {
    // Skip if API call already in progress or component unmounted
    if (apiCallInProgress.current || !componentMounted.current) {
      console.log('API call already in progress or component unmounted, skipping fetchEmployeeData');
      return [];
    }
    
    // Mark API call as in progress
    apiCallInProgress.current = true;
    
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
      
      // Only update state if component is still mounted
      if (componentMounted.current) {
        // Process employee data for lifecycle analytics with improved error handling
        const employeesByMonth = processEmployeeLifecycleData(combinedData);
        setEmployeeLifecycleData(employeesByMonth);
        
        // Process tenure distribution
        const tenureData = processTenureDistribution(combinedData);
        setTenureDistribution(tenureData);
        
        // Process manager ratings
        const managerData = processManagerRatings(combinedData);
        setRatingsByManager(managerData);
        
        // Process performance distribution
        const performanceData = processPerformanceDistribution(combinedData);
        setPerformanceDistribution(performanceData);
      }
      
      // Reset API call flag
      apiCallInProgress.current = false;
      
      return combinedData;
    } catch (error) {
      console.error('Error fetching employee data:', error);
      
      // Only update state if component is still mounted
      if (componentMounted.current) {
        setDataFetchError(true);
      }
      
      // Reset API call flag
      apiCallInProgress.current = false;
      
      return [];
    }
  };

  // Process performance distribution for chart
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
      return [];
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
    
    return performanceData;
  };

  // Process actual employee data into lifecycle chart format
  const processEmployeeLifecycleData = (employees) => {
    console.log('Processing employee lifecycle data');
    
    if (!Array.isArray(employees)) {
      console.warn('processEmployeeLifecycleData: employees is not an array');
      return [];
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
    return months;
  };
  
  // Process employee data into tenure distribution
  const processTenureDistribution = (employees) => {
    console.log('Processing tenure distribution from employees');
    
    if (!Array.isArray(employees)) {
      console.warn('processTenureDistribution: employees is not an array');
      return [];
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
    return tenureRanges;
  };
  
  // Process manager performance ratings with improved error handling
  const processManagerRatings = (employees) => {
    console.log('Processing manager ratings from employees');
    
    if (!Array.isArray(employees)) {
      console.warn('processManagerRatings: employees is not an array');
      return [];
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
    
    // Sort by average rating (highest first) and take top 5
    return managerArray
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 5);
  };

  // Enhanced function to fetch assignments with better error handling
  const fetchAssignments = async () => {
    // Skip if fetch already in progress or component unmounted
    if (apiCallInProgress.current || !componentMounted.current) {
      console.log('API call already in progress or component unmounted, skipping fetchAssignments');
      return;
    }
    
    // Skip if already fetched
    if (fetchedAssignmentsRef.current) {
      console.log('Already fetched assignments, skipping');
      return;
    }
    
    // Debug display of fetch status
    console.log('Fetching dashboard data');
    
    // Set API call flag
    apiCallInProgress.current = true;
    setIsLoading(true);
    setDataFetchError(false);
    
    try {
      // Mark that we're fetching to prevent duplicate calls
      fetchedAssignmentsRef.current = true;
      
      // Enhanced fetch with retry logic
      const fetchWithRetry = async (url, options, retries = 2) => {
        try {
          const response = await fetch(url, options);
          if (!response.ok) throw new Error(`Failed to fetch from ${url}`);
          return await response.json();
        } catch (error) {
          if (retries === 0) throw error;
          console.log(`Retrying fetch for ${url}, ${retries} attempts left`);
          await new Promise(resolve => setTimeout(resolve, 500)); // Wait before retry
          return fetchWithRetry(url, options, retries - 1);
        }
      };

      // Fetch assignments with retry
      const authHeaders = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      };
      
      // For impersonation, use a simpler approach
      let assignments = [];
      if (impersonationActive.current) {
        console.log("Fetching assignments in impersonation mode");
        try {
          assignments = await fetchWithRetry(`${API_BASE_URL}/api/templates/assignments`, authHeaders);
        } catch (error) {
          console.warn('Failed to fetch assignments, falling back to empty array', error);
          assignments = [];
        }
      } else {
        try {
          // Fetch both employees and assignments concurrently for non-impersonation mode
          const [assignmentsResponse, employeeResult] = await Promise.all([
            fetchWithRetry(`${API_BASE_URL}/api/templates/assignments`, authHeaders),
            fetchEmployeeData() // This will update employee-related state variables
          ]);
          
          assignments = assignmentsResponse;
        } catch (error) {
          console.warn('Failed to fetch data concurrently, trying sequential fallback', error);
          
          // Try sequential fetching as fallback
          try {
            assignments = await fetchWithRetry(`${API_BASE_URL}/api/templates/assignments`, authHeaders);
            await fetchEmployeeData();
          } catch (fallbackError) {
            console.error('Sequential fallback failed:', fallbackError);
            assignments = [];
          }
        }
      }
      
      // Only proceed if component is still mounted
      if (!componentMounted.current) {
        console.log('Component unmounted, aborting data processing');
        apiCallInProgress.current = false;
        return;
      }

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
      
      // Only update state if still mounted
      if (!componentMounted.current) {
        apiCallInProgress.current = false;
        return;
      }
      
      // Convert department map to array for the chart
      const departmentStats = Array.from(deptMap.values());
      
      console.log('Department data before processing:', departmentStats);
      
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
      
      // Add empty departments array if none found
      if (departmentStats.length === 0) {
        console.log('No department data found, creating empty array');
        departmentStats.push(
          { name: 'No Data', pending: 0, completed: 0, total: 0 }
        );
      }
      
      console.log('Final department data:', departmentStats);
      setDepartmentData(departmentStats);
      
      // Convert and sort trend data
      const trendData = Array.from(monthMap.values())
        .sort((a, b) => a.date - b.date); // Sort by date ascending
      
      console.log('Trend data before processing:', trendData);
      
      // Use empty trend data if none found
      if (trendData.every(item => item.completed === 0 && item.pending === 0 && item.upcoming === 0)) {
        console.log('No trend data found, keeping empty data');
      }
      
      console.log('Final trend data:', trendData);
      setReviewsTrend(trendData);
      
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
      
      // Ensure we also have employee data if in impersonation mode
      if (impersonationActive.current && componentMounted.current) {
        // Fetch employee data separately for impersonation mode
        try {
          await fetchEmployeeData();
        } catch (error) {
          console.warn('Error fetching employee data in impersonation mode:', error);
        }
      }
      
      setIsLoading(false);
      
      // Reset API call flag - must be the last thing we do
      apiCallInProgress.current = false;
    } catch (error) {
      console.error('Error fetching assignments:', error);
      
      // Only update state if component is still mounted
      if (componentMounted.current) {
        setDataFetchError(true);
        setIsLoading(false);
      }
      
      // Reset API call flag
      apiCallInProgress.current = false;
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
      navigateToTemplates(); // FIXED: Use the force reload function
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
  
  // Function to retry data fetching
  const handleRetryFetch = () => {
    setDataFetchError(false);
    fetchedAssignmentsRef.current = false;
    apiCallInProgress.current = false;
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
  
  // MODIFIED: Render the active view with Suspense for lazy-loaded components
  // Fixed to use placeholder components for removed views and added reports component support
  const renderActiveView = () => {
    // Add debug logging
    console.log('renderActiveView called with activeView:', activeView, 'initialView:', initialView);
    
    // Return a Suspense wrapped component
    const renderComponent = (Component, props = {}) => (
      <Suspense fallback={<div className="loading-state">Loading component...</div>}>
        <Component {...props} />
      </Suspense>
    );
    
    // MODIFIED: Use placeholder component for my-reviews and team-reviews, and added metrics and reports
    switch (activeView) {
      // MODIFIED: Use EmptyPlaceholder for removed components
      case 'my-reviews': 
      case 'team-reviews': 
        return renderDashboardDefault(); // Redirect to dashboard instead of showing placeholder
        
      case 'employees': 
        // FIXED: Add key to force render and check location to ensure we're on the right page
        if (window.location.pathname === '/employees') {
          return renderComponent(EmployeesPage, { key: `emp-${Date.now()}` });
        } else {
          navigateToEmployees();
          return <div className="loading-state">Redirecting to Employees page...</div>;
        }
      case 'settings': return renderComponent(SettingsPage);
      case 'review-cycles': return renderComponent(ReviewCyclesComponent);
      case 'templates': 
        // FIXED: Add key to force render and check location to ensure we're on the right page
        if (window.location.pathname === '/templates') {
          return renderComponent(ReviewTemplatesComponent, { key: `templ-${Date.now()}` });
        } else {
          navigateToTemplates();
          return <div className="loading-state">Redirecting to Templates page...</div>;
        }
      case 'template-assignments': return renderComponent(TemplateAssignmentsComponent);
      case 'kpis': return renderComponent(KpiManagerComponent);
      // ADDED: Support for metrics component
      case 'metrics': 
        console.log('Rendering Metrics component directly');
        return <Metrics />;
      // ADDED: Support for reports component
      case 'reports': 
        console.log('Rendering Reports component directly');
        return <Reports />;
      case 'tools-imports': return renderComponent(ImportToolComponent);
      case 'tools-exports': return renderComponent(ExportToolComponent);
      case 'evaluation-detail': return renderComponent(ViewEvaluationComponent);
      case 'pending-reviews': return renderComponent(PendingReviewsComponent);
      case 'super-admin': return renderComponent(SuperAdminDashboardComponent);
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
              onClick={navigateToEmployees} // FIXED: Use force reload function
            >
              <div className="card-icon">
                <FaUserFriends />
              </div>
              <div className="card-content">
                <h3>Active Employees</h3>
                <div className="value">{activeEmployeesCount || employeeLifecycleData[employeeLifecycleData.length - 1]?.active || 0}</div>
                <div className="trend positive">
                  <span className="trend-arrow">↑</span> {employeeLifecycleData[employeeLifecycleData.length - 1]?.hired || 0} new this month
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
                  <span className="trend-arrow">↑</span> {Math.max(0, Math.floor(reviewData.completed * 0.1))} from last cycle
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
        
        {/* Standard Dashboard Charts */}
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
            position: relative;
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
            height: 300px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background-color: #f9fafb;
            border-radius: 8px;
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
          
          /* Loading state for the entire dashboard */
          .loading-state {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            width: 100%;
            background-color: #f9fafb;
            font-size: 1.25rem;
            color: #6b7280;
          }
          
          /* Error state for authentication issues */
          .error-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 3rem;
            height: 50vh;
            background-color: #f9fafb;
            border-radius: 8px;
            text-align: center;
          }
          
          .error-state h1 {
            font-size: 1.5rem;
            color: #ef4444;
            margin-bottom: 1rem;
          }
          
          .error-state p {
            color: #4b5563;
            margin-bottom: 2rem;
          }
          
          .return-login-button {
            padding: 0.75rem 1.5rem;
            background-color: #6366F1;
            color: white;
            border: none;
            border-radius: 6px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          
          .return-login-button:hover {
            background-color: #4F46E5;
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
  
  // Return the dashboard content
  return renderActiveView();
}

export default Dashboard;