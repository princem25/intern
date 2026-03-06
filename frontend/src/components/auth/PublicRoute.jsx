import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * PublicRoute — prevents already-authenticated users from visiting
 * login, register, forgot-password, reset-password pages.
 *
 * If the user is logged in, redirect them to their role's home page.
 */
const PublicRoute = ({ children }) => {
    const token = localStorage.getItem('auth_token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user?.role?.name;

    if (token && role && user.status === 'approved') {
        if (role === 'teamlead' || role === 'admin') return <Navigate to="/lead/dashboard" replace />;
        if (role === 'hr') return <Navigate to="/hr/dashboard" replace />;
        return <Navigate to="/intern/dashboard" replace />;
    }

    return children;
};

export default PublicRoute;
