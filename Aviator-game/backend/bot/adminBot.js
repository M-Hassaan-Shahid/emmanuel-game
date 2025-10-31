require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const User = require('../Models/User');
const Transaction = require('../Models/Transaction');
const Admin = require('../Models/Admin');
const Setting = require('../Models/Setting');

if (!process.env.TELEGRAM_ADMIN_BOT_TOKEN) {
    console.error('❌ TELEGRAM_ADMIN_BOT_TOKEN not found in environment variables!');
    process.exit(1);
}

console.log('🤖 Initializing Admin Bot...');
console.log('📡 Bot Token:', process.env.TELEGRAM_ADMIN_BOT_TOKEN ? 'Present' : 'Missing');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Aviator';
console.log('🗄️ Connecting to MongoDB:', MONGODB_URI);

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
})
    .then(() => {
        console.log('✅ MongoDB connected successfully!');
    })
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error.message);
        console.error('⚠️ Bot will continue but database operations will fail!');
    });

mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('error', (error) => {
    console.error('❌ MongoDB error:', error.message);
});

const bot = new TelegramBot(process.env.TELEGRAM_ADMIN_BOT_TOKEN, {
    polling: {
        interval: 300,
        autoStart: true,
        params: {
            timeout: 10
        }
    }
});

bot.on('polling_error', (error) => {
    console.error('❌ Polling error:', error.code, error.message);
    if (error.code === 'EFATAL' || error.code === 'ECONNRESET') {
        console.log('⚠️ Connection issue detected. Bot will retry automatically...');
    }
});

bot.on('webhook_error', (error) => {
    console.error('❌ Webhook error:', error);
});

bot.getMe().then((botInfo) => {
    console.log('✅ Admin Bot started successfully!');
    console.log('🤖 Bot Name:', botInfo.first_name);
    console.log('👤 Bot Username:', '@' + botInfo.username);
    console.log('💰 Currency: Telegram Stars (⭐)');
    console.log('📡 Ready to receive commands!');
}).catch((error) => {
    console.error('❌ Failed to start bot:', error.message);
});

module.exports = bot;

const adminSessions = new Map();

const isAdmin = async (chatId) => {
    return adminSessions.has(chatId);
};

const formatCurrency = (amount) => `⭐ ${parseFloat(amount || 0).toFixed(0)} Stars`;

const mainMenuKeyboard = {
    reply_markup: {
        keyboard: [
            ['👥 Users', '📊 Statistics'],
            ['📜 Transactions', '⚙️ Settings'],
            ['🎮 Game Control', '🔓 Logout']
        ],
        resize_keyboard: true
    }
};

const userMenuKeyboard = {
    reply_markup: {
        keyboard: [
            ['👤 Search User', '📋 All Users'],
            ['🔝 Top Users', '🔙 Back to Menu']
        ],
        resize_keyboard: true
    }
};

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    console.log('🎯 /start command');

    if (adminSessions.has(chatId)) {
        bot.sendMessage(chatId, '✅ You are already logged in!', mainMenuKeyboard);
        return;
    }

    bot.sendMessage(
        chatId,
        '🔐 *Admin Login*\n\n' +
        'Please enter your admin credentials:\n' +
        'Format: `/login email password`\n\n' +
        'Example: `/login admin@aviator.com 1234`',
        { parse_mode: 'Markdown' }
    );
});

bot.onText(/\/login\s+(\S+)\s+(\S+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const email = match[1];
    const password = match[2];

    console.log('🎯 /login command triggered!');
    console.log('🔍 Login attempt:', { email, password: '***', chatId });

    await bot.sendMessage(chatId, '⏳ Processing login...').catch(e => console.error('Send error:', e));

    try {
        const bcrypt = require('bcryptjs');

        const admin = await Admin.findOne({ email });
        console.log('👤 Admin found:', admin ? 'Yes' : 'No');

        if (!admin) {
            console.log('❌ Admin not found in database');
            await bot.sendMessage(chatId, '❌ Invalid credentials! Admin not found.');
            return;
        }

        console.log('🔐 Comparing passwords...');
        const isMatch = await bcrypt.compare(password, admin.password);
        console.log('🔐 Password match:', isMatch);

        if (!isMatch) {
            await bot.sendMessage(chatId, '❌ Invalid credentials! Wrong password.');
            return;
        }

        adminSessions.set(chatId, { email, adminId: admin._id });
        console.log('✅ Login successful for:', email);

        await bot.sendMessage(
            chatId,
            `✅ *Welcome Admin!*\n\n` +
            `Email: ${email}\n` +
            `Access Level: Full Control\n\n` +
            `Use the menu below to manage your platform.`,
            { ...mainMenuKeyboard, parse_mode: 'Markdown' }
        );
    } catch (error) {
        console.error('❌ Login error:', error);
        await bot.sendMessage(chatId, `❌ Login failed: ${error.message}`);
    }
});

