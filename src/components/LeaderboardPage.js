import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Link } from 'react-router-dom';

const LeaderboardPage = () => {
    const [topSupporters, setTopSupporters] = useState([]);
    const [topStorytellers, setTopStorytellers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboards();
    }, []);

    const fetchLeaderboards = async () => {
        try {
            // Get users sorted by totalVotes received
            const usersRef = collection(db, 'users');
            const supportersQuery = query(usersRef, orderBy('totalVotesReceived', 'desc'), limit(10));
            const supportersSnapshot = await getDocs(supportersQuery);

            const supporters = supportersSnapshot.docs.map((doc, index) => ({
                id: doc.id,
                rank: index + 1,
                ...doc.data()
            }));
            setTopSupporters(supporters);

            // Get users sorted by story count
            const storytellerQuery = query(usersRef, orderBy('storyCount', 'desc'), limit(10));
            const storytellerSnapshot = await getDocs(storytellerQuery);

            const storytellers = storytellerSnapshot.docs.map((doc, index) => ({
                id: doc.id,
                rank: index + 1,
                ...doc.data()
            }));
            setTopStorytellers(storytellers);

        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        }
        setLoading(false);
    };

    const getRankEmoji = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return rank;
    };

    if (loading) {
        return (
            <div className="page-clean">
                <div className="loading-text">Loading leaderboard...</div>
            </div>
        );
    }

    return (
        <div className="page-clean">
            <header className="page-header-clean">
                <h1>Leaderboard</h1>
                <p>Top contributors in our community</p>
            </header>

            <div className="leaderboard-sections">
                {/* Top Supported */}
                <div className="leaderboard-section">
                    <h2>Most Supported</h2>
                    <p className="section-subtitle">Users who received the most support</p>

                    {topSupporters.length > 0 ? (
                        <div className="leaderboard-list">
                            {topSupporters.map(user => (
                                <Link
                                    key={user.id}
                                    to={`/user/${user.id}`}
                                    className="leaderboard-item"
                                >
                                    <span className="rank">{getRankEmoji(user.rank)}</span>
                                    <span className="name">{user.displayName || 'Anonymous'}</span>
                                    <span className="score">{user.totalVotesReceived || 0} supports</span>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="empty-message">No data yet</p>
                    )}
                </div>

                {/* Top Storytellers */}
                <div className="leaderboard-section">
                    <h2>Top Storytellers</h2>
                    <p className="section-subtitle">Users who shared the most stories</p>

                    {topStorytellers.length > 0 ? (
                        <div className="leaderboard-list">
                            {topStorytellers.map(user => (
                                <Link
                                    key={user.id}
                                    to={`/user/${user.id}`}
                                    className="leaderboard-item"
                                >
                                    <span className="rank">{getRankEmoji(user.rank)}</span>
                                    <span className="name">{user.displayName || 'Anonymous'}</span>
                                    <span className="score">{user.storyCount || 0} stories</span>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="empty-message">No data yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeaderboardPage;
