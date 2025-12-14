import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import FailureForm from './FailureForm';
import FailureList from './FailureList';
import EmptyState from './EmptyState';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

const HomePage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { currentUser, userProfile } = useAuth();
    const { createNotification } = useNotifications();

    const [sortBy, setSortBy] = useState('newest');
    const [searchTerm, setSearchTerm] = useState('');
    const [showBookmarked, setShowBookmarked] = useState(false);
    const [selectedHashtag, setSelectedHashtag] = useState(searchParams.get('hashtag') || '');

    const [bookmarks, setBookmarks] = useState(() => {
        const savedBookmarks = localStorage.getItem('bookmarks');
        return savedBookmarks ? JSON.parse(savedBookmarks) : [];
    });

    useEffect(() => {
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    }, [bookmarks]);

    useEffect(() => {
        const hashtag = searchParams.get('hashtag');
        if (hashtag) setSelectedHashtag(hashtag);
    }, [searchParams]);

    const [failures, setFailures] = useState(() => {
        const savedFailures = localStorage.getItem('failures');
        if (savedFailures) return JSON.parse(savedFailures);
        return [
            {
                id: 1,
                text: "I tried to learn React in one day and cried.",
                author: "Anonymous",
                votes: 15,
                timestamp: Date.now() - 100000,
                hashtags: ['coding'],
                comments: [{ id: 1, text: "We've all been there!", author: "DevGuru" }]
            },
            {
                id: 2,
                text: "Deployed to production on a Friday evening...",
                author: "JuniorDev",
                votes: 42,
                timestamp: Date.now() - 200000,
                hashtags: ['work'],
                comments: []
            },
            {
                id: 3,
                text: "Sent 'Love you' to my boss instead of my wife.",
                author: "Anonymous",
                votes: 89,
                timestamp: Date.now(),
                hashtags: ['life'],
                comments: []
            }
        ];
    });

    useEffect(() => {
        localStorage.setItem('failures', JSON.stringify(failures));
    }, [failures]);

    const addFailure = (newFailureData) => {
        const newFailure = {
            id: Date.now(),
            ...newFailureData,
            votes: 0,
            timestamp: Date.now(),
            comments: []
        };
        setFailures([newFailure, ...failures]);
    };

    const handleSupport = async (id) => {
        const failure = failures.find(f => f.id === id);
        setFailures(failures.map(f => f.id === id ? { ...f, votes: f.votes + 1 } : f));

        if (currentUser && failure?.authorId && failure.authorId !== currentUser.uid) {
            try {
                await createNotification({
                    userId: failure.authorId,
                    type: 'vote',
                    fromUserId: currentUser.uid,
                    fromUserName: userProfile?.displayName || currentUser.displayName,
                    storyId: id,
                    storyText: failure.text
                });
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };

    const handleAddComment = async (id, text) => {
        const failure = failures.find(f => f.id === id);
        const newComment = {
            id: Date.now(),
            text,
            author: currentUser ? (userProfile?.displayName || currentUser.displayName) : 'Anonymous',
            authorId: currentUser?.uid || null,
            timestamp: Date.now()
        };

        setFailures(failures.map(f =>
            f.id === id ? { ...f, comments: [...(f.comments || []), newComment] } : f
        ));

        if (currentUser && failure?.authorId && failure.authorId !== currentUser.uid) {
            try {
                await createNotification({
                    userId: failure.authorId,
                    type: 'comment',
                    fromUserId: currentUser.uid,
                    fromUserName: userProfile?.displayName || currentUser.displayName,
                    storyId: id,
                    storyText: failure.text.substring(0, 50)
                });
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };

    const handleReplyToComment = (storyId, commentId, text) => {
        const reply = {
            id: Date.now(),
            text,
            author: currentUser ? (userProfile?.displayName || currentUser.displayName) : 'Anonymous',
            timestamp: Date.now()
        };

        setFailures(failures.map(f => {
            if (f.id === storyId) {
                const updatedComments = (f.comments || []).map(c =>
                    c.id === commentId ? { ...c, replies: [...(c.replies || []), reply] } : c
                );
                return { ...f, comments: updatedComments };
            }
            return f;
        }));
    };

    const handleEditStory = (updatedStory) => {
        setFailures(failures.map(f => f.id === updatedStory.id ? { ...f, text: updatedStory.text } : f));
    };

    const handleDeleteStory = (id) => {
        if (window.confirm('Delete this story?')) {
            setFailures(failures.filter(f => f.id !== id));
        }
    };

    const handleToggleBookmark = (storyId) => {
        setBookmarks(prev => prev.includes(storyId) ? prev.filter(id => id !== storyId) : [...prev, storyId]);
    };

    const handleHashtagClick = (hashtag) => {
        setSelectedHashtag(hashtag);
        setSearchParams({ hashtag });
    };

    const clearHashtagFilter = () => {
        setSelectedHashtag('');
        setSearchParams({});
    };

    // Filtering
    let filteredFailures = [...failures];
    if (searchTerm) {
        filteredFailures = filteredFailures.filter(f =>
            f.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.author?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    if (selectedHashtag) {
        filteredFailures = filteredFailures.filter(f =>
            f.hashtags?.includes(selectedHashtag.toLowerCase())
        );
    }
    if (showBookmarked) {
        filteredFailures = filteredFailures.filter(f => bookmarks.includes(f.id));
    }

    const sortedFailures = [...filteredFailures].sort((a, b) => {
        if (sortBy === 'votes') return b.votes - a.votes;
        return b.timestamp - a.timestamp;
    });

    return (
        <div className="page-clean">
            {/* Header */}
            <header className="page-header-clean">
                <h1>Share Your Failures</h1>
                <p>Learn from mistakes. Support each other.</p>
            </header>

            {/* Form */}
            <FailureForm addFailure={addFailure} />

            {/* Controls */}
            <div className="controls-clean">
                <input
                    type="text"
                    className="search-clean"
                    placeholder="Search stories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <div className="tabs-clean">
                    <button
                        className={sortBy === 'newest' && !showBookmarked ? 'active' : ''}
                        onClick={() => { setSortBy('newest'); setShowBookmarked(false); }}
                    >
                        New
                    </button>
                    <button
                        className={sortBy === 'votes' && !showBookmarked ? 'active' : ''}
                        onClick={() => { setSortBy('votes'); setShowBookmarked(false); }}
                    >
                        Top
                    </button>
                    <button
                        className={showBookmarked ? 'active' : ''}
                        onClick={() => setShowBookmarked(!showBookmarked)}
                    >
                        Saved
                    </button>
                </div>
            </div>

            {/* Filter indicator */}
            {selectedHashtag && (
                <div className="filter-tag">
                    #{selectedHashtag}
                    <button onClick={clearHashtagFilter}>×</button>
                </div>
            )}

            {/* Content */}
            {sortedFailures.length === 0 ? (
                <EmptyState
                    type={searchTerm ? 'search' : showBookmarked ? 'bookmarks' : selectedHashtag ? 'hashtag' : 'stories'}
                    onAction={() => { setSearchTerm(''); setShowBookmarked(false); clearHashtagFilter(); }}
                />
            ) : (
                <FailureList
                    failures={sortedFailures}
                    onSupport={handleSupport}
                    onAddComment={handleAddComment}
                    onReplyToComment={handleReplyToComment}
                    onEditStory={handleEditStory}
                    onDeleteStory={handleDeleteStory}
                    bookmarks={bookmarks}
                    onToggleBookmark={handleToggleBookmark}
                    onHashtagClick={handleHashtagClick}
                />
            )}
        </div>
    );
};

export default HomePage;
