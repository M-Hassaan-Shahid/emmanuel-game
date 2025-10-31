require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

console.log('🔍 Testing Admin Bot Configuration...\n');

// Check if token exists
if (!process.env.TELEGRAM_ADMIN_BOT_TOKEN) {
    console.error('❌ TELEGRAM_ADMIN_BOT_TOKEN not found in .env file!');
    process.exit(1);
}

console.log('✅ Token found in .env');
console.log('📡 Token:', process.env.TELEGRAM_ADMIN_BOT_TOKEN.substring(0, 10) + '...');

// Test bot connection
const bot = new TelegramBot(process.env.TELEGRAM_ADMIN_BOT_TOKEN, { polling: false });

console.log('\n🤖 Testing bot connection...');

bot.getMe()
    .then((botInfo) => {
        console.log('\n✅ Bot is working!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🤖 Bot Name:', botInfo.first_name);
        console.log('👤 Username:', '@' + botInfo.username);
        console.log('🆔 Bot ID:', botInfo.id);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n📱 To use the bot:');
        console.log('1. Open Telegram');
        console.log('2. Search for: @' + botInfo.username);
        console.log('3. Send: /start');
        console.log('4. Login with: /login your-email@example.com your-password');
        console.log('\n✅ Bot is ready to receive commands!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Bot connection failed!');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('Error:', error.message);
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        if (error.message.includes('401')) {
            console.error('\n🔧 Fix: Invalid bot token');
            console.error('1. Go to @BotFather on Telegram');
            console.error('2. Send: /mybots');
            console.error('3. Select your admin bot');
            console.error('4. Click "API Token"');
            console.error('5. Copy the new token');
            console.error('6. Update TELEGRAM_ADMIN_BOT_TOKEN in .env file');
        } else if (error.message.includes('ETELEGRAM')) {
            console.error('\n🔧 Fix: Network/Telegram API issue');
            console.error('1. Check your internet connection');
            console.error('2. Try again in a few minutes');
            console.error('3. Check if Telegram is blocked in your region');
        }

        process.exit(1);
    });
