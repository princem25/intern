import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { getUsers } from '../../api/admin';

const AllMembers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('approved');

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = { status: statusFilter || 'all' };
            if (roleFilter) params.role = roleFilter;
            if (search) params.search = search;
            const data = await getUsers(params);
            setUsers(data);
        } catch (err) {
            console.error('Failed to load users', err);
        } finally {
            setLoading(false);
        }
    }, [statusFilter, roleFilter, search]);

    useEffect(() => {
        const t = setTimeout(loadUsers, 300);
        return () => clearTimeout(t);
    }, [loadUsers]);

    const formatDate = (d) => d
        ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : '—';

    const getStatusConfig = (status) => ({
        pending: { bg: 'rgba(245,158,11,0.12)', color: 'var(--warning)', label: 'Pending' },
        approved: { bg: 'rgba(16,185,129,0.12)', color: 'var(--success)', label: 'Approved' },
        rejected: { bg: 'rgba(239,68,68,0.12)', color: 'var(--danger)', label: 'Rejected' },
    }[status] || { bg: 'var(--bg-body)', color: 'var(--text-muted)', label: status });

    const getRoleColor = (name) => ({
        intern: 'var(--primary)',
        teamlead: 'var(--warning)',
    }[name] || 'var(--text-muted)');

    return (
        <DashboardLayout role="HR">
            {/* Header */}
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h2 style={{ margin: 0 }}>All Members</h2>
                    <p className="text-muted" style={{ marginTop: '0.25rem' }}>
                        View all registered users across all statuses.
                    </p>
                </div>
                <Button variant="secondary" onClick={loadUsers}>
                    <i className="fa-solid fa-rotate-right" style={{ marginRight: '0.5rem' }}></i> Refresh
                </Button>
            </header>

            {/* Filters */}
            <Card className="mb-6" style={{ padding: '1rem' }}>
                <div className="flex gap-3 items-center flex-wrap">
                    {/* Search */}
                    <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                        <i className="fa-solid fa-magnifying-glass" style={{
                            position: 'absolute', left: '0.75rem', top: '50%',
                            transform: 'translateY(-50%)', color: 'var(--text-muted)',
                            pointerEvents: 'none',
                        }}></i>
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.625rem 0.75rem 0.625rem 2.25rem',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--bg-body)',
                                color: 'var(--text-main)',
                                fontSize: '0.875rem',
                                outline: 'none',
                            }}
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        style={{
                            padding: '0.625rem 2rem 0.625rem 0.75rem',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-body)',
                            color: 'var(--text-main)',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            outline: 'none',
                            minWidth: '140px',
                            appearance: 'none',
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748B' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 0.75rem center',
                        }}
                    >
                        <option value="">All Statuses</option>
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                    </select>

                    {/* Role Filter */}
                    <select
                        value={roleFilter}
                        onChange={e => setRoleFilter(e.target.value)}
                        style={{
                            padding: '0.625rem 2rem 0.625rem 0.75rem',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-body)',
                            color: 'var(--text-main)',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            outline: 'none',
                            minWidth: '140px',
                            appearance: 'none',
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748B' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 0.75rem center',
                        }}
                    >
                        <option value="">All Roles</option>
                        <option value="intern">Intern</option>
                        <option value="teamlead">Team Lead</option>
                    </select>

                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                        {loading ? 'Loading...' : `${users.length} member${users.length !== 1 ? 's' : ''}`}
                    </div>
                </div>
            </Card>

            {/* Table */}
            <Card style={{ padding: 0 }}>
                {/* Head */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 120px',
                    gap: '1rem',
                    padding: '0.875rem 1.5rem',
                    borderBottom: '1px solid var(--border)',
                    background: 'var(--bg-body)',
                    borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
                }}>
                    {['Member', 'Role', 'Technology', 'Joined', 'Status'].map(col => (
                        <div key={col} style={{
                            fontSize: '0.75rem', fontWeight: 700,
                            color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em',
                        }}>
                            {col}
                        </div>
                    ))}
                </div>

                {/* Body */}
                {loading ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.75rem' }}></i>
                        Loading members...
                    </div>
                ) : users.length === 0 ? (
                    <div style={{ padding: '4rem', textAlign: 'center' }}>
                        <i className="fa-solid fa-users-slash" style={{ fontSize: '3rem', color: 'var(--border)', display: 'block', marginBottom: '1rem' }}></i>
                        <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>No members found</p>
                        <p className="text-muted" style={{ fontSize: '0.875rem' }}>Try adjusting your filters.</p>
                    </div>
                ) : (
                    users.map((user, idx) => {
                        const status = getStatusConfig(user.status);
                        return (
                            <div
                                key={user.id}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '2fr 1fr 1fr 1fr 120px',
                                    gap: '1rem',
                                    padding: '1rem 1.5rem',
                                    alignItems: 'center',
                                    borderBottom: idx < users.length - 1 ? '1px solid var(--border)' : 'none',
                                    transition: 'background 0.2s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-body)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                {/* Avatar + Info */}
                                <div className="flex items-center gap-3">
                                    <div style={{
                                        width: 38, height: 38, borderRadius: '50%',
                                        background: 'var(--gradient-primary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0,
                                    }}>
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</div>
                                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{user.email}</div>
                                    </div>
                                </div>

                                {/* Role */}
                                <div>
                                    <span style={{
                                        padding: '0.2rem 0.6rem',
                                        background: `${getRoleColor(user.role?.name)}15`,
                                        color: getRoleColor(user.role?.name),
                                        borderRadius: 'var(--radius-full)',
                                        fontSize: '0.75rem', fontWeight: 600,
                                        textTransform: 'capitalize',
                                    }}>
                                        {user.role?.name || '—'}
                                    </span>
                                </div>

                                {/* Technology */}
                                <div style={{ fontSize: '0.875rem', color: user.technology ? 'var(--text-main)' : 'var(--text-muted)' }}>
                                    {user.technology?.name || '—'}
                                </div>

                                {/* Date joined */}
                                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                    {formatDate(user.created_at)}
                                </div>

                                {/* Status */}
                                <div>
                                    <span style={{
                                        padding: '0.25rem 0.65rem',
                                        background: status.bg,
                                        color: status.color,
                                        borderRadius: 'var(--radius-full)',
                                        fontSize: '0.75rem', fontWeight: 600,
                                    }}>
                                        {status.label}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </Card>
        </DashboardLayout>
    );
};

export default AllMembers;
