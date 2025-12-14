import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const AdminPage = () => {
    const { currentUser, userProfile } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [reports, setReports] = useState([]);
    const [users, setUsers] = useState([]);
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalUsers: 0, totalStories: 0, pendingReports: 0 });

    const isAdmin = userProfile?.isAdmin === true;

    useEffect(() => {
        if (isAdmin) {
            loadDashboardStats();
            if (activeTab === 'reports') loadReports();
            else if (activeTab === 'users') loadUsers();
            else if (activeTab === 'stories') loadStories();
        }
    }, [isAdmin, activeTab]);

    const loadDashboardStats = async () => {
        try {
            const [usersSnap, reportsSnap] = await Promise.all([
                getDocs(collection(db, 'users')),
                getDocs(collection(db, 'reports'))
            ]);

            const savedFailures = localStorage.getItem('failures');
            const storiesCount = savedFailures ? JSON.parse(savedFailures).length : 0;
            const pendingReports = reportsSnap.docs.filter(d => d.data().status === 'pending').length;

            setStats({
                totalUsers: usersSnap.size,
                totalStories: storiesCount,
                pendingReports
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const sendWeeklyDigest = async () => {
        if (!window.confirm('Tüm kullanıcılara haftalık özet emaili gönderilecek. Onaylıyor musun?')) return;

        try {
            const { sendWeeklyDigest: sendDigest, isEmailConfigured } = await import('../services/emailService');

            if (!isEmailConfigured()) {
                alert('Email servisi yapılandırılmamış!');
                return;
            }

            // Get users
            const usersSnap = await getDocs(collection(db, 'users'));
            const usersList = usersSnap.docs.map(doc => doc.data());

            // Get top stories
            const savedFailures = localStorage.getItem('failures');
            const allStories = savedFailures ? JSON.parse(savedFailures) : [];
            const topStories = allStories
                .sort((a, b) => (b.votes || 0) - (a.votes || 0))
                .slice(0, 5);

            let successCount = 0;
            let errorCount = 0;

            for (const user of usersList) {
                if (user.email) {
                    const result = await sendDigest(
                        user.email,
                        user.displayName || 'Kullanıcı',
                        topStories,
                        { totalStories: allStories.length, totalUsers: usersList.length }
                    );
                    if (result.success) successCount++;
                    else errorCount++;
                }
            }

            alert(`Digest sent!\n✅ Success: ${successCount}\n❌ Failed: ${errorCount}`);
        } catch (error) {
            console.error('Error sending digest:', error);
            alert('Error sending digest: ' + error.message);
        }
    };

    const exportData = () => {
        const data = {
            stories: JSON.parse(localStorage.getItem('failures') || '[]'),
            blogPosts: JSON.parse(localStorage.getItem('blogPosts') || '[]'),
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `failboard-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const clearAllStories = () => {
        if (!window.confirm('⚠️ WARNING: This will delete ALL stories permanently. Are you sure?')) return;
        if (!window.confirm('This action cannot be undone. Type "DELETE" mentally and click OK to confirm.')) return;

        localStorage.setItem('failures', JSON.stringify([]));
        setStories([]);
        loadDashboardStats();
        alert('All stories have been deleted.');
    };

    const loadReports = async () => {
        setLoading(true);
        try {
            const reportsRef = collection(db, 'reports');
            const q = query(reportsRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error('Error loading reports:', error);
        }
        setLoading(false);
    };

    const loadUsers = async () => {
        setLoading(true);
        try {
            const usersRef = collection(db, 'users');
            const snapshot = await getDocs(usersRef);
            setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error('Error loading users:', error);
        }
        setLoading(false);
    };

    const loadStories = () => {
        setLoading(true);
        const savedFailures = localStorage.getItem('failures');
        if (savedFailures) {
            setStories(JSON.parse(savedFailures));
        }
        setLoading(false);
    };

    const handleReportAction = async (reportId, action, storyId) => {
        try {
            const reportRef = doc(db, 'reports', reportId);

            if (action === 'resolve') {
                await updateDoc(reportRef, { status: 'resolved' });
            } else if (action === 'dismiss') {
                await updateDoc(reportRef, { status: 'dismissed' });
            } else if (action === 'delete-story') {
                // Delete the reported story from localStorage
                const savedFailures = localStorage.getItem('failures');
                if (savedFailures) {
                    const failures = JSON.parse(savedFailures);
                    const updated = failures.filter(f => f.id !== storyId);
                    localStorage.setItem('failures', JSON.stringify(updated));
                }
                await updateDoc(reportRef, { status: 'resolved', storyDeleted: true });
            }

            loadReports();
            loadDashboardStats();
        } catch (error) {
            console.error('Error handling report:', error);
        }
    };

    const deleteStory = (storyId) => {
        if (!window.confirm('Bu hikayeyi silmek istediğinden emin misin?')) return;

        const savedFailures = localStorage.getItem('failures');
        if (savedFailures) {
            const failures = JSON.parse(savedFailures);
            const updated = failures.filter(f => f.id !== storyId);
            localStorage.setItem('failures', JSON.stringify(updated));
            setStories(updated);
            loadDashboardStats();
        }
    };

    const toggleUserBan = async (userId, currentlyBanned) => {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, { isBanned: !currentlyBanned });
            loadUsers();
        } catch (error) {
            console.error('Error toggling ban:', error);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('tr-TR') + ' ' + date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    };

    if (!currentUser) {
        return (
            <div className="page-clean">
                <h1>Admin Panel</h1>
                <p>Giriş yapmanız gerekiyor.</p>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="page-clean">
                <h1>Erişim Engellendi</h1>
                <p>Bu sayfaya erişim yetkiniz yok.</p>
                <Link to="/" className="link-btn">Ana Sayfaya Dön</Link>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <h1>Admin Panel</h1>

            {/* Tabs */}
            <div className="admin-tabs">
                <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
                    Dashboard
                </button>
                <button className={activeTab === 'reports' ? 'active' : ''} onClick={() => setActiveTab('reports')}>
                    Şikayetler ({stats.pendingReports})
                </button>
                <button className={activeTab === 'stories' ? 'active' : ''} onClick={() => setActiveTab('stories')}>
                    Hikayeler ({stats.totalStories})
                </button>
                <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
                    Kullanıcılar ({stats.totalUsers})
                </button>
            </div>

            {/* Dashboard */}
            {activeTab === 'dashboard' && (
                <div className="admin-dashboard">
                    {/* Stats Grid */}
                    <div className="stats-grid">
                        <div className="stat-card" onClick={() => setActiveTab('users')}>
                            <h3>{stats.totalUsers}</h3>
                            <p>Total Users</p>
                        </div>
                        <div className="stat-card" onClick={() => setActiveTab('stories')}>
                            <h3>{stats.totalStories}</h3>
                            <p>Total Stories</p>
                        </div>
                        <div className="stat-card warning" onClick={() => setActiveTab('reports')}>
                            <h3>{stats.pendingReports}</h3>
                            <p>Pending Reports</p>
                        </div>
                    </div>

                    {/* Quick Actions Grid */}
                    <div className="admin-actions-grid">
                        <div className="action-card" onClick={() => setActiveTab('reports')}>
                            <span className="action-icon">⚠️</span>
                            <h4>Review Reports</h4>
                            <p>Handle user complaints</p>
                        </div>
                        <div className="action-card" onClick={() => setActiveTab('stories')}>
                            <span className="action-icon">📖</span>
                            <h4>Manage Stories</h4>
                            <p>Edit or delete content</p>
                        </div>
                        <div className="action-card" onClick={() => setActiveTab('users')}>
                            <span className="action-icon">👥</span>
                            <h4>Manage Users</h4>
                            <p>Ban or view users</p>
                        </div>
                        <Link to="/admin/digest" className="action-card">
                            <span className="action-icon">📧</span>
                            <h4>Send Digest</h4>
                            <p>Weekly email to all</p>
                        </Link>
                        <div className="action-card" onClick={exportData}>
                            <span className="action-icon">📥</span>
                            <h4>Export Data</h4>
                            <p>Download all data</p>
                        </div>
                        <div className="action-card danger" onClick={clearAllStories}>
                            <span className="action-icon">🗑️</span>
                            <h4>Clear Stories</h4>
                            <p>Delete all stories</p>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="recent-activity">
                        <h3>Recent Stories</h3>
                        <div className="activity-list">
                            {stories.slice(0, 5).map(story => (
                                <div key={story.id} className="activity-item">
                                    <span className="activity-author">{story.author}</span>
                                    <span className="activity-text">{story.text?.substring(0, 50)}...</span>
                                    <span className="activity-stats">❤️ {story.votes || 0}</span>
                                </div>
                            ))}
                            {stories.length === 0 && <p className="empty-message">No stories yet</p>}
                        </div>
                    </div>
                </div>
            )}

            {/* Reports */}
            {activeTab === 'reports' && (
                <div className="admin-section">
                    <h2>Şikayetler</h2>
                    {loading ? (
                        <p className="loading-text">Yükleniyor...</p>
                    ) : reports.length === 0 ? (
                        <p className="empty-message">Şikayet yok</p>
                    ) : (
                        <div className="reports-list">
                            {reports.map(report => (
                                <div key={report.id} className={`report-card ${report.status}`}>
                                    <div className="report-header">
                                        <span className={`status-badge ${report.status}`}>
                                            {report.status === 'pending' ? 'Bekliyor' :
                                                report.status === 'resolved' ? 'Çözüldü' : 'Reddedildi'}
                                        </span>
                                        <span className="report-date">{formatDate(report.createdAt)}</span>
                                    </div>

                                    <p className="report-reason"><strong>Sebep:</strong> {report.reason}</p>
                                    {report.additionalInfo && (
                                        <p className="report-info"><strong>Detay:</strong> {report.additionalInfo}</p>
                                    )}

                                    <div className="report-story">
                                        <strong>Şikayet Edilen Hikaye:</strong>
                                        <p>"{report.storyText?.substring(0, 200)}..."</p>
                                    </div>

                                    {report.status === 'pending' && (
                                        <div className="report-actions">
                                            <button className="btn-danger" onClick={() => handleReportAction(report.id, 'delete-story', report.storyId)}>
                                                Hikayeyi Sil
                                            </button>
                                            <button className="btn-resolve" onClick={() => handleReportAction(report.id, 'resolve')}>
                                                Şikayeti Kapat
                                            </button>
                                            <button className="btn-dismiss" onClick={() => handleReportAction(report.id, 'dismiss')}>
                                                Reddet
                                            </button>
                                        </div>
                                    )}

                                    {report.storyDeleted && (
                                        <p className="deleted-notice">✓ Hikaye silindi</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Stories */}
            {activeTab === 'stories' && (
                <div className="admin-section">
                    <h2>Tüm Hikayeler</h2>
                    {loading ? (
                        <p className="loading-text">Yükleniyor...</p>
                    ) : stories.length === 0 ? (
                        <p className="empty-message">Hikaye yok</p>
                    ) : (
                        <div className="stories-admin-list">
                            {stories.map(story => (
                                <div key={story.id} className="story-admin-card">
                                    <div className="story-admin-header">
                                        <span className="story-author">{story.author}</span>
                                        <span className="story-date">{new Date(story.timestamp).toLocaleDateString('tr-TR')}</span>
                                    </div>
                                    <p className="story-text">{story.text}</p>
                                    <div className="story-admin-footer">
                                        <span>{story.votes || 0} destek</span>
                                        <span>{story.comments?.length || 0} yorum</span>
                                        <button className="btn-danger-small" onClick={() => deleteStory(story.id)}>
                                            Sil
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Users */}
            {activeTab === 'users' && (
                <div className="admin-section">
                    <h2>Kullanıcılar</h2>
                    {loading ? (
                        <p className="loading-text">Yükleniyor...</p>
                    ) : (
                        <div className="users-admin-list">
                            {users.map(user => (
                                <div key={user.id} className={`user-admin-card ${user.isBanned ? 'banned' : ''}`}>
                                    <div className="user-info">
                                        <strong>{user.displayName || 'İsimsiz'}</strong>
                                        <span>{user.email}</span>
                                    </div>
                                    <div className="user-meta">
                                        <span>Kayıt: {formatDate(user.createdAt)}</span>
                                        {user.isAdmin && <span className="admin-badge">Admin</span>}
                                        {user.isBanned && <span className="banned-badge">Engelli</span>}
                                    </div>
                                    <div className="user-actions">
                                        {!user.isAdmin && (
                                            <button
                                                className={user.isBanned ? 'btn-unban' : 'btn-ban'}
                                                onClick={() => toggleUserBan(user.id, user.isBanned)}
                                            >
                                                {user.isBanned ? 'Engeli Kaldır' : 'Engelle'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminPage;
