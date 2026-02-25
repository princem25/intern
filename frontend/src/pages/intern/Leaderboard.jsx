import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import config from '../../config';

const apiFetch = async (url) => {
    const token = localStorage.getItem('auth_token');
    const r = await fetch(url, {
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
    });
    if (r.status === 401) { localStorage.removeItem('auth_token'); localStorage.removeItem('user'); window.location.href = '/auth/login'; return null; }
    if (!r.ok) throw new Error('Failed to fetch');
    return r.json();
};

const Leaderboard = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const res = await apiFetch(`${config.API_BASE_URL}/leaderboard`);
                if (res) setData(res);
            } catch { setError('Failed to load leaderboard.'); }
            finally { setLoading(false); }
        })();
    }, []);

    const currentUser = data.find(u => u.is_current_user);
    const top3 = data.slice(0, 3);

    const getRankDisplay = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    const getRankColor = (rank) => {
        if (rank === 1) return '#FFD700';
        if (rank === 2) return '#C0C0C0';
        if (rank === 3) return '#CD7F32';
        return 'var(--primary)';
    };

    const podiumOrder = [1, 0, 2]; // 2nd, 1st, 3rd for visual podium

    return (
        <DashboardLayout role="Intern">
            <style>{`
                .lb-podium { display: flex; justify-content: center; align-items: flex-end; gap: 1rem; margin-bottom: 2rem; }
                .lb-podium-card { display: flex; flex-direction: column; align-items: center; padding: 1.25rem 1rem; border-radius: 16px; background: var(--bg-card); border: 1px solid var(--border); transition: all 0.3s; min-width: 140px; }
                .lb-podium-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
                .lb-avatar { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.1rem; color: white; margin-bottom: 0.75rem; }
                .lb-avatar-sm { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; color: white; flex-shrink: 0; }
                .lb-row { display: grid; grid-template-columns: 50px 1fr 90px 90px 90px; align-items: center; padding: 0.85rem 1.25rem; border-bottom: 1px solid var(--border); transition: background 0.15s; gap: 0.5rem; }
                .lb-row:hover { background: rgba(99,102,241,0.04); }
                .lb-row.current { background: rgba(99,102,241,0.08); border-left: 3px solid var(--primary); }
                .lb-header { font-size: 0.72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 2px solid var(--border); }
                @media (max-width: 640px) {
                    .lb-row { grid-template-columns: 40px 1fr 70px 70px; }
                    .lb-row .hide-mobile { display: none; }
                    .lb-podium { flex-direction: column; align-items: center; }
                }
            `}</style>

            <div style={{ marginBottom: '2rem' }}>
                {/* Header */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <h1 style={{ margin: 0, marginBottom: '0.35rem', fontSize: '1.5rem' }}>🏆 Leaderboard</h1>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Rankings based on total scores from reviewed tasks
                    </p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.75rem' }}></i> Loading leaderboard…
                    </div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#EF4444' }}>{error}</div>
                ) : data.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                        <i className="fa-solid fa-trophy" style={{ fontSize: '3rem', color: 'var(--border)', display: 'block', marginBottom: '1rem' }}></i>
                        <p style={{ fontWeight: 600 }}>No interns yet</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>The leaderboard will populate once interns have completed and been reviewed on tasks.</p>
                    </div>
                ) : (
                    <>
                        {/* Current user rank banner */}
                        {currentUser && (
                            <div style={{ background: 'var(--gradient-primary)', borderRadius: '14px', padding: '1.25rem 1.5rem', color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem' }}>
                                        {currentUser.avatar}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '1.15rem' }}>Your Rank: #{currentUser.rank}</div>
                                        <div style={{ opacity: 0.85, fontSize: '0.85rem' }}>{currentUser.name}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontWeight: 800, fontSize: '1.4rem' }}>{currentUser.total_score}</div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>Total Score</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontWeight: 800, fontSize: '1.4rem' }}>{currentUser.done_tasks}</div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>Completed</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontWeight: 800, fontSize: '1.4rem' }}>{currentUser.avg_score || '—'}</div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>Avg Score</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Top 3 Podium */}
                        {top3.length >= 3 && (
                            <div className="lb-podium">
                                {podiumOrder.map(idx => {
                                    const u = top3[idx];
                                    if (!u) return null;
                                    const isFirst = u.rank === 1;
                                    return (
                                        <div key={u.id} className="lb-podium-card" style={{ order: idx, transform: isFirst ? 'scale(1.08)' : 'none', borderColor: getRankColor(u.rank), borderWidth: isFirst ? 2 : 1 }}>
                                            <div style={{ fontSize: isFirst ? '2rem' : '1.5rem', marginBottom: '0.5rem' }}>{getRankDisplay(u.rank)}</div>
                                            <div className="lb-avatar" style={{ background: `linear-gradient(135deg, ${getRankColor(u.rank)}, ${getRankColor(u.rank)}88)`, width: isFirst ? 64 : 52, height: isFirst ? 64 : 52, fontSize: isFirst ? '1.3rem' : '1rem' }}>
                                                {u.avatar}
                                            </div>
                                            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.15rem', textAlign: 'center' }}>{u.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{u.technology}</div>
                                            <div style={{ fontWeight: 800, fontSize: '1.15rem', color: getRankColor(u.rank) }}>{u.total_score} pts</div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{u.done_tasks} tasks done • avg {u.avg_score || 0}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Full Table */}
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
                            <div className="lb-row lb-header">
                                <div>Rank</div>
                                <div>Intern</div>
                                <div style={{ textAlign: 'center' }}>Score</div>
                                <div style={{ textAlign: 'center' }}>Tasks</div>
                                <div style={{ textAlign: 'center' }} className="hide-mobile">Avg</div>
                            </div>
                            {data.map(u => (
                                <div key={u.id} className={`lb-row ${u.is_current_user ? 'current' : ''}`}>
                                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{getRankDisplay(u.rank)}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                                        <div className="lb-avatar-sm" style={{ background: u.rank <= 3 ? `linear-gradient(135deg, ${getRankColor(u.rank)}, ${getRankColor(u.rank)}88)` : 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                                            {u.avatar}
                                        </div>
                                        <div style={{ overflow: 'hidden' }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {u.name}
                                                {u.is_current_user && <span style={{ marginLeft: '0.4rem', background: 'var(--primary)', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '999px', fontSize: '0.65rem', fontWeight: 700 }}>YOU</span>}
                                            </div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{u.technology}</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'center', fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem' }}>{u.total_score}</div>
                                    <div style={{ textAlign: 'center', fontSize: '0.85rem' }}>
                                        <span style={{ fontWeight: 600 }}>{u.done_tasks}</span>
                                        <span style={{ color: 'var(--text-muted)' }}>/{u.total_tasks}</span>
                                    </div>
                                    <div style={{ textAlign: 'center', fontSize: '0.85rem' }} className="hide-mobile">
                                        {u.avg_score > 0 ? (
                                            <span style={{ fontWeight: 600, color: u.avg_score >= 70 ? '#10B981' : u.avg_score >= 40 ? '#F59E0B' : '#EF4444' }}>{u.avg_score}</span>
                                        ) : '—'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Leaderboard;
