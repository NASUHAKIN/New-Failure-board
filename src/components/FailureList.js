import React, { useState } from 'react';
import CommentSection from '../CommentSection';
import VoteButton from './VoteButton';
import EmojiReactions from './EmojiReactions';
import ShareButtons from './ShareButtons';
import EditStoryModal from './EditStoryModal';
import BookmarkButton from './BookmarkButton';

const FailureList = ({ failures, onSupport, onAddComment, onReplyToComment, onReaction, onEditStory, onDeleteStory, bookmarks, onToggleBookmark }) => {
    const [editingStory, setEditingStory] = useState(null);

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
                            <div className="header-right">
                                <span className="timestamp">{formatTime(failure.timestamp)}</span>
                                <div className="story-actions-menu">
                                    <button
                                        className="action-btn edit-btn"
                                        onClick={() => setEditingStory(failure)}
                                        title="Edit story"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="action-btn delete-btn"
                                        onClick={() => onDeleteStory(failure.id)}
                                        title="Delete story"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>

                        {failure.isSupportRequest && (
                            <div className="support-request-badge">
                                🤝 Seeking Advice & Support
                            </div>
                        )}

                        <p className="failure-text">{failure.text}</p>

                        <div className="failure-actions">
                            <EmojiReactions
                                reactions={failure.reactions || {}}
                                onReact={(reactionType) => onReaction(failure.id, reactionType)}
                            />
                            <div className="action-buttons-right">
                                <BookmarkButton
                                    storyId={failure.id}
                                    isBookmarked={bookmarks && bookmarks.includes(failure.id)}
                                    onToggle={onToggleBookmark}
                                />
                                <VoteButton failureId={failure.id} onVote={onSupport} votes={failure.votes} />
                            </div>
                        </div>

                        <ShareButtons failure={failure} />
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

            {editingStory && (
                <EditStoryModal
                    story={editingStory}
                    onSave={onEditStory}
                    onClose={() => setEditingStory(null)}
                />
            )}
        </div>
    );
};

export default FailureList;