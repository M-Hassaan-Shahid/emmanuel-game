require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const User = require('../Models/User');
const Transaction = require('../Models/Transaction');
const Admin = require('../Models/Admin');
const Setting = require('../Models/Setting');

// Create Express app for webhook
const app = express();
app.use(express.json());

// Initialize bot WITHOUT polling (for webhook mode)
const bot = new TelegramBot(process.env.TELEGRAM_ADMIN_BOT_TOKEN);

// Store admin sessions
const adminSessions = new Map();

// Admin authentication middleware
const isAdmin = async (chatId) => {
    return adminSessions.has(chatId);
};

// Format currency
const formatCurrency = (amount) => `₹${parseFloat(amount).toFixed(2)}`;

// Main menu keyboard
const mainMenuKeyboard = {
    reply_markup: {
        keyboard: [
            ['👥 Users', '💰 Payments'],
            ['📊 Statistics', '⚙️ Settings'],
            ['🎮 Game Control', '📢 Broadcast'],
            ['🔓 Logout']
        ],
        resize_keyboard: true
    }
};

// Payment menu keyboard
const paymentMenuKeyboard = {
    reply_markup: {
        keyboard: [
            ['💳 Recharge Requests', '💸 Withdrawal Requests'],
            ['📜 All Transactions', '🔙 Back to Menu']
        ],
        resize_keyboard: true
    }
};

// User menu keyboard
const userMenuKeyboard = {
    reply_markup: {
        keyboard: [
            ['👤 Search User', '📋 All Users'],
            ['🔝 Top Users', '🔙 Back to Menu']
        ],
        resize_keyboard: true
    }
};

// Settings menu keyboard
const settingsMenuKeyboard = {
    reply_markup: {
        keyboard: [
            ['🎯 Game Settings', '🏦 Bank Details'],
            ['📊 Crash %', '🔙 Back to Menu']
        ],
        resize_keyboard: true
    }
};

// Webhook endpoint
app.post(`/bot${process.env.TELEGRAM_ADMIN_BOT_TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', bot: 'running' });
});

// ==================== AUTHENTICATION ====================

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;

    if (adminSessions.has(chatId)) {
        bot.sendMessage(chatId, '✅ You are already logged in!', mainMenuKeyboard);
        return;
    }

    bot.sendMessage(
        chatId,
        '🔐 *Admin Login*\n\n' +
        'Please enter your admin credentials:\n' +
        'Format: `/login email password`\n\n' +
        'Example: `/login admin@example.com mypassword`',
        { parse_mode: 'Markdown' }
    );
});

bot.onText(/\/login (.+) (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const email = match[1];
    const password = match[2];

    try {
        const bcrypt = require('bcryptjs');
        const admin = await Admin.findOne({ email });

        if (!admin) {
            bot.sendMessage(chatId, '❌ Invalid credentials!');
            return;
        }

        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            bot.sendMessage(chatId, '❌ Invalid credentials!');
            return;
        }

        adminSessions.set(chatId, { email, adminId: admin._id });

        bot.sendMessage(
            chatId,
            `✅ *Welcome Admin!*\n\n` +
            `Email: ${email}\n` +
            `Access Level: Full Control\n\n` +
            `Use the menu below to manage your platform.`,
            { ...mainMenuKeyboard, parse_mode: 'Markdown' }
        );
    } catch (error) {
        console.error('Login error:', error);
        bot.sendMessage(chatId, '❌ Login failed. Please try again.');
    }
});

bot.onText(/🔓 Logout/, async (msg) => {
    const chatId = msg.chat.id;
    adminSessions.delete(chatId);
    bot.sendMessage(chatId, '👋 Logged out successfully!', { reply_markup: { remove_keyboard: true } });
});

// ==================== STATISTICS ====================

bot.onText(/📊 Statistics/, async (msg) => {
    const chatId = msg.chat.id;

    if (!await isAdmin(chatId)) {
        bot.sendMessage(chatId, '❌ Please login first: /start');
        return;
    }

    try {
        const totalUsers = await User.countDocuments({ deleted_at: null });
        const activeUsers = await User.countDocuments({ deleted_at: null, status: 1 });

        const totalTransactions = await Transaction.countDocuments({ deleted_at: null });
        const pendingPayments = await Transaction.countDocuments({ status: 'pending' });

        const rechargeSum = await Transaction.aggregate([
            { $match: { transactionType: 'recharge', status: 'approved' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const withdrawSum = await Transaction.aggregate([
            { $match: { transactionType: 'withdraw', status: 'approved' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const totalRecharge = rechargeSum[0]?.total || 0;
        const totalWithdraw = withdrawSum[0]?.total || 0;
        const revenue = totalRecharge - totalWithdraw;

        bot.sendMessage(
            chatId,
            `📊 *Platform Statistics*\n\n` +
            `👥 *Users:*\n` +
            `Total: ${totalUsers}\n` +
            `Active: ${activeUsers}\n\n` +
            `💰 *Transactions:*\n` +
            `Total: ${totalTransactions}\n` +
            `Pending: ${pendingPayments}\n\n` +
            `💵 *Financial:*\n` +
            `Total Recharge: ${formatCurrency(totalRecharge)}\n` +
            `Total Withdraw: ${formatCurrency(totalWithdraw)}\n` +
            `Revenue: ${formatCurrency(revenue)}`,
            { parse_mode: 'Markdown' }
        );
    } catch (error) {
        console.error('Statistics error:', error);
        bot.sendMessage(chatId, '❌ Error fetching statistics.');
    }
});

// Add all other handlers from adminBot.js here...
// (Copy the rest of the handlers from the original file)

console.log('✅ Admin Telegram Bot (Webhook Mode) is ready...');
console.log('⚠️ Remember to set webhook URL in production!');

module.exports = { bot, app };
