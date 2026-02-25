import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationDropdown } from '../ui/NotificationDropdown';
import { useTheme } from '../../context/ThemeContext';
import { logout } from '../../api/auth';

export const Topbar = ({ title = "Dashboard", onToggleSidebar, user }) => {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    // Derive initials from user name (e.g. "John Doe" → "JD")
    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map(w => w[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    const initials = user?.name ? getInitials(user.name) : '?';
    const displayName = user?.name || 'User';
    const userRole = user?.role?.name || '';

    const handleLogout = async () => {
        await logout();
        navigate('/auth/login', { replace: true });
    };

    return (
        <header className="topbar">
            <div className="flex items-center gap-4">
                {/* Toggle button in topbar */}
                <button
                    className="btn btn-secondary topbar-toggle-btn"
                    style={{ padding: '0.5rem' }}
                    onClick={onToggleSidebar}
                >
                    <i className="fa-solid fa-bars"></i>
                </button>
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{title}</h2>
            </div>
            <div className="flex items-center gap-4">
                {/* Theme toggle */}
                <button
                    className="btn btn-secondary"
                    style={{ border: 'none', background: 'transparent', fontSize: '1.25rem', color: 'var(--text-muted)' }}
                    onClick={toggleTheme}
                    title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                    <i className={`fa-regular ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
                </button>

                {/* Notifications */}
                <NotificationDropdown />

                {/* User avatar + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: 'var(--primary)', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '0.875rem', flexShrink: 0
                    }}>
                        {initials}
                    </div>
                    <div style={{ lineHeight: 1.2 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{displayName}</div>
                        {userRole && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{userRole}</div>}
                    </div>
                </div>

                {/* Logout button */}
                <button
                    className="btn btn-secondary"
                    style={{ border: 'none', background: 'transparent', fontSize: '1.1rem', color: 'var(--danger)' }}
                    onClick={handleLogout}
                    title="Logout"
                >
                    <i className="fa-solid fa-right-from-bracket"></i>
                </button>
            </div>
        </header>
    );
};

