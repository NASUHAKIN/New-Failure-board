import React, { useState } from 'react';

const FailureForm = ({ addFailure }) => {
  const [text, setText] = useState('');
  const [category, setCategory] = useState('General');
  const [author, setAuthor] = useState('');
  const [isSupportRequest, setIsSupportRequest] = useState(false);

  const categories = ["General", "Coding", "Work", "Life", "Love", "Cooking"];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      addFailure({
        text,
        category,
        author: author.trim() || 'Anonymous',
        isSupportRequest
      });
      setText('');
      setCategory('General');
      setAuthor('');
      setIsSupportRequest(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="failure-form">
      <div className="form-row">
        <input
          type="text"
          className="failure-input-line"
          placeholder="Your Name (Optional)"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="category-select"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <textarea
        className="failure-input"
        placeholder="Share your failure story..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows="3"
      />

      <div className="form-footer">
        <label className="checkbox-container">
          <input
            type="checkbox"
            checked={isSupportRequest}
            onChange={(e) => setIsSupportRequest(e.target.checked)}
          />
          <span className="checkmark"></span>
          I need advice / support 🤝
        </label>
        <button type="submit" className="submit-btn">Share Story</button>
      </div>
    </form>
  );
};

export default FailureForm;