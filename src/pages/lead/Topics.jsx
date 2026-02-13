import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const LeadTopics = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <DashboardLayout role="Lead">
            <header className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ margin: 0 }}>Topic Management</h2>
                    <p className="text-muted">Create assignments and organize the curriculum.</p>
                </div>
                <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                    <i className="fa-solid fa-plus" style={{ marginRight: '0.5rem' }}></i> New Topic
                </Button>
            </header>

            <div className="grid grid-responsive gap-6">
                {/* Topic 1 */}
                <Card style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', background: 'rgba(79, 70, 229, 0.05)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                            <i className="fa-brands fa-react text-primary"></i>
                        </div>
                        <div className="flex gap-2">
                            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><i className="fa-solid fa-pen"></i></button>
                            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><i className="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                    <div style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem' }}>Advanced React Patterns</h3>
                        <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Hooks, Context API, HOCs, and Performance Optimization techniques.</p>

                        <div style={{ marginTop: '1rem' }}>
                            <div className="flex justify-between" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                <span>Completion Status</span>
                                <span>75% of Interns</span>
                            </div>
                            <div style={{ height: '6px', background: 'var(--bg-body)', borderRadius: '4px' }}>
                                <div style={{ width: '75%', height: '100%', background: 'var(--primary)', borderRadius: '4px' }}></div>
                            </div>
                        </div>
                    </div>
                    <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-body)' }}>
                        <span className="badge badge-success">Active</span>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>12 Exercises</span>
                    </div>
                </Card>

                {/* Topic 2 */}
                <Card style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', background: 'rgba(79, 70, 229, 0.05)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                            <i className="fa-brands fa-node text-success"></i>
                        </div>
                        <div className="flex gap-2">
                            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><i className="fa-solid fa-pen"></i></button>
                            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><i className="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                    <div style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem' }}>Node.js Microservices</h3>
                        <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Building scalable services with Express, Docker, and Redis.</p>

                        <div style={{ marginTop: '1rem' }}>
                            <div className="flex justify-between" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                <span>Completion Status</span>
                                <span>30% of Interns</span>
                            </div>
                            <div style={{ height: '6px', background: 'var(--bg-body)', borderRadius: '4px' }}>
                                <div style={{ width: '30%', height: '100%', background: 'var(--warning)', borderRadius: '4px' }}></div>
                            </div>
                        </div>
                    </div>
                    <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-body)' }}>
                        <span className="badge badge-success">Active</span>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>8 Exercises</span>
                    </div>
                </Card>

                {/* Topic 3 */}
                <Card style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', background: 'rgba(79, 70, 229, 0.05)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                            <i className="fa-solid fa-database text-warning"></i>
                        </div>
                        <div className="flex gap-2">
                            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><i className="fa-solid fa-pen"></i></button>
                            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><i className="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                    <div style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem' }}>Database Indexing</h3>
                        <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Understanding B-Trees, Hash Indexes, and Query Optimization.</p>

                        <div style={{ marginTop: '1rem' }}>
                            <div className="flex justify-between" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                <span>Completion Status</span>
                                <span>0% of Interns</span>
                            </div>
                            <div style={{ height: '6px', background: 'var(--bg-body)', borderRadius: '4px' }}>
                                <div style={{ width: '0%', height: '100%', background: 'var(--text-muted)', borderRadius: '4px' }}></div>
                            </div>
                        </div>
                    </div>
                    <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-body)' }}>
                        <span className="badge badge-warning">Draft</span>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>5 Exercises</span>
                    </div>
                </Card>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal active" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.5)', zIndex: 100, alignItems: 'center', justifyContent: 'center' }}>
                    <div className="modal-content" style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', width: '500px', maxWidth: '90%' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Create New Topic</h3>
                        <div className="input-group">
                            <label className="input-label">Topic Title</label>
                            <input type="text" className="input-field" placeholder="e.g., System Design" />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Description</label>
                            <textarea className="input-field" rows="3" placeholder="Brief description of the topic..."></textarea>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="input-group">
                                <label className="input-label">Category</label>
                                <select className="input-field">
                                    <option>Frontend</option>
                                    <option>Backend</option>
                                    <option>DevOps</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="input-label">Difficulty</label>
                                <select className="input-field">
                                    <option>Beginner</option>
                                    <option>Intermediate</option>
                                    <option>Advanced</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4" style={{ marginTop: '1.5rem' }}>
                            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button variant="primary">Create Topic</Button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default LeadTopics;
