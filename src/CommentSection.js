import React, { useState } from 'react';

const CommentSection = ({ comments, onAddComment, onReplyToComment }) => {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null); // ID of comment being replied to
  const [replyText, setReplyText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  const handleReplySubmit = (e, commentId) => {
    e.preventDefault();
    if (replyText.trim()) {
      onReplyToComment(commentId, replyText);
      setReplyText('');
      setReplyingTo(null);
    }
  };

  return (
    <div className="comment-section">
      <h4 className="comments-title">Community Support ({comments.length})</h4>

      <div className="comments-list">
        {comments.map((comment) => (
          <div key={comment.id} className="comment-item-container">
            <div className="comment-item">
              <span className="comment-author">{comment.author || 'Anonymous'}:</span>
              <span className="comment-text">{comment.text}</span>
              <button
                className="reply-btn"
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              >
                Reply
              </button>
            </div>

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="replies-list">
                {comment.replies.map(reply => (
                  <div key={reply.id} className="reply-item">
                    <span className="reply-author">{reply.author || 'Anonymous'}:</span>
                    <span className="reply-text">{reply.text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Input */}
            {replyingTo === comment.id && (
              <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="reply-form">
                <input
                  type="text"
                  className="reply-input"
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="reply-submit-btn">Reply</button>
              </form>
            )}
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