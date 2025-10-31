require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const User = require('../Models/User');
const Transaction = require('../Models/Transaction');

// Initialize bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Store user sessions
const userSessions = new Map();

// ==================== TELEGRAM STARS PAYMENT ====================

// Main menu with Stars payment option
const mainMenu = {
    reply_markup: {
        keyboard: [
            ['💰 Buy Credits with Stars', '💳 Balance'],
            ['🌐 Open Website', '❓ Help']
        ],
        resize_keyboard: true
    }
};

// Start command - with optional link code or purchase deep link
bot.onText(/\/start(.*)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;
    const username = msg.from.username || msg.from.first_name;
    const parameter = match[1] ? match[1].trim() : null;

    try {
        // Check if user already exists
        let user = await User.findOne({ telegramId: telegramId.toString() });

        // Handle login request (e.g., /start login)
        if (parameter === 'login') {
            if (user) {
                bot.sendMessage(
                    chatId,
                    `✅ *Already Logged In!*\n\n` +
                    `👤 Username: ${user.username || username}\n` +
                    `⭐ Balance: ${user.balance} Stars\n\n` +
                    `You can now use the bot or visit the website!`,
                    { ...mainMenu, parse_mode: 'Markdown' }
                );
            } else {
                bot.sendMessage(
                    chatId,
                    `👋 *Welcome!*\n\n` +
                    `I'll create an account for you automatically.\n` +
                    `Just send /start to get started!\n\n` +
                    `💡 *Already have a website account?*\n` +
                    `Link it here:\n` +
                    `1. Login on the website\n` +
                    `2. Go to Profile → Link Telegram\n` +
                    `3. Use the 6-digit code to connect`,
                    { parse_mode: 'Markdown' }
                );
            }
            return;
        }

        // Handle deep link purchase (e.g., /start buy_100)
        if (parameter && parameter.startsWith('buy_')) {
            const amount = parseInt(parameter.split('_')[1]);

            if (!user) {
                bot.sendMessage(
                    chatId,
                    `❌ *Account Not Linked*\n\n` +
                    `Please link your Telegram account first!\n\n` +
                    `Go to the website → Profile → Link Telegram\n` +
                    `Then come back to make a purchase.`,
                    { parse_mode: 'Markdown' }
                );
                return;
            }

            // Create invoice directly
            await createStarsInvoice(chatId, amount);
            return;
        }

        // If link code provided (6-digit number), try to link account
        if (parameter && !user && /^\d{6}$/.test(parameter)) {
            try {
                const axios = require('axios');
                const response = await axios.post(
                    `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/telegram-link/verify-link-code`,
                    {
                        code: parameter,
                        telegramId: telegramId.toString(),
                        telegramUsername: username
                    }
                );

                if (response.data.success) {
                    // Fetch the linked user
                    user = await User.findOne({ telegramId: telegramId.toString() });

                    bot.sendMessage(
                        chatId,
                        `✅ *Account Linked Successfully!*\n\n` +
                        `🎮 Welcome to Aviator Game!\n` +
                        `👤 Username: ${user.username || username}\n` +
                        `📧 Email: ${user.email || 'Not set'}\n` +
                        `⭐ Balance: ${user.balance} Stars\n\n` +
                        `Your web account is now connected!\n` +
                        `You can buy Stars here and use them on the website.`,
                        { ...mainMenu, parse_mode: 'Markdown' }
                    );
                    return;
                }
            } catch (linkError) {
                console.error('Link error:', linkError);
                bot.sendMessage(
                    chatId,
                    `❌ Failed to link account.\n` +
                    `The code may be invalid or expired.\n\n` +
                    `Please generate a new code from the website.`
                );
            }
        }

        // If no user found, create Telegram-only account
        if (!user) {
            try {
                // Generate unique user ID
                let uniqueUId;
                let isUnique = false;

                while (!isUnique) {
                    uniqueUId = `T${Math.floor(10000 + Math.random() * 90000)}`;
                    const existingId = await User.findOne({ user_id: uniqueUId });
                    if (!existingId) {
                        isUnique = true;
                    }
                }

                user = new User({
                    username: username || `user_${telegramId}`,
                    user_id: uniqueUId,
                    telegramId: telegramId.toString(),
                    balance: 0,
                    status: 1,
                    isVerified: true,
                });

                await user.save();
                console.log(`✅ New Telegram-only user created: ${username || telegramId}`);

                bot.sendMessage(
                    chatId,
                    `🎮 *Welcome to Aviator Game!*\n\n` +
                    `✅ Account created successfully!\n\n` +
                    `👤 Username: ${user.username}\n` +
                    `🆔 User ID: ${user.user_id}\n` +
                    `⭐ Balance: ${user.balance} Stars\n\n` +
                    `🌐 *How to Login on Website:*\n` +
                    `1. Click "🌐 Open Website" below\n` +
                    `2. On the login page, click the "Telegram" button\n` +
                    `3. You'll be logged in automatically!\n\n` +
                    `💡 Your balance syncs automatically between bot and website.\n\n` +
                    `Use the menu below to get started!`,
                    { ...mainMenu, parse_mode: 'Markdown' }
                );
            } catch (createError) {
                console.error('Error creating user:', createError);
                bot.sendMessage(
                    chatId,
                    `❌ *Error Creating Account*\n\n` +
                    `There was an error creating your account.\n\n` +
                    `Please run this command first:\n` +
                    `\`node fix-email-index.js\`\n\n` +
                    `Then restart the bot and try again.`,
                    { parse_mode: 'Markdown' }
                );
                return; // Exit early if user creation fails
            }
        } else {
            // Existing user
            bot.sendMessage(
                chatId,
                `🎮 *Welcome Back!*\n\n` +
                `👤 Username: ${user.username || username}\n` +
                `⭐ Balance: ${user.balance} Stars\n\n` +
                `Use the menu below to continue!`,
                { ...mainMenu, parse_mode: 'Markdown' }
            );
        }

        if (user && user._id) {
            userSessions.set(chatId, { userId: user._id, telegramId });
        }

    } catch (error) {
        console.error('Start error:', error);
        bot.sendMessage(chatId, '❌ Error starting bot. Please try again.');
    }
});

