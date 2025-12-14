import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../contexts/AuthContext';

const EmailPreferences = () => {
    const { currentUser } = useAuth();
    const [preferences, setPreferences] = useState({
        emailNotifications: true,
        weeklyDigest: true
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (currentUser) {
            loadPreferences();
        }
    }, [currentUser]);

    const loadPreferences = async () => {
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                const data = userDoc.data();
                setPreferences({
                    emailNotifications: data.emailNotifications !== false,
                    weeklyDigest: data.weeklyDigest !== false
                });
            }
        } catch (error) {
            console.error('Error loading preferences:', error);
        }
    };

    const savePreferences = async () => {
        setSaving(true);
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                emailNotifications: preferences.emailNotifications,
                weeklyDigest: preferences.weeklyDigest
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error('Error saving preferences:', error);
        }
        setSaving(false);
    };

    if (!currentUser) return null;

    return (
        <div className="email-preferences">
            <h3>Email Preferences</h3>

            <label className="preference-item">
                <input
                    type="checkbox"
                    checked={preferences.emailNotifications}
                    onChange={(e) => setPreferences({
                        ...preferences,
                        emailNotifications: e.target.checked
                    })}
                />
                <span>Receive notification emails (votes, comments, follows)</span>
            </label>

            <label className="preference-item">
                <input
                    type="checkbox"
                    checked={preferences.weeklyDigest}
                    onChange={(e) => setPreferences({
                        ...preferences,
                        weeklyDigest: e.target.checked
                    })}
                />
                <span>Receive weekly digest (top stories, stats)</span>
            </label>

            <button
                className="save-preferences-btn"
                onClick={savePreferences}
                disabled={saving}
            >
                {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Preferences'}
            </button>
        </div>
    );
};

export default EmailPreferences;
