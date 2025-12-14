import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebaseConfig';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Create user profile in Firestore
    const createUserProfile = async (user, additionalData = {}) => {
        if (!user) return;

        const userRef = doc(db, 'users', user.uid);
        const snapshot = await getDoc(userRef);

        // Only create profile and send email if user doesn't exist
        const isNewUser = !snapshot.exists();

        if (isNewUser) {
            const { displayName, email, photoURL } = user;
            await setDoc(userRef, {
                uid: user.uid,
                displayName: displayName || additionalData.displayName || 'Anonymous',
                displayNameLower: (displayName || additionalData.displayName || 'anonymous').toLowerCase(),
                email,
                photoURL: photoURL || null,
                bio: '',
                createdAt: serverTimestamp(),
                followers: [],
                following: [],
                badges: ['newcomer'],
                totalStories: 0,
                totalVotes: 0
            });

            // Send welcome email for new users
            try {
                const { sendWelcomeEmail, isEmailConfigured } = await import('../services/emailService');
                if (isEmailConfigured()) {
                    const userName = displayName || additionalData.displayName || 'there';
                    await sendWelcomeEmail(email, userName);
                    console.log('Welcome email sent to new user:', email);
                }
            } catch (error) {
                console.log('Email service error:', error);
            }
        }

        return getUserProfile(user.uid);
    };

    // Get user profile from Firestore
    const getUserProfile = async (uid) => {
        const userRef = doc(db, 'users', uid);
        const snapshot = await getDoc(userRef);
        if (snapshot.exists()) {
            const profile = { id: snapshot.id, ...snapshot.data() };
            console.log('User Profile from Firestore:', profile);
            console.log('isAdmin:', profile.isAdmin);
            setUserProfile(profile);
            return profile;
        }
        console.log('No user profile found for UID:', uid);
        return null;
    };

    // Register with email and password
    const register = async (email, password, displayName) => {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName });
        await createUserProfile(result.user, { displayName });
        // Welcome email is now sent in createUserProfile
        return result;
    };

    // Login with email and password
    const login = async (email, password) => {
        const result = await signInWithEmailAndPassword(auth, email, password);
        await getUserProfile(result.user.uid);
        return result;
    };

    // Login with Google
    const loginWithGoogle = async () => {
        const result = await signInWithPopup(auth, googleProvider);
        await createUserProfile(result.user);
        return result;
    };

    // Logout
    const logout = async () => {
        await signOut(auth);
        setUserProfile(null);
    };

    // Update user profile
    const updateUserProfile = async (data) => {
        if (!currentUser) return;

        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, data);
        await getUserProfile(currentUser.uid);
    };

    // Follow a user
    const followUser = async (targetUserId) => {
        if (!currentUser || currentUser.uid === targetUserId) return;

        const currentUserRef = doc(db, 'users', currentUser.uid);
        const targetUserRef = doc(db, 'users', targetUserId);

        await updateDoc(currentUserRef, {
            following: arrayUnion(targetUserId)
        });

        await updateDoc(targetUserRef, {
            followers: arrayUnion(currentUser.uid)
        });

        // Refresh profile
        await getUserProfile(currentUser.uid);
    };

    // Unfollow a user
    const unfollowUser = async (targetUserId) => {
        if (!currentUser) return;

        const currentUserRef = doc(db, 'users', currentUser.uid);
        const targetUserRef = doc(db, 'users', targetUserId);

        await updateDoc(currentUserRef, {
            following: arrayRemove(targetUserId)
        });

        await updateDoc(targetUserRef, {
            followers: arrayRemove(currentUser.uid)
        });

        await getUserProfile(currentUser.uid);
    };

    // Check if following a user
    const isFollowing = (targetUserId) => {
        return userProfile?.following?.includes(targetUserId) || false;
    };

    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                await getUserProfile(user.uid);
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userProfile,
        loading,
        register,
        login,
        loginWithGoogle,
        logout,
        updateUserProfile,
        followUser,
        unfollowUser,
        isFollowing,
        getUserProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