// Buy Credits with Telegram Stars
bot.onText(/💰 Buy Credits with Stars/, async (msg) => {
    const chatId = msg.chat.id;

    const keyboard = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '⭐ 100 Stars', callback_data: 'buy_100' },
                    { text: '⭐ 500 Stars', callback_data: 'buy_500' }
                ],
                [
                    { text: '⭐ 1000 Stars', callback_data: 'buy_1000' },
                    { text: '⭐ 5000 Stars', callback_data: 'buy_5000' }
                ],
                [{ text: '🔙 Back', callback_data: 'back_menu' }]
            ]
        }
    };

    bot.sendMessage(
        chatId,
        `⭐ *Buy Credits with Telegram Stars*\n\n` +
        `Choose a package:\n` +
        `Purchase Stars to play the game!\n\n` +
        `Select amount below:`,
        { ...keyboard, parse_mode: 'Markdown' }
    );
});

// Handle purchase callbacks
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (data.startsWith('buy_')) {
        const amount = parseInt(data.split('_')[1]);
        await createStarsInvoice(chatId, amount);
        bot.answerCallbackQuery(query.id);
    } else if (data === 'back_menu') {
        bot.answerCallbackQuery(query.id);
        bot.sendMessage(chatId, '🏠 Main Menu', mainMenu);
    }
});

// Create Telegram Stars invoice
async function createStarsInvoice(chatId, amount) {
    try {
        const title = `${amount} Telegram Stars`;
        const description = `Add ${amount} Stars to your Aviator game balance`;
        const payload = `stars_${chatId}_${amount}_${Date.now()}`;
        const currency = 'XTR'; // Telegram Stars currency code
        const prices = [{ label: 'Telegram Stars', amount: amount }]; // Amount in Stars

        await bot.sendInvoice(
            chatId,
            title,
            description,
            payload,
            '', // provider_token (empty for Stars)
            currency,
            prices,
            {
                photo_url: 'https://your-domain.com/game-icon.png', // Optional
                photo_width: 512,
                photo_height: 512,
                need_name: false,
                need_phone_number: false,
                need_email: false,
                need_shipping_address: false,
                is_flexible: false
            }
        );

        bot.sendMessage(
            chatId,
            `✅ Invoice created!\n\n` +
            `Amount: ⭐ ${amount} Stars\n` +
            `You will receive: ${amount} Stars in your game balance\n\n` +
            `Click the invoice above to pay.`
        );
    } catch (error) {
        console.error('Invoice error:', error);
        bot.sendMessage(chatId, '❌ Error creating invoice. Please try again.');
    }
}

// Handle pre-checkout query (before payment)
bot.on('pre_checkout_query', async (query) => {
    try {
        // Validate the payment
        await bot.answerPreCheckoutQuery(query.id, true);
    } catch (error) {
        console.error('Pre-checkout error:', error);
        await bot.answerPreCheckoutQuery(query.id, false, {
            error_message: 'Payment validation failed'
        });
    }
});

