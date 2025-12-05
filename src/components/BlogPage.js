import React from 'react';

const BlogPage = () => {
    const blogPosts = [
        {
            id: 1,
            title: "Why Failure is the Best Teacher",
            excerpt: "We often fear failure, but it is actually the most potent tool for growth. Here is why you should embrace your mistakes.",
            author: "Sarah J.",
            date: "Oct 12, 2023",
            readTime: "5 min read"
        },
        {
            id: 2,
            title: "5 Famous People Who Failed Before Succeeding",
            excerpt: "From J.K. Rowling to Steve Jobs, discover how the world's most successful people turned their failures into triumphs.",
            author: "Mike T.",
            date: "Oct 15, 2023",
            readTime: "7 min read"
        },
        {
            id: 3,
            title: "How to Recover from a Coding Disaster",
            excerpt: "Did you just delete the production database? Don't panic. Here is a step-by-step guide to fixing your mess and your reputation.",
            author: "Alex Code",
            date: "Oct 20, 2023",
            readTime: "4 min read"
        }
    ];

    return (
        <div className="blog-page">
            <h2 className="section-title">Latest from the Blog</h2>
            <div className="blog-grid">
                {blogPosts.map(post => (
                    <article key={post.id} className="blog-card">
                        <div className="blog-content">
                            <div className="blog-meta">
                                <span className="blog-date">{post.date}</span>
                                <span className="blog-read-time">{post.readTime}</span>
                            </div>
                            <h3 className="blog-title">{post.title}</h3>
                            <p className="blog-excerpt">{post.excerpt}</p>
                            <div className="blog-footer">
                                <span className="blog-author">By {post.author}</span>
                                <button className="read-more-btn">Read More →</button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
};

export default BlogPage;
