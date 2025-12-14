import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, updateDoc, increment, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from './AuthContext';

const GamificationContext = createContext();

export const useGamification = () => {
    const context = useContext(GamificationContext);
    if (!context) {
        throw new Error('useGamification must be used within GamificationProvider');
    }
    return context;
};

// Points configuration
const POINTS = {
    SHARE_STORY: 10,
    RECEIVE_VOTE: 2,
    GIVE_VOTE: 1,
    WRITE_COMMENT: 3,
    DAILY_LOGIN: 5,
    STREAK_BONUS: 2 // per day
};

// Level calculation
const calculateLevel = (points) => {
    if (points < 50) return 1;
    if (points < 150) return 2;
    if (points < 300) return 3;
    if (points < 500) return 4;
    if (points < 800) return 5;
    if (points < 1200) return 6;
    if (points < 1800) return 7;
    if (points < 2500) return 8;
    if (points < 3500) return 9;
    return 10;
};

const getLevelTitle = (level) => {
    const titles = {
        1: 'Newcomer',
        2: 'Learner',
        3: 'Contributor',
        4: 'Supporter',
        5: 'Storyteller',
        6: 'Mentor',
        7: 'Veteran',
        8: 'Champion',
        9: 'Legend',
        10: 'Master'
    };
    return titles[level] || 'Unknown';
};

export const GamificationProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [points, setPoints] = useState(0);
    const [streak, setStreak] = useState(0);
    const [level, setLevel] = useState(1);

    useEffect(() => {
        if (currentUser) {
            loadGamificationData();
            checkDailyLogin();
        }
    }, [currentUser]);

    const loadGamificationData = async () => {
        if (!currentUser) return;

        try {
            const userRef = doc(db, 'users', currentUser.uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                const data = userDoc.data();
                setPoints(data.points || 0);
                setStreak(data.streak || 0);
                setLevel(calculateLevel(data.points || 0));
            }
        } catch (error) {
            console.error('Error loading gamification data:', error);
        }
    };

    const checkDailyLogin = async () => {
        if (!currentUser) return;

        try {
            const userRef = doc(db, 'users', currentUser.uid);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) return;

            const data = userDoc.data();
            const lastLogin = data.lastLoginDate?.toDate();
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (!lastLogin || lastLogin < today) {
                let newStreak = 1;
                let streakBonus = 0;

                // Check if streak continues
                if (lastLogin) {
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);

                    if (lastLogin >= yesterday) {
                        newStreak = (data.streak || 0) + 1;
                        streakBonus = newStreak * POINTS.STREAK_BONUS;
                    }
                }

                const dailyPoints = POINTS.DAILY_LOGIN + streakBonus;

                await updateDoc(userRef, {
                    lastLoginDate: serverTimestamp(),
                    streak: newStreak,
                    points: increment(dailyPoints)
                });

                setStreak(newStreak);
                setPoints(prev => prev + dailyPoints);
            }
        } catch (error) {
            console.error('Error checking daily login:', error);
        }
    };

    const addPoints = async (type) => {
        if (!currentUser) return;

        const pointValue = POINTS[type] || 0;
        if (pointValue === 0) return;

        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                points: increment(pointValue)
            });

            setPoints(prev => {
                const newPoints = prev + pointValue;
                setLevel(calculateLevel(newPoints));
                return newPoints;
            });
        } catch (error) {
            console.error('Error adding points:', error);
        }
    };

    const value = {
        points,
        streak,
        level,
        levelTitle: getLevelTitle(level),
        addPoints,
        POINTS
    };

    return (
        <GamificationContext.Provider value={value}>
            {children}
        </GamificationContext.Provider>
    );
};
