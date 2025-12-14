import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, limit, getDocs, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const TrendingSidebar = () => {
    const [trendingHashtags, setTrendingHashtags] = useState([]);
    const [trendingStories, setTrendingStories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTrending();
    }, []);

    const fetchTrending = async () => {
        try {
            // Get stories from last 24 hours
            const oneDayAgo = Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000));

            const storiesRef = collection(db, 'stories');
            const q = query(
                storiesRef,
                where('createdAt', '>=', oneDayAgo),
                orderBy('createdAt', 'desc'),
                orderBy('votes', 'desc'),
                limit(50)
            );

            const snapshot = await getDocs(q);
            const stories = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Calculate trending hashtags
            const hashtagCounts = {};
            stories.forEach(story => {
                (story.hashtags || []).forEach(tag => {
                    hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
                });
            });

            const sortedHashtags = Object.entries(hashtagCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([tag, count]) => ({ tag, count }));

            setTrendingHashtags(sortedHashtags);

            // Get top 5 stories by votes
            const topStories = [...stories]
                .sort((a, b) => b.votes - a.votes)
                .slice(0, 5);

            setTrendingStories(topStories);
        } catch (error) {
            console.error('Error fetching trending:', error);
            // Fallback to empty
            setTrendingHashtags([]);
            setTrendingStories([]);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="trending-sidebar">
                <div className="trending-loading">
                    <span className="loading-spinner"></span>
                    Loading...
                </div>
            </div>
        );
    }

    return (
        <div className="trending-sidebar">
            <div className="trending-section">
                <h3 className="trending-title">
                    <span className="trending-icon">🔥</span>
                    Trending Hashtags
                </h3>
                {trendingHashtags.length === 0 ? (
                    <p className="no-trending">No trending hashtags yet</p>
                ) : (
                    <div className="trending-hashtags">
                        {trendingHashtags.map(({ tag, count }) => (
                            <Link
                                key={tag}
                                to={`/?hashtag=${encodeURIComponent(tag)}`}
                                className="trending-hashtag"
                            >
                                <span className="hashtag-name">#{tag}</span>
                                <span className="hashtag-count">{count} stories</span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <div className="trending-section">
                <h3 className="trending-title">
                    <span className="trending-icon">⭐</span>
                    Top Stories Today
                </h3>
                {trendingStories.length === 0 ? (
                    <p className="no-trending">No stories yet today</p>
                ) : (
                    <div className="trending-stories">
                        {trendingStories.map((story, index) => (
                            <div key={story.id} className="trending-story-item">
                                <span className="trending-rank">{index + 1}</span>
                                <div className="trending-story-content">
                                    <p className="trending-story-text">
                                        {story.text.length > 60
                                            ? story.text.substring(0, 60) + '...'
                                            : story.text}
                                    </p>
                                    <span className="trending-story-votes">
                                        ❤️ {story.votes} supports
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrendingSidebar;
