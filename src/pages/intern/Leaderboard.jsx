import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const Leaderboard = () => {
    const [timeFilter, setTimeFilter] = useState('week'); // week, month, allTime

    // Sample leaderboard data
    const leaderboardData = {
        week: [
            { rank: 1, name: 'Sarah Connor', avatar: 'SC', points: 850, tasksCompleted: 12, streak: 7, change: 'up' },
            { rank: 2, name: 'John Doe', avatar: 'JD', points: 820, tasksCompleted: 11, streak: 5, change: 'same', isCurrentUser: true },
            { rank: 3, name: 'Alice Johnson', avatar: 'AJ', points: 780, tasksCompleted: 10, streak: 6, change: 'down' },
            { rank: 4, name: 'Bob Smith', avatar: 'BS', points: 750, tasksCompleted: 9, streak: 4, change: 'up' },
            { rank: 5, name: 'Emma Wilson', avatar: 'EW', points: 720, tasksCompleted: 9, streak: 3, change: 'up' },
            { rank: 6, name: 'Michael Brown', avatar: 'MB', points: 690, tasksCompleted: 8, streak: 5, change: 'down' },
            { rank: 7, name: 'Olivia Davis', avatar: 'OD', points: 650, tasksCompleted: 8, streak: 2, change: 'same' },
            { rank: 8, name: 'James Miller', avatar: 'JM', points: 620, tasksCompleted: 7, streak: 4, change: 'up' },
            { rank: 9, name: 'Sophia Garcia', avatar: 'SG', points: 590, tasksCompleted: 7, streak: 3, change: 'down' },
            { rank: 10, name: 'William Martinez', avatar: 'WM', points: 560, tasksCompleted: 6, streak: 2, change: 'same' }
        ],
        month: [
            { rank: 1, name: 'Sarah Connor', avatar: 'SC', points: 3200, tasksCompleted: 45, streak: 28, change: 'up' },
            { rank: 2, name: 'Alice Johnson', avatar: 'AJ', points: 3100, tasksCompleted: 42, streak: 25, change: 'up' },
            { rank: 3, name: 'John Doe', avatar: 'JD', points: 2950, tasksCompleted: 40, streak: 20, change: 'down', isCurrentUser: true },
            { rank: 4, name: 'Bob Smith', avatar: 'BS', points: 2800, tasksCompleted: 38, streak: 18, change: 'same' },
            { rank: 5, name: 'Emma Wilson', avatar: 'EW', points: 2650, tasksCompleted: 35, streak: 15, change: 'up' }
        ],
        allTime: [
            { rank: 1, name: 'Sarah Connor', avatar: 'SC', points: 15200, tasksCompleted: 180, streak: 120, change: 'up' },
            { rank: 2, name: 'Alice Johnson', avatar: 'AJ', points: 14800, tasksCompleted: 175, streak: 115, change: 'same' },
            { rank: 3, name: 'Bob Smith', avatar: 'BS', points: 13500, tasksCompleted: 160, streak: 100, change: 'up' },
            { rank: 4, name: 'John Doe', avatar: 'JD', points: 12900, tasksCompleted: 155, streak: 95, change: 'down', isCurrentUser: true },
            { rank: 5, name: 'Emma Wilson', avatar: 'EW', points: 11200, tasksCompleted: 140, streak: 85, change: 'up' }
        ]
    };

    const currentData = leaderboardData[timeFilter];
    const currentUser = currentData.find(user => user.isCurrentUser);

    const getRankIcon = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return rank;
    };

    const getChangeIcon = (change) => {
        if (change === 'up') return <i className="fa-solid fa-arrow-up" style={{ color: 'var(--success)', fontSize: '0.9rem' }}></i>;
        if (change === 'down') return <i className="fa-solid fa-arrow-down" style={{ color: 'var(--danger)', fontSize: '0.9rem' }}></i>;
        return <i className="fa-solid fa-minus" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}></i>;
    };

    return (
        <DashboardLayout role="Intern">
            <div style={{ marginBottom: '2rem' }}>
                {/* Header */}
                <div className="flex justify-between items-center mb-6" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ margin: 0, marginBottom: '0.5rem' }}>🏆 Leaderboard</h1>
                        <p className="text-muted" style={{ margin: 0 }}>
                            Compete with fellow interns and climb the ranks!
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={timeFilter === 'week' ? 'primary' : 'secondary'}
                            onClick={() => setTimeFilter('week')}
                        >
                            This Week
                        </Button>
                        <Button
                            variant={timeFilter === 'month' ? 'primary' : 'secondary'}
                            onClick={() => setTimeFilter('month')}
                        >
                            This Month
                        </Button>
                        <Button
                            variant={timeFilter === 'allTime' ? 'primary' : 'secondary'}
                            onClick={() => setTimeFilter('allTime')}
                        >
                            All Time
                        </Button>
                    </div>
                </div>

                {/* Current User Stats */}
                {currentUser && (
                    <Card className="p-6 mb-6" style={{ background: 'var(--gradient-primary)', color: 'white' }}>
                        <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '1.5rem' }}>
                            <div className="flex items-center gap-4">
                                <div className="leaderboard-avatar-large" style={{ background: 'rgba(255,255,255,0.2)' }}>
                                    {currentUser.avatar}
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, marginBottom: '0.25rem', color: 'white' }}>Your Rank: #{currentUser.rank}</h2>
                                    <p style={{ margin: 0, opacity: 0.9 }}>{currentUser.name}</p>
                                </div>
                            </div>
                            <div className="flex gap-6" style={{ flexWrap: 'wrap' }}>
                                <div className="text-center">
                                    <div style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>{currentUser.points}</div>
                                    <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Points</div>
                                </div>
                                <div className="text-center">
                                    <div style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>{currentUser.tasksCompleted}</div>
                                    <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Tasks</div>
                                </div>
                                <div className="text-center">
                                    <div style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>🔥 {currentUser.streak}</div>
                                    <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Day Streak</div>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Top 3 Podium */}
                <div className="leaderboard-podium mb-6">
                    {currentData.slice(0, 3).sort((a, b) => {
                        const order = { 2: 0, 1: 1, 3: 2 };
                        return order[a.rank] - order[b.rank];
                    }).map((user) => (
                        <div key={user.rank} className={`podium-place podium-${user.rank}`}>
                            <div className="podium-avatar">
                                {user.avatar}
                            </div>
                            <div className="podium-rank">{getRankIcon(user.rank)}</div>
                            <div className="podium-name">{user.name}</div>
                            <div className="podium-points">{user.points} pts</div>
                        </div>
                    ))}
                </div>

                {/* Full Leaderboard Table */}
                <Card>
                    <div className="leaderboard-table">
                        <div className="leaderboard-header">
                            <div className="leaderboard-col-rank">Rank</div>
                            <div className="leaderboard-col-user">User</div>
                            <div className="leaderboard-col-stat">Points</div>
                            <div className="leaderboard-col-stat">Tasks</div>
                            <div className="leaderboard-col-stat">Streak</div>
                            <div className="leaderboard-col-change">Trend</div>
                        </div>
                        {currentData.map((user) => (
                            <div
                                key={user.rank}
                                className={`leaderboard-row ${user.isCurrentUser ? 'leaderboard-row-current' : ''}`}
                            >
                                <div className="leaderboard-col-rank">
                                    <span className="leaderboard-rank-badge">
                                        {getRankIcon(user.rank)}
                                    </span>
                                </div>
                                <div className="leaderboard-col-user">
                                    <div className="flex items-center gap-3">
                                        <div className="leaderboard-avatar">
                                            {user.avatar}
                                        </div>
                                        <span style={{ fontWeight: user.isCurrentUser ? 600 : 500 }}>
                                            {user.name}
                                            {user.isCurrentUser && (
                                                <span className="badge badge-primary" style={{ marginLeft: '0.5rem', fontSize: '0.7rem' }}>
                                                    You
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                </div>
                                <div className="leaderboard-col-stat">
                                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{user.points}</span>
                                </div>
                                <div className="leaderboard-col-stat">{user.tasksCompleted}</div>
                                <div className="leaderboard-col-stat">
                                    🔥 {user.streak}
                                </div>
                                <div className="leaderboard-col-change">
                                    {getChangeIcon(user.change)}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default Leaderboard;
