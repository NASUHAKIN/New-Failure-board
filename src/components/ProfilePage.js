import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import FollowButton from './FollowButton';

const ProfilePage = () => {
    const { userId } = useParams();
    const { currentUser, userProfile, updateUserProfile } = useAuth();
    const [profile, setProfile] = useState(null);
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [emailPrefs, setEmailPrefs] = useState({
        digestEmails: true,
        notificationEmails: true
    });
    const [savingPrefs, setSavingPrefs] = useState(false);

    const targetUserId = userId || currentUser?.uid;
    const isOwnProfile = !userId || userId === currentUser?.uid;

    useEffect(() => {
        if (targetUserId) {
            fetchProfile();
            fetchUserStories();
        } else {
            setLoading(false);
        }
    }, [targetUserId]);

    useEffect(() => {
        // Load email preferences from profile
        if (profile) {
            setEmailPrefs({
                digestEmails: profile.digestEmails !== false,
                notificationEmails: profile.notificationEmails !== false
            });
        }
    }, [profile]);

    const fetchProfile = async () => {
        try {
            if (isOwnProfile && userProfile) {
                setProfile(userProfile);
            } else if (targetUserId) {
                const userRef = doc(db, 'users', targetUserId);
                const snapshot = await getDoc(userRef);
                if (snapshot.exists()) {
                    setProfile({ id: snapshot.id, ...snapshot.data() });
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
        setLoading(false);
    };

    const fetchUserStories = () => {
        const savedFailures = localStorage.getItem('failures');
        if (savedFailures) {
            const allStories = JSON.parse(savedFailures);
            const userStories = allStories.filter(story =>
                story.authorId === targetUserId ||
                (isOwnProfile && story.authorId === currentUser?.uid)
            );
            setStories(userStories);
        }
    };

    const handleSaveEmailPrefs = async () => {
        if (!currentUser) return;
        setSavingPrefs(true);
        try {
            await updateUserProfile({
                digestEmails: emailPrefs.digestEmails,
                notificationEmails: emailPrefs.notificationEmails
            });
            alert('Email preferences saved!');
        } catch (error) {
            console.error('Error saving preferences:', error);
            alert('Failed to save preferences');
        }
        setSavingPrefs(false);
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="profile-simple">
                <div className="loading-text">Loading...</div>
            </div>
        );
    }

    if (!profile && !isOwnProfile) {
        return (
            <div className="profile-simple">
                <h2>Profile not found</h2>
                <Link to="/" className="link-btn">Back to Home</Link>
            </div>
        );
    }

    const displayName = profile?.displayName || userProfile?.displayName || currentUser?.displayName || 'User';

    return (
        <div className="profile-simple">
            {/* Profile Header */}
            <div className="profile-header-simple">
                <h1>{displayName}</h1>
                {profile?.bio && <p className="profile-bio-simple">{profile.bio}</p>}
                <p className="profile-meta">Joined {formatDate(profile?.createdAt)}</p>

                <div className="profile-stats-simple">
                    <div className="stat">
                        <strong>{stories.length}</strong>
                        <span>Stories</span>
                    </div>
                    <div className="stat">
                        <strong>{profile?.followers?.length || 0}</strong>
                        <span>Followers</span>
                    </div>
                    <div className="stat">
                        <strong>{profile?.following?.length || 0}</strong>
                        <span>Following</span>
                    </div>
                </div>

                {!isOwnProfile && targetUserId && (
                    <FollowButton targetUserId={targetUserId} targetUserName={displayName} />
                )}
            </div>

            {/* Email Preferences - Only for own profile */}
            {isOwnProfile && currentUser && (
                <div className="email-preferences-section">
                    <h3>📧 Email Preferences</h3>
                    <div className="preference-options">
                        <label className="preference-toggle">
                            <input
                                type="checkbox"
                                checked={emailPrefs.digestEmails}
                                onChange={(e) => setEmailPrefs({ ...emailPrefs, digestEmails: e.target.checked })}
                            />
                            <span>Weekly Digest Emails</span>
                            <small>Get top stories every week</small>
                        </label>
                        <label className="preference-toggle">
                            <input
                                type="checkbox"
                                checked={emailPrefs.notificationEmails}
                                onChange={(e) => setEmailPrefs({ ...emailPrefs, notificationEmails: e.target.checked })}
                            />
                            <span>Notification Emails</span>
                            <small>New followers, comments, etc.</small>
                        </label>
                    </div>
                    <button
                        className="save-prefs-btn"
                        onClick={handleSaveEmailPrefs}
                        disabled={savingPrefs}
                    >
                        {savingPrefs ? 'Saving...' : 'Save Preferences'}
                    </button>
                </div>
            )}

            {/* Stories */}
            <div className="profile-stories-simple">
                <h3>Stories ({stories.length})</h3>

                {stories.length === 0 ? (
                    <div className="empty-message">
                        <p>No stories yet</p>
                        {isOwnProfile && (
                            <Link to="/" className="link-btn">Share your first story</Link>
                        )}
                    </div>
                ) : (
                    <div className="stories-list-simple">
                        {stories.map(story => (
                            <div key={story.id} className="story-item-simple">
                                <p>{story.text}</p>
                                <div className="story-stats">
                                    <span>{story.votes || 0} supports</span>
                                    <span>{story.comments?.length || 0} comments</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
