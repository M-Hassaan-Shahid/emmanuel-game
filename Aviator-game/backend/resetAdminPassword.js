const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const Admin = require('./Models/Admin');
const bcrypt = require('bcryptjs');

async function resetPassword() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Aviator');
        console.log('✅ MongoDB connected\n');

        const admin = await Admin.findOne({ email: 'admin@aviator.com' });

        if (!admin) {
            console.log('❌ Admin not found!');
            process.exit(1);
        }

        console.log('👤 Admin found:', admin.email);
        console.log('🔐 Resetting password to: 1234\n');

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('1234', salt);

        // Update admin password
        admin.password = hashedPassword;
        await admin.save();

        console.log('✅ Password reset successfully!\n');
        console.log('📱 Login credentials:');
        console.log('   Email: admin@aviator.com');
        console.log('   Password: 1234');
        console.log('\n🤖 Use in Telegram bot:');
        console.log('   /login admin@aviator.com 1234');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

resetPassword();
