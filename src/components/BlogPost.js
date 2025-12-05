import React from 'react';
import { useParams, Link } from 'react-router-dom';
import blogPosts from '../data/blogData';

const BlogPost = () => {
    const { id } = useParams();
    const post = blogPosts.find(p => p.id === parseInt(id));

    if (!post) {
        return (
            <div className="blog-post-container">
                <h2>Post not found</h2>
                <Link to="/blog" className="back-link">← Back to Blog</Link>
            </div>
        );
    }

    return (
        <div className="blog-post-container">
            <Link to="/blog" className="back-link">← Back to Blog</Link>

            <article className="blog-post-full">
                <header className="blog-post-header">
                    <h1 className="blog-post-title">{post.title}</h1>
                    <div className="blog-meta">
                        <span>{post.date}</span>
                        <span className="separator">•</span>
                        <span>{post.readTime}</span>
                        <span className="separator">•</span>
                        <span className="blog-author">By {post.author}</span>
                    </div>
                </header>

                <div
                    className="blog-post-content"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />
            </article>
        </div>
    );
};

export default BlogPost;