bot.onText(/🔓 Logout/, async (msg) => {
    const chatId = msg.chat.id;
    adminSessions.delete(chatId);
    bot.sendMessage(chatId, '👋 Logged out successfully!', { reply_markup: { remove_keyboard: true } });
});

bot.onText(/📊 Statistics/, async (msg) => {
    const chatId = msg.chat.id;

    if (!await isAdmin(chatId)) {
        bot.sendMessage(chatId, '❌ Please login first: /start');
        return;
    }

    try {
        console.log('📊 Fetching statistics...');

        const totalUsers = await User.countDocuments({ deleted_at: null });
        const activeUsers = await User.countDocuments({ deleted_at: null, status: 1 });
        console.log('👥 Users:', { totalUsers, activeUsers });

        const totalTransactions = await Transaction.countDocuments({ deleted_at: null });
        const pendingPayments = await Transaction.countDocuments({ status: 'pending', deleted_at: null });
        console.log('💰 Transactions:', { totalTransactions, pendingPayments });

        const rechargeSum = await Transaction.aggregate([
            { $match: { transactionType: 'recharge', status: 'approved', deleted_at: null } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const withdrawSum = await Transaction.aggregate([
            { $match: { transactionType: 'withdraw', status: 'approved', deleted_at: null } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const totalRecharge = rechargeSum[0]?.total || 0;
        const totalWithdraw = withdrawSum[0]?.total || 0;
        const revenue = totalRecharge - totalWithdraw;
        console.log('💵 Financial:', { totalRecharge, totalWithdraw, revenue });

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
        console.error('❌ Statistics error:', error);
        bot.sendMessage(chatId, `❌ Error fetching statistics: ${error.message}`);
    }
});

bot.onText(/👥 Users/, async (msg) => {
    const chatId = msg.chat.id;

    if (!await isAdmin(chatId)) {
        bot.sendMessage(chatId, '❌ Please login first: /start');
        return;
    }

    bot.sendMessage(chatId, '👥 *User Management*\n\nChoose an option:', { ...userMenuKeyboard, parse_mode: 'Markdown' });
});

bot.onText(/📋 All Users/, async (msg) => {
    const chatId = msg.chat.id;

    if (!await isAdmin(chatId)) {
        bot.sendMessage(chatId, '❌ Please login first: /start');
        return;
    }

    try {
        const users = await User.find({ deleted_at: null })
            .sort({ createdAt: -1 })
            .limit(10);

        if (users.length === 0) {
            bot.sendMessage(chatId, '📭 No users found.');
            return;
        }

        let message = '📋 *Recent Users (Last 10):*\n\n';

        users.forEach((user, index) => {
            message += `${index + 1}. *${user.username || 'N/A'}*\n`;
            message += `   ID: \`${user.user_id || user._id}\`\n`;
            message += `   Balance: ${formatCurrency(user.balance)}\n`;
            message += `   Contact: ${user.contact || 'N/A'}\n\n`;
        });

        message += `\nTo search specific user: /searchuser <username or id>`;

        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Users error:', error);
        bot.sendMessage(chatId, '❌ Error fetching users.');
    }
});

bot.onText(/\/searchuser (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const query = match[1];

    if (!await isAdmin(chatId)) {
        bot.sendMessage(chatId, '❌ Please login first: /start');
        return;
    }

    try {
        const user = await User.findOne({
            $or: [
                { username: new RegExp(query, 'i') },
                { user_id: query },
                { email: new RegExp(query, 'i') },
                { contact: query }
            ],
            deleted_at: null
        });

        if (!user) {
            bot.sendMessage(chatId, '❌ User not found.');
            return;
        }

        const message = `👤 *User Details*\n\n` +
            `Name: ${user.username || 'N/A'}\n` +
            `User ID: \`${user.user_id || user._id}\`\n` +
            `Email: ${user.email || 'N/A'}\n` +
            `Contact: ${user.contact || 'N/A'}\n` +
            `Balance: ${formatCurrency(user.balance)}\n` +
            `Last Recharge: ${formatCurrency(user.last_recharge || 0)}\n` +
            `Status: ${user.status === 1 ? '✅ Active' : '❌ Inactive'}\n` +
            `Joined: ${user.createdAt?.toLocaleDateString() || 'N/A'}`;

        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Search user error:', error);
        bot.sendMessage(chatId, '❌ Error searching user.');
    }
});

bot.onText(/🔝 Top Users/, async (msg) => {
    const chatId = msg.chat.id;

    if (!await isAdmin(chatId)) {
        bot.sendMessage(chatId, '❌ Please login first: /start');
        return;
    }

    try {
        const topUsers = await User.find({ deleted_at: null })
            .sort({ balance: -1 })
            .limit(10);

        let message = '🔝 *Top 10 Users by Balance:*\n\n';

        topUsers.forEach((user, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
            message += `${medal} *${user.username || 'N/A'}*\n`;
            message += `   Balance: ${formatCurrency(user.balance)}\n\n`;
        });

        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Top users error:', error);
        bot.sendMessage(chatId, '❌ Error fetching top users.');
    }
});

bot.onText(/📜 Transactions/, async (msg) => {
    const chatId = msg.chat.id;

    if (!await isAdmin(chatId)) {
        bot.sendMessage(chatId, '❌ Please login first: /start');
        return;
    }

    try {
        console.log('📜 Fetching recharge transactions...');

        // Get total count first (only recharges)
        const totalCount = await Transaction.countDocuments({
            deleted_at: null,
            transactionType: 'recharge'
        });
        console.log(`Found ${totalCount} total recharge transactions`);

        if (totalCount === 0) {
            bot.sendMessage(chatId, '📭 No recharge transactions found in database.');
            return;
        }

        const transactions = await Transaction.find({
            deleted_at: null,
            transactionType: 'recharge' // Only show recharges
        })
            .sort({ createdAt: -1 })
            .limit(10) // Reduced to 10 to avoid message length issues
            .populate('user_id', 'username user_id')
            .lean();

        console.log(`Retrieved ${transactions.length} transactions`);

        if (transactions.length === 0) {
            bot.sendMessage(chatId, '📭 No transactions found.');
            return;
        }

        // Split into chunks to avoid Telegram message length limit
        let message = `💳 *Recharge History*\n`;
        message += `Total: ${totalCount} | Showing: ${transactions.length}\n\n`;

        let messageCount = 0;

        for (const txn of transactions) {
            const statusEmoji = txn.status === 'approved' ? '✅' : txn.status === 'pending' ? '⏳' : '❌';

            const txnMessage = `${statusEmoji} *RECHARGE*\n` +
                `User: ${txn.user_id?.username || txn.user_id?.user_id || 'N/A'}\n` +
                `Amount: ${formatCurrency(txn.amount)}\n` +
                `Status: ${txn.status}\n` +
                `Date: ${txn.createdAt ? new Date(txn.createdAt).toLocaleDateString() : 'N/A'}\n\n`;

            // Check if adding this transaction would exceed Telegram's limit
            if ((message + txnMessage).length > 3800) {
                // Send current message and start a new one
                await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
                message = '💳 *Recharge History (continued):*\n\n';
                messageCount++;
            }

            message += txnMessage;
        }

        // Send remaining message
        if (message.length > 0) {
            await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        }

        console.log('✅ Transactions sent successfully');
    } catch (error) {
        console.error('❌ Transactions error:', error);
        console.error('Error details:', error.message);
        bot.sendMessage(chatId, `❌ Error fetching transactions: ${error.message}`);
    }
});

bot.onText(/🎮 Game Control/, async (msg) => {
    const chatId = msg.chat.id;

    if (!await isAdmin(chatId)) {
        bot.sendMessage(chatId, '❌ Please login first: /start');
        return;
    }

    try {
        const setting = await Setting.findOne();

        if (!setting) {
            bot.sendMessage(chatId, '❌ Settings not found.');
            return;
        }

        const status = setting.gameStatus === 1 ? '🟢 Active' : '🔴 Inactive';

        const keyboard = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '🟢 Enable Game', callback_data: 'game_enable' },
                        { text: '🔴 Disable Game', callback_data: 'game_disable' }
                    ],
                    [{ text: '🔙 Back', callback_data: 'back_menu' }]
                ]
            }
        };

        bot.sendMessage(
            chatId,
            `🎮 *Game Control Panel*\n\n` +
            `Current Status: ${status}\n\n` +
            `Min Bet: ${formatCurrency(setting.minBetAmount)}\n` +
            `Max Bet: ${formatCurrency(setting.maxBetAmount)}\n` +
            `Min Recharge: ${formatCurrency(setting.minRecharge)}`,
            { ...keyboard, parse_mode: 'Markdown' }
        );
    } catch (error) {
        console.error('Game control error:', error);
        bot.sendMessage(chatId, '❌ Error fetching game settings.');
    }
});

bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (!await isAdmin(chatId)) {
        bot.answerCallbackQuery(query.id, { text: '❌ Unauthorized' });
        return;
    }

    try {
        if (data === 'game_enable') {
            await Setting.updateOne({}, { gameStatus: 1 });
            bot.answerCallbackQuery(query.id, { text: '✅ Game Enabled!' });
            bot.sendMessage(chatId, '🟢 *Game is now ACTIVE!*', { parse_mode: 'Markdown' });
        } else if (data === 'game_disable') {
            await Setting.updateOne({}, { gameStatus: 0 });
            bot.answerCallbackQuery(query.id, { text: '✅ Game Disabled!' });
            bot.sendMessage(chatId, '🔴 *Game is now INACTIVE!*', { parse_mode: 'Markdown' });
        } else if (data === 'back_menu') {
            bot.answerCallbackQuery(query.id);
            bot.sendMessage(chatId, '🏠 Main Menu', mainMenuKeyboard);
        }
    } catch (error) {
        console.error('Callback error:', error);
        bot.answerCallbackQuery(query.id, { text: '❌ Error' });
    }
});

