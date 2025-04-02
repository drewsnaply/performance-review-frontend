import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DepartmentProvider } from './context/DepartmentContext';
import PrivateRoute from './components/PrivateRoute';

// Import pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Unauthorized from './pages/Unauthorized';
import Test from './pages/Test'; // or './Test' depending on your folder structure

// Import components for routes
import MyReviews from './components/MyReviews';
import TeamReviews from './components/TeamReviews';
import ReviewCycles from './components/ReviewCycles';
import ReviewTemplates from './components/ReviewTemplates';
import ImportTool from './components/ImportTool';
import ExportTool from './components/ExportTool';
import EvaluationManagement from './components/EvaluationManagement';
import DepartmentManager from './components/DepartmentManager';
import ViewEvaluation from './components/ViewEvaluation';

function App() {
  return (
    <DepartmentProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Shared routes for authenticated users */}
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
              path="/evaluation/:id"
              element={
                <PrivateRoute>
                  <Dashboard initialView="evaluation-detail" />
                </PrivateRoute>
              }
            />
            
            {/* Manager and Admin routes */}
            <Route
              path="/employees"
              element={
                <PrivateRoute allowedRoles={['manager', 'admin']}>
                  <Employees />
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
              path="/review-templates"
              element={
                <PrivateRoute allowedRoles={['manager', 'admin']}>
                  <ReviewTemplates />
                </PrivateRoute>
              }
            />
            
            {/* Admin-only routes */}
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
              path="/departments"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <DepartmentManager />
                </PrivateRoute>
              }
            />
            
            {/* Redirect to Dashboard if authenticated, else to Login */}
            <Route path="/" element={<PrivateRoute><Navigate to="/dashboard" replace /></PrivateRoute>} />
            
            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
            <Route path="/test" element={<Test />} />
            <Route path="/direct-dashboard" element={<Dashboard />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </DepartmentProvider>
  );
}

export default App;