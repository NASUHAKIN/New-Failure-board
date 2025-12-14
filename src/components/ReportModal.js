import React, { useState, useRef, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../contexts/AuthContext';

const ReportModal = ({ isOpen, onClose, storyId, storyText, anchorRef }) => {
    const { currentUser } = useAuth();
    const [selectedReason, setSelectedReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const dropdownRef = useRef(null);

    const reasons = [
        'Spam',
        'Harassment',
        'Hate speech',
        'Harmful content',
        'Other'
    ];

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    const handleSubmit = async () => {
        if (!selectedReason) return;

        setSubmitting(true);
        try {
            await addDoc(collection(db, 'reports'), {
                storyId,
                storyText: storyText?.substring(0, 100),
                reporterId: currentUser?.uid || 'anonymous',
                reporterEmail: currentUser?.email || null,
                reason: selectedReason,
                status: 'pending',
                createdAt: serverTimestamp()
            });
            setSubmitted(true);
            setTimeout(() => {
                onClose();
                setSubmitted(false);
                setSelectedReason('');
            }, 1500);
        } catch (error) {
            console.error('Error submitting report:', error);
        }
        setSubmitting(false);
    };

    if (!isOpen) return null;

    return (
        <div className="report-dropdown" ref={dropdownRef}>
            {submitted ? (
                <div className="report-done">
                    <span>✓</span> Reported
                </div>
            ) : (
                <>
                    <div className="report-dropdown-header">Report</div>
                    <div className="report-options">
                        {reasons.map(r => (
                            <button
                                key={r}
                                className={`report-option ${selectedReason === r ? 'selected' : ''}`}
                                onClick={() => setSelectedReason(r)}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                    <button
                        className="report-send-btn"
                        onClick={handleSubmit}
                        disabled={!selectedReason || submitting}
                    >
                        {submitting ? '...' : 'Send'}
                    </button>
                </>
            )}
        </div>
    );
};

export default ReportModal;
