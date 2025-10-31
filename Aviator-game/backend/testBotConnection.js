// Quick test to verify bot database connections
require('dotenv').config();
const mongoose = require('mongoose');
const BankDetail = require('./Models/BankDetail');
const PromoCode = require('./Models/PromoCode');
const PlaneCrash = require('./Models/PlaneCrash');
const Transaction = require('./Models/Transaction');
const User = require('./Models/User');
const Admin = require('./Models/Admin');
const Setting = require('./Models/Setting');

async function testConnections() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected\n');

        // Test Admin
        const adminCount = await Admin.countDocuments();
        console.log(`👤 Admins in database: ${adminCount}`);
        if (adminCount > 0) {
            const admin = await Admin.findOne();
            console.log(`   Email: ${admin.email}`);
        }

        // Test Users
        const userCount = await User.countDocuments({ deleted_at: null });
        console.log(`\n👥 Users in database: ${userCount}`);

        // Test Transactions
        const txnCount = await Transaction.countDocuments({ deleted_at: null });
        const pendingCount = await Transaction.countDocuments({ status: 'pending' });
        console.log(`\n💰 Transactions: ${txnCount} (${pendingCount} pending)`);

        // Test Bank Details
        const bankCount = await BankDetail.countDocuments({ deleted_at: null });
        console.log(`\n🏦 Bank Details: ${bankCount}`);
        if (bankCount > 0) {
            const bank = await BankDetail.findOne({ deleted_at: null });
            console.log(`   Bank: ${bank.bankName || 'N/A'}`);
            console.log(`   UPI: ${bank.upiId || 'N/A'}`);
        }

        // Test Promo Codes
        const promoCount = await PromoCode.countDocuments();
        console.log(`\n🎁 Promo Codes: ${promoCount}`);
        if (promoCount > 0) {
            const promo = await PromoCode.findOne();
            console.log(`   Reward: ₹${promo.reward}`);
        }

        // Test Crash Settings
        const crashCount = await PlaneCrash.countDocuments({ deleted_at: null });
        console.log(`\n📊 Crash Settings: ${crashCount}`);
        if (crashCount > 0) {
            const crash = await PlaneCrash.findOne({ deleted_at: null });
            console.log(`   Range: ${crash.firstValue}x - ${crash.secondValue}x`);
            console.log(`   Crash %: ${crash.crashPercentage}%`);
        }

        // Test Settings
        const setting = await Setting.findOne();
        if (setting) {
            console.log(`\n⚙️ Game Settings:`);
            console.log(`   Status: ${setting.gameStatus === 1 ? '🟢 Active' : '🔴 Inactive'}`);
            console.log(`   Min Bet: ₹${setting.minBetAmount}`);
            console.log(`   Max Bet: ₹${setting.maxBetAmount}`);
        }

        console.log('\n✅ All database connections working!');
        console.log('\n📱 Your Telegram bot can access all this data.');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

testConnections();
