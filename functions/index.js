const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();
const db = admin.firestore();

// Configure email transporter (use Gmail or SMTP service)
// For production, use environment variables: firebase functions:config:set email.user="..." email.pass="..."
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: functions.config().email?.user || 'your-email@gmail.com',
        pass: functions.config().email?.pass || 'your-app-password'
    }
});

// Email templates
const templates = {
    welcome: (name) => ({
        subject: 'Welcome to FailBoard! 🎉',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #7c3aed;">Welcome to FailBoard!</h1>
                <p>Hi ${name},</p>
                <p>Thank you for joining our community! FailBoard is a safe space to share your failures and learn from others.</p>
                <h3>Get Started:</h3>
                <ul>
                    <li>Share your first failure story</li>
                    <li>Support others by voting on their stories</li>
                    <li>Join the conversation with comments</li>
                </ul>
                <p>Remember: Every failure is a step towards success! 💪</p>
                <a href="https://your-app-url.com" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">Start Sharing</a>
                <p style="margin-top: 32px; color: #666;">— The FailBoard Team</p>
            </div>
        `
    }),

    notification: (type, fromUser, storyPreview) => {
        const messages = {
            vote: {
                subject: `${fromUser} supported your story! ❤️`,
                content: `${fromUser} gave support to your story: "${storyPreview}"`
            },
            comment: {
                subject: `${fromUser} commented on your story! 💬`,
                content: `${fromUser} left a comment on your story: "${storyPreview}"`
            },
            follow: {
                subject: `${fromUser} started following you! 👋`,
                content: `${fromUser} is now following you on FailBoard.`
            }
        };
        const msg = messages[type] || messages.vote;
        return {
            subject: msg.subject,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #7c3aed;">${msg.subject}</h2>
                    <p>${msg.content}</p>
                    <a href="https://your-app-url.com" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">View on FailBoard</a>
                    <p style="margin-top: 32px; color: #666;">— The FailBoard Team</p>
                </div>
            `
        };
    },

    weeklyDigest: (stories, stats) => ({
        subject: 'Your Weekly FailBoard Digest 📊',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #7c3aed;">Your Weekly Digest</h1>
                
                <h3>🔥 Top Stories This Week</h3>
                ${stories.map((s, i) => `
                    <div style="padding: 16px; background: #f8f8f8; border-radius: 8px; margin-bottom: 12px;">
                        <p style="margin: 0;"><strong>#${i + 1}</strong> ${s.text.substring(0, 100)}...</p>
                        <p style="margin: 8px 0 0; color: #666;">❤️ ${s.votes} supports</p>
                    </div>
                `).join('')}
                
                <h3>📊 Community Stats</h3>
                <ul>
                    <li>${stats.newStories} new stories shared</li>
                    <li>${stats.totalVotes} supports given</li>
                    <li>${stats.newUsers} new members joined</li>
                </ul>
                
                <a href="https://your-app-url.com" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">Explore More</a>
                <p style="margin-top: 32px; color: #666;">— The FailBoard Team</p>
            </div>
        `
    })
};

// ========================================
// 1. WELCOME EMAIL - Triggered on new user signup
// ========================================
exports.sendWelcomeEmail = functions.auth.user().onCreate(async (user) => {
    try {
        const { email, displayName } = user;
        if (!email) return null;

        const template = templates.welcome(displayName || 'there');

        await transporter.sendMail({
            from: '"FailBoard" <noreply@failboard.com>',
            to: email,
            subject: template.subject,
            html: template.html
        });

        console.log('Welcome email sent to:', email);
        return { success: true };
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return { error: error.message };
    }
});

// ========================================
// 2. NOTIFICATION EMAIL - Triggered on new notification
// ========================================
exports.sendNotificationEmail = functions.firestore
    .document('notifications/{notificationId}')
    .onCreate(async (snap, context) => {
        try {
            const notification = snap.data();
            const { userId, type, fromUserName, storyText } = notification;

            // Get user email
            const userDoc = await db.collection('users').doc(userId).get();
            if (!userDoc.exists) return null;

            const userData = userDoc.data();
            const email = userData.email;

            // Check if user wants email notifications
            if (userData.emailNotifications === false) {
                console.log('User has disabled email notifications');
                return null;
            }

            const template = templates.notification(type, fromUserName, storyText);

            await transporter.sendMail({
                from: '"FailBoard" <noreply@failboard.com>',
                to: email,
                subject: template.subject,
                html: template.html
            });

            console.log('Notification email sent to:', email);
            return { success: true };
        } catch (error) {
            console.error('Error sending notification email:', error);
            return { error: error.message };
        }
    });

// ========================================
// 3. WEEKLY DIGEST - Scheduled every Sunday at 10 AM
// ========================================
exports.sendWeeklyDigest = functions.pubsub
    .schedule('every sunday 10:00')
    .timeZone('Europe/Istanbul')
    .onRun(async (context) => {
        try {
            // Get top stories from last week
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);

            const storiesSnapshot = await db.collection('stories')
                .where('createdAt', '>=', weekAgo)
                .orderBy('createdAt', 'desc')
                .orderBy('votes', 'desc')
                .limit(5)
                .get();

            const topStories = storiesSnapshot.docs.map(doc => doc.data());

            // Get weekly stats
            const usersSnapshot = await db.collection('users')
                .where('createdAt', '>=', weekAgo)
                .get();

            const stats = {
                newStories: storiesSnapshot.size,
                totalVotes: topStories.reduce((sum, s) => sum + (s.votes || 0), 0),
                newUsers: usersSnapshot.size
            };

            // Get all users who want digest emails
            const allUsersSnapshot = await db.collection('users')
                .where('weeklyDigest', '!=', false)
                .get();

            const template = templates.weeklyDigest(topStories, stats);

            // Send to all subscribed users
            const emailPromises = allUsersSnapshot.docs.map(async (userDoc) => {
                const userData = userDoc.data();
                if (!userData.email) return null;

                try {
                    await transporter.sendMail({
                        from: '"FailBoard" <noreply@failboard.com>',
                        to: userData.email,
                        subject: template.subject,
                        html: template.html
                    });
                    return { email: userData.email, success: true };
                } catch (err) {
                    return { email: userData.email, error: err.message };
                }
            });

            const results = await Promise.all(emailPromises);
            console.log('Weekly digest sent:', results.filter(r => r?.success).length, 'emails');

            return { success: true, sent: results.length };
        } catch (error) {
            console.error('Error sending weekly digest:', error);
            return { error: error.message };
        }
    });
