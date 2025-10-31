// Run this script once to fix the email index in MongoDB
// This allows multiple users with null email (Telegram-only accounts)

require('dotenv').config();
const mongoose = require('mongoose');

async function fixEmailIndex() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get the user collection
        const db = mongoose.connection.db;
        const collection = db.collection('user');

        // Drop the old email index
        try {
            await collection.dropIndex('email_1');
            console.log('✅ Dropped old email index');
        } catch (error) {
            console.log('ℹ️  Email index already dropped or doesn\'t exist');
        }

        // Create new sparse index
        await collection.createIndex({ email: 1 }, { unique: true, sparse: true });
        console.log('✅ Created new sparse email index');

        console.log('\n✅ Database fixed! You can now have multiple users with null email.');
        console.log('   Restart the Telegram bot to apply changes.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixEmailIndex();
