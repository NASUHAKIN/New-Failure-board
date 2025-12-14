import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const AdminPage = () => {
    const { currentUser, userProfile } = useAuth();
    const [activeTab, setActiveTab] = useState('reports');
    const [reports, setReports] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Check if user is admin - with debug
    const isAdmin = userProfile?.isAdmin === true;

    // Debug log
    console.log('AdminPage - userProfile:', userProfile);
    console.log('AdminPage - isAdmin:', isAdmin);

    useEffect(() => {
        if (isAdmin) {
            if (activeTab === 'reports') {
                loadReports();
            } else {
                loadUsers();
            }
        }
    }, [isAdmin, activeTab]);

    const loadReports = async () => {
        setLoading(true);
        try {
            const reportsRef = collection(db, 'reports');
            const q = query(reportsRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const reportList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setReports(reportList);
        } catch (error) {
            console.error('Error loading reports:', error);
        }
        setLoading(false);
    };

    const loadUsers = async () => {
        setLoading(true);
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const userList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(userList);
        } catch (error) {
            console.error('Error loading users:', error);
        }
        setLoading(false);
    };

    const handleReportAction = async (reportId, action) => {
        try {
            const reportRef = doc(db, 'reports', reportId);

            if (action === 'resolve') {
                await updateDoc(reportRef, { status: 'resolved' });
            } else if (action === 'dismiss') {
                await updateDoc(reportRef, { status: 'dismissed' });
            } else if (action === 'delete') {
                await deleteDoc(reportRef);
            }

            loadReports();
        } catch (error) {
            console.error('Error handling report:', error);
        }
    };

    const toggleUserBan = async (userId, currentlyBanned) => {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                isBanned: !currentlyBanned
            });
            loadUsers();
        } catch (error) {
            console.error('Error toggling ban:', error);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    if (!currentUser) {
        return (
            <div className="page-clean">
                <h1>Admin Panel</h1>
                <p>Please sign in to access admin features.</p>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="page-clean">
                <h1>Access Denied</h1>
                <p>You don't have permission to access this page.</p>
                <Link to="/" className="link-btn">Back to Home</Link>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <h1>Admin Panel</h1>

            <div className="admin-tabs">
                <button
                    className={activeTab === 'reports' ? 'active' : ''}
                    onClick={() => setActiveTab('reports')}
                >
                    Reports ({reports.filter(r => r.status === 'pending').length})
                </button>
                <button
                    className={activeTab === 'users' ? 'active' : ''}
                    onClick={() => setActiveTab('users')}
                >
                    Users ({users.length})
                </button>
            </div>

            {loading ? (
                <p className="loading-text">Loading...</p>
            ) : (
                <>
                    {activeTab === 'reports' && (
                        <div className="admin-section">
                            <h2>Content Reports</h2>
                            {reports.length === 0 ? (
                                <p className="empty-message">No reports</p>
                            ) : (
                                <div className="reports-list">
                                    {reports.map(report => (
                                        <div key={report.id} className={`report-card ${report.status}`}>
                                            <div className="report-header">
                                                <span className={`status-badge ${report.status}`}>
                                                    {report.status}
                                                </span>
                                                <span className="report-date">{formatDate(report.createdAt)}</span>
                                            </div>
                                            <p className="report-reason"><strong>Reason:</strong> {report.reason}</p>
                                            {report.additionalInfo && (
                                                <p className="report-info">{report.additionalInfo}</p>
                                            )}
                                            <p className="report-story"><strong>Story:</strong> {report.storyText}</p>

                                            {report.status === 'pending' && (
                                                <div className="report-actions">
                                                    <button
                                                        className="btn-resolve"
                                                        onClick={() => handleReportAction(report.id, 'resolve')}
                                                    >
                                                        Resolve
                                                    </button>
                                                    <button
                                                        className="btn-dismiss"
                                                        onClick={() => handleReportAction(report.id, 'dismiss')}
                                                    >
                                                        Dismiss
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="admin-section">
                            <h2>User Management</h2>
                            <div className="users-table">
                                <div className="table-header">
                                    <span>Name</span>
                                    <span>Email</span>
                                    <span>Joined</span>
                                    <span>Status</span>
                                    <span>Actions</span>
                                </div>
                                {users.map(user => (
                                    <div key={user.id} className="table-row">
                                        <span>{user.displayName || 'N/A'}</span>
                                        <span>{user.email || 'N/A'}</span>
                                        <span>{formatDate(user.createdAt)}</span>
                                        <span className={user.isBanned ? 'banned' : 'active'}>
                                            {user.isBanned ? 'Banned' : 'Active'}
                                        </span>
                                        <span>
                                            <button
                                                className={user.isBanned ? 'btn-unban' : 'btn-ban'}
                                                onClick={() => toggleUserBan(user.id, user.isBanned)}
                                            >
                                                {user.isBanned ? 'Unban' : 'Ban'}
                                            </button>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminPage;
