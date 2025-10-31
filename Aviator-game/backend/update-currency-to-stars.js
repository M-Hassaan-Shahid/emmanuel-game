require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./Models/User');

console.log('\n' + '='.repeat(80));
console.log('💰 UPDATING ALL USER CURRENCIES TO STARS');
console.log('='.repeat(80) + '\n');

async function updateCurrency() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Aviator');
        console.log('✅ MongoDB connected\n');

        // Find all users with non-STARS currency
        const usersToUpdate = await User.find({
            $or: [
                { currency: { $ne: 'STARS' } },
                { currency: { $exists: false } },
                { currency: null }
            ]
        });

        console.log(`📊 Found ${usersToUpdate.length} users to update\n`);

        if (usersToUpdate.length === 0) {
            console.log('✅ All users already have STARS currency!');
            await mongoose.disconnect();
            process.exit(0);
        }

        // Show current currencies
        const currencyCount = {};
        usersToUpdate.forEach(user => {
            const curr = user.currency || 'NULL';
            currencyCount[curr] = (currencyCount[curr] || 0) + 1;
        });

        console.log('📋 Current currency distribution:');
        Object.entries(currencyCount).forEach(([curr, count]) => {
            console.log(`   ${curr}: ${count} users`);
        });
        console.log('');

        // Update all users to STARS
        const result = await User.updateMany(
            {
                $or: [
                    { currency: { $ne: 'STARS' } },
                    { currency: { $exists: false } },
                    { currency: null }
                ]
            },
            {
                $set: { currency: 'STARS' }
            }
        );

        console.log('✅ Update completed!');
        console.log(`   Modified: ${result.modifiedCount} users`);
        console.log(`   Matched: ${result.matchedCount} users\n`);

        // Verify the update
        const starsUsers = await User.countDocuments({ currency: 'STARS' });
        const totalUsers = await User.countDocuments();

        console.log('📊 Verification:');
        console.log(`   Total users: ${totalUsers}`);
        console.log(`   STARS currency: ${starsUsers}`);
        console.log(`   Other currency: ${totalUsers - starsUsers}\n`);

        if (starsUsers === totalUsers) {
            console.log('🎉 SUCCESS! All users now have STARS currency!');
        } else {
            console.log('⚠️  Some users still have different currency');
        }

        await mongoose.disconnect();
        console.log('\n' + '='.repeat(80) + '\n');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        await mongoose.disconnect();
        process.exit(1);
    }
}

updateCurrency();
