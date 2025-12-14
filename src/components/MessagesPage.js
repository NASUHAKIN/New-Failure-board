import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../contexts/AuthContext';

const MessagesPage = () => {
    const { currentUser, userProfile } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [showNewChat, setShowNewChat] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [searchUser, setSearchUser] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (currentUser) {
            loadConversations();
            loadAllUsers();
        } else {
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        if (selectedConversation) {
            loadMessages(selectedConversation.id);
        }
    }, [selectedConversation]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadConversations = async () => {
        try {
            const convRef = collection(db, 'conversations');
            const q = query(
                convRef,
                where('participants', 'array-contains', currentUser.uid)
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const convs = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                // Sort by updatedAt client-side to avoid index requirement
                convs.sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
                setConversations(convs);
                setLoading(false);
            }, (error) => {
                console.error('Error loading conversations:', error);
                setLoading(false);
            });

            return unsubscribe;
        } catch (error) {
            console.error('Error loading conversations:', error);
            setLoading(false);
        }
    };

    const loadAllUsers = async () => {
        try {
            const usersRef = collection(db, 'users');
            const snapshot = await getDocs(usersRef);
            const users = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(user => user.id !== currentUser.uid);
            setAllUsers(users);
        } catch (error) {
            console.error('Error loading users:', error);
        }
    };

    const loadMessages = async (conversationId) => {
        try {
            const messagesRef = collection(db, `conversations/${conversationId}/messages`);
            const q = query(messagesRef, orderBy('createdAt', 'asc'));

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const msgs = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setMessages(msgs);
            });

            return unsubscribe;
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const startNewConversation = async (targetUser) => {
        try {
            // Check if conversation already exists
            const existingConv = conversations.find(conv =>
                conv.participants.includes(targetUser.id)
            );

            if (existingConv) {
                setSelectedConversation(existingConv);
                setShowNewChat(false);
                return;
            }

            // Create new conversation
            const convRef = doc(collection(db, 'conversations'));
            const convData = {
                participants: [currentUser.uid, targetUser.id],
                participantNames: {
                    [currentUser.uid]: userProfile?.displayName || currentUser.displayName,
                    [targetUser.id]: targetUser.displayName
                },
                lastMessage: '',
                updatedAt: serverTimestamp(),
                createdAt: serverTimestamp()
            };

            await setDoc(convRef, convData);

            setSelectedConversation({ id: convRef.id, ...convData });
            setShowNewChat(false);
        } catch (error) {
            console.error('Error starting conversation:', error);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation) return;

        try {
            const messagesRef = collection(db, `conversations/${selectedConversation.id}/messages`);
            await addDoc(messagesRef, {
                senderId: currentUser.uid,
                senderName: userProfile?.displayName || currentUser.displayName,
                text: newMessage.trim(),
                createdAt: serverTimestamp()
            });

            // Update conversation's last message
            const convRef = doc(db, 'conversations', selectedConversation.id);
            await setDoc(convRef, {
                lastMessage: newMessage.trim(),
                updatedAt: serverTimestamp()
            }, { merge: true });

            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const getOtherParticipant = (conv) => {
        const otherId = conv.participants?.find(id => id !== currentUser.uid);
        return conv.participantNames?.[otherId] || 'Unknown';
    };

    const filteredUsers = allUsers.filter(user =>
        user.displayName?.toLowerCase().includes(searchUser.toLowerCase())
    );

    if (!currentUser) {
        return (
            <div className="page-clean">
                <header className="page-header-clean">
                    <h1>Messages</h1>
                    <p>Sign in to view your messages</p>
                </header>
            </div>
        );
    }

    return (
        <div className="messages-page">
            {/* Conversation List */}
            <div className="conversations-list">
                <div className="conv-header">
                    <h2>Messages</h2>
                    <button
                        className="new-chat-btn"
                        onClick={() => setShowNewChat(true)}
                    >
                        + New
                    </button>
                </div>

                {loading ? (
                    <p className="loading-text">Loading...</p>
                ) : conversations.length === 0 ? (
                    <div className="empty-message">
                        <p>No conversations yet</p>
                        <button
                            className="start-chat-btn"
                            onClick={() => setShowNewChat(true)}
                        >
                            Start a conversation
                        </button>
                    </div>
                ) : (
                    conversations.map(conv => (
                        <button
                            key={conv.id}
                            className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
                            onClick={() => setSelectedConversation(conv)}
                        >
                            <span className="conv-name">{getOtherParticipant(conv)}</span>
                            <span className="conv-preview">{conv.lastMessage?.substring(0, 30) || 'No messages yet'}</span>
                        </button>
                    ))
                )}
            </div>

            {/* Chat Window */}
            <div className="chat-window">
                {showNewChat ? (
                    <div className="new-chat-panel">
                        <div className="chat-header">
                            <h3>New Message</h3>
                            <button onClick={() => setShowNewChat(false)}>✕</button>
                        </div>
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchUser}
                            onChange={(e) => setSearchUser(e.target.value)}
                            className="user-search-input"
                        />
                        <div className="user-list">
                            {filteredUsers.length === 0 ? (
                                <p className="empty-message">No users found</p>
                            ) : (
                                filteredUsers.map(user => (
                                    <button
                                        key={user.id}
                                        className="user-item"
                                        onClick={() => startNewConversation(user)}
                                    >
                                        {user.displayName}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                ) : selectedConversation ? (
                    <>
                        <div className="chat-header">
                            <h3>{getOtherParticipant(selectedConversation)}</h3>
                        </div>

                        <div className="chat-messages">
                            {messages.length === 0 ? (
                                <p className="empty-message">No messages yet. Say hello!</p>
                            ) : (
                                messages.map(msg => (
                                    <div
                                        key={msg.id}
                                        className={`message ${msg.senderId === currentUser.uid ? 'own' : 'other'}`}
                                    >
                                        <p>{msg.text}</p>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="chat-input" onSubmit={sendMessage}>
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button type="submit" disabled={!newMessage.trim()}>Send</button>
                        </form>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <p>Select a conversation or start a new one</p>
                        <button
                            className="start-chat-btn"
                            onClick={() => setShowNewChat(true)}
                        >
                            + New Message
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagesPage;
