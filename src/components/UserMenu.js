import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const UserMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const { currentUser, userProfile, logout } = useAuth();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            setIsOpen(false);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const displayName = userProfile?.displayName || currentUser?.displayName || 'User';

    return (
        <div className="user-menu-container" ref={menuRef}>
            <button
                className="user-menu-trigger-simple"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{displayName}</span>
                <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
                <div className="user-menu-dropdown">
                    <div className="user-menu-header">
                        <span className="user-menu-name">{displayName}</span>
                        <span className="user-menu-email">{currentUser?.email}</span>
                    </div>

                    <div className="user-menu-divider"></div>

                    <Link
                        to="/profile"
                        className="user-menu-item"
                        onClick={() => setIsOpen(false)}
                    >
                        My Profile
                    </Link>

                    <Link
                        to="/profile?tab=stories"
                        className="user-menu-item"
                        onClick={() => setIsOpen(false)}
                    >
                        My Stories
                    </Link>

                    <Link
                        to="/profile?tab=saved"
                        className="user-menu-item"
                        onClick={() => setIsOpen(false)}
                    >
                        Saved
                    </Link>

                    <div className="user-menu-divider"></div>

                    <button className="user-menu-item logout-item" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
