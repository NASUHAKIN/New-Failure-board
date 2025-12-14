import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CommentSection from '../CommentSection';
import VoteButton from './VoteButton';
import BookmarkButton from './BookmarkButton';
import HashtagBadge from './HashtagBadge';
import ReportModal from './ReportModal';
import { useAuth } from '../contexts/AuthContext';

const FailureList = ({ failures, onSupport, onAddComment, onReplyToComment, onEditStory, onDeleteStory, bookmarks, onToggleBookmark, onHashtagClick }) => {
    const { currentUser } = useAuth();
    const [expandedComments, setExpandedComments] = useState({});
    const [reportingStory, setReportingStory] = useState(null);

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m`;
        if (hours < 24) return `${hours}h`;
        if (days < 7) return `${days}d`;
        return date.toLocaleDateString();
    };

    const toggleComments = (id) => {
        setExpandedComments(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const isOwnStory = (story) => {
        return currentUser && story.authorId === currentUser.uid;
    };

    return (
        <>
            <div className="failure-list">
                {failures.map((failure) => (
                    <div key={failure.id} className="failure-card simple">
                        {/* Header */}
                        <div className="card-header-simple">
                            <div className="author-info">
                                {failure.authorId ? (
                                    <Link to={`/user/${failure.authorId}`} className="author-link">
                                        {failure.author || 'Anonymous'}
                                    </Link>
                                ) : (
                                    <span className="author-name">{failure.author || 'Anonymous'}</span>
                                )}
                                <span className="time-ago">
                                    · {formatTime(failure.timestamp)}
                                </span>
                                {failure.viewCount > 0 && (
                                    <span className="view-count">· {failure.viewCount} views</span>
                                )}
                            </div>

                            <div className="story-menu">
                                {isOwnStory(failure) ? (
                                    <>
                                        <button className="icon-btn" onClick={() => onEditStory(failure)} title="Edit">✏️</button>
                                        <button className="icon-btn" onClick={() => onDeleteStory(failure.id)} title="Delete">🗑️</button>
                                    </>
                                ) : (
                                    <button
                                        className="icon-btn report-btn"
                                        onClick={() => setReportingStory(failure)}
                                        title="Report"
                                    >
                                        ⚠️
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Story text */}
                        <p className="story-text">{failure.text}</p>

                        {/* Hashtags */}
                        {failure.hashtags && failure.hashtags.length > 0 && (
                            <div className="hashtags-compact">
                                {failure.hashtags.slice(0, 3).map(tag => (
                                    <HashtagBadge key={tag} tag={tag} onClick={onHashtagClick} />
                                ))}
                                {failure.hashtags.length > 3 && (
                                    <span className="more-tags">+{failure.hashtags.length - 3}</span>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="card-actions-simple">
                            <VoteButton
                                failureId={failure.id}
                                onVote={onSupport}
                                votes={failure.votes}
                            />

                            <button
                                className="comment-toggle-btn"
                                onClick={() => toggleComments(failure.id)}
                            >
                                💬 {failure.comments?.length || 0}
                            </button>

                            <BookmarkButton
                                storyId={failure.id}
                                isBookmarked={bookmarks && bookmarks.includes(failure.id)}
                                onToggle={onToggleBookmark}
                            />
                        </div>

                        {/* Comments */}
                        {expandedComments[failure.id] && (
                            <div className="comments-section-simple">
                                <CommentSection
                                    comments={failure.comments || []}
                                    onAddComment={(text) => onAddComment(failure.id, text)}
                                    onReplyToComment={(commentId, text) => onReplyToComment(failure.id, commentId, text)}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Report Modal */}
            <ReportModal
                isOpen={!!reportingStory}
                onClose={() => setReportingStory(null)}
                storyId={reportingStory?.id}
                storyText={reportingStory?.text}
            />
        </>
    );
};

export default FailureList;