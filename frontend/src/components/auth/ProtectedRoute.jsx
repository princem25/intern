import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute — gates a route by:
 *  1. Whether the user is logged in (auth_token present)
 *  2. Whether the user's role matches the allowed roles for that section
 *
 * Usage:
 *   <ProtectedRoute allowedRoles={['intern']}>
 *     <InternDashboard />
 *   </ProtectedRoute>
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const token = localStorage.getItem('auth_token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user?.role?.name; // e.g. 'intern', 'teamlead', 'hr', 'admin'

    // Not logged in or not approved → go to login
    if (!token || !role || user.status !== 'approved') {
        if (token) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
        }
        return <Navigate to="/auth/login" replace />;
    }

    // Wrong role → redirect to the correct home for this user
    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        if (role === 'teamlead' || role === 'admin') return <Navigate to="/lead/dashboard" replace />;
        if (role === 'hr') return <Navigate to="/hr/dashboard" replace />;
        return <Navigate to="/intern/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
