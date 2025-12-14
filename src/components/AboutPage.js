import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
    return (
        <div className="about-modern">
            {/* Hero Section */}
            <section className="about-hero-modern">
                <div className="hero-badge">About Us</div>
                <h1>
                    Where <span className="gradient-text">Failure</span> Becomes
                    <span className="gradient-text"> Growth</span>
                </h1>
                <p className="hero-subtitle">
                    We're building the world's first support community for sharing failures
                    and learning from each other's mistakes.
                </p>
            </section>

            {/* Stats Section */}
            <section className="about-stats">
                <div className="stat-item">
                    <span className="stat-number">10K+</span>
                    <span className="stat-label">Stories Shared</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                    <span className="stat-number">50K+</span>
                    <span className="stat-label">Supports Given</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                    <span className="stat-number">5K+</span>
                    <span className="stat-label">Community Members</span>
                </div>
            </section>

            {/* Mission Cards */}
            <section className="about-values">
                <h2>What We Believe</h2>
                <div className="values-grid">
                    <div className="value-card">
                        <div className="value-icon">🛡️</div>
                        <h3>Safe Space</h3>
                        <p>Share anonymously. No judgment. Just support from people who understand.</p>
                    </div>
                    <div className="value-card">
                        <div className="value-icon">💪</div>
                        <h3>Resilience</h3>
                        <p>Every failure is a lesson. We help you see the growth in every setback.</p>
                    </div>
                    <div className="value-card">
                        <div className="value-icon">🤝</div>
                        <h3>Community</h3>
                        <p>You're not alone. Connect with others who've been through similar struggles.</p>
                    </div>
                    <div className="value-card">
                        <div className="value-icon">✨</div>
                        <h3>Authenticity</h3>
                        <p>Real stories from real people. No filters, no highlight reels.</p>
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="about-story-modern">
                <div className="story-content">
                    <h2>Why We Exist</h2>
                    <p>
                        In a world obsessed with success stories and perfect Instagram feeds,
                        we forget that everyone fails. CEOs, athletes, artists, developers —
                        we all stumble.
                    </p>
                    <p>
                        <strong>FailBoard</strong> was born from a simple idea: what if we
                        normalized failure? What if sharing our mistakes became as natural
                        as celebrating our wins?
                    </p>
                    <p>
                        Every story shared here helps someone feel less alone. Every
                        "me too" comment creates connection. That's the power of
                        vulnerability.
                    </p>
                </div>
            </section>

            {/* CTA Section */}
            <section className="about-cta">
                <h2>Ready to Share Your Story?</h2>
                <p>Join thousands who've turned their failures into inspiration.</p>
                <div className="cta-buttons">
                    <Link to="/" className="cta-primary">Share Your Story</Link>
                    <Link to="/blog" className="cta-secondary">Read Stories</Link>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
