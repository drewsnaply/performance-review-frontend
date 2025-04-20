import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DepartmentProvider } from './context/DepartmentContext';
import PrivateRoute from './components/PrivateRoute';
import AuthInitCheck from './components/AuthInitCheck';
import SidebarLayout from './components/SidebarLayout';

// Import pages and components
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Settings from './pages/Settings';
import Unauthorized from './pages/Unauthorized';
import Test from './pages/Test';
import SetupPassword from './pages/SetupPassword';
import MyReviews from './components/MyReviews';
import TeamReviews from './components/TeamReviews';
import ReviewCycles from './components/ReviewCycles';
import ReviewTemplates from './components/ReviewTemplates';
import ImportTool from './components/ImportTool';
import ExportTool from './components/ExportTool';
import EmployeeProfile from './components/EmployeeProfile';
import PendingReviews from './components/PendingReviews';
import ViewEvaluation from './components/ViewEvaluation';
import TemplateBuilder from './components/TemplateBuilder';
import MonthlyGoalTracking from './components/MonthlyGoalTracking';
import KpiManager from './components/KpiManager';
import TemplateAssignments from './components/TemplateAssignments';

// Import Super Admin components
import SuperAdminDashboard from './components/super-admin/SuperAdminDashboard';
import CustomerDetailPage from './components/super-admin/CustomerDetailPage';
import SuperAdminUsers from './components/super-admin/SuperAdminUsers';
import SuperAdminAnalytics from './components/super-admin/SuperAdminAnalytics';
import SuperAdminLogs from './components/super-admin/SuperAdminLogs';
import SuperAdminSettings from './components/super-admin/SuperAdminSettings';
import SuperAdminSessions from './components/super-admin/SuperAdminSessions';
import ExitImpersonation from './components/super-admin/ExitImpersonation';

// Import Manager components
import ManagerDashboard from './components/Manager/ManagerDashboard';
import TeamMember from './components/Manager/TeamMember';
import ReviewForm from './components/Manager/ReviewForm';

import './App.css';

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
        '/team-members': 'Team Members'
      };

      // Check specific paths
      if (location.pathname.startsWith('/employees/')) {
        return 'Employee Profile';
      }
      if (location.pathname.startsWith('/reviews/edit/')) {
        return 'Review Editor';
      }
      if (location.pathname.startsWith('/templates/builder/')) {
        return 'Edit Template';
      }
      if (location.pathname.startsWith('/goals/review/')) {
        return 'Review Goals';
      }
      if (location.pathname.match(/^\/super-admin\/customers\/[^/]+\/details$/)) {
        return 'Customer Details';
      }
      if (location.pathname.startsWith('/setup-password/')) {
        return 'Account Setup';
      }
      if (location.pathname.match(/^\/team-members\/[^/]+$/)) {
        return 'Team Member Profile';
      }
      if (location.pathname.match(/^\/manager\/reviews\/[^/]+$/)) {
        return 'Edit Performance Review';
      }

      return pathToTitleMap[location.pathname] || 'Performance Review System';
    };

    document.title = getPageTitle();
  }, [location.pathname]);

  return null;
};

// Function to check if user is manager
const isUserManager = () => {
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      return user.role === 'manager';
    }
  } catch (e) {
    console.error('Error checking user role:', e);
  }
  return false;
};