bot.onText(/🔙 Back to Menu/, async (msg) => {
    const chatId = msg.chat.id;

    if (!await isAdmin(chatId)) {
        bot.sendMessage(chatId, '❌ Please login first: /start');
        return;
    }

    bot.sendMessage(chatId, '🏠 Main Menu', mainMenuKeyboard);
});

bot.onText(/⚙️ Settings/, async (msg) => {
    const chatId = msg.chat.id;

    if (!await isAdmin(chatId)) {
        bot.sendMessage(chatId, '❌ Please login first: /start');
        return;
    }

    try {
        const setting = await Setting.findOne();

        if (!setting) {
            bot.sendMessage(chatId, '❌ Settings not found.');
            return;
        }

        const message = `⚙️ *Game Settings*\n\n` +
            `Status: ${setting.gameStatus === 1 ? '🟢 Active' : '🔴 Inactive'}\n` +
            `Min Bet: ${formatCurrency(setting.minBetAmount)}\n` +
            `Max Bet: ${formatCurrency(setting.maxBetAmount)}\n` +
            `Min Recharge: ${formatCurrency(setting.minRecharge)}`;

        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Settings error:', error);
        bot.sendMessage(chatId, '❌ Error fetching settings.');
    }
});

bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;

    const helpMessage = `🤖 *Admin Bot Commands*\n\n` +
        `*Authentication:*\n` +
        `/start - Start bot\n` +
        `/login <email> <password> - Login as admin\n\n` +
        `*User Management:*\n` +
        `/searchuser <query> - Search user\n\n` +
        `*Debug:*\n` +
        `/status - Check bot and database status\n\n` +
        `*General:*\n` +
        `/help - Show this help message`;

    bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

