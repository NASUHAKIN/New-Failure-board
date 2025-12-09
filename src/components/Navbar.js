import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
    const location = useLocation();

    return (
        <nav className="navbar">
            <div className="nav-logo">
                <Link to="/">
                    <img src="/logo.png" alt="Failure Board Logo" className="logo-img" />
                    <span className="logo-text">Failure Board</span>
                </Link>
            </div>
            <div className="nav-links">
                <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
                <Link to="/blog" className={location.pathname.startsWith('/blog') ? 'active' : ''}>Blog</Link>
                <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>About</Link>
                <ThemeToggle />
            </div>
        </nav>
    );
};

export default Navbar;
