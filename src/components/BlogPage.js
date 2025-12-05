import React from 'react';
import { Link } from 'react-router-dom';
import blogPosts from '../data/blogData';

const BlogPage = () => {
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
                                <Link to={`/blog/${post.id}`} className="read-more-btn">Read More →</Link>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
};

export default BlogPage;
