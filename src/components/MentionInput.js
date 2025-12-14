import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const MentionInput = ({ value, onChange, placeholder, onMention }) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [mentionSearch, setMentionSearch] = useState('');
    const [cursorPosition, setCursorPosition] = useState(0);
    const inputRef = useRef(null);

    useEffect(() => {
        if (mentionSearch.length >= 2) {
            searchUsers(mentionSearch);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [mentionSearch]);

    const searchUsers = async (searchTerm) => {
        try {
            const usersRef = collection(db, 'users');
            const q = query(
                usersRef,
                where('displayNameLower', '>=', searchTerm.toLowerCase()),
                where('displayNameLower', '<=', searchTerm.toLowerCase() + '\uf8ff'),
                limit(5)
            );
            const snapshot = await getDocs(q);
            const users = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setSuggestions(users);
            setShowSuggestions(users.length > 0);
        } catch (error) {
            console.error('Error searching users:', error);
        }
    };

    const handleChange = (e) => {
        const text = e.target.value;
        const cursor = e.target.selectionStart;
        setCursorPosition(cursor);
        onChange(text);

        // Check for @ mention
        const textBeforeCursor = text.substring(0, cursor);
        const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

        if (mentionMatch) {
            setMentionSearch(mentionMatch[1]);
        } else {
            setMentionSearch('');
            setShowSuggestions(false);
        }
    };

    const selectUser = (user) => {
        const textBeforeCursor = value.substring(0, cursorPosition);
        const textAfterCursor = value.substring(cursorPosition);

        // Replace @search with @username
        const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
        if (mentionMatch) {
            const newTextBefore = textBeforeCursor.slice(0, -mentionMatch[0].length);
            const newText = newTextBefore + `@${user.displayName} ` + textAfterCursor;
            onChange(newText);

            if (onMention) {
                onMention(user);
            }
        }

        setShowSuggestions(false);
        setMentionSearch('');
        inputRef.current?.focus();
    };

    return (
        <div className="mention-input-container">
            <textarea
                ref={inputRef}
                className="mention-textarea"
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                rows={3}
            />

            {showSuggestions && (
                <div className="mention-suggestions">
                    {suggestions.map(user => (
                        <button
                            key={user.id}
                            className="mention-suggestion"
                            onClick={() => selectUser(user)}
                            type="button"
                        >
                            <span className="suggestion-name">{user.displayName}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MentionInput;
