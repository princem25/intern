import React from 'react';
import { Button } from '../ui/Button';
import { NotificationDropdown } from '../ui/NotificationDropdown';

import { useTheme } from '../../context/ThemeContext';

export const Topbar = ({ title = "Dashboard", onToggleSidebar, user }) => {
    const { theme, toggleTheme } = useTheme();

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
                <button
                    className="btn btn-secondary"
                    style={{ border: 'none', background: 'transparent', fontSize: '1.25rem', color: 'var(--text-muted)' }}
                    onClick={toggleTheme}
                    title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                    <i className={`fa-regular ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
                </button>
                <NotificationDropdown />
            </div>
        </header>
    );
};
