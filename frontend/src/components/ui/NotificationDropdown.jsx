import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '../../api/auth';

export const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Determine notifications link based on role
    const currentUser = getCurrentUser();
    const role = currentUser?.role?.name;
    const notifLink = role === 'teamlead' || role === 'admin'
        ? '/lead/dashboard'
        : role === 'hr'
            ? '/hr/dashboard'
            : '/intern/notifications';

    // Sample notifications data
    const notifications = [
        {
            id: 1,
            type: 'success',
            title: 'Code Approved',
            message: 'Your submission for "Two Sum" has been approved!',
            time: '5 min ago',
            unread: true
        },
        {
            id: 2,
            type: 'warning',
            title: 'Feedback Received',
            message: 'Sarah Connor left feedback on your API Integration task.',
            time: '1 hour ago',
            unread: true
        },
        {
            id: 3,
            type: 'info',
            title: 'New Task Assigned',
            message: 'You have been assigned a new task: "Build Authentication System"',
            time: '3 hours ago',
            unread: false
        },
        {
            id: 4,
            type: 'danger',
            title: 'Deadline Approaching',
            message: 'Your task "To-Do App" is due tomorrow at 5:00 PM',
            time: '5 hours ago',
            unread: false
        }
    ];

    const unreadCount = notifications.filter(n => n.unread).length;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const getIconClass = (type) => {
        switch (type) {
            case 'success': return 'fa-circle-check';
            case 'warning': return 'fa-triangle-exclamation';
            case 'danger': return 'fa-circle-exclamation';
            case 'info': return 'fa-circle-info';
            default: return 'fa-bell';
        }
    };

    const getIconColor = (type) => {
        switch (type) {
            case 'success': return 'var(--success)';
            case 'warning': return 'var(--warning)';
            case 'danger': return 'var(--danger)';
            case 'info': return 'var(--primary)';
            default: return 'var(--text-muted)';
        }
    };

    return (
        <div className="notification-dropdown" ref={dropdownRef}>
            <button
                className="btn btn-secondary notification-bell"
                style={{
                    border: 'none',
                    background: 'transparent',
                    fontSize: '1.25rem',
                    color: 'var(--text-muted)',
                    position: 'relative'
                }}
                onClick={() => setIsOpen(!isOpen)}
            >
                <i className="fa-regular fa-bell"></i>
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="notification-panel">
                    <div className="notification-header">
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Notifications</h3>
                        {unreadCount > 0 && (
                            <span className="badge badge-primary">{unreadCount} new</span>
                        )}
                    </div>

                    <div className="notification-list">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`notification-item ${notification.unread ? 'unread' : ''}`}
                            >
                                <div className="notification-icon" style={{ color: getIconColor(notification.type) }}>
                                    <i className={`fa-solid ${getIconClass(notification.type)}`}></i>
                                </div>
                                <div className="notification-content">
                                    <div className="notification-title">{notification.title}</div>
                                    <div className="notification-message">{notification.message}</div>
                                    <div className="notification-time">{notification.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="notification-footer">
                        <Link to={notifLink} style={{ textDecoration: 'none' }} onClick={() => setIsOpen(false)}>
                            <button className="btn btn-link" style={{ width: '100%', textAlign: 'center' }}>
                                View All Notifications
                            </button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

