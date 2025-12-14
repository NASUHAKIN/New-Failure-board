import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, writeBatch, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Listen to notifications in real-time
    useEffect(() => {
        if (!currentUser) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        const notificationsRef = collection(db, 'notifications');
        const q = query(
            notificationsRef,
            where('userId', '==', currentUser.uid),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNotifications(notifs);
            setUnreadCount(notifs.filter(n => !n.read).length);
        });

        return () => unsubscribe();
    }, [currentUser]);

    // Mark notification as read
    const markAsRead = async (notificationId) => {
        const notifRef = doc(db, 'notifications', notificationId);
        await updateDoc(notifRef, { read: true });
    };

    // Mark all as read
    const markAllAsRead = async () => {
        const batch = writeBatch(db);
        notifications.filter(n => !n.read).forEach(n => {
            const notifRef = doc(db, 'notifications', n.id);
            batch.update(notifRef, { read: true });
        });
        await batch.commit();
    };

    // Create notification
    const createNotification = async ({ userId, type, fromUserId, fromUserName, storyId, storyText }) => {
        if (userId === fromUserId) return; // Don't notify self

        await addDoc(collection(db, 'notifications'), {
            userId,
            type,
            fromUserId,
            fromUserName,
            storyId: storyId || null,
            storyText: storyText ? storyText.substring(0, 50) + '...' : null,
            read: false,
            createdAt: serverTimestamp()
        });
    };

    const value = {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        createNotification
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
