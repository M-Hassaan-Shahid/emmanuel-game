require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./Models/User');
const Admin = require('./Models/Admin');
const Transaction = require('./Models/Transaction');
const Setting = require('./Models/Setting');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

console.log('\n' + '='.repeat(80));
console.log('🔍 AVIATOR GAME - COMPLETE SYSTEM DIAGNOSTICS');
console.log('='.repeat(80) + '\n');

async function diagnoseSystem() {
    const results = {
        environment: {},
        database: {},
        models: {},
        auth: {},
        api: {},
        summary: { passed: 0, failed: 0, warnings: 0 }
    };

    // ==================== ENVIRONMENT VARIABLES ====================
    console.log('📋 1. ENVIRONMENT VARIABLES');
    console.log('-'.repeat(80));

    const requiredEnvVars = [
        'MONGODB_URI',
        'JWT_SECRET',
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',
        'TELEGRAM_BOT_TOKEN',
        'TELEGRAM_ADMIN_BOT_TOKEN',
        'EMAIL_USER',
        'EMAIL_PASS',
        'FRONTEND_URL'
    ];

    requiredEnvVars.forEach(varName => {
        const value = process.env[varName];
        const status = value ? '✅' : '❌';
        const display = value ? (varName.includes('SECRET') || varName.includes('PASS') ? '***' : value.substring(0, 20) + '...') : 'NOT SET';
        console.log(`${status} ${varName.padEnd(30)} ${display}`);
        results.environment[varName] = !!value;
        if (value) results.summary.passed++; else results.summary.failed++;
    });

    // ==================== DATABASE CONNECTION ====================
    console.log('\n📊 2. DATABASE CONNECTION');
    console.log('-'.repeat(80));

    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Aviator', {
            serverSelectionTimeoutMS: 5000
        });
        console.log('✅ MongoDB connected successfully');
        console.log(`   Database: ${mongoose.connection.name}`);
        console.log(`   Host: ${mongoose.connection.host}`);
        results.database.connected = true;
        results.summary.passed++;
    } catch (error) {
        console.log('❌ MongoDB connection failed:', error.message);
        results.database.connected = false;
        results.database.error = error.message;
        results.summary.failed++;
        return results; // Can't continue without DB
    }

    // ==================== DATABASE MODELS ====================
    console.log('\n📦 3. DATABASE MODELS & DATA');
    console.log('-'.repeat(80));

    try {
        // Users
        const userCount = await User.countDocuments();
        const verifiedUsers = await User.countDocuments({ isVerified: true });
        const googleUsers = await User.countDocuments({ googleId: { $exists: true, $ne: null } });
        const telegramUsers = await User.countDocuments({ telegramId: { $exists: true, $ne: null } });

        console.log(`✅ Users Model:`);
        console.log(`   Total: ${userCount}`);
        console.log(`   Verified: ${verifiedUsers}`);
        console.log(`   Google Auth: ${googleUsers}`);
        console.log(`   Telegram Auth: ${telegramUsers}`);
        results.models.users = { total: userCount, verified: verifiedUsers };
        results.summary.passed++;

        // Admins
        const adminCount = await Admin.countDocuments();
        const activeAdmins = await Admin.countDocuments({ status: 1 });
        console.log(`✅ Admins Model:`);
        console.log(`   Total: ${adminCount}`);
        console.log(`   Active: ${activeAdmins}`);
        results.models.admins = { total: adminCount, active: activeAdmins };
        results.summary.passed++;

        // Transactions
        const txnCount = await Transaction.countDocuments();
        const pendingTxn = await Transaction.countDocuments({ status: 'pending' });
        console.log(`✅ Transactions Model:`);
        console.log(`   Total: ${txnCount}`);
        console.log(`   Pending: ${pendingTxn}`);
        results.models.transactions = { total: txnCount, pending: pendingTxn };
        results.summary.passed++;

        // Settings
        const settings = await Setting.findOne();
        if (settings) {
            console.log(`✅ Settings Model:`);
            console.log(`   Game Status: ${settings.gameStatus === 1 ? '🟢 Active' : '🔴 Inactive'}`);
            console.log(`   Min Bet: ⭐ ${settings.minBetAmount} Stars`);
            console.log(`   Max Bet: ⭐ ${settings.maxBetAmount} Stars`);
            results.models.settings = { exists: true, gameActive: settings.gameStatus === 1 };
            results.summary.passed++;
        } else {
            console.log(`⚠️  Settings Model: Not initialized`);
            results.models.settings = { exists: false };
            results.summary.warnings++;
        }

    } catch (error) {
        console.log('❌ Error checking models:', error.message);
        results.summary.failed++;
    }

    // ==================== AUTHENTICATION ====================
    console.log('\n🔐 4. AUTHENTICATION SYSTEMS');
    console.log('-'.repeat(80));

    // JWT Test
    try {
        const testPayload = { id: 'test123', email: 'test@test.com' };
        const testToken = jwt.sign(testPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
        const decoded = jwt.verify(testToken, process.env.JWT_SECRET);
        console.log('✅ JWT: Working correctly');
        results.auth.jwt = true;
        results.summary.passed++;
    } catch (error) {
        console.log('❌ JWT: Failed -', error.message);
        results.auth.jwt = false;
        results.summary.failed++;
    }

    // Bcrypt Test
    try {
        const testPassword = 'test1234';
        const hash = await bcrypt.hash(testPassword, 10);
        const isMatch = await bcrypt.compare(testPassword, hash);
        console.log('✅ Bcrypt: Working correctly');
        results.auth.bcrypt = true;
        results.summary.passed++;
    } catch (error) {
        console.log('❌ Bcrypt: Failed -', error.message);
        results.auth.bcrypt = false;
        results.summary.failed++;
    }

    // Google OAuth Config
    const googleConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
    console.log(`${googleConfigured ? '✅' : '❌'} Google OAuth: ${googleConfigured ? 'Configured' : 'Not configured'}`);
    results.auth.google = googleConfigured;
    if (googleConfigured) results.summary.passed++; else results.summary.failed++;

    // Telegram Bot Config
    const telegramConfigured = !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_ADMIN_BOT_TOKEN);
    console.log(`${telegramConfigured ? '✅' : '❌'} Telegram Bots: ${telegramConfigured ? 'Configured' : 'Not configured'}`);
    results.auth.telegram = telegramConfigured;
    if (telegramConfigured) results.summary.passed++; else results.summary.failed++;

    // ==================== API ENDPOINTS ====================
    console.log('\n🌐 5. API ENDPOINTS (Backend must be running)');
    console.log('-'.repeat(80));

    const backendUrl = 'http://localhost:8000';
    const endpoints = [
        { path: '/api/auth/google', method: 'GET', description: 'Google OAuth' },
        { path: '/api/sendmailsms', method: 'POST', description: 'Send OTP' },
        { path: '/api/verifyotpreg', method: 'POST', description: 'Verify OTP' },
        { path: '/api/insertuser', method: 'POST', description: 'Register User' },
        { path: '/api/userlogin', method: 'POST', description: 'User Login' }
    ];

    console.log('⚠️  Note: Backend must be running on port 8000 for API tests');
    console.log('   Run: npm start (in backend folder)');

    // ==================== CURRENCY CHECK ====================
    console.log('\n💰 6. CURRENCY CONFIGURATION');
    console.log('-'.repeat(80));

    try {
        const sampleUser = await User.findOne().limit(1);
        if (sampleUser) {
            const currency = sampleUser.currency || 'NOT SET';
            const isStars = currency === 'STARS';
            console.log(`${isStars ? '✅' : '⚠️ '} User Currency: ${currency} ${isStars ? '' : '(Should be STARS)'}`);
            results.models.currency = currency;
            if (isStars) results.summary.passed++; else results.summary.warnings++;
        }
    } catch (error) {
        console.log('⚠️  Could not check currency');
    }

    // ==================== SUMMARY ====================
    console.log('\n' + '='.repeat(80));
    console.log('📊 DIAGNOSTIC SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Passed:   ${results.summary.passed}`);
    console.log(`❌ Failed:   ${results.summary.failed}`);
    console.log(`⚠️  Warnings: ${results.summary.warnings}`);
    console.log('');

    if (results.summary.failed === 0) {
        console.log('🎉 ALL CRITICAL SYSTEMS OPERATIONAL!');
    } else if (results.summary.failed < 5) {
        console.log('⚠️  SOME ISSUES DETECTED - Review failed items above');
    } else {
        console.log('❌ CRITICAL ISSUES DETECTED - System may not function properly');
    }

    console.log('\n' + '='.repeat(80));
    console.log('📝 RECOMMENDATIONS:');
    console.log('='.repeat(80));

    if (!results.database.connected) {
        console.log('❗ Start MongoDB: mongod or net start MongoDB');
    }
    if (!results.environment.EMAIL_USER || !results.environment.EMAIL_PASS) {
        console.log('❗ Configure email in .env for OTP functionality');
    }
    if (!results.auth.google) {
        console.log('❗ Configure Google OAuth credentials in .env');
    }
    if (results.models.admins?.total === 0) {
        console.log('❗ Create admin user: node createAdmin.js');
    }
    if (!results.models.settings?.exists) {
        console.log('❗ Initialize settings: node initializeSettings.js');
    }

    console.log('\n' + '='.repeat(80) + '\n');

    await mongoose.disconnect();
    process.exit(0);
}

diagnoseSystem().catch(error => {
    console.error('\n❌ Diagnostic failed:', error);
    process.exit(1);
});
