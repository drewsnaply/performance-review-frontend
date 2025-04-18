import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DepartmentProvider } from './context/DepartmentContext';
import PrivateRoute from './components/PrivateRoute';
import AuthInitCheck from './components/AuthInitCheck';
import EmployeeProfile from './components/EmployeeProfile';
import PendingReviews from './components/PendingReviews';
import ViewEvaluation from './components/ViewEvaluation';
import TemplateBuilder from './components/TemplateBuilder';
import MonthlyGoalTracking from './components/MonthlyGoalTracking';
import KpiManager from './components/KpiManager';
import TemplateAssignments from './components/TemplateAssignments';

// Import pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Settings from './pages/Settings';
import Unauthorized from './pages/Unauthorized';
import Test from './pages/Test';
import SetupPassword from './pages/SetupPassword';

// Import components for routes
import MyReviews from './components/MyReviews';
import TeamReviews from './components/TeamReviews';
import ReviewCycles from './components/ReviewCycles';
import ReviewTemplates from './components/ReviewTemplates';
import ImportTool from './components/ImportTool';
import ExportTool from './components/ExportTool';

// Import Super Admin components
import SuperAdminDashboard from './components/super-admin/SuperAdminDashboard';
import CustomerDetailPage from './components/super-admin/CustomerDetailPage';
import SuperAdminUsers from './components/super-admin/SuperAdminUsers';
import SuperAdminAnalytics from './components/super-admin/SuperAdminAnalytics';
import SuperAdminLogs from './components/super-admin/SuperAdminLogs';
import SuperAdminSettings from './components/super-admin/SuperAdminSettings';
import SuperAdminSessions from './components/super-admin/SuperAdminSessions';
import ExitImpersonation from './components/super-admin/ExitImpersonation';

// Import Manager Dashboard components
import ManagerDashboard from './components/Manager/ManagerDashboard';
import TeamMember from './components/Manager/TeamMember';
import ReviewForm from './components/Manager/ReviewForm';
import ManagerSidebar from './components/Manager/ManagerSidebar';

// Import CSS files - correct path within src directory
import './styles/Manager/ManagerLayout.css';

// Title Updater Component
const TitleUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    const getPageTitle = () => {
      const pathToTitleMap = {
        '/dashboard': 'Dashboard',
        '/my-reviews': 'My Reviews',
        '/team-reviews': 'Team Reviews',
        '/employees': 'Employees',
        '/settings': 'Settings',
        '/review-cycles': 'Review Cycles',
        '/templates': 'Templates',
        '/templates/assignments': 'Template Assignments',
        '/templates/builder': 'Template Builder',
        '/import-tool': 'Import Tool',
        '/export-tool': 'Export Tool',
        '/pending-reviews': 'Pending Reviews',
        '/goals': 'Monthly Goal Tracking',
        '/kpis': 'KPI Management',
        '/setup-password': 'Setup Your Password',
        
        // Super Admin routes
        '/super-admin': 'Super Admin Dashboard',
        '/super-admin/customers': 'Customer Organizations',
        '/super-admin/users': 'User Management',
        '/super-admin/sessions': 'Active Sessions',
        '/super-admin/analytics': 'System Analytics',
        '/super-admin/logs': 'System Logs',
        '/super-admin/settings': 'System Settings',
        
        // Manager Dashboard routes
        '/manager/dashboard': 'Manager Dashboard',
        '/manager/reviews/new': 'New Performance Review',
        '/manager/employees': 'Team Members'
      };

      // Check if path is an employee profile page
      if (location.pathname.startsWith('/employees/')) {
        return 'Employee Profile';
      }
      
      // Check if path is a review edit page
      if (location.pathname.startsWith('/reviews/edit/')) {
        return 'Review Editor';
      }
      
      // Check if path is editing a specific template
      if (location.pathname.startsWith('/templates/builder/')) {
        return 'Edit Template';
      }
      
      // Check if path is goal tracking for a specific review
      if (location.pathname.startsWith('/goals/review/')) {
        return 'Review Goals';
      }
      
      // Check if path is a customer detail page
      if (location.pathname.match(/^\/super-admin\/customers\/[^/]+\/details$/)) {
        return 'Customer Details';
      }
      
      // Check if path is password setup page
      if (location.pathname.startsWith('/setup-password/')) {
        return 'Account Setup';
      }
      
      // Check if path is a team member profile page
      if (location.pathname.match(/^\/manager\/employees\/[^/]+$/)) {
        return 'Team Member Profile';
      }
      
      // Check if path is editing a review
      if (location.pathname.match(/^\/manager\/reviews\/[^/]+$/)) {
        return 'Edit Performance Review';
      }

      return pathToTitleMap[location.pathname] || 'Performance Review System';
    };

    document.title = getPageTitle();
  }, [location.pathname]);

  return null;
};

