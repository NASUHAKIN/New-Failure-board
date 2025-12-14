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
                        className="nav-icon-btn"
                        onClick={toggleTheme}
                        title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    >
                        {theme === 'dark' ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="5" />
                                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                            </svg>
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                            </svg>
                        )}
                    </button>

                    {currentUser ? (
                        <>
                            <Link to="/messages" className="nav-icon-btn" title="Messages">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                                </svg>
                            </Link>
                            <Link to="/stats" className="nav-icon-btn" title="Your Stats">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 20V10M12 20V4M6 20v-6" />
                                </svg>
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
