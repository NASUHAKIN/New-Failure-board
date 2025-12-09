import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        onSearch(value);
    };

    const clearSearch = () => {
        setSearchTerm('');
        onSearch('');
    };

    return (
        <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
                type="text"
                className="search-input"
                placeholder="Search stories..."
                value={searchTerm}
                onChange={handleChange}
            />
            {searchTerm && (
                <button className="search-clear" onClick={clearSearch}>
                    ✕
                </button>
            )}
        </div>
    );
};

export default SearchBar;
