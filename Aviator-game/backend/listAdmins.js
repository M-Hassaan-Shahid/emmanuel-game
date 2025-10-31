require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./Models/Admin');

async function listAdmins() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected\n');

        const admins = await Admin.find();

        if (admins.length === 0) {
            console.log('📭 No admins found in database.');
            console.log('\nCreate an admin using: node createAdmin.js');
            process.exit(0);
        }

        console.log('👥 Admin Users List');
        console.log('================================\n');

        admins.forEach((admin, index) => {
            console.log(`${index + 1}. Email: ${admin.email}`);
            console.log(`   Contact: ${admin.contact || 'N/A'}`);
            console.log(`   Status: ${admin.status === 1 ? '✅ Active' : '❌ Inactive'}`);
            console.log(`   Created: ${admin.createdAt?.toLocaleDateString() || 'N/A'}`);
            console.log(`   ID: ${admin._id}`);
            console.log('');
        });

        console.log('================================');
        console.log(`Total Admins: ${admins.length}\n`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

listAdmins();
