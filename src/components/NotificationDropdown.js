import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { Link } from 'react-router-dom';

const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'vote': return '❤️';
            case 'comment': return '💬';
            case 'reply': return '↩️';
            case 'follow': return '👤';
            default: return '🔔';
        }
    };

    const getNotificationText = (notification) => {
        switch (notification.type) {
            case 'vote':
                return `${notification.fromUserName} supported your story`;
            case 'comment':
                return `${notification.fromUserName} commented on your story`;
            case 'reply':
                return `${notification.fromUserName} replied to your comment`;
            case 'follow':
                return `${notification.fromUserName} started following you`;
            default:
                return 'New notification';
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.read) {
            await markAsRead(notification.id);
        }
        setIsOpen(false);
    };

    return (
        <div className="notification-container" ref={dropdownRef}>
            <button
                className="nav-icon-btn notification-trigger"
                onClick={() => setIsOpen(!isOpen)}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                className="mark-all-read-btn"
                                onClick={markAllAsRead}
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <div className="no-notifications">
                                <span className="no-notif-icon">🔕</span>
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.slice(0, 20).map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <span className="notif-icon">
                                        {getNotificationIcon(notification.type)}
                                    </span>
                                    <div className="notif-content">
                                        <p className="notif-text">{getNotificationText(notification)}</p>
                                        {notification.storyText && (
                                            <p className="notif-story-preview">"{notification.storyText}"</p>
                                        )}
                                        <span className="notif-time">{formatTime(notification.createdAt)}</span>
                                    </div>
                                    {!notification.read && <span className="unread-dot"></span>}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
