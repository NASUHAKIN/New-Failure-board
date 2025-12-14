import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

const FollowButton = ({ targetUserId, targetUserName }) => {
    const { currentUser, userProfile, isFollowing, followUser, unfollowUser } = useAuth();
    const { createNotification } = useNotifications();
    const [loading, setLoading] = useState(false);

    if (!currentUser || currentUser.uid === targetUserId) {
        return null;
    }

    const following = isFollowing(targetUserId);

    const handleClick = async () => {
        setLoading(true);
        try {
            if (following) {
                await unfollowUser(targetUserId);
            } else {
                await followUser(targetUserId);
                // Send notification
                await createNotification({
                    userId: targetUserId,
                    type: 'follow',
                    fromUserId: currentUser.uid,
                    fromUserName: userProfile?.displayName || currentUser.displayName
                });
            }
        } catch (error) {
            console.error('Follow error:', error);
        }
        setLoading(false);
    };

    return (
        <button
            className={`follow-btn ${following ? 'following' : ''}`}
            onClick={handleClick}
            disabled={loading}
        >
            {loading ? '...' : (following ? 'Following' : 'Follow')}
        </button>
    );
};

export default FollowButton;