// Manager Layout Component
const ManagerLayout = ({ children, activeView }) => {
  const auth = useAuth();
  
  return (
    <div className="manager-layout">
      <ManagerSidebar user={auth.user} activeView={activeView} />
      <div className="manager-content">
        {children}
      </div>
    </div>
  );
};

// Add styles for manager layout directly in the component
const injectManagerStyles = () => {
  // Create a style element if it doesn't already exist
  if (!document.getElementById('manager-layout-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'manager-layout-styles';
    styleElement.innerHTML = `
      /* Manager Layout Styles */
      .manager-layout {
        display: flex;
        width: 100%;
        min-height: 100vh;
        background-color: #f9fafb;
      }
      
      .manager-content {
        flex: 1;
        margin-left: 250px;
        transition: margin-left 0.3s ease;
        padding: 20px;
        min-height: 100vh;
        background-color: #f9fafb;
      }
      
      .manager-content.sidebar-collapsed {
        margin-left: 60px;
        width: calc(100% - 60px);
      }
      
      /* Responsive adjustments */
      @media (max-width: 768px) {
        .manager-content {
          margin-left: 200px;
          padding: 16px;
        }
      }
    `;
    document.head.appendChild(styleElement);
  }
};

function App() {
  // Inject manager styles when App mounts
  useEffect(() => {
    injectManagerStyles();
    
    // Cleanup on unmount
    return () => {
      const styleElement = document.getElementById('manager-layout-styles');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, []);

  return (
    <AuthProvider>
      <DepartmentProvider>
        <BrowserRouter>
          <AuthInitCheck />
          <TitleUpdater />

          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/setup-password/:token" element={<SetupPassword />} />

            {/* Private Routes - Regular users and admins */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/my-reviews"
              element={
                <PrivateRoute>
                  <MyReviews />
                </PrivateRoute>
              }
            />
            
            {/* Admin and Manager Routes */}
            <Route
              path="/employees"
              element={
                <PrivateRoute allowedRoles={['manager', 'admin']}>
                  <Employees />
                </PrivateRoute>
              }
            />
            <Route
              path="/employees/:id"
              element={
                <PrivateRoute allowedRoles={['manager', 'admin']}>
                  <EmployeeProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/team-reviews"
              element={
                <PrivateRoute allowedRoles={['manager', 'admin']}>
                  <TeamReviews />
                </PrivateRoute>
              }
            />
            <Route
              path="/review-cycles"
              element={
                <PrivateRoute allowedRoles={['manager', 'admin']}>
                  <ReviewCycles />
                </PrivateRoute>
              }
            />
            <Route
              path="/templates"
              element={
                <PrivateRoute allowedRoles={['manager', 'admin']}>
                  <ReviewTemplates />
                </PrivateRoute>
              }
            />
            <Route
              path="/templates/assignments"
              element={
                <PrivateRoute allowedRoles={['manager', 'admin']}>
                  <TemplateAssignments />
                </PrivateRoute>
              }
            />
            <Route
              path="/templates/builder"
              element={
                <PrivateRoute allowedRoles={['manager', 'admin']}>
                  <TemplateBuilder />
                </PrivateRoute>
              }
            />
            <Route
              path="/templates/builder/:id"
              element={
                <PrivateRoute allowedRoles={['manager', 'admin']}>
                  <TemplateBuilder />
                </PrivateRoute>
              }
            />
            <Route
              path="/pending-reviews"
              element={
                <PrivateRoute allowedRoles={['manager', 'admin']}>
                  <PendingReviews />
                </PrivateRoute>
              }
            />
            <Route
              path="/reviews/edit/:id"
              element={
                <PrivateRoute allowedRoles={['manager', 'admin']}>
                  <ViewEvaluation />
                </PrivateRoute>
              }
            />
            <Route
              path="/kpis"
              element={
                <PrivateRoute allowedRoles={['manager', 'admin']}>
                  <KpiManager />
                </PrivateRoute>
              }
            />
            
            {/* Admin-only Routes */}
            <Route
              path="/settings"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <Settings />
                </PrivateRoute>
              }
            />
            <Route
              path="/import-tool"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <ImportTool />
                </PrivateRoute>
              }
            />
            <Route
              path="/export-tool"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <ExportTool />
                </PrivateRoute>
              }
            />
            
            {/* Routes accessible by all users */}
            <Route
              path="/goals"
              element={
                <PrivateRoute>
                  <MonthlyGoalTracking />
                </PrivateRoute>
              }
            />
            <Route
              path="/goals/review/:reviewId"
              element={
                <PrivateRoute>
                  <MonthlyGoalTracking />
                </PrivateRoute>
              }
            />

            {/* Super Admin Routes */}
            <Route 
              path="/super-admin" 
              element={
                <PrivateRoute allowedRoles={['superadmin', 'super_admin']}>
                  <SuperAdminDashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/super-admin/customers" 
              element={
                <PrivateRoute allowedRoles={['superadmin', 'super_admin']}>
                  <SuperAdminDashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/super-admin/customers/:customerId/details" 
              element={
                <PrivateRoute allowedRoles={['superadmin', 'super_admin']}>
                  <CustomerDetailPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/super-admin/users" 
              element={
                <PrivateRoute allowedRoles={['superadmin', 'super_admin']}>
                  <SuperAdminUsers />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/super-admin/sessions" 
              element={
                <PrivateRoute allowedRoles={['superadmin', 'super_admin']}>
                  <SuperAdminSessions />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/super-admin/analytics" 
              element={
                <PrivateRoute allowedRoles={['superadmin', 'super_admin']}>
                  <SuperAdminAnalytics />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/super-admin/logs" 
              element={
                <PrivateRoute allowedRoles={['superadmin', 'super_admin']}>
                  <SuperAdminLogs />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/super-admin/settings" 
              element={
                <PrivateRoute allowedRoles={['superadmin', 'super_admin']}>
                  <SuperAdminSettings />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/super-admin/exit-impersonation" 
              element={
                <PrivateRoute allowedRoles={['superadmin', 'super_admin']}>
                  <ExitImpersonation />
                </PrivateRoute>
              } 
            />

            {/* Manager Dashboard Routes - Using ManagerLayout */}
            <Route
              path="/manager/dashboard"
              element={
                <PrivateRoute allowedRoles={['manager', 'admin', 'superadmin', 'super_admin']}>
                  <ManagerLayout activeView="manager-dashboard">
                    <ManagerDashboard />
                  </ManagerLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/manager/employees/:employeeId"
              element={
                <PrivateRoute allowedRoles={['manager', 'admin', 'superadmin', 'super_admin']}>
                  <ManagerLayout activeView="team-members">
                    <TeamMember />
                  </ManagerLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/manager/reviews/new"
              element={
                <PrivateRoute allowedRoles={['manager', 'admin', 'superadmin', 'super_admin']}>
                  <ManagerLayout activeView="create-review">
                    <ReviewForm />
                  </ManagerLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/manager/reviews/:reviewId"
              element={
                <PrivateRoute allowedRoles={['manager', 'admin', 'superadmin', 'super_admin']}>
                  <ManagerLayout activeView="create-review">
                    <ReviewForm />
                  </ManagerLayout>
                </PrivateRoute>
              }
            />

            {/* Default Routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />

            {/* Additional routes */}
            <Route path="/test" element={<Test />} />
          </Routes>
        </BrowserRouter>
      </DepartmentProvider>
    </AuthProvider>
  );
}

export default App;