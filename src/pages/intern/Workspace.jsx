import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';

const InternWorkspace = () => {
    return (
        <DashboardLayout role="Intern" fullWidth={true}>
            {/* Workspace 3-Pane Grid */}
            <div className="workspace-grid" id="workspace-grid">

                {/* 1. Question List */}
                <div className="col-list" id="question-panel">
                    <div className="list-header">
                        <span>Task List</span>
                        <span className="badge badge-success">3 Pending</span>
                    </div>
                    <div className="question-list">
                        <div className="question-item active">
                            <div className="flex justify-between items-center mb-1" style={{ marginBottom: '0.25rem' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>1. Two Sum</span>
                                <span className="difficulty-badge diff-easy">Easy</span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Array • Hash Map</div>
                        </div>

                        <div className="question-item">
                            <div className="flex justify-between items-center mb-1" style={{ marginBottom: '0.25rem' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>2. Reverse Linked List</span>
                                <span className="difficulty-badge diff-medium">Med</span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Linked List • Recursion</div>
                        </div>

                        <div className="question-item">
                            <div className="flex justify-between items-center mb-1" style={{ marginBottom: '0.25rem' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>3. LRU Cache</span>
                                <span className="difficulty-badge diff-hard">Hard</span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Design • Hash Map</div>
                        </div>
                    </div>
                </div>

                {/* 2. Problem Description */}
                <div className="col-desc">
                    <h1 className="problem-title">Two Sum</h1>
                    <div className="problem-meta">
                        <span className="difficulty-badge diff-easy">Easy</span>
                        <span><i className="fa-regular fa-clock"></i> 15 mins</span>
                        <span><i className="fa-solid fa-trophy"></i> 100 Points</span>
                    </div>

                    <div className="markdown-body">
                        <p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.</p>
                        <p>You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice.</p>
                        <p>You can return the answer in any order.</p>

                        <h4 style={{ marginTop: '1.5rem' }}>Example 1:</h4>
                        <pre>Input: nums = [2,7,11,15], target = 9{'\n'}Output: [0,1]{'\n'}Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].</pre>

                        <h4 style={{ marginTop: '1.5rem' }}>Constraints:</h4>
                        <ul>
                            <li>2 &lt;= nums.length &lt;=10^4</li>
                            <li>-10^9 &lt;= nums[i] &lt;=10^9</li>
                            <li>-10^9 &lt;= target &lt;=10^9</li>
                        </ul>
                    </div>
                </div>

                {/* 3. Code Editor */}
                <div className="col-editor">
                    <div className="editor-header">
                        <div className="editor-tabs">
                            <div className="tab">solution.js</div>
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>Autosaved</div>
                    </div>

                    <textarea className="code-area" defaultValue={`function twoSum(nums, target) {
    // Write your code here
    const map = new Map();

    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}`} spellCheck="false"></textarea>

                    <div className="editor-footer">
                        <button className="btn btn-secondary" style={{ border: '1px solid #444', color: '#eee', background: '#333' }}>Run Code</button>
                        <button className="btn btn-primary">Submit Solution</button>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
};

export default InternWorkspace;
