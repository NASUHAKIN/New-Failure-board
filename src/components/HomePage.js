import React, { useState, useEffect } from 'react';
import FailureForm from './FailureForm';
import FailureList from './FailureList';
import SearchBar from './SearchBar';

const HomePage = () => {
    const [sortBy, setSortBy] = useState('newest');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [showBookmarked, setShowBookmarked] = useState(false);

    // Bookmarks state
    const [bookmarks, setBookmarks] = useState(() => {
        const savedBookmarks = localStorage.getItem('bookmarks');
        return savedBookmarks ? JSON.parse(savedBookmarks) : [];
    });

    useEffect(() => {
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    }, [bookmarks]);

    const dailyPrompt = "What is a mistake you made today that taught you something?";

    const [failures, setFailures] = useState(() => {
        const savedFailures = localStorage.getItem('failures');
        if (savedFailures) {
            return JSON.parse(savedFailures);
        }
        return [
            {
                id: 1,
                text: "I tried to learn React in one day and cried.",
                author: "Anonymous",
                votes: 15,
                category: "Coding",
                timestamp: Date.now() - 100000,
                isSupportRequest: false,
                reactions: {},
                comments: [
                    { id: 1, text: "We've all been there! Keep going.", author: "DevGuru" }
                ]
            },
            {
                id: 2,
                text: "Deployed to production on a Friday evening...",
                author: "JuniorDev_99",
                votes: 42,
                category: "Work",
                timestamp: Date.now() - 200000,
                isSupportRequest: true,
                reactions: {},
                comments: []
            },
            {
                id: 3,
                text: "Sent 'Love you' to my boss instead of my wife.",
                votes: 89,
                category: "Life",
                timestamp: Date.now(),
                isSupportRequest: false,
                reactions: {},
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
            reactions: {},
            comments: []
        };
        setFailures([newFailure, ...failures]);
    };

    const handleSupport = (id) => {
        setFailures(failures.map(failure =>
            failure.id === id ? { ...failure, votes: failure.votes + 1 } : failure
        ));
    };

    const handleReaction = (id, reactionType) => {
        setFailures(failures.map(failure => {
            if (failure.id === id) {
                const currentReactions = failure.reactions || {};
                return {
                    ...failure,
                    reactions: {
                        ...currentReactions,
                        [reactionType]: (currentReactions[reactionType] || 0) + 1
                    }
                };
            }
            return failure;
        }));
    };

    const handleEditStory = (updatedStory) => {
        setFailures(failures.map(failure =>
            failure.id === updatedStory.id ? updatedStory : failure
        ));
    };

    const handleDeleteStory = (id) => {
        if (window.confirm('Are you sure you want to delete this story?')) {
            setFailures(failures.filter(failure => failure.id !== id));
        }
    };

    const handleAddComment = (failureId, commentText) => {
        setFailures(failures.map(failure => {
            if (failure.id === failureId) {
                return {
                    ...failure,
                    comments: [...failure.comments, {
                        id: Date.now(),
                        text: commentText,
                        author: "Anonymous",
                        replies: []
                    }]
                };
            }
            return failure;
        }));
    };

    const handleReplyToComment = (failureId, commentId, replyText) => {
        setFailures(failures.map(failure => {
            if (failure.id === failureId) {
                return {
                    ...failure,
                    comments: failure.comments.map(comment => {
                        if (comment.id === commentId) {
                            return {
                                ...comment,
                                replies: [...(comment.replies || []), {
                                    id: Date.now(),
                                    text: replyText,
                                    author: "Anonymous"
                                }]
                            };
                        }
                        return comment;
                    })
                };
            }
            return failure;
        }));
    };

    const handleToggleBookmark = (storyId) => {
        setBookmarks(prev => {
            if (prev.includes(storyId)) {
                return prev.filter(id => id !== storyId);
            }
            return [...prev, storyId];
        });
    };

    // Filter by search term
    const searchFilteredFailures = failures.filter(failure =>
        failure.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (failure.author && failure.author.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Filter by bookmarks if showing saved
    const bookmarkFilteredFailures = showBookmarked
        ? searchFilteredFailures.filter(f => bookmarks.includes(f.id))
        : searchFilteredFailures;

    // Filter by category
    const filteredFailures = bookmarkFilteredFailures.filter(failure =>
        selectedCategory === 'All' || failure.category === selectedCategory
    );

    const sortedFailures = [...filteredFailures].sort((a, b) => {
        if (sortBy === 'votes') return b.votes - a.votes;
        return b.timestamp - a.timestamp;
    });

    const categories = ["All", "General", "Coding", "Work", "Life", "Love", "Cooking"];
    const bookmarkCount = bookmarks.length;

    return (
        <div className="home-page">
            <div className="daily-prompt-card">
                <span className="prompt-label">💡 Daily Prompt</span>
                <p className="prompt-text">{dailyPrompt}</p>
            </div>

            <FailureForm addFailure={addFailure} />

            <SearchBar onSearch={setSearchTerm} />

            <div className="controls-section">
                <div className="category-filters">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="sort-controls">
                    <button
                        className={`sort-btn ${sortBy === 'newest' ? 'active' : ''}`}
                        onClick={() => setSortBy('newest')}
                    >
                        Newest
                    </button>
                    <button
                        className={`sort-btn ${sortBy === 'votes' ? 'active' : ''}`}
                        onClick={() => setSortBy('votes')}
                    >
                        Most Supported
                    </button>
                    <button
                        className={`sort-btn bookmark-filter ${showBookmarked ? 'active' : ''}`}
                        onClick={() => setShowBookmarked(!showBookmarked)}
                    >
                        🔖 Saved ({bookmarkCount})
                    </button>
                </div>
            </div>

            {sortedFailures.length === 0 && searchTerm && (
                <div className="no-results">
                    <p>No stories found for "{searchTerm}"</p>
                </div>
            )}

            <FailureList
                failures={sortedFailures}
                onSupport={handleSupport}
                onAddComment={handleAddComment}
                onReplyToComment={handleReplyToComment}
                onReaction={handleReaction}
                onEditStory={handleEditStory}
                onDeleteStory={handleDeleteStory}
                bookmarks={bookmarks}
                onToggleBookmark={handleToggleBookmark}
            />
        </div>
    );
};

export default HomePage;
