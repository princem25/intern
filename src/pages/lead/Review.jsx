import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

const LeadReview = () => {
    return (
        <div className="review-container">
            {/* Header */}
            <header className="review-header" style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)' }}>
                <div className="flex items-center gap-4">
                    <Link to="/lead/dashboard" className="btn btn-secondary" style={{ padding: '0.5rem' }}>
                        <i className="fa-solid fa-arrow-left"></i>
                    </Link>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>Two Sum Optimization</div>
                        <div className="flex items-center gap-2 text-muted" style={{ fontSize: '0.875rem' }}>
                            <span>Submitted by</span>
                            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>John Doe</span>
                            <span>• 2 hours ago</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <span className="badge badge-warning">Pending Review</span>
                </div>
            </header>

            {/* Main Workspace */}
            <div className="review-workspace">

                {/* Code Viewer */}
                <div className="code-viewer" style={{ background: '#1E1E1E', color: '#D4D4D4', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div className="file-tabs" style={{ background: '#252526', display: 'flex' }}>
                        <div className="file-tab" style={{ padding: '0.5rem 1rem', background: '#1E1E1E', borderTop: '2px solid var(--primary)', color: 'white', fontSize: '0.875rem' }}>solution.js</div>
                    </div>
                    <div className="code-content" style={{ flex: 1, padding: '1rem', fontFamily: "'Fira Code', monospace", fontSize: '0.875rem', lineHeight: 1.6, overflowY: 'auto' }}>
                        <div className="code-line" style={{ display: 'flex' }}>
                            <div className="line-num" style={{ width: '40px', textAlign: 'right', paddingRight: '1rem', color: '#858585', userSelect: 'none' }}>1</div>
                            <div className="line-code" style={{ flex: 1, whiteSpace: 'pre' }}><span style={{ color: '#569cd6' }}>function</span> twoSum(nums, target) {'{'}</div>
                        </div>
                        <div className="code-line" style={{ display: 'flex' }}>
                            <div className="line-num" style={{ width: '40px', textAlign: 'right', paddingRight: '1rem', color: '#858585', userSelect: 'none' }}>2</div>
                            <div className="line-code" style={{ flex: 1, whiteSpace: 'pre' }}><span style={{ color: '#6a9955' }}>// Optimized solution using Hash Map</span></div>
                        </div>
                        <div className="code-line diff-add" style={{ display: 'flex', background: 'rgba(16, 185, 129, 0.2)' }}>
                            <div className="line-num" style={{ width: '40px', textAlign: 'right', paddingRight: '1rem', color: '#858585', userSelect: 'none' }}>3</div>
                            <div className="line-code" style={{ flex: 1, whiteSpace: 'pre' }}><span style={{ color: '#569cd6' }}>const</span> map = <span style={{ color: '#569cd6' }}>new</span> Map();</div>
                        </div>
                        {/* ... truncated lines for brevity, assuming user wants structure first ... */}
                        <div className="code-line" style={{ display: 'flex' }}>
                            <div className="line-num" style={{ width: '40px', textAlign: 'right', paddingRight: '1rem', color: '#858585', userSelect: 'none' }}>4</div>
                            <div className="line-code" style={{ flex: 1, whiteSpace: 'pre' }}> </div>
                        </div>
                        <div className="code-line" style={{ display: 'flex' }}>
                            <div className="line-num" style={{ width: '40px', textAlign: 'right', paddingRight: '1rem', color: '#858585', userSelect: 'none' }}>5</div>
                            <div className="line-code" style={{ flex: 1, whiteSpace: 'pre' }}><span style={{ color: '#c586c0' }}>for</span> (<span style={{ color: '#569cd6' }}>let</span> i = 0; i &lt; nums.length; i++) {'{'}</div>
                        </div>
                        <div className="code-line" style={{ display: 'flex' }}>
                            <div className="line-num" style={{ width: '40px', textAlign: 'right', paddingRight: '1rem', color: '#858585', userSelect: 'none' }}>6</div>
                            <div className="line-code" style={{ flex: 1, whiteSpace: 'pre' }}><span style={{ color: '#569cd6' }}>const</span> complement = target - nums[i];</div>
                        </div>
                        <div className="code-line" style={{ display: 'flex' }}>
                            <div className="line-num" style={{ width: '40px', textAlign: 'right', paddingRight: '1rem', color: '#858585', userSelect: 'none' }}>7</div>
                            <div className="line-code" style={{ flex: 1, whiteSpace: 'pre' }}><span style={{ color: '#c586c0' }}>if</span> (map.has(complement)) {'{'}</div>
                        </div>
                        <div className="code-line" style={{ display: 'flex' }}>
                            <div className="line-num" style={{ width: '40px', textAlign: 'right', paddingRight: '1rem', color: '#858585', userSelect: 'none' }}>8</div>
                            <div className="line-code" style={{ flex: 1, whiteSpace: 'pre' }}><span style={{ color: '#c586c0' }}>return</span> [map.get(complement), i];</div>
                        </div>
                        <div className="code-line" style={{ display: 'flex' }}>
                            <div className="line-num" style={{ width: '40px', textAlign: 'right', paddingRight: '1rem', color: '#858585', userSelect: 'none' }}>9</div>
                            <div className="line-code" style={{ flex: 1, whiteSpace: 'pre' }}>{'}'}</div>
                        </div>
                    </div>
                </div>

                {/* Feedback Panel */}
                <div className="feedback-panel" style={{ background: 'var(--bg-card)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
                    <div className="panel-header" style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="avatar-sm" style={{ width: '32px', height: '32px', background: 'var(--bg-body)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, border: '1px solid var(--border)' }}>JD</div>
                        <span style={{ fontWeight: 600 }}>Evaluation</span>
                    </div>

                    <div className="panel-body" style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>


                        <div className="input-group">
                            <label className="input-label">Feedback</label>
                            <textarea className="input-field" rows="6" placeholder="Add specific feedback here..." defaultValue="Great use of Map for O(1) lookups. In the future, verify constraints before choosing the data structure, but this is optimal for general cases." name="teamlead_feedback"></textarea>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Score (0-100)</label>
                            <input type="number" className="input-field" defaultValue="95" name="teamlead_score" />
                        </div>
                    </div>

                    <div className="panel-footer" style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', background: 'var(--bg-body)' }}>
                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="secondary" className="w-full">Request Changes</Button>
                            <Button variant="primary" className="w-full">Approve</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeadReview;
