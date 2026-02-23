import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const Notifications = () => {
    const [filter, setFilter] = useState('all'); // all, unread, read

    // Sample notifications data
    const allNotifications = [
        {
            id: 1,
            type: 'success',
            title: 'Code Approved',
            message: 'Your submission for "Two Sum" has been approved by Sarah Connor. Great work!',
            time: '5 min ago',
            timestamp: new Date(Date.now() - 5 * 60 * 1000),
            unread: true
        },
        {
            id: 2,
            type: 'warning',
            title: 'Feedback Received',
            message: 'Sarah Connor left feedback on your API Integration task. Please review the comments and make necessary changes.',
            time: '1 hour ago',
            timestamp: new Date(Date.now() - 60 * 60 * 1000),
            unread: true
        },
        {
            id: 3,
            type: 'info',
            title: 'New Topic Assigned',
            message: 'You have been assigned a new topic: "PHP OOP Basics". Check your workspace.',
            time: '3 hours ago',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
            unread: false
        },
        {
            id: 4,
            type: 'success',
            title: 'Extra Hours Approved',
            message: 'Your request for 120 minutes of extra time has been approved.',
            time: '5 hours ago',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
            unread: false
        }
    ];

    const filteredNotifications = allNotifications.filter(n => {
        if (filter === 'unread') return n.unread;
        if (filter === 'read') return !n.unread;
        return true;
    });

    const unreadCount = allNotifications.filter(n => n.unread).length;

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
        <DashboardLayout role="Intern">
            <div style={{ marginBottom: '2rem' }}>
                <div className="flex justify-between items-center mb-6" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ margin: 0, marginBottom: '0.5rem' }}>Recent Activity</h1>
                        <p className="text-muted" style={{ margin: 0 }}>
                            Updates on your tasks and performance
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    {filteredNotifications.length === 0 ? (
                        <Card className="p-8 text-center">
                            <i className="fa-regular fa-bell-slash" style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '1rem' }}></i>
                            <h3 style={{ color: 'var(--text-muted)' }}>No notifications</h3>
                            <p className="text-muted">You're all caught up!</p>
                        </Card>
                    ) : (
                        filteredNotifications.map((notification) => (
                            <Card
                                key={notification.id}
                                className="p-6"
                                style={{ transition: 'all 0.2s' }}
                            >
                                <div className="flex gap-4">
                                    <div
                                        className="notification-icon-large"
                                        style={{ color: getIconColor(notification.type) }}
                                    >
                                        <i className={`fa-solid ${getIconClass(notification.type)}`}></i>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2" style={{ gap: '1rem' }}>
                                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                                                {notification.title}
                                            </h3>
                                            <span className="text-muted" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                                {notification.time}
                                            </span>
                                        </div>
                                        <p className="text-muted" style={{ margin: 0, lineHeight: 1.6 }}>
                                            {notification.message}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Notifications;
