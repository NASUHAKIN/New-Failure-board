import React from 'react';
import CommentSection from '../CommentSection';
import VoteButton from './VoteButton';

const FailureList = ({ failures, onSupport, onAddComment, onReplyToComment }) => {
    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="failure-list">
            {failures.map((failure) => (
                <div key={failure.id} className="failure-card">
                    <div className="failure-content">
                        <div className="failure-header">
                            <div className="header-left">
                                <span className={`category-badge ${(failure.category || 'General').toLowerCase()}`}>
                                    {failure.category || 'General'}
                                </span>
                                <span className="author-name">by {failure.author || 'Anonymous'}</span>
                            </div>
                            <span className="timestamp">{formatTime(failure.timestamp)}</span>
                        </div>

                        {failure.isSupportRequest && (
                            <div className="support-request-badge">
                                🤝 Seeking Advice & Support
                            </div>
                        )}

                        <p className="failure-text">{failure.text}</p>

                        <div className="failure-actions">
                            <VoteButton failureId={failure.id} onVote={onSupport} votes={failure.votes} />
                        </div>
                    </div>

                    <div className="failure-comments">
                        <CommentSection
                            comments={failure.comments || []}
                            onAddComment={(text) => onAddComment(failure.id, text)}
                            onReplyToComment={(commentId, text) => onReplyToComment(failure.id, commentId, text)}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FailureList;