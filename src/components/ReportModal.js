import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../contexts/AuthContext';

const ReportModal = ({ isOpen, onClose, storyId, storyText }) => {
    const { currentUser } = useAuth();
    const [reason, setReason] = useState('');
    const [selectedReason, setSelectedReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const reasons = [
        'Spam or misleading',
        'Harassment or bullying',
        'Hate speech',
        'Violence or harmful content',
        'Personal information shared',
        'Other'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedReason) return;

        setSubmitting(true);
        try {
            await addDoc(collection(db, 'reports'), {
                storyId,
                storyText: storyText?.substring(0, 100),
                reporterId: currentUser?.uid || 'anonymous',
                reporterEmail: currentUser?.email || null,
                reason: selectedReason,
                additionalInfo: reason,
                status: 'pending',
                createdAt: serverTimestamp()
            });
            setSubmitted(true);
            setTimeout(() => {
                onClose();
                setSubmitted(false);
                setSelectedReason('');
                setReason('');
            }, 2000);
        } catch (error) {
            console.error('Error submitting report:', error);
            alert('Failed to submit report. Please try again.');
        }
        setSubmitting(false);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content report-modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>

                {submitted ? (
                    <div className="report-success">
                        <h3>Report Submitted</h3>
                        <p>Thank you for helping keep our community safe.</p>
                    </div>
                ) : (
                    <>
                        <h2>Report Story</h2>
                        <p className="report-subtitle">Why are you reporting this content?</p>

                        <form onSubmit={handleSubmit}>
                            <div className="reason-options">
                                {reasons.map(r => (
                                    <label key={r} className="reason-option">
                                        <input
                                            type="radio"
                                            name="reason"
                                            value={r}
                                            checked={selectedReason === r}
                                            onChange={(e) => setSelectedReason(e.target.value)}
                                        />
                                        <span>{r}</span>
                                    </label>
                                ))}
                            </div>

                            {selectedReason === 'Other' && (
                                <textarea
                                    className="report-textarea"
                                    placeholder="Please describe the issue..."
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    rows={3}
                                />
                            )}

                            <button
                                type="submit"
                                className="report-submit-btn"
                                disabled={!selectedReason || submitting}
                            >
                                {submitting ? 'Submitting...' : 'Submit Report'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ReportModal;
