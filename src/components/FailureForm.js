import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { parseHashtags } from './HashtagBadge';

const FailureForm = ({ addFailure }) => {
  const { currentUser, userProfile } = useAuth();
  const [text, setText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (text.trim()) {
      const hashtags = parseHashtags(text);
      const authorName = currentUser
        ? (userProfile?.displayName || currentUser.displayName)
        : 'Anonymous';

      addFailure({
        text,
        category: 'General',
        author: authorName,
        authorId: currentUser?.uid || null,
        isSupportRequest: false,
        hashtags
      });

      setText('');
      setIsExpanded(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="failure-form-simple">
      <div className="form-input-wrapper">
        <textarea
          className="story-input"
          placeholder={isExpanded ? "Share your failure story... Use #hashtags!" : "What went wrong today? Share your story..."}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          rows={isExpanded ? 4 : 2}
        />
      </div>

      {(isExpanded || text.length > 0) && (
        <div className="form-actions-simple">
          <span className="char-count">{text.length}/500</span>
          <button
            type="submit"
            className="submit-btn-simple"
            disabled={!text.trim()}
          >
            Share Story
          </button>
        </div>
      )}
    </form>
  );
};

export default FailureForm;