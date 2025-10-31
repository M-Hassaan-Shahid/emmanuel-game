// Notification helper for sending admin alerts
require('dotenv').config();

let bot = null;

// Initialize bot only if token exists
if (process.env.TELEGRAM_ADMIN_BOT_TOKEN) {
    try {
        const TelegramBot = require('node-telegram-bot-api');
        bot = new TelegramBot(process.env.TELEGRAM_ADMIN_BOT_TOKEN);
        console.log('✅ Admin notification system initialized');
    } catch (error) {
        console.log('⚠️  Admin bot not available for notifications');
    }
}

// Store admin chat IDs (you can get these from @userinfobot in Telegram)
// Add your Telegram chat ID here after getting it
const ADMIN_CHAT_IDS = [
    // Add admin chat IDs here, example:
    // '123456789',
    // '987654321'
];

/**
 * Send notification to all admins
 */
async function notifyAdmins(message, options = {}) {
    if (!bot || ADMIN_CHAT_IDS.length === 0) {
        return;
    }

    for (const chatId of ADMIN_CHAT_IDS) {
        try {
            await bot.sendMessage(chatId, message, {
                parse_mode: 'Markdown',
                ...options
            });
        } catch (error) {
            console.error(`Failed to notify admin ${chatId}:`, error.message);
        }
    }
}

/**
 * Notify admins about new payment request
 */
async function notifyNewPayment(transaction, user) {
    const type = transaction.transactionType === 'recharge' ? '💳 Recharge' : '💸 Withdrawal';
    const emoji = transaction.transactionType === 'recharge' ? '💰' : '💸';

    const message =
        `${emoji} *New ${transaction.transactionType.toUpperCase()} Request!*\n\n` +
        `👤 User: ${user.username || 'N/A'}\n` +
        `📱 Contact: ${user.contact || 'N/A'}\n` +
        `💵 Amount: ₹${transaction.amount}\n` +
        `📝 Type: ${transaction.paymentType}\n` +
        `🆔 Transaction ID: \`${transaction._id}\`\n\n` +
        `✅ Approve: /approve ${transaction._id}\n` +
        `❌ Reject: /reject ${transaction._id}`;

    await notifyAdmins(message);
}

/**
 * Notify admins about new user registration
 */
async function notifyNewUser(user) {
    const message =
        `👤 *New User Registered!*\n\n` +
        `Name: ${user.username || 'N/A'}\n` +
        `Contact: ${user.contact || 'N/A'}\n` +
        `Email: ${user.email || 'N/A'}\n` +
        `User ID: \`${user.user_id || user._id}\`\n` +
        `Initial Balance: ₹${user.balance || 0}`;

    await notifyAdmins(message);
}

/**
 * Notify admins about large transaction
 */
async function notifyLargeTransaction(transaction, user, threshold = 10000) {
    if (transaction.amount < threshold) {
        return;
    }

    const message =
        `🚨 *Large Transaction Alert!*\n\n` +
        `Type: ${transaction.transactionType.toUpperCase()}\n` +
        `Amount: ₹${transaction.amount}\n` +
        `User: ${user.username || 'N/A'}\n` +
        `Status: ${transaction.status}\n` +
        `Transaction ID: \`${transaction._id}\``;

    await notifyAdmins(message);
}

/**
 * Notify admins about suspicious activity
 */
async function notifySuspiciousActivity(description, user) {
    const message =
        `⚠️ *Suspicious Activity Detected!*\n\n` +
        `${description}\n\n` +
        `User: ${user.username || 'N/A'}\n` +
        `User ID: \`${user.user_id || user._id}\`\n` +
        `Contact: ${user.contact || 'N/A'}`;

    await notifyAdmins(message);
}

/**
 * Notify admins about system errors
 */
async function notifySystemError(error, context = '') {
    const message =
        `🔴 *System Error!*\n\n` +
        `Context: ${context}\n` +
        `Error: ${error.message}\n` +
        `Time: ${new Date().toLocaleString()}`;

    await notifyAdmins(message);
}

/**
 * Send daily summary to admins
 */
async function sendDailySummary(stats) {
    const message =
        `📊 *Daily Summary*\n\n` +
        `📅 Date: ${new Date().toLocaleDateString()}\n\n` +
        `👥 New Users: ${stats.newUsers || 0}\n` +
        `💰 Total Recharges: ₹${stats.totalRecharges || 0}\n` +
        `💸 Total Withdrawals: ₹${stats.totalWithdrawals || 0}\n` +
        `📈 Revenue: ₹${stats.revenue || 0}\n` +
        `⏳ Pending Requests: ${stats.pendingRequests || 0}`;

    await notifyAdmins(message);
}

module.exports = {
    notifyAdmins,
    notifyNewPayment,
    notifyNewUser,
    notifyLargeTransaction,
    notifySuspiciousActivity,
    notifySystemError,
    sendDailySummary,
    ADMIN_CHAT_IDS // Export so you can add IDs dynamically
};
