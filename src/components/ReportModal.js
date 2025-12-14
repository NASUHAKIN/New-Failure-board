import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../contexts/AuthContext';

const ReportModal = ({ isOpen, onClose, storyId, storyText }) => {
    const { currentUser } = useAuth();
    const [selectedReason, setSelectedReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const reasons = [
        { id: 'spam', label: 'Spam', icon: '🚫' },
        { id: 'harassment', label: 'Harassment', icon: '😠' },
        { id: 'hate', label: 'Hate speech', icon: '⛔' },
        { id: 'harmful', label: 'Harmful', icon: '⚠️' },
        { id: 'other', label: 'Other', icon: '📝' }
    ];

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
            alert('✅ Report submitted successfully!');
            setTimeout(() => {
                handleClose();
            }, 1000);
        } catch (error) {
            console.error('Error submitting report:', error);
            alert('❌ Failed: ' + error.message);
        }
        setSubmitting(false);
    };

    const handleClose = () => {
        onClose();
        setSubmitted(false);
        setSelectedReason('');
    };

    if (!isOpen) return null;

    // Use Portal to render outside parent hierarchy
    return ReactDOM.createPortal(
        <div className="report-overlay" onClick={handleClose}>
            <div className="report-box" onClick={e => e.stopPropagation()}>
                {submitted ? (
                    <div className="report-success-msg">
                        <span className="success-icon">✓</span>
                        <p>Report submitted</p>
                    </div>
                ) : (
                    <>
                        <div className="report-header">
                            <span className="report-title">Report</span>
                            <button className="report-close" onClick={handleClose}>×</button>
                        </div>
                        <div className="report-reasons">
                            {reasons.map(r => (
                                <button
                                    key={r.id}
                                    className={`report-reason-btn ${selectedReason === r.id ? 'active' : ''}`}
                                    onClick={() => setSelectedReason(r.id)}
                                >
                                    <span>{r.icon}</span>
                                    <span>{r.label}</span>
                                </button>
                            ))}
                        </div>
                        <button
                            className="report-submit"
                            onClick={handleSubmit}
                            disabled={!selectedReason || submitting}
                        >
                            {submitting ? 'Sending...' : 'Submit'}
                        </button>
                    </>
                )}
            </div>
        </div>,
        document.body
    );
};

export default ReportModal;
