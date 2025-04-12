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
import EvaluationManagement from './components/EvaluationManagement';

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
        '/templates/builder': 'Template Builder',
        '/evaluation-management': 'Evaluation Management',
        '/import-tool': 'Import Tool',
        '/export-tool': 'Export Tool',
        '/pending-reviews': 'Pending Reviews',
        '/goals': 'Monthly Goal Tracking',
        '/kpis': 'KPI Management'
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
              path="/evaluation-management"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <EvaluationManagement />
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