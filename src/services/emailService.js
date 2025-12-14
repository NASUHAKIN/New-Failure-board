import emailjs from '@emailjs/browser';

// ========================================
// EmailJS Configuration
// ========================================
// To use EmailJS:
// 1. Sign up at https://www.emailjs.com
// 2. Create an Email Service (Gmail, Outlook, etc.)
// 3. Create Email Templates for each type
// 4. Copy your Service ID, Template IDs, and Public Key below

const EMAILJS_CONFIG = {
    SERVICE_ID: 'service_aqazoi5',      // Your EmailJS service ID
    PUBLIC_KEY: 'EdBvLTVP_mQn-VXPL',    // Your EmailJS public key
    TEMPLATES: {
        WELCOME: 'template_k5jbazg',     // Your welcome template ID
        NOTIFICATION: 'template_notify', // Create this template for notifications
        DIGEST: 'template_digest'        // Create this template for digest
    }
};

// Initialize EmailJS
emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);

// ========================================
// Email Sending Functions
// ========================================

/**
 * Send welcome email to new user
 */
export const sendWelcomeEmail = async (email, name) => {
    try {
        const response = await emailjs.send(
            EMAILJS_CONFIG.SERVICE_ID,
            EMAILJS_CONFIG.TEMPLATES.WELCOME,
            {
                to_email: email,
                to_name: name || 'there',
                app_name: 'FailBoard',
                app_url: window.location.origin
            }
        );
        console.log('Welcome email sent:', response.status);
        return { success: true };
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send notification email (vote, comment, follow)
 */
export const sendNotificationEmail = async (email, type, fromUser, storyPreview = '') => {
    const messages = {
        vote: `${fromUser} supported your story!`,
        comment: `${fromUser} commented on your story!`,
        follow: `${fromUser} started following you!`,
        mention: `${fromUser} mentioned you in a story!`
    };

    try {
        const response = await emailjs.send(
            EMAILJS_CONFIG.SERVICE_ID,
            EMAILJS_CONFIG.TEMPLATES.NOTIFICATION,
            {
                to_email: email,
                notification_type: type,
                message: messages[type] || messages.vote,
                from_user: fromUser,
                story_preview: storyPreview.substring(0, 100),
                app_url: window.location.origin
            }
        );
        console.log('Notification email sent:', response.status);
        return { success: true };
    } catch (error) {
        console.error('Error sending notification email:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Check if EmailJS is configured
 */
export const isEmailConfigured = () => {
    return EMAILJS_CONFIG.SERVICE_ID !== 'YOUR_SERVICE_ID' &&
        EMAILJS_CONFIG.PUBLIC_KEY !== 'YOUR_PUBLIC_KEY';
};

export default {
    sendWelcomeEmail,
    sendNotificationEmail,
    isEmailConfigured
};
