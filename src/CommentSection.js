import React, { useState } from 'react';

const CommentSection = ({ comments, onAddComment }) => {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  return (
    <div className="comment-section">
      <h4 className="comments-title">Community Support ({comments.length})</h4>

      <div className="comments-list">
        {comments.map((comment, index) => (
          <div key={index} className="comment-item">
            <span className="comment-author">{comment.author || 'Anonymous'}:</span>
            <span className="comment-text">{comment.text}</span>
          </div>
        ))}
        {comments.length === 0 && <p className="no-comments">Be the first to show support!</p>}
      </div>

      <form onSubmit={handleSubmit} className="comment-form">
        <input
          type="text"
          className="comment-input"
          placeholder="Write a supportive comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button type="submit" className="comment-btn">Post</button>
      </form>
    </div>
  );
};

export default CommentSection;