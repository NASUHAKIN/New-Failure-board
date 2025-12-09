import React from 'react';

const BookmarkButton = ({ storyId, isBookmarked, onToggle }) => {
    return (
        <button
            className={`bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
            onClick={() => onToggle(storyId)}
            title={isBookmarked ? 'Remove from saved' : 'Save story'}
        >
            <span className="bookmark-icon">{isBookmarked ? '🔖' : '📑'}</span>
            <span className="bookmark-text">{isBookmarked ? 'Saved' : 'Save'}</span>
        </button>
    );
};

export default BookmarkButton;
