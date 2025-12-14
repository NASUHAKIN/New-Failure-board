import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { GamificationProvider } from './contexts/GamificationContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import BlogPage from './components/BlogPage';
import BlogPost from './components/BlogPost';
import AboutPage from './components/AboutPage';
import ProfilePage from './components/ProfilePage';
import LeaderboardPage from './components/LeaderboardPage';
import StatsPage from './components/StatsPage';
import MessagesPage from './components/MessagesPage';
import AdminPage from './components/AdminPage';
import './index.css';

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <GamificationProvider>
            <Router>
              <div className="app-wrapper">
                <Navbar />
                <main className="main-wrapper">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/blog/:id" element={<BlogPost />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/user/:userId" element={<ProfilePage />} />
                    <Route path="/leaderboard" element={<LeaderboardPage />} />
                    <Route path="/stats" element={<StatsPage />} />
                    <Route path="/messages" element={<MessagesPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </Router>
          </GamificationProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;