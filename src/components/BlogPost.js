import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const BlogPost = () => {
    const { id } = useParams();
    const { currentUser, userProfile } = useAuth();
    const [post, setPost] = useState(null);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPost();
    }, [id]);

    const loadPost = () => {
        const savedPosts = localStorage.getItem('blogPosts');
        if (savedPosts) {
            const posts = JSON.parse(savedPosts);
            const foundPost = posts.find(p => p.id === parseInt(id));
            setPost(foundPost);
        }
        setLoading(false);
    };

    const handleLike = () => {
        const savedPosts = localStorage.getItem('blogPosts');
        if (savedPosts) {
            const posts = JSON.parse(savedPosts);
            const updated = posts.map(p => {
                if (p.id === parseInt(id)) {
                    return { ...p, likes: (p.likes || 0) + 1 };
                }
                return p;
            });
            localStorage.setItem('blogPosts', JSON.stringify(updated));
            setPost({ ...post, likes: (post.likes || 0) + 1 });
        }
    };

    const handleAddComment = (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        const newComment = {
            id: Date.now(),
            text: comment,
            author: currentUser ? (userProfile?.displayName || currentUser.displayName || 'Anonymous') : 'Anonymous',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };

        const savedPosts = localStorage.getItem('blogPosts');
        if (savedPosts) {
            const posts = JSON.parse(savedPosts);
            const updated = posts.map(p => {
                if (p.id === parseInt(id)) {
                    return { ...p, comments: [...(p.comments || []), newComment] };
                }
                return p;
            });
            localStorage.setItem('blogPosts', JSON.stringify(updated));
            setPost({ ...post, comments: [...(post.comments || []), newComment] });
        }

        setComment('');
    };

    const handleShare = (platform) => {
        const url = window.location.href;
        const text = `${post.title} - FailBoard Blog`;

        const urls = {
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
            whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
            substack: `https://substack.com/notes/new?body=${encodeURIComponent(text + '\n\n' + url)}`
        };

        window.open(urls[platform], '_blank');
    };

    if (loading) {
        return (
            <div className="blog-post-container">
                <p>Loading...</p>
            </div>
        );
    }

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
                        <span className="blog-author">{post.author}</span>
                    </div>
                </header>

                <div
                    className="blog-post-content"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Actions */}
                <div className="blog-post-actions">
                    <button className="like-btn-large" onClick={handleLike}>
                        ❤️ {post.likes || 0} Likes
                    </button>

                    <div className="share-buttons">
                        <span>Share:</span>
                        <button onClick={() => handleShare('twitter')}>𝕏</button>
                        <button onClick={() => handleShare('linkedin')}>in</button>
                        <button onClick={() => handleShare('whatsapp')}>📱</button>
                        <button onClick={() => handleShare('substack')} className="substack-btn">S</button>
                    </div>
                </div>

                {/* Comments */}
                <section className="comments-section">
                    <h3>Comments ({post.comments?.length || 0})</h3>

                    <form className="comment-form" onSubmit={handleAddComment}>
                        <textarea
                            placeholder="Write a comment..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={3}
                        />
                        <button type="submit" disabled={!comment.trim()}>
                            Post Comment
                        </button>
                    </form>

                    <div className="comments-list">
                        {(post.comments || []).length === 0 ? (
                            <p className="no-comments">No comments yet. Be the first to comment!</p>
                        ) : (
                            post.comments.map(c => (
                                <div key={c.id} className="comment-item">
                                    <div className="comment-header">
                                        <strong>{c.author}</strong>
                                        <span>{c.date}</span>
                                    </div>
                                    <p>{c.text}</p>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </article>
        </div>
    );
};

export default BlogPost;
