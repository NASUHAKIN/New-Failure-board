import React, { useState } from 'react';

const ShareButtons = ({ failure }) => {
    const [copied, setCopied] = useState(false);

    const shareText = `"${failure.text}" - Shared from Failure Board`;
    const shareUrl = window.location.origin;

    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="share-buttons">
            <span className="share-label">Share:</span>
            <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="share-btn twitter"
                title="Share on Twitter"
            >
                𝕏
            </a>
            <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="share-btn linkedin"
                title="Share on LinkedIn"
            >
                in
            </a>
            <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="share-btn whatsapp"
                title="Share on WhatsApp"
            >
                📱
            </a>
            <button
                className={`share-btn copy ${copied ? 'copied' : ''}`}
                onClick={copyToClipboard}
                title="Copy to clipboard"
            >
                {copied ? '✓' : '📋'}
            </button>
        </div>
    );
};

export default ShareButtons;
