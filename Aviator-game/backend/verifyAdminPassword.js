const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const Admin = require('./Models/Admin');
const bcrypt = require('bcryptjs');

async function verifyPassword() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Aviator');
        console.log('✅ MongoDB connected\n');

        const admin = await Admin.findOne({ email: 'admin@aviator.com' });

        if (!admin) {
            console.log('❌ Admin not found!');
            process.exit(1);
        }

        console.log('👤 Admin found:', admin.email);
        console.log('🔐 Password hash:', admin.password);
        console.log('\n🔍 Testing passwords...\n');

        // Test common passwords
        const testPasswords = ['1234', 'admin', 'password', 'admin123', '12345678'];

        for (const pwd of testPasswords) {
            const isMatch = await bcrypt.compare(pwd, admin.password);
            console.log(`   ${pwd.padEnd(15)} -> ${isMatch ? '✅ MATCH!' : '❌ No match'}`);
            if (isMatch) {
                console.log(`\n✅ Correct password is: ${pwd}`);
                console.log(`\nUse this to login:`);
                console.log(`/login admin@aviator.com ${pwd}`);
                process.exit(0);
            }
        }

        console.log('\n❌ None of the common passwords matched!');
        console.log('\n📝 To reset password to "1234", run:');
        console.log('   node resetAdminPassword.js');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

verifyPassword();
