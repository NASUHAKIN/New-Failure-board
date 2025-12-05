import React from 'react';

const AboutPage = () => {
    return (
        <div className="about-page">
            <section className="about-hero">
                <h2 className="section-title">About Failure Board</h2>
                <p className="about-intro">
                    We believe that failure is not the opposite of success; it's part of success.
                    Failure Board is a safe space to share your mistakes, learn from others, and realize you are not alone.
                </p>
            </section>

            <section className="about-mission">
                <h3>Our Mission</h3>
                <div className="mission-grid">
                    <div className="mission-card">
                        <span className="mission-icon">🛡️</span>
                        <h4>Safe Space</h4>
                        <p>An anonymous environment where you can be vulnerable without judgment.</p>
                    </div>
                    <div className="mission-card">
                        <span className="mission-icon">🌱</span>
                        <h4>Growth</h4>
                        <p>Turning stumbling blocks into stepping stones for personal development.</p>
                    </div>
                    <div className="mission-card">
                        <span className="mission-icon">🤝</span>
                        <h4>Community</h4>
                        <p>Supporting each other through the tough times because we've all been there.</p>
                    </div>
                </div>
            </section>

            <section className="about-story">
                <h3>Why We Started</h3>
                <p>
                    In a world curated for perfection on social media, we wanted to build a place for reality.
                    Everyone fails. CEOs, artists, developers, parents. But we rarely talk about it.
                    By sharing our failures, we normalize them and take away their power to shame us.
                </p>
            </section>
        </div>
    );
};

export default AboutPage;
