import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import BlogPage from './components/BlogPage';
import BlogPost from './components/BlogPost';
import AboutPage from './components/AboutPage';
import './index.css';

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <header className="app-header">
          <h1>Failure Board</h1>
          <p className="subtitle">Share. Learn. Support.</p>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:id" element={<BlogPost />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;