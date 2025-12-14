import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import FollowButton from './FollowButton';

const ProfilePage = () => {
    const { userId } = useParams();
    const { currentUser, userProfile } = useAuth();
    const [profile, setProfile] = useState(null);
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);

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
        // Get stories from localStorage (same as HomePage)
        const savedFailures = localStorage.getItem('failures');
        if (savedFailures) {
            const allStories = JSON.parse(savedFailures);
            // Filter by authorId matching current user
            const userStories = allStories.filter(story =>
                story.authorId === targetUserId ||
                (isOwnProfile && story.authorId === currentUser?.uid)
            );
            setStories(userStories);
        }
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