// Get user data from localStorage
const getUserFromStorage = () => {
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      return JSON.parse(userData);
    }
  } catch (e) {
    console.error('Error getting user data:', e);
  }
  return { role: 'admin' }; // Default fallback
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
            <Route path="/setup-password/:token" element={<SetupPassword />} />
            
            {/* Admin Routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute allowedRoles={['admin', 'superadmin', 'super_admin']}>
                  <SidebarLayout user={getUserFromStorage()}>
                    <Dashboard />
                  </SidebarLayout>
                </PrivateRoute>
              }
            />
            
            {/* Shared Routes - accessible by both admin and manager */}
            <Route
              path="/my-reviews"
              element={
                <PrivateRoute>
                  <SidebarLayout user={getUserFromStorage()}>
                    <MyReviews />
                  </SidebarLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/team-reviews"
              element={
                <PrivateRoute allowedRoles={['admin', 'manager']}>
                  <SidebarLayout user={getUserFromStorage()}>
                    <TeamReviews />
                  </SidebarLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/team-members"
              element={
                <PrivateRoute allowedRoles={['admin', 'manager']}>
                  <SidebarLayout user={getUserFromStorage()}>
                    <TeamMember />
                  </SidebarLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/team-members/:id"
              element={
                <PrivateRoute allowedRoles={['admin', 'manager']}>
                  <SidebarLayout user={getUserFromStorage()}>
                    <TeamMember isViewingEmployee={true} />
                  </SidebarLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/review-cycles"
              element={
                <PrivateRoute allowedRoles={['admin', 'manager']}>
                  <SidebarLayout user={getUserFromStorage()}>
                    <ReviewCycles />
                  </SidebarLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/templates"
              element={
                <PrivateRoute allowedRoles={['admin', 'manager']}>
                  <SidebarLayout user={getUserFromStorage()}>
                    <ReviewTemplates />
                  </SidebarLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/templates/assignments"
              element={
                <PrivateRoute allowedRoles={['admin', 'manager']}>
                  <SidebarLayout user={getUserFromStorage()}>
                    <TemplateAssignments />
                  </SidebarLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/templates/builder"
              element={
                <PrivateRoute allowedRoles={['admin', 'manager']}>
                  <SidebarLayout user={getUserFromStorage()}>
                    <TemplateBuilder />
                  </SidebarLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/templates/builder/:id"
              element={
                <PrivateRoute allowedRoles={['admin', 'manager']}>
                  <SidebarLayout user={getUserFromStorage()}>
                    <TemplateBuilder />
                  </SidebarLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/pending-reviews"
              element={
                <PrivateRoute allowedRoles={['admin', 'manager']}>
                  <SidebarLayout user={getUserFromStorage()}>
                    <PendingReviews />
                  </SidebarLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/reviews/:id"
              element={
                <PrivateRoute allowedRoles={['admin', 'manager']}>
                  <SidebarLayout user={getUserFromStorage()}>
                    <ViewEvaluation />
                  </SidebarLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/reviews/edit/:id"
              element={
                <PrivateRoute allowedRoles={['admin', 'manager']}>
                  <SidebarLayout user={getUserFromStorage()}>
                    <ViewEvaluation />
                  </SidebarLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/employees"
              element={
                <PrivateRoute allowedRoles={['admin', 'manager']}>
                  <SidebarLayout user={getUserFromStorage()}>
                    <Employees />
                  </SidebarLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/employees/:id"
              element={
                <PrivateRoute allowedRoles={['admin', 'manager']}>
                  <SidebarLayout user={getUserFromStorage()}>
                    <EmployeeProfile />
                  </SidebarLayout>
                </PrivateRoute>
              }
            />
            
            {/* Admin-only Routes */}
            <Route
              path="/settings"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <SidebarLayout user={getUserFromStorage()}>
                    <Settings />
                  </SidebarLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/import-tool"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <SidebarLayout user={getUserFromStorage()}>
                    <ImportTool />
                  </SidebarLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/export-tool"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <SidebarLayout user={getUserFromStorage()}>
                    <ExportTool />
                  </SidebarLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/kpis"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <SidebarLayout user={getUserFromStorage()}>
                    <KpiManager />
                  </SidebarLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/goals"
              element={
                <PrivateRoute>
                  <SidebarLayout user={getUserFromStorage()}>
                    <MonthlyGoalTracking />
                  </SidebarLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/goals/review/:reviewId"
              element={
                <PrivateRoute>
                  <SidebarLayout user={getUserFromStorage()}>
                    <MonthlyGoalTracking />
                  </SidebarLayout>
                </PrivateRoute>
              }
            />
            
            {/* Super Admin Routes */}
            <Route 
              path="/super-admin" 
              element={
                <PrivateRoute allowedRoles={['superadmin', 'super_admin']}>
                  <SidebarLayout user={{ role: 'superadmin' }}>
                    <SuperAdminDashboard />
                  </SidebarLayout>
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/super-admin/customers" 
              element={
                <PrivateRoute allowedRoles={['superadmin', 'super_admin']}>
                  <SidebarLayout user={{ role: 'superadmin' }}>
                    <SuperAdminDashboard />
                  </SidebarLayout>
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/super-admin/customers/:customerId/details" 
              element={
                <PrivateRoute allowedRoles={['superadmin', 'super_admin']}>
                  <SidebarLayout user={{ role: 'superadmin' }}>
                    <CustomerDetailPage />
                  </SidebarLayout>
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/super-admin/users" 
              element={
                <PrivateRoute allowedRoles={['superadmin', 'super_admin']}>
                  <SidebarLayout user={{ role: 'superadmin' }}>
                    <SuperAdminUsers />
                  </SidebarLayout>
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/super-admin/sessions" 
              element={
                <PrivateRoute allowedRoles={['superadmin', 'super_admin']}>
                  <SidebarLayout user={{ role: 'superadmin' }}>
                    <SuperAdminSessions />
                  </SidebarLayout>
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/super-admin/analytics" 
              element={
                <PrivateRoute allowedRoles={['superadmin', 'super_admin']}>
                  <SidebarLayout user={{ role: 'superadmin' }}>
                    <SuperAdminAnalytics />
                  </SidebarLayout>
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/super-admin/logs" 
              element={
                <PrivateRoute allowedRoles={['superadmin', 'super_admin']}>
                  <SidebarLayout user={{ role: 'superadmin' }}>
                    <SuperAdminLogs />
                  </SidebarLayout>
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/super-admin/settings" 
              element={
                <PrivateRoute allowedRoles={['superadmin', 'super_admin']}>
                  <SidebarLayout user={{ role: 'superadmin' }}>
                    <SuperAdminSettings />
                  </SidebarLayout>
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/super-admin/exit-impersonation" 
              element={
                <PrivateRoute allowedRoles={['superadmin', 'super_admin']}>
                  <SidebarLayout user={{ role: 'superadmin' }}>
                    <ExitImpersonation />
                  </SidebarLayout>
                </PrivateRoute>
              } 
            />
            
            {/* Manager Dashboard Routes */}
            <Route
              path="/manager/dashboard"
              element={
                <PrivateRoute allowedRoles={['manager']}>
                  <SidebarLayout user={{ role: 'manager' }}>
                    <ManagerDashboard />
                  </SidebarLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/manager/reviews/new"
              element={
                <PrivateRoute allowedRoles={['manager']}>
                  <SidebarLayout user={{ role: 'manager' }}>
                    <ReviewForm />
                  </SidebarLayout>
                </PrivateRoute>
              }
            />
            
            <Route
              path="/manager/reviews/:reviewId"
              element={
                <PrivateRoute allowedRoles={['manager']}>
                  <SidebarLayout user={{ role: 'manager' }}>
                    <ReviewForm />
                  </SidebarLayout>
                </PrivateRoute>
              }
            />
            
            {/* Default Routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
            
            {/* Test Route */}
            <Route path="/test" element={<Test />} />
          </Routes>
        </BrowserRouter>
      </DepartmentProvider>
    </AuthProvider>
  );
}

export default App;