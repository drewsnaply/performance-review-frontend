import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
        
        // Super Admin routes
        '/super-admin': 'Super Admin Dashboard',
        '/super-admin/customers': 'Customer Organizations',
        '/super-admin/users': 'User Management',
        '/super-admin/sessions': 'Active Sessions',
        '/super-admin/analytics': 'System Analytics',
        '/super-admin/logs': 'System Logs',
        '/super-admin/settings': 'System Settings'
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

      return pathToTitleMap[location.pathname] || 'Performance Review System';
    };

    document.title = getPageTitle();
  }, [location.pathname]);

  return null;
};

function App() {
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

            {/* Private Routes */}
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
            <Route
              path="/employees"
              element={
                <PrivateRoute allowedRoles={['manager', 'admin']}>
                  <Employees />
                </PrivateRoute>
              }
            />
            {/* New route for employee profile */}
            <Route
              path="/employees/:id"
              element={
                <PrivateRoute allowedRoles={['manager', 'admin']}>
                  <EmployeeProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <Settings />
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
            {/* Template Assignments route */}
            <Route
              path="/templates/assignments"
              element={
                <PrivateRoute allowedRoles={['manager', 'admin']}>
                  <TemplateAssignments />
                </PrivateRoute>
              }
            />
            {/* New route for template builder */}
            <Route
              path="/templates/builder"
              element={
                <PrivateRoute allowedRoles={['manager', 'admin']}>
                  <TemplateBuilder />
                </PrivateRoute>
              }
            />
            {/* New route for editing existing templates */}
            <Route
              path="/templates/builder/:id"
              element={
                <PrivateRoute allowedRoles={['manager', 'admin']}>
                  <TemplateBuilder />
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
            <Route
              path="/pending-reviews"
              element={
                <PrivateRoute allowedRoles={['manager', 'admin']}>
                  <PendingReviews />
                </PrivateRoute>
              }
            />
            
            {/* New route for editing reviews */}
            <Route
              path="/reviews/edit/:id"
              element={
                <PrivateRoute allowedRoles={['manager', 'admin']}>
                  <ViewEvaluation />
                </PrivateRoute>
              }
            />
            
            {/* New route for goal tracking */}
            <Route
              path="/goals"
              element={
                <PrivateRoute>
                  <MonthlyGoalTracking />
                </PrivateRoute>
              }
            />
            
            {/* New route for goal tracking for a specific review */}
            <Route
              path="/goals/review/:reviewId"
              element={
                <PrivateRoute>
                  <MonthlyGoalTracking />
                </PrivateRoute>
              }
            />
            
            {/* New route for KPI management */}
            <Route
              path="/kpis"
              element={
                <PrivateRoute allowedRoles={['manager', 'admin']}>
                  <KpiManager />
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