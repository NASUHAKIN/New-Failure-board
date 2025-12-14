import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const MessagesPage = () => {
    const { currentUser, userProfile } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (currentUser) {
            loadConversations();
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
                where('participants', 'array-contains', currentUser.uid),
                orderBy('updatedAt', 'desc')
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const convs = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setConversations(convs);
                setLoading(false);
            });

            return unsubscribe;
        } catch (error) {
            console.error('Error loading conversations:', error);
            setLoading(false);
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
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const getOtherParticipant = (conv) => {
        const otherId = conv.participants?.find(id => id !== currentUser.uid);
        return conv.participantNames?.[otherId] || 'Unknown';
    };

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
                <h2>Messages</h2>

                {loading ? (
                    <p className="loading-text">Loading...</p>
                ) : conversations.length === 0 ? (
                    <p className="empty-message">No conversations yet</p>
                ) : (
                    conversations.map(conv => (
                        <button
                            key={conv.id}
                            className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
                            onClick={() => setSelectedConversation(conv)}
                        >
                            <span className="conv-name">{getOtherParticipant(conv)}</span>
                            <span className="conv-preview">{conv.lastMessage?.substring(0, 30)}...</span>
                        </button>
                    ))
                )}
            </div>

            {/* Chat Window */}
            <div className="chat-window">
                {selectedConversation ? (
                    <>
                        <div className="chat-header">
                            <h3>{getOtherParticipant(selectedConversation)}</h3>
                        </div>

                        <div className="chat-messages">
                            {messages.map(msg => (
                                <div
                                    key={msg.id}
                                    className={`message ${msg.senderId === currentUser.uid ? 'own' : 'other'}`}
                                >
                                    <p>{msg.text}</p>
                                </div>
                            ))}
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
                        <p>Select a conversation to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagesPage;
