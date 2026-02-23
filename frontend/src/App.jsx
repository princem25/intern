import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import InternDashboard from './pages/intern/Dashboard';
import InternWorkspace from './pages/intern/Workspace';
import InternPerformance from './pages/intern/Performance';
import InternProfile from './pages/intern/Profile';
import InternNotifications from './pages/intern/Notifications';
import InternLeaderboard from './pages/intern/Leaderboard';
import LeadDashboard from './pages/lead/Dashboard';
import LeadTopics from './pages/lead/Topics';
import LeadReview from './pages/lead/Review';
import LeadInternManagement from './pages/lead/InternManagement';
import HRDashboard from './pages/hr/Dashboard';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />

          {/* Intern Routes */}
          <Route path="/intern">
            <Route index element={<Navigate to="/intern/dashboard" replace />} />
            <Route path="dashboard" element={<InternDashboard />} />
            <Route path="workspace" element={<InternWorkspace />} />
            <Route path="performance" element={<InternPerformance />} />
            <Route path="profile" element={<InternProfile />} />
            <Route path="notifications" element={<InternNotifications />} />
            <Route path="leaderboard" element={<InternLeaderboard />} />
          </Route>

          {/* Lead Routes */}
          <Route path="/lead">
            <Route index element={<Navigate to="/lead/dashboard" replace />} />
            <Route path="dashboard" element={<LeadDashboard />} />
            <Route path="topics" element={<LeadTopics />} />
            <Route path="review" element={<LeadReview />} />
            <Route path="interns" element={<LeadInternManagement />} />
          </Route>

          {/* HR Routes */}
          <Route path="/hr">
            <Route index element={<Navigate to="/hr/dashboard" replace />} />
            <Route path="dashboard" element={<HRDashboard />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
