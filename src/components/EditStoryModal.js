import React, { useState } from 'react';

const EditStoryModal = ({ story, onSave, onClose }) => {
    const [text, setText] = useState(story.text);
    const [category, setCategory] = useState(story.category || 'General');

    const categories = ["General", "Coding", "Work", "Life", "Love", "Cooking"];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim()) {
            onSave({ ...story, text, category });
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Edit Story</h3>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="category-select modal-select"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <textarea
                        className="modal-textarea"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows="4"
                        placeholder="Your story..."
                    />
                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-save">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditStoryModal;
