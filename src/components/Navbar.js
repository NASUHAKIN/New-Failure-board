import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const location = useLocation();

    return (
        <nav className="navbar">
            <div className="nav-logo">
                <Link to="/">Failure Board</Link>
            </div>
            <div className="nav-links">
                <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
                <Link to="/blog" className={location.pathname === '/blog' ? 'active' : ''}>Blog</Link>
            </div>
        </nav>
    );
};

export default Navbar;
