import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { sendWeeklyDigest, isEmailConfigured } from '../services/emailService';

const DigestPage = () => {
    const { userProfile } = useAuth();
    const isAdmin = userProfile?.isAdmin === true;

    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [topStories, setTopStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [results, setResults] = useState(null);

    useEffect(() => {
        if (isAdmin) {
            loadData();
        }
    }, [isAdmin]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load users
            const usersSnap = await getDocs(collection(db, 'users'));
            const usersList = usersSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                digestOptIn: doc.data().digestEmails !== false // Default to true
            })).filter(u => u.email);
            setUsers(usersList);
            // Auto-select only users who opted in
            setSelectedUsers(usersList.filter(u => u.digestOptIn).map(u => u.id));

            // Load top stories
            const savedFailures = localStorage.getItem('failures');
            if (savedFailures) {
                const stories = JSON.parse(savedFailures)
                    .sort((a, b) => (b.votes || 0) - (a.votes || 0))
                    .slice(0, 5);
                setTopStories(stories);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
        setLoading(false);
    };

    const toggleUser = (userId) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const selectAll = () => {
        setSelectedUsers(users.map(u => u.id));
    };

    const deselectAll = () => {
        setSelectedUsers([]);
    };

    const handleSendDigest = async () => {
        if (selectedUsers.length === 0) {
            alert('Please select at least one recipient.');
            return;
        }

        if (!isEmailConfigured()) {
            alert('Email service is not configured.');
            return;
        }

        if (!window.confirm(`Send digest to ${selectedUsers.length} user(s)?`)) return;

        setSending(true);
        setResults(null);

        let successCount = 0;
        let errorCount = 0;
        const resultsList = [];

        for (const userId of selectedUsers) {
            const user = users.find(u => u.id === userId);
            if (user && user.email) {
                try {
                    const result = await sendWeeklyDigest(
                        user.email,
                        user.displayName || 'User',
                        topStories,
                        { totalStories: topStories.length, totalUsers: users.length }
                    );
                    if (result.success) {
                        successCount++;
                        resultsList.push({ email: user.email, status: 'success' });
                    } else {
                        errorCount++;
                        resultsList.push({ email: user.email, status: 'error', error: result.error });
                    }
                } catch (error) {
                    errorCount++;
                    resultsList.push({ email: user.email, status: 'error', error: error.message });
                }
            }
        }

        setResults({ successCount, errorCount, list: resultsList });
        setSending(false);
    };

    if (!isAdmin) {
        return (
            <div className="page-clean">
                <h1>Access Denied</h1>
                <p>You don't have permission to access this page.</p>
                <Link to="/" className="link-btn">Go Home</Link>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="digest-page">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="digest-page">
            <header className="digest-header">
                <Link to="/admin" className="back-link">← Back to Admin</Link>
                <h1>📧 Email Digest</h1>
                <p>Send weekly digest to selected users</p>
            </header>

            <div className="digest-content">
                {/* Left: Recipients */}
                <div className="digest-recipients">
                    <div className="section-header">
                        <h3>Recipients ({selectedUsers.length}/{users.length})</h3>
                        <div className="select-actions">
                            <button onClick={selectAll}>Select All</button>
                            <button onClick={deselectAll}>Deselect All</button>
                        </div>
                    </div>

                    <div className="users-list">
                        {users.map(user => (
                            <label key={user.id} className={`user-checkbox ${selectedUsers.includes(user.id) ? 'selected' : ''} ${!user.digestOptIn ? 'opted-out' : ''}`}>
                                <input
                                    type="checkbox"
                                    checked={selectedUsers.includes(user.id)}
                                    onChange={() => toggleUser(user.id)}
                                />
                                <div className="user-info">
                                    <span className="user-name">
                                        {user.displayName || 'Anonymous'}
                                        {!user.digestOptIn && <span className="opt-out-badge">Opted Out</span>}
                                    </span>
                                    <span className="user-email">{user.email}</span>
                                </div>
                            </label>
                        ))}
                        {users.length === 0 && (
                            <p className="empty-message">No users with email found</p>
                        )}
                    </div>
                </div>

                {/* Right: Preview */}
                <div className="digest-preview">
                    <h3>Email Preview</h3>
                    <div className="preview-card">
                        <div className="preview-header">
                            <strong>Subject:</strong> FailBoard Weekly Digest
                        </div>
                        <div className="preview-body">
                            <p>Hello <em>[User Name]</em>,</p>
                            <p>Here are this week's top stories:</p>

                            <div className="preview-stories">
                                {topStories.map((story, index) => (
                                    <div key={story.id} className="preview-story">
                                        <span className="story-rank">#{index + 1}</span>
                                        <span className="story-text">{story.text?.substring(0, 60)}...</span>
                                        <span className="story-votes">❤️ {story.votes || 0}</span>
                                    </div>
                                ))}
                                {topStories.length === 0 && (
                                    <p className="empty-message">No stories to include</p>
                                )}
                            </div>

                            <p>Visit FailBoard to share your story!</p>
                        </div>
                    </div>

                    <button
                        className="send-digest-btn"
                        onClick={handleSendDigest}
                        disabled={sending || selectedUsers.length === 0}
                    >
                        {sending ? 'Sending...' : `Send to ${selectedUsers.length} User(s)`}
                    </button>

                    {/* Results */}
                    {results && (
                        <div className="digest-results">
                            <h4>Results</h4>
                            <p className="results-summary">
                                ✅ Success: {results.successCount} | ❌ Failed: {results.errorCount}
                            </p>
                            <div className="results-list">
                                {results.list.map((r, i) => (
                                    <div key={i} className={`result-item ${r.status}`}>
                                        <span>{r.email}</span>
                                        <span className={`status-badge ${r.status}`}>
                                            {r.status === 'success' ? '✓' : '✗'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DigestPage;
