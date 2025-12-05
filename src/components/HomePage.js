import React, { useState, useEffect } from 'react';
import FailureForm from './FailureForm';
import FailureList from './FailureList';

const HomePage = () => {
    const [sortBy, setSortBy] = useState('newest');
    const [selectedCategory, setSelectedCategory] = useState('All');

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
                comments: []
            },
            {
                id: 3,
                text: "Sent 'Love you' to my boss instead of my wife.",
                votes: 89,
                category: "Life",
                timestamp: Date.now(),
                isSupportRequest: false,
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

    const handleSupport = (id) => {
        setFailures(failures.map(failure =>
            failure.id === id ? { ...failure, votes: failure.votes + 1 } : failure
        ));
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

    const filteredFailures = failures.filter(failure =>
        selectedCategory === 'All' || failure.category === selectedCategory
    );

    const sortedFailures = [...filteredFailures].sort((a, b) => {
        if (sortBy === 'votes') return b.votes - a.votes;
        return b.timestamp - a.timestamp;
    });

    const categories = ["All", "General", "Coding", "Work", "Life", "Love", "Cooking"];

    return (
        <div className="home-page">
            <div className="daily-prompt-card">
                <span className="prompt-label">💡 Daily Prompt</span>
                <p className="prompt-text">{dailyPrompt}</p>
            </div>

            <FailureForm addFailure={addFailure} />

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
                </div>
            </div>

            <FailureList
                failures={sortedFailures}
                onSupport={handleSupport}
                onAddComment={handleAddComment}
                onReplyToComment={handleReplyToComment}
            />
        </div>
    );
};

export default HomePage;
