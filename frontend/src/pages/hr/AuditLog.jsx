import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { getApprovalLogs } from '../../api/admin';

const AuditLog = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all | approved | rejected

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const data = await getApprovalLogs();
            setLogs(data);
        } catch (err) {
            console.error('Failed to load audit logs', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (d) => d
        ? new Date(d).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        })
        : '—';

    const filtered = filter === 'all' ? logs : logs.filter(l => l.action === filter);

    const actionConfig = {
        approved: {
            icon: 'fa-circle-check',
            color: 'var(--success)',
            bg: 'rgba(16,185,129,0.1)',
            label: 'Approved',
        },
        rejected: {
            icon: 'fa-circle-xmark',
            color: 'var(--danger)',
            bg: 'rgba(239,68,68,0.1)',
            label: 'Rejected',
        },
    };

    const approvedCount = logs.filter(l => l.action === 'approved').length;
    const rejectedCount = logs.filter(l => l.action === 'rejected').length;

    return (
        <DashboardLayout role="HR">
            {/* Header */}
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h2 style={{ margin: 0 }}>Audit Log</h2>
                    <p className="text-muted" style={{ marginTop: '0.25rem' }}>
                        Complete record of all approval and rejection actions taken by HR.
                    </p>
                </div>
                <Button variant="secondary" onClick={loadLogs}>
                    <i className="fa-solid fa-rotate-right" style={{ marginRight: '0.5rem' }}></i> Refresh
                </Button>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-6 mb-6">
                {[
                    { label: 'Total Actions', value: logs.length, icon: 'fa-clipboard-list', color: 'var(--primary)', bg: 'rgba(79,70,229,0.1)' },
                    { label: 'Total Approved', value: approvedCount, icon: 'fa-circle-check', color: 'var(--success)', bg: 'rgba(16,185,129,0.1)' },
                    { label: 'Total Rejected', value: rejectedCount, icon: 'fa-circle-xmark', color: 'var(--danger)', bg: 'rgba(239,68,68,0.1)' },
                ].map(card => (
                    <Card key={card.label} className="p-5">
                        <div className="flex justify-between items-center">
                            <div>
                                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>{card.label}</div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: card.color }}>
                                    {loading ? '—' : card.value}
                                </div>
                            </div>
                            <div style={{
                                width: 44, height: 44,
                                background: card.bg,
                                borderRadius: 'var(--radius-lg)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <i className={`fa-solid ${card.icon}`} style={{ fontSize: '1.1rem', color: card.color }}></i>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', background: 'var(--bg-body)', borderRadius: 'var(--radius-lg)', padding: '0.25rem', width: 'fit-content' }}>
                {[
                    { key: 'all', label: 'All Actions', icon: 'fa-list' },
                    { key: 'approved', label: 'Approved', icon: 'fa-circle-check' },
                    { key: 'rejected', label: 'Rejected', icon: 'fa-circle-xmark' },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            border: 'none',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            background: filter === tab.key ? 'var(--bg-card)' : 'transparent',
                            color: filter === tab.key
                                ? (tab.key === 'approved' ? 'var(--success)' : tab.key === 'rejected' ? 'var(--danger)' : 'var(--primary)')
                                : 'var(--text-muted)',
                            boxShadow: filter === tab.key ? 'var(--shadow-sm)' : 'none',
                        }}
                    >
                        <i className={`fa-solid ${tab.icon}`}></i>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Log Entries */}
            <Card style={{ padding: 0 }}>
                {/* Table Head */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.5fr 1fr 1fr 2fr',
                    gap: '1rem',
                    padding: '0.875rem 1.5rem',
                    borderBottom: '1px solid var(--border)',
                    background: 'var(--bg-body)',
                    borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
                }}>
                    {['User', 'Actioned By', 'Action', 'Date & Time', 'Reason'].map(col => (
                        <div key={col} style={{
                            fontSize: '0.75rem', fontWeight: 700,
                            color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em',
                        }}>
                            {col}
                        </div>
                    ))}
                </div>

                {/* Rows */}
                {loading ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.75rem' }}></i>
                        Loading audit log...
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ padding: '4rem', textAlign: 'center' }}>
                        <i className="fa-solid fa-clipboard" style={{ fontSize: '3rem', color: 'var(--border)', display: 'block', marginBottom: '1rem' }}></i>
                        <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>No log entries yet</p>
                        <p className="text-muted" style={{ fontSize: '0.875rem' }}>Actions will appear here after approvals or rejections.</p>
                    </div>
                ) : (
                    filtered.map((log, idx) => {
                        const action = actionConfig[log.action] || { icon: 'fa-circle', color: 'var(--text-muted)', bg: 'var(--bg-body)', label: log.action };
                        return (
                            <div
                                key={log.id}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '2fr 1.5fr 1fr 1fr 2fr',
                                    gap: '1rem',
                                    padding: '1rem 1.5rem',
                                    alignItems: 'center',
                                    borderBottom: idx < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                                    transition: 'background 0.2s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-body)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                {/* Target User */}
                                <div className="flex items-center gap-2">
                                    <div style={{
                                        width: 32, height: 32, borderRadius: '50%',
                                        background: 'var(--gradient-primary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0,
                                    }}>
                                        {log.target_user?.name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{log.target_user?.name || '(deleted)'}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                                            {log.target_user?.role?.name || '—'}
                                        </div>
                                    </div>
                                </div>

                                {/* Actioned By */}
                                <div style={{ fontSize: '0.875rem' }}>
                                    <div style={{ fontWeight: 500 }}>{log.acted_by?.name || '—'}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>HR</div>
                                </div>

                                {/* Action Badge */}
                                <div>
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                        padding: '0.25rem 0.65rem',
                                        background: action.bg,
                                        color: action.color,
                                        borderRadius: 'var(--radius-full)',
                                        fontSize: '0.75rem', fontWeight: 600,
                                    }}>
                                        <i className={`fa-solid ${action.icon}`}></i>
                                        {action.label}
                                    </span>
                                </div>

                                {/* Date */}
                                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                    {formatDateTime(log.created_at)}
                                </div>

                                {/* Reason */}
                                <div style={{
                                    fontSize: '0.8125rem',
                                    color: log.reason ? 'var(--text-main)' : 'var(--text-muted)',
                                    fontStyle: log.reason ? 'normal' : 'italic',
                                }}>
                                    {log.reason || 'No reason provided'}
                                </div>
                            </div>
                        );
                    })
                )}
            </Card>
        </DashboardLayout>
    );
};

export default AuditLog;
