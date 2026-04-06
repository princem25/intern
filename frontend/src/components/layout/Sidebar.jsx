import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../../api/auth';

export const Sidebar = ({ links, role = 'Intern', onToggle }) => {
    const navigate = useNavigate();

    const handleLogout = async (e) => {
        e.preventDefault();
        await logout();
        navigate('/auth/login', { replace: true });
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header"
                style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <i className="fa-solid fa-layer-group text-primary"
                        style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}></i>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>InternPro</span>
                </div>
                {/* Toggle button inside sidebar */}
                <button
                    className="btn btn-secondary sidebar-toggle-btn"
                    style={{ padding: '0.5rem' }}
                    onClick={onToggle}
                >
                    <i className="fa-solid fa-chevron-left"></i>
                </button>
            </div>

            <nav className="sidebar-menu" style={{ padding: '1.5rem 1rem', flex: 1 }}>
                {links.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
                        onClick={() => window.innerWidth < 1024 && onToggle && onToggle()}
                    >
                        <i className={`fa-solid ${link.icon}`}></i>
                        <span>{link.text}</span>
                        {link.badge && (
                            <span className={`badge badge-${link.badgeColor || 'secondary'}`} style={{ marginLeft: 'auto' }}>
                                {link.badge}
                            </span>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
                <button
                    className="menu-item"
                    style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                    onClick={handleLogout}
                >
                    <i className="fa-solid fa-right-from-bracket"></i>
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

