import React from 'react';
import { Link } from 'react-router-dom';

const HashtagBadge = ({ tag, onClick }) => {
    const handleClick = (e) => {
        if (onClick) {
            e.preventDefault();
            onClick(tag);
        }
    };

    return (
        <Link
            to={`/?hashtag=${encodeURIComponent(tag)}`}
            className="hashtag-badge"
            onClick={handleClick}
        >
            #{tag}
        </Link>
    );
};

// Parse hashtags from text
export const parseHashtags = (text) => {
    const hashtagRegex = /#(\w+)/g;
    const matches = text.match(hashtagRegex);
    if (!matches) return [];
    return [...new Set(matches.map(tag => tag.slice(1).toLowerCase()))];
};

// Render text with clickable hashtags
export const renderTextWithHashtags = (text, onHashtagClick) => {
    const parts = text.split(/(#\w+)/g);
    return parts.map((part, index) => {
        if (part.startsWith('#')) {
            const tag = part.slice(1).toLowerCase();
            return (
                <HashtagBadge
                    key={index}
                    tag={tag}
                    onClick={onHashtagClick}
                />
            );
        }
        return part;
    });
};

export default HashtagBadge;
