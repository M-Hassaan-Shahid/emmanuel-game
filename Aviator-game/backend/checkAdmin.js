const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const Admin = require('./Models/Admin');

async function checkAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aviator');
        console.log('✅ MongoDB connected\n');

        const admins = await Admin.find();

        if (admins.length === 0) {
            console.log('❌ No admin users found in database!');
            console.log('\n📝 To create an admin user, run:');
            console.log('   CREATE_ADMIN_NOW.bat');
            console.log('\n   Or manually:');
            console.log('   cd backend');
            console.log('   node createAdmin.js');
        } else {
            console.log('✅ Admin users found!\n');
            console.log('================================');
            admins.forEach((admin, index) => {
                console.log(`\n${index + 1}. Email: ${admin.email}`);
                console.log(`   Contact: ${admin.contact || 'N/A'}`);
                console.log(`   Status: ${admin.status === 1 ? 'Active' : 'Inactive'}`);
                console.log(`   Created: ${admin.createdAt?.toLocaleDateString() || 'N/A'}`);
            });
            console.log('\n================================');
            console.log(`\nTotal Admins: ${admins.length}`);
            console.log('\n✅ You can login with these credentials!');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n⚠️  Make sure MongoDB is running!');
        console.log('   Run: mongod');
        process.exit(1);
    }
}

checkAdmin();
