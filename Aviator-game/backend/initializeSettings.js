const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const Setting = require('./Models/Setting');

async function initializeSettings() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Aviator';
        await mongoose.connect(mongoUri);
        console.log('✅ MongoDB connected\n');

        // Check if settings already exist
        const existingSetting = await Setting.findOne();

        if (existingSetting) {
            console.log('⚠️  Settings already exist!');
            console.log('\nCurrent Settings:');
            console.log('================================');
            console.log('Game Status:', existingSetting.gameStatus === 1 ? '🟢 Active' : '🔴 Inactive');
            console.log('Min Bet:', existingSetting.minBetAmount);
            console.log('Max Bet:', existingSetting.maxBetAmount);
            console.log('Min Recharge:', existingSetting.minRecharge);
            console.log('Withdrawal Fee:', existingSetting.withdrawalFee + '%');
            console.log('================================\n');
            process.exit(0);
        }

        // Create default settings
        const defaultSettings = new Setting({
            gameStatus: 1, // Active by default
            withdrawalFee: 2, // 2% fee
            minBetAmount: 10,
            maxBetAmount: 10000,
            minRecharge: 100,
            initialBonus: 50,
            startGameRangeTimer: 5,
            endGameRangeTimer: 10
        });

        await defaultSettings.save();

        console.log('✅ Settings initialized successfully!');
        console.log('\nDefault Settings Created:');
        console.log('================================');
        console.log('Game Status: 🟢 Active');
        console.log('Min Bet: ₹10');
        console.log('Max Bet: ₹10,000');
        console.log('Min Recharge: ₹100');
        console.log('Withdrawal Fee: 2%');
        console.log('Initial Bonus: ₹50');
        console.log('Game Timer: 5-10 seconds');
        console.log('================================\n');

        console.log('✅ Game Control in Telegram bot will now work!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

initializeSettings();
