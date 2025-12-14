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

            alert(`Digest gönderildi!\n✅ Başarılı: ${successCount}\n❌ Hata: ${errorCount}`);
        } catch (error) {
            console.error('Error sending digest:', error);
            alert('Digest gönderilirken hata oluştu: ' + error.message);
        }
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
                    <div className="stats-grid">
                        <div className="stat-card">
                            <h3>{stats.totalUsers}</h3>
                            <p>Toplam Kullanıcı</p>
                        </div>
                        <div className="stat-card">
                            <h3>{stats.totalStories}</h3>
                            <p>Toplam Hikaye</p>
                        </div>
                        <div className="stat-card warning">
                            <h3>{stats.pendingReports}</h3>
                            <p>Bekleyen Şikayet</p>
                        </div>
                    </div>

                    <div className="quick-actions">
                        <h3>Hızlı İşlemler</h3>
                        <button onClick={() => setActiveTab('reports')}>
                            Şikayetleri İncele →
                        </button>
                        <button onClick={() => setActiveTab('stories')}>
                            Hikayeleri Yönet →
                        </button>
                        <button onClick={sendWeeklyDigest} className="digest-btn">
                            📧 Haftalık Özet Gönder
                        </button>
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
