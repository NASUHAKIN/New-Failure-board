import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import defaultBlogPosts from '../data/blogData';

const CATEGORIES = [
    { id: 'all', name: 'Tümü' },
    { id: 'career', name: 'Kariyer' },
    { id: 'coding', name: 'Yazılım' },
    { id: 'mindset', name: 'Mindset' },
    { id: 'life', name: 'Hayat' }
];

const BlogPage = () => {
    const { userProfile } = useAuth();
    const isAdmin = userProfile?.isAdmin === true;

    const [posts, setPosts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingPost, setEditingPost] = useState(null);

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = () => {
        const savedPosts = localStorage.getItem('blogPosts');
        if (savedPosts) {
            setPosts(JSON.parse(savedPosts));
        } else {
            // Add categories to default posts
            const postsWithCategories = defaultBlogPosts.map((post, index) => ({
                ...post,
                category: ['mindset', 'career', 'coding', 'life', 'mindset'][index % 5],
                likes: Math.floor(Math.random() * 50) + 10,
                likedBy: [],
                comments: []
            }));
            setPosts(postsWithCategories);
            localStorage.setItem('blogPosts', JSON.stringify(postsWithCategories));
        }
    };

    const savePosts = (newPosts) => {
        setPosts(newPosts);
        localStorage.setItem('blogPosts', JSON.stringify(newPosts));
    };

    const handleLike = (postId) => {
        const updated = posts.map(post => {
            if (post.id === postId) {
                return { ...post, likes: (post.likes || 0) + 1 };
            }
            return post;
        });
        savePosts(updated);
    };

    const handleDeletePost = (postId) => {
        if (!window.confirm('Bu yazıyı silmek istediğinden emin misin?')) return;
        const updated = posts.filter(p => p.id !== postId);
        savePosts(updated);
    };

    const filteredPosts = posts.filter(post => {
        const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const featuredPost = filteredPosts[0];
    const otherPosts = filteredPosts.slice(1);

    return (
        <div className="blog-page-enhanced">
            {/* Header */}
            <header className="blog-header">
                <h1>Blog</h1>
                <p>Başarısızlıktan öğrenmek hakkında makaleler</p>

                {isAdmin && (
                    <button
                        className="add-post-btn"
                        onClick={() => setShowAddModal(true)}
                    >
                        + Yeni Yazı
                    </button>
                )}
            </header>

            {/* Search & Filters */}
            <div className="blog-controls">
                <input
                    type="text"
                    placeholder="Ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="blog-search"
                />

                <div className="category-filters">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat.id)}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Featured Post */}
            {featuredPost && (
                <article className="featured-post">
                    <div className="featured-content">
                        <span className="category-tag">{CATEGORIES.find(c => c.id === featuredPost.category)?.name || 'Genel'}</span>
                        <h2>{featuredPost.title}</h2>
                        <p>{featuredPost.excerpt}</p>
                        <div className="featured-meta">
                            <span>{featuredPost.author}</span>
                            <span>•</span>
                            <span>{featuredPost.date}</span>
                            <span>•</span>
                            <span>{featuredPost.readTime}</span>
                        </div>
                        <div className="featured-actions">
                            <Link to={`/blog/${featuredPost.id}`} className="read-more-btn">
                                Devamını Oku →
                            </Link>
                            <button className="like-btn" onClick={() => handleLike(featuredPost.id)}>
                                ❤️ {featuredPost.likes || 0}
                            </button>
                            {isAdmin && (
                                <>
                                    <button className="edit-btn" onClick={() => setEditingPost(featuredPost)}>
                                        ✏️
                                    </button>
                                    <button className="delete-btn" onClick={() => handleDeletePost(featuredPost.id)}>
                                        🗑️
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </article>
            )}

            {/* Blog Grid */}
            <div className="blog-grid-enhanced">
                {otherPosts.map(post => (
                    <article key={post.id} className="blog-card-enhanced">
                        <span className="category-tag small">{CATEGORIES.find(c => c.id === post.category)?.name || 'Genel'}</span>
                        <h3>{post.title}</h3>
                        <p>{post.excerpt}</p>
                        <div className="blog-card-meta">
                            <span>{post.author}</span>
                            <span>{post.readTime}</span>
                        </div>
                        <div className="blog-card-actions">
                            <Link to={`/blog/${post.id}`} className="read-more-link">
                                Devamını Oku →
                            </Link>
                            <button className="like-btn-small" onClick={() => handleLike(post.id)}>
                                ❤️ {post.likes || 0}
                            </button>
                            {isAdmin && (
                                <button className="delete-btn-small" onClick={() => handleDeletePost(post.id)}>
                                    🗑️
                                </button>
                            )}
                        </div>
                    </article>
                ))}
            </div>

            {filteredPosts.length === 0 && (
                <div className="no-posts">
                    <p>Sonuç bulunamadı</p>
                </div>
            )}

            {/* Add/Edit Modal */}
            {(showAddModal || editingPost) && (
                <BlogPostModal
                    post={editingPost}
                    onClose={() => { setShowAddModal(false); setEditingPost(null); }}
                    onSave={(postData) => {
                        if (editingPost) {
                            const updated = posts.map(p => p.id === editingPost.id ? { ...p, ...postData } : p);
                            savePosts(updated);
                        } else {
                            const newPost = {
                                id: Date.now(),
                                ...postData,
                                date: new Date().toLocaleDateString('tr-TR'),
                                likes: 0,
                                likedBy: [],
                                comments: []
                            };
                            savePosts([newPost, ...posts]);
                        }
                        setShowAddModal(false);
                        setEditingPost(null);
                    }}
                />
            )}
        </div>
    );
};

// Modal Component for Add/Edit
const BlogPostModal = ({ post, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        title: post?.title || '',
        excerpt: post?.excerpt || '',
        content: post?.content || '',
        author: post?.author || 'Admin',
        category: post?.category || 'mindset',
        readTime: post?.readTime || '5 min read'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.content.trim()) return;
        onSave(formData);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content blog-modal" onClick={(e) => e.stopPropagation()}>
                <h2>{post ? 'Yazıyı Düzenle' : 'Yeni Blog Yazısı'}</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Başlık"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Özet"
                        value={formData.excerpt}
                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                        required
                    />
                    <textarea
                        placeholder="İçerik (HTML destekler)"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        rows={10}
                        required
                    />
                    <div className="form-row">
                        <input
                            type="text"
                            placeholder="Yazar"
                            value={formData.author}
                            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        />
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="career">Kariyer</option>
                            <option value="coding">Yazılım</option>
                            <option value="mindset">Mindset</option>
                            <option value="life">Hayat</option>
                        </select>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>İptal</button>
                        <button type="submit" className="btn-save">Kaydet</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BlogPage;