// Handle successful payment
bot.on('successful_payment', async (msg) => {
    const chatId = msg.chat.id;
    const payment = msg.successful_payment;
    const telegramId = msg.from.id;

    try {
        // Extract amount from payload
        const payload = payment.invoice_payload;
        const payloadParts = payload.split('_');
        const amount = parseInt(payloadParts[2] || payloadParts[payloadParts.length - 2]);

        // Check if this is a web payment (starts with web_stars_)
        const isWebPayment = payload.startsWith('web_stars_');

        if (isWebPayment) {
            // Call webhook to update web transaction
            const axios = require('axios');
            const userId = payloadParts[2];

            try {
                await axios.post(
                    `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/telegram/payment-webhook`,
                    {
                        payload: payload,
                        userId: userId,
                        amount: amount,
                        telegram_charge_id: payment.telegram_payment_charge_id
                    }
                );

                console.log('✅ Web payment processed:', payload);
            } catch (webhookError) {
                console.error('Webhook error:', webhookError.message);
            }
        }

        // Find user and update balance
        const user = await User.findOne({ telegramId: telegramId.toString() });

        if (!user) {
            // For web payments, user might not have telegramId yet
            if (isWebPayment) {
                bot.sendMessage(
                    chatId,
                    `✅ *Payment Successful!*\n\n` +
                    `⭐ Paid: ${amount} Stars\n` +
                    `Your balance has been updated on the website!\n\n` +
                    `Refresh the page to see your new balance.`,
                    { parse_mode: 'Markdown' }
                );
                return;
            }

            bot.sendMessage(chatId, '❌ User not found. Please /start again.');
            return;
        }

        user.balance += amount;
        await user.save();

        // Create transaction record
        const transaction = new Transaction({
            user_id: user._id,
            amount: amount,
            transactionType: 'recharge',
            paymentType: 'telegram_stars',
            status: 'approved',
            telegram_charge_id: payment.telegram_payment_charge_id,
            telegram_invoice_payload: payload
        });
        await transaction.save();

        bot.sendMessage(
            chatId,
            `✅ *Payment Successful!*\n\n` +
            `⭐ Paid: ${amount} Stars\n` +
            `⭐ Added: ${amount} Stars\n` +
            `⭐ New Balance: ${user.balance} Stars\n\n` +
            `Transaction ID: ${transaction._id}\n\n` +
            `You can now play the game!`,
            { parse_mode: 'Markdown' }
        );
    } catch (error) {
        console.error('Payment processing error:', error);
        bot.sendMessage(chatId, '❌ Error processing payment. Contact support.');
    }
});

// Check Balance
bot.onText(/💳 Balance/, async (msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;

    try {
        const user = await User.findOne({ telegramId });

        if (!user) {
            bot.sendMessage(chatId, '❌ User not found. Please /start again.');
            return;
        }

        bot.sendMessage(
            chatId,
            `💳 *Your Balance*\n\n` +
            `⭐ Current Balance: ${user.balance} Stars\n` +
            `⭐ Last Recharge: ${user.last_recharge || 0} Stars\n\n` +
            `Use "💰 Buy Credits" to add more!`,
            { parse_mode: 'Markdown' }
        );
    } catch (error) {
        console.error('Balance error:', error);
        bot.sendMessage(chatId, '❌ Error fetching balance.');
    }
});

// Removed withdraw functionality - not offered

// Open Website button
bot.on('message', async (msg) => {
    if (msg.text === '🌐 Open Website') {
        const chatId = msg.chat.id;
        const websiteUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        bot.sendMessage(
            chatId,
            `🌐 *Visit Our Website*\n\n` +
            `Open this link to play Aviator Game:\n` +
            `${websiteUrl}\n\n` +
            `💡 *Your balance will sync automatically!*\n` +
            `Login with your Telegram account to access your Stars.\n\n` +
            `🎮 Copy the link above and paste it in your browser to play!`,
            { parse_mode: 'Markdown' }
        );
    }
});

// Help command
bot.onText(/❓ Help/, async (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(
        chatId,
        `❓ *Help & Commands*\n\n` +
        `*Payment:*\n` +
        `💰 Buy Credits - Purchase Telegram Stars\n` +
        `💳 Balance - Check your Stars balance\n\n` +
        `*Website:*\n` +
        `🌐 Open Website - Play the game online\n\n` +
        `*Commands:*\n` +
        `/start - Start bot\n` +
        `/help - Show this help\n\n` +
        `*How to Play:*\n` +
        `1. Buy Stars using this bot\n` +
        `2. Click "🌐 Open Website"\n` +
        `3. Login and play!\n\n` +
        `💡 *Note:* Withdrawals are not available. Stars can only be used for playing the game.`,
        { parse_mode: 'Markdown' }
    );
});

console.log('✅ Telegram Stars Bot is running...');

module.exports = bot;
