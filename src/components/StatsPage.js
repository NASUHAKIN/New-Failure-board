import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const StatsPage = () => {
    const { currentUser, userProfile } = useAuth();
    const [stats, setStats] = useState({
        storiesThisWeek: 0,
        votesReceived: 0,
        votesGiven: 0,
        commentsWritten: 0,
        viewsReceived: 0
    });

    useEffect(() => {
        if (currentUser) {
            // Load stats from localStorage for demo
            const savedStats = localStorage.getItem(`stats_${currentUser.uid}`);
            if (savedStats) {
                setStats(JSON.parse(savedStats));
            }
            calculateWeeklyStats();
        }
    }, [currentUser]);

    const calculateWeeklyStats = () => {
        const failures = JSON.parse(localStorage.getItem('failures') || '[]');
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

        // Stories shared this week by current user
        const myStoriesThisWeek = failures.filter(f =>
            f.authorId === currentUser?.uid &&
            f.timestamp > weekAgo
        ).length;

        // Total votes received on my stories
        const myTotalVotes = failures
            .filter(f => f.authorId === currentUser?.uid)
            .reduce((sum, f) => sum + (f.votes || 0), 0);

        // Total views on my stories
        const myTotalViews = failures
            .filter(f => f.authorId === currentUser?.uid)
            .reduce((sum, f) => sum + (f.viewCount || 0), 0);

        setStats({
            storiesThisWeek: myStoriesThisWeek,
            votesReceived: myTotalVotes,
            votesGiven: userProfile?.votesGiven || 0,
            commentsWritten: userProfile?.commentsWritten || 0,
            viewsReceived: myTotalViews
        });
    };

    if (!currentUser) {
        return (
            <div className="page-clean">
                <header className="page-header-clean">
                    <h1>Your Stats</h1>
                    <p>Sign in to see your weekly statistics</p>
                </header>
            </div>
        );
    }

    return (
        <div className="page-clean">
            <header className="page-header-clean">
                <h1>Your Stats</h1>
                <p>Your activity over the past week</p>
            </header>

            <div className="stats-dashboard">
                <div className="stat-card">
                    <div className="stat-value">{stats.storiesThisWeek}</div>
                    <div className="stat-title">Stories This Week</div>
                </div>

                <div className="stat-card">
                    <div className="stat-value">{stats.votesReceived}</div>
                    <div className="stat-title">Supports Received</div>
                </div>

                <div className="stat-card">
                    <div className="stat-value">{stats.votesGiven}</div>
                    <div className="stat-title">Supports Given</div>
                </div>

                <div className="stat-card">
                    <div className="stat-value">{stats.viewsReceived}</div>
                    <div className="stat-title">Story Views</div>
                </div>
            </div>

            <div className="stats-tips">
                <h3>Tips to grow</h3>
                <ul>
                    <li>Share stories regularly to build your audience</li>
                    <li>Use hashtags to reach more people</li>
                    <li>Support others to get support back</li>
                </ul>
            </div>
        </div>
    );
};

export default StatsPage;
