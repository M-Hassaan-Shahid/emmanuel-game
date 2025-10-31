const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./Models/Admin');

// Admin credentials - CHANGE THESE!
const ADMIN_EMAIL = 'admin@aviator.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_CONTACT = '+1234567890';

async function createAdmin() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Aviator';
        await mongoose.connect(mongoUri);
        console.log('✅ MongoDB connected');

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email: ADMIN_EMAIL });

        if (existingAdmin) {
            console.log('⚠️  Admin already exists with this email!');
            console.log('Email:', existingAdmin.email);
            console.log('\nTo update password, delete the existing admin first or use a different email.');
            process.exit(0);
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

        // Create new admin
        const newAdmin = new Admin({
            email: ADMIN_EMAIL,
            password: hashedPassword,
            contact: ADMIN_CONTACT,
            status: 1
        });

        await newAdmin.save();

        console.log('\n✅ Admin created successfully!');
        console.log('================================');
        console.log('Email:', ADMIN_EMAIL);
        console.log('Password:', ADMIN_PASSWORD);
        console.log('Contact:', ADMIN_CONTACT);
        console.log('================================');
        console.log('\n⚠️  IMPORTANT: Change the default password after first login!');
        console.log('\nYou can now login at: http://localhost:3000');
        console.log('Or use Telegram bot: /login', ADMIN_EMAIL, ADMIN_PASSWORD);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    }
}

createAdmin();
