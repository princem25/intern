import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';

// ─── Auth Pages ───────────────────────────────────────────────────────────────
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// ─── Intern Pages ─────────────────────────────────────────────────────────────
import InternDashboard from './pages/intern/Dashboard';
import InternWorkspace from './pages/intern/Workspace';
import InternPerformance from './pages/intern/Performance';
import InternProfile from './pages/intern/Profile';
import InternNotifications from './pages/intern/Notifications';
import InternLeaderboard from './pages/intern/Leaderboard';
import CodeEditorPage from './pages/intern/CodeEditorPage';

// ─── Team Lead Pages ──────────────────────────────────────────────────────────
import LeadDashboard from './pages/lead/Dashboard';
import LeadTopics from './pages/lead/Topics';
import LeadReview from './pages/lead/Review';
import LeadInternManagement from './pages/lead/InternManagement';

// ─── HR Pages ─────────────────────────────────────────────────────────────────
import HRDashboard from './pages/hr/Dashboard';
import PendingApprovals from './pages/hr/PendingApprovals';
import TeamLeadAssignment from './pages/hr/TeamLeadAssignment';
import AllMembers from './pages/hr/AllMembers';
import AuditLog from './pages/hr/AuditLog';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>

          {/* ── Public Routes ───────────────────────────────────────────── */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />

          {/* ── Intern Routes ───────────────────────────────────────────── */}
          <Route path="/intern">
            <Route index element={<Navigate to="/intern/dashboard" replace />} />
            <Route path="dashboard" element={<ProtectedRoute allowedRoles={['intern']}><InternDashboard /></ProtectedRoute>} />
            <Route path="workspace" element={<ProtectedRoute allowedRoles={['intern']}><InternWorkspace /></ProtectedRoute>} />
            <Route path="editor/:taskId" element={<ProtectedRoute allowedRoles={['intern']}><CodeEditorPage /></ProtectedRoute>} />
            <Route path="performance" element={<ProtectedRoute allowedRoles={['intern']}><InternPerformance /></ProtectedRoute>} />
            <Route path="profile" element={<ProtectedRoute allowedRoles={['intern']}><InternProfile /></ProtectedRoute>} />
            <Route path="notifications" element={<ProtectedRoute allowedRoles={['intern']}><InternNotifications /></ProtectedRoute>} />
            <Route path="leaderboard" element={<ProtectedRoute allowedRoles={['intern']}><InternLeaderboard /></ProtectedRoute>} />
          </Route>

          {/* ── Team Lead Routes ─────────────────────────────────────────── */}
          <Route path="/lead">
            <Route index element={<Navigate to="/lead/dashboard" replace />} />
            <Route path="dashboard" element={<ProtectedRoute allowedRoles={['teamlead', 'admin']}><LeadDashboard /></ProtectedRoute>} />
            <Route path="topics" element={<ProtectedRoute allowedRoles={['teamlead', 'admin']}><LeadTopics /></ProtectedRoute>} />
            <Route path="review" element={<ProtectedRoute allowedRoles={['teamlead', 'admin']}><LeadReview /></ProtectedRoute>} />
            <Route path="interns" element={<ProtectedRoute allowedRoles={['teamlead', 'admin']}><LeadInternManagement /></ProtectedRoute>} />
          </Route>

          {/* ── HR Routes ────────────────────────────────────────────────── */}
          <Route path="/hr">
            <Route index element={<Navigate to="/hr/dashboard" replace />} />
            <Route path="dashboard" element={<ProtectedRoute allowedRoles={['hr', 'admin']}><HRDashboard /></ProtectedRoute>} />
            <Route path="approvals" element={<ProtectedRoute allowedRoles={['hr', 'admin']}><PendingApprovals /></ProtectedRoute>} />
            <Route path="assignments" element={<ProtectedRoute allowedRoles={['hr', 'admin']}><TeamLeadAssignment /></ProtectedRoute>} />
            <Route path="members" element={<ProtectedRoute allowedRoles={['hr', 'admin']}><AllMembers /></ProtectedRoute>} />
            <Route path="audit-log" element={<ProtectedRoute allowedRoles={['hr', 'admin']}><AuditLog /></ProtectedRoute>} />
          </Route>

          {/* ── Catch-all ────────────────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
