import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import config from '../../config';

const apiFetch = async (url) => {
    const token = localStorage.getItem('auth_token');
    const r = await fetch(url, {
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
    });
    if (r.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
        return null;
    }
    if (!r.ok) throw new Error('Failed to fetch');
    return r.json();
};

const HRPerformance = () => {
    const [interns, setInterns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedIntern, setSelectedIntern] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [internDetails, setInternDetails] = useState(null);

    const token = localStorage.getItem('auth_token');

    useEffect(() => {
        loadLeaderboard();
    }, []);

    const loadLeaderboard = async () => {
        setLoading(true);
        try {
            const res = await apiFetch(`${config.API_BASE_URL}/leaderboard`);
            if (res) setInterns(res);
        } catch (err) {
            setError('Failed to load intern performance data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadInternDetails = async (internId) => {
        setDetailsLoading(true);
        try {
            const response = await fetch(
                `${config.API_BASE_URL}/hr/performance/${internId}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            if (response.ok) {
                const data = await response.json();
                setInternDetails(data);
                setSelectedIntern(internId);
            }
        } catch (err) {
            console.error('Error loading intern details:', err);
        } finally {
            setDetailsLoading(false);
        }
    };

    const getProgressColor = (percent) => {
        if (percent >= 75) return '#10B981';
        if (percent >= 50) return '#F59E0B';
        if (percent >= 25) return '#EF4444';
        return '#6B7280';
    };

    return (
        <DashboardLayout role="HR">
            <style>{`
                .perf-row { display: grid; grid-template-columns: 50px 1fr 80px 80px 80px 80px 80px; align-items: center; padding: 0.85rem 1.25rem; border-bottom: 1px solid var(--border); transition: background 0.15s; gap: 0.5rem; cursor: pointer; }
                .perf-row:hover { background: rgba(99,102,241,0.04); }
                .perf-row.selected { background: rgba(99,102,241,0.08); border-left: 3px solid var(--primary); }
                .perf-header { font-size: 0.72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 2px solid var(--border); background: var(--bg-body); }
                .perf-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; color: white; background: var(--primary); flex-shrink: 0; }
                .perf-name { font-weight: 600; font-size: 0.9rem; }
                .perf-email { font-size: 0.75rem; color: var(--text-muted); }
                .perf-score { text-align: center; fontWeight: 700; }
                @media (max-width: 768px) {
                    .perf-row { grid-template-columns: 40px 1fr 60px 60px 60px; }
                    .perf-col-hide { display: none; }
                }
            `}</style>

            {/* Header */}
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h2 style={{ margin: 0 }}>📊 Intern Performance</h2>
                    <p className="text-muted" style={{ marginTop: '0.25rem' }}>
                        Track all interns' task completion and scoring performance
                    </p>
                </div>
            </header>

            {loading ? (
                <Card style={{ padding: '4rem', textAlign: 'center' }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', display: 'block', marginBottom: '1rem' }}></i>
                    Loading performance data...
                </Card>
            ) : error ? (
                <Card style={{ padding: '2rem', background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}>
                    {error}
                </Card>
            ) : interns.length === 0 ? (
                <Card style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <i className="fa-solid fa-chart-line" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}></i>
                    <p>No interns found</p>
                </Card>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', minHeight: 'calc(100vh - 250px)' }}>
                    {/* Interns Table */}
                    <Card style={{ padding: 0, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                        <div style={{ padding: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.125rem' }}>All Interns</h3>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', borderTop: '1px solid var(--border)' }}>
                            {/* Header Row */}
                            <div className="perf-row perf-header">
                                <div>Rank</div>
                                <div>Intern</div>
                                <div style={{ textAlign: 'center' }}>Tasks</div>
                                <div style={{ textAlign: 'center' }}>Done</div>
                                <div style={{ textAlign: 'center' }}>Score</div>
                                <div style={{ textAlign: 'center' }}>Avg</div>
                                <div style={{ textAlign: 'center' }}>Copies</div>
                            </div>

                            {/* Data Rows */}
                            {interns.map((intern) => (
                                <div
                                    key={intern.id}
                                    className={`perf-row ${selectedIntern === intern.id ? 'selected' : ''}`}
                                    onClick={() => loadInternDetails(intern.id)}
                                >
                                    <div style={{ fontWeight: 700, color: 'var(--primary)' }}>#{intern.rank}</div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div className="perf-avatar">{intern.avatar}</div>
                                            <div>
                                                <div className="perf-name">{intern.name}</div>
                                                <div className="perf-email">{intern.technology}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="perf-score">{intern.total_tasks}</div>
                                    <div className="perf-score" style={{ color: getProgressColor(intern.total_tasks > 0 ? (intern.done_tasks / intern.total_tasks * 100) : 0) }}>
                                        {intern.done_tasks}
                                    </div>
                                    <div className="perf-score">{intern.total_score}</div>
                                    <div className="perf-score" style={{ color: '#10B981' }}>{intern.avg_score || '—'}</div>
                                    <div className="perf-score" style={{ color: intern.copy_incidents > 0 ? '#EF4444' : '#10B981', fontWeight: intern.copy_incidents > 0 ? 700 : 500 }}>
                                        {intern.copy_incidents > 0 ? (
                                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                                                <i className="fa-solid fa-warning" style={{ fontSize: '0.7rem' }}></i>
                                                {intern.copy_incidents}
                                            </span>
                                        ) : (
                                            '0'
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Details Panel */}
                    {selectedIntern && internDetails ? (
                        <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.125rem' }}>
                                {internDetails.intern.name}'s Details
                            </h3>

                            {detailsLoading ? (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>
                                    <i className="fa-solid fa-spinner fa-spin"></i>
                                </div>
                            ) : (
                                <>
                                    {/* Info Cards */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                        <div style={{ padding: '1rem', background: 'var(--bg-body)', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Email</div>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{internDetails.intern.email}</div>
                                        </div>
                                        <div style={{ padding: '1rem', background: 'var(--bg-body)', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Technology</div>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{internDetails.intern.technology}</div>
                                        </div>
                                        <div style={{ padding: '1rem', background: 'var(--bg-body)', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Team Lead</div>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{internDetails.intern.team_lead}</div>
                                        </div>
                                        <div style={{ padding: '1rem', background: 'var(--bg-body)', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Status</div>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#10B981' }}>{internDetails.intern.status}</div>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                        {[
                                            { label: 'Total Tasks', value: internDetails.stats.total_tasks, color: 'var(--primary)' },
                                            { label: 'Completed', value: internDetails.stats.completed_tasks, color: '#10B981' },
                                            { label: 'In Progress', value: internDetails.stats.in_progress_tasks, color: '#F59E0B' },
                                            { label: 'To Do', value: internDetails.stats.todo_tasks, color: '#6B7280' },
                                        ].map((stat, idx) => (
                                            <div key={idx} style={{
                                                padding: '0.75rem',
                                                background: 'var(--bg-body)',
                                                borderRadius: '8px',
                                                textAlign: 'center',
                                            }}>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: stat.color }}>
                                                    {stat.value}
                                                </div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                                    {stat.label}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Progress Bar */}
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Overall Progress</span>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: getProgressColor(internDetails.stats.progress_percent) }}>
                                                {internDetails.stats.progress_percent}%
                                            </span>
                                        </div>
                                        <div style={{
                                            height: '8px',
                                            background: 'var(--bg-body)',
                                            borderRadius: '4px',
                                            overflow: 'hidden',
                                        }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${internDetails.stats.progress_percent}%`,
                                                background: getProgressColor(internDetails.stats.progress_percent),
                                                transition: 'width 0.3s',
                                            }} />
                                        </div>
                                    </div>

                                    {/* Difficulty Breakdown */}
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>Difficulty Breakdown</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                                            <div style={{ padding: '0.6rem', background: 'rgba(16,185,129,0.12)', borderRadius: '6px', textAlign: 'center' }}>
                                                <div style={{ color: '#10B981', fontWeight: 600, fontSize: '0.8rem' }}>Basic</div>
                                                <div style={{ color: '#10B981', fontWeight: 700 }}>{internDetails.stats.basic_tasks}</div>
                                            </div>
                                            <div style={{ padding: '0.6rem', background: 'rgba(245,158,11,0.12)', borderRadius: '6px', textAlign: 'center' }}>
                                                <div style={{ color: '#F59E0B', fontWeight: 600, fontSize: '0.8rem' }}>Medium</div>
                                                <div style={{ color: '#F59E0B', fontWeight: 700 }}>{internDetails.stats.medium_tasks}</div>
                                            </div>
                                            <div style={{ padding: '0.6rem', background: 'rgba(239,68,68,0.12)', borderRadius: '6px', textAlign: 'center' }}>
                                                <div style={{ color: '#EF4444', fontWeight: 600, fontSize: '0.8rem' }}>Hard</div>
                                                <div style={{ color: '#EF4444', fontWeight: 700 }}>{internDetails.stats.hard_tasks}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tasks List */}
                                    <div style={{ flex: 1, minHeight: 0 }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>Recent Tasks</div>
                                        <div style={{ overflowY: 'auto', height: '100%' }}>
                                            {internDetails.tasks.length === 0 ? (
                                                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem', fontSize: '0.85rem' }}>
                                                    No tasks assigned
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                    {internDetails.tasks.map((task) => {
                                                        const statusColor = {
                                                            done: '#10B981',
                                                            in_progress: '#F59E0B',
                                                            todo: '#6B7280',
                                                        }[task.status];
                                                        const diffColor = {
                                                            basic: '#10B981',
                                                            medium: '#F59E0B',
                                                            hard: '#EF4444',
                                                        }[task.difficulty];
                                                        return (
                                                            <div key={task.id} style={{
                                                                padding: '0.6rem',
                                                                background: 'var(--bg-body)',
                                                                borderRadius: '6px',
                                                                borderLeft: `3px solid ${statusColor}`,
                                                                fontSize: '0.8rem',
                                                            }}>
                                                                <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{task.title}</div>
                                                                <div style={{ display: 'flex', gap: '0.3rem', fontSize: '0.7rem' }}>
                                                                    <span style={{
                                                                        background: `${statusColor}20`,
                                                                        color: statusColor,
                                                                        padding: '0.15rem 0.3rem',
                                                                        borderRadius: '2px',
                                                                    }}>
                                                                        {task.status.replace('_', ' ')}
                                                                    </span>
                                                                    {task.difficulty && <span style={{
                                                                        background: `${diffColor}20`,
                                                                        color: diffColor,
                                                                        padding: '0.15rem 0.3rem',
                                                                        borderRadius: '2px',
                                                                    }}>
                                                                        {task.difficulty}
                                                                    </span>}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </Card>
                    ) : (
                        <Card style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <i className="fa-solid fa-chart-line" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}></i>
                            <p>Select an intern to view detailed performance</p>
                        </Card>
                    )}
                </div>
            )}
        </DashboardLayout>
    );
};

export default HRPerformance;
