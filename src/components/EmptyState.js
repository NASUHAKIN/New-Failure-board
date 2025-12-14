import React from 'react';

const EmptyState = ({ type = 'stories', onAction }) => {
    const content = {
        stories: {
            emoji: '🌟',
            title: 'No stories yet!',
            subtitle: 'Every failure is a step toward success',
            description: 'Be the first to share your story and inspire others.',
            buttonText: 'Share Your First Story',
            buttonEmoji: '✨'
        },
        search: {
            emoji: '🔍',
            title: 'No results found',
            subtitle: 'Try a different search term',
            description: 'We couldn\'t find any stories matching your search.',
            buttonText: 'Clear Search',
            buttonEmoji: '🔄'
        },
        bookmarks: {
            emoji: '🔖',
            title: 'No saved stories',
            subtitle: 'Start building your collection',
            description: 'Save stories that inspire you by clicking the bookmark icon.',
            buttonText: 'Explore Stories',
            buttonEmoji: '🚀'
        },
        hashtag: {
            emoji: '#️⃣',
            title: 'No stories with this hashtag',
            subtitle: 'Be the trendsetter!',
            description: 'Start a new conversation by sharing a story with this topic.',
            buttonText: 'Share a Story',
            buttonEmoji: '💡'
        }
    };

    const { emoji, title, subtitle, description, buttonText, buttonEmoji } = content[type] || content.stories;

    return (
        <div className="empty-state">
            <div className="empty-state-icon">{emoji}</div>
            <h3 className="empty-state-title">{title}</h3>
            <p className="empty-state-subtitle">{subtitle}</p>
            <p className="empty-state-description">{description}</p>
            {onAction && (
                <button className="empty-state-btn" onClick={onAction}>
                    {buttonEmoji} {buttonText}
                </button>
            )}
            <div className="empty-state-decoration">
                <span className="decoration-dot"></span>
                <span className="decoration-dot"></span>
                <span className="decoration-dot"></span>
            </div>
        </div>
    );
};

export default EmptyState;
