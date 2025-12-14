import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import UserMenu from './UserMenu';
import NotificationDropdown from './NotificationDropdown';
import AuthModal from './AuthModal';

const Navbar = () => {
    const location = useLocation();
    const { currentUser } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [showAuthModal, setShowAuthModal] = useState(false);

    // Log UID for admin setup
    useEffect(() => {
        if (currentUser) {
            console.log('=================================');
            console.log('YOUR USER ID (UID):', currentUser.uid);
            console.log('Copy this UID to add isAdmin in Firestore');
            console.log('=================================');
        }
    }, [currentUser]);

    return (
        <>
            <nav className="nav-minimal">
                {/* Logo */}
                <Link to="/" className="logo-minimal">
                    FailBoard
                </Link>

                {/* Center Navigation */}
                <div className="nav-links-minimal">
                    <Link
                        to="/"
                        className={location.pathname === '/' ? 'active' : ''}
                    >
                        Home
                    </Link>
                    <Link
                        to="/leaderboard"
                        className={location.pathname === '/leaderboard' ? 'active' : ''}
                    >
                        Leaderboard
                    </Link>
                    <Link
                        to="/blog"
                        className={location.pathname.startsWith('/blog') ? 'active' : ''}
                    >
                        Blog
                    </Link>
                    <Link
                        to="/about"
                        className={location.pathname === '/about' ? 'active' : ''}
                    >
                        About
                    </Link>
                </div>

                {/* Right side */}
                <div className="nav-auth">
                    {/* Theme Toggle */}
                    <button
                        className="theme-toggle-btn"
                        onClick={toggleTheme}
                        title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    >
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>

                    {currentUser ? (
                        <>
                            <Link to="/messages" className="nav-icon-btn" title="Messages">
                                ✉️
                            </Link>
                            <Link to="/stats" className="nav-icon-btn" title="Your Stats">
                                📊
                            </Link>
                            <NotificationDropdown />
                            <UserMenu />
                        </>
                    ) : (
                        <button
                            className="btn-signin"
                            onClick={() => setShowAuthModal(true)}
                        >
                            Get Started
                        </button>
                    )}
                </div>
            </nav>

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
            />
        </>
    );
};

export default Navbar;
