import React from 'react';

const REACTIONS = [
    { emoji: '❤️', label: 'love' },
    { emoji: '🫂', label: 'hug' },
    { emoji: '💪', label: 'strength' },
    { emoji: '🎯', label: 'goal' },
    { emoji: '😢', label: 'sad' }
];

const EmojiReactions = ({ reactions = {}, onReact }) => {
    const handleReaction = (label) => {
        onReact(label);
    };

    return (
        <div className="emoji-reactions">
            {REACTIONS.map(({ emoji, label }) => (
                <button
                    key={label}
                    className={`emoji-btn ${reactions[label] ? 'active' : ''}`}
                    onClick={() => handleReaction(label)}
                    title={label}
                >
                    <span className="emoji">{emoji}</span>
                    {reactions[label] > 0 && (
                        <span className="emoji-count">{reactions[label]}</span>
                    )}
                </button>
            ))}
        </div>
    );
};

export default EmojiReactions;
