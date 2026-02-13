import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';

const InternManagement = () => {
    const [selectedIntern, setSelectedIntern] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');

    // Sample intern data
    const interns = [
        {
            id: 1,
            name: 'John Doe',
            avatar: 'JD',
            email: 'john.doe@company.com',
            status: 'active',
            performance: 85,
            tasksCompleted: 12,
            tasksInProgress: 2,
            tasksPending: 1,
            streak: 5,
            lastActive: '2 hours ago',
            skills: ['JavaScript', 'React', 'Node.js'],
            recentActivity: [
                { type: 'completed', task: 'Build To-Do App', time: '2 hours ago' },
                { type: 'submitted', task: 'API Integration', time: '1 day ago' }
            ],
            needsAttention: false
        },
        {
            id: 2,
            name: 'Sarah Connor',
            avatar: 'SC',
            email: 'sarah.connor@company.com',
            status: 'active',
            performance: 92,
            tasksCompleted: 15,
            tasksInProgress: 3,
            tasksPending: 0,
            streak: 7,
            lastActive: '30 min ago',
            skills: ['Python', 'Django', 'PostgreSQL'],
            recentActivity: [
                { type: 'completed', task: 'Database Design', time: '30 min ago' },
                { type: 'completed', task: 'Authentication System', time: '5 hours ago' }
            ],
            needsAttention: false
        },
        {
            id: 3,
            name: 'Alice Johnson',
            avatar: 'AJ',
            email: 'alice.j@company.com',
            status: 'needsAttention',
            performance: 65,
            tasksCompleted: 6,
            tasksInProgress: 1,
            tasksPending: 3,
            streak: 2,
            lastActive: '2 days ago',
            skills: ['HTML', 'CSS', 'JavaScript'],
            recentActivity: [
                { type: 'late', task: 'Landing Page', time: '2 days overdue' },
                { type: 'submitted', task: 'Form Validation', time: '3 days ago' }
            ],
            needsAttention: true
        },
        {
            id: 4,
            name: 'Bob Smith',
            avatar: 'BS',
            email: 'bob.smith@company.com',
            status: 'active',
            performance: 78,
            tasksCompleted: 10,
            tasksInProgress: 2,
            tasksPending: 1,
            streak: 4,
            lastActive: '1 hour ago',
            skills: ['Java', 'Spring Boot', 'MySQL'],
            recentActivity: [
                { type: 'submitted', task: 'REST API', time: '1 hour ago' },
                { type: 'completed', task: 'Unit Tests', time: '1 day ago' }
            ],
            needsAttention: false
        }
    ];

    const filteredInterns = interns.filter(intern => {
        if (filterStatus === 'active') return intern.status === 'active';
        if (filterStatus === 'needsAttention') return intern.needsAttention;
        return true;
    });

    const stats = {
        total: interns.length,
        active: interns.filter(i => i.status === 'active').length,
        needsAttention: interns.filter(i => i.needsAttention).length,
        avgPerformance: Math.round(interns.reduce((sum, i) => sum + i.performance, 0) / interns.length)
    };

    const getPerformanceColor = (score) => {
        if (score >= 80) return 'var(--success)';
        if (score >= 60) return 'var(--warning)';
        return 'var(--danger)';
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'completed': return { icon: 'fa-circle-check', color: 'var(--success)' };
            case 'submitted': return { icon: 'fa-paper-plane', color: 'var(--primary)' };
            case 'late': return { icon: 'fa-clock', color: 'var(--danger)' };
            default: return { icon: 'fa-circle', color: 'var(--text-muted)' };
        }
    };

    return (
        <DashboardLayout role="Lead">
            <div style={{ marginBottom: '2rem' }}>
                {/* Header */}
                <div className="flex justify-between items-center mb-6" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ margin: 0, marginBottom: '0.5rem' }}>👥 Intern Management</h1>
                        <p className="text-muted" style={{ margin: 0 }}>
                            Monitor and manage your intern team
                        </p>
                    </div>
                    <Link to="/lead/topics" style={{ textDecoration: 'none' }}>
                        <Button variant="primary">
                            <i className="fa-solid fa-plus" style={{ marginRight: '0.5rem' }}></i>
                            Assign Task
                        </Button>
                    </Link>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-responsive gap-4 mb-6">
                    <Card className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="stat-icon" style={{ background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)' }}>
                                <i className="fa-solid fa-users"></i>
                            </div>
                            <div>
                                <div className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>Total Interns</div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{stats.total}</div>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="stat-icon" style={{ background: 'rgba(var(--success-rgb), 0.1)', color: 'var(--success)' }}>
                                <i className="fa-solid fa-user-check"></i>
                            </div>
                            <div>
                                <div className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>Active</div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{stats.active}</div>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="stat-icon" style={{ background: 'rgba(var(--warning-rgb), 0.1)', color: 'var(--warning)' }}>
                                <i className="fa-solid fa-triangle-exclamation"></i>
                            </div>
                            <div>
                                <div className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>Needs Attention</div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{stats.needsAttention}</div>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="stat-icon" style={{ background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)' }}>
                                <i className="fa-solid fa-chart-line"></i>
                            </div>
                            <div>
                                <div className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>Avg Performance</div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{stats.avgPerformance}%</div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-4">
                    <Button
                        variant={filterStatus === 'all' ? 'primary' : 'secondary'}
                        onClick={() => setFilterStatus('all')}
                    >
                        All ({interns.length})
                    </Button>
                    <Button
                        variant={filterStatus === 'active' ? 'primary' : 'secondary'}
                        onClick={() => setFilterStatus('active')}
                    >
                        Active ({stats.active})
                    </Button>
                    <Button
                        variant={filterStatus === 'needsAttention' ? 'primary' : 'secondary'}
                        onClick={() => setFilterStatus('needsAttention')}
                    >
                        Needs Attention ({stats.needsAttention})
                    </Button>
                </div>

                {/* Intern Grid - Vertical Expansion */}
                <div className="grid grid-responsive gap-4 items-start">
                    {filteredInterns.map((intern) => (
                        <Card
                            key={intern.id}
                            className="intern-card-modern"
                            style={{
                                padding: '1.5rem',
                                borderTop: intern.needsAttention ? '4px solid var(--danger)' : '4px solid transparent',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem',
                                height: 'fit-content' // Important for alignment
                            }}
                            onClick={() => setSelectedIntern(selectedIntern?.id === intern.id ? null : intern)}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="intern-avatar">
                                        {intern.avatar}
                                    </div>
                                    <div>
                                        <h3 className="intern-name">{intern.name}</h3>
                                        <p className="intern-email">{intern.email}</p>
                                    </div>
                                </div>
                                {intern.needsAttention && (
                                    <div className="attention-badge-small">
                                        <i className="fa-solid fa-exclamation"></i>
                                    </div>
                                )}
                            </div>

                            {/* Performance Section */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium text-muted">Performance Score</span>
                                    <span className="font-bold" style={{ color: getPerformanceColor(intern.performance) }}>
                                        {intern.performance}%
                                    </span>
                                </div>
                                <div className="progress-bar-modern">
                                    <div
                                        className="progress-fill-modern"
                                        style={{
                                            width: `${intern.performance}%`,
                                            background: getPerformanceColor(intern.performance)
                                        }}
                                    ></div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-2" style={{ background: 'var(--bg-body)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                                <div className="text-center">
                                    <div className="text-lg font-bold">{intern.tasksCompleted}</div>
                                    <div className="text-xs text-muted">Done</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-bold">{intern.tasksInProgress}</div>
                                    <div className="text-xs text-muted">Active</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-orange-500">
                                        {intern.streak}
                                    </div>
                                    <div className="text-xs text-muted">Streak</div>
                                </div>
                            </div>

                            {/* Footer - Always visible, changes based on state */}
                            {!selectedIntern || selectedIntern.id !== intern.id ? (
                                <div className="flex justify-between items-center text-xs text-muted pt-2 border-t border-border">
                                    <span><i className="fa-regular fa-clock mr-1"></i> Active {intern.lastActive}</span>
                                    <i className="fa-solid fa-chevron-down"></i>
                                </div>
                            ) : null}

                            {/* Expanded Details - Vertical Stack */}
                            {selectedIntern?.id === intern.id && (
                                <div className="intern-expanded-details mt-4 pt-4 border-t border-border flex flex-col gap-4">
                                    {/* Skills */}
                                    <div>
                                        <h4 className="text-sm font-bold mb-2">Skills</h4>
                                        <div className="flex gap-2 flex-wrap">
                                            {intern.skills.map((skill, idx) => (
                                                <span key={idx} className="skill-badge">{skill}</span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Recent Activity */}
                                    <div>
                                        <h4 className="text-sm font-bold mb-2">Recent Activity</h4>
                                        <div className="activity-list">
                                            {intern.recentActivity.map((activity, idx) => {
                                                const { icon, color } = getActivityIcon(activity.type);
                                                return (
                                                    <div key={idx} className="activity-item">
                                                        <div className="activity-icon" style={{ background: `${color}15`, color }}>
                                                            <i className={`fa-solid ${icon}`}></i>
                                                        </div>
                                                        <div className="activity-content">
                                                            <div className="activity-task">{activity.task}</div>
                                                            <div className="activity-time">{activity.time}</div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="text-xs text-muted mt-2 text-right">
                                            Last active: {intern.lastActive}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-2">
                                        <Button variant="primary" style={{ flex: 1 }}>
                                            <i className="fa-solid fa-message mr-2"></i> Message
                                        </Button>
                                        <Button variant="secondary" style={{ flex: 1 }}>
                                            <i className="fa-solid fa-user mr-2"></i> Profile
                                        </Button>
                                    </div>

                                    {/* Close Chevron */}
                                    <div className="text-center text-muted mt-2">
                                        <i className="fa-solid fa-chevron-up"></i>
                                    </div>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default InternManagement;