bot.onText(/\/status/, async (msg) => {
    const chatId = msg.chat.id;

    if (!await isAdmin(chatId)) {
        bot.sendMessage(chatId, '❌ Please login first: /start');
        return;
    }

    try {
        const dbStatus = mongoose.connection.readyState;
        const dbStatusText = dbStatus === 1 ? '✅ Connected' : dbStatus === 2 ? '⏳ Connecting' : '❌ Disconnected';

        const userCount = await User.countDocuments({ deleted_at: null });
        const txnCount = await Transaction.countDocuments({ deleted_at: null });
        const pendingTxn = await Transaction.countDocuments({ status: 'pending', deleted_at: null });

        const message = `🔍 *System Status*\n\n` +
            `*Database:* ${dbStatusText}\n` +
            `*Users:* ${userCount}\n` +
            `*Transactions:* ${txnCount}\n` +
            `*Pending:* ${pendingTxn}\n\n` +
            `*Bot:* ✅ Running\n` +
            `*MongoDB URI:* ${MONGODB_URI}`;

        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Status error:', error);
        bot.sendMessage(chatId, `❌ Error checking status: ${error.message}`);
    }
});

console.log('✅ Admin Telegram Bot is running...');
console.log('🔑 Bot Token:', process.env.TELEGRAM_ADMIN_BOT_TOKEN ? 'Set' : 'NOT SET');
console.log('🗄️ MongoDB URI:', process.env.MONGODB_URI);

module.exports = bot;
