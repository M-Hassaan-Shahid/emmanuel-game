require('dotenv').config();
const { sendOTP, sendPasswordResetOTP } = require('./utils/mailer');

console.log('🧪 Testing Email Configuration...\n');
console.log('📧 Email User:', process.env.EMAIL_USER);
console.log('🔑 Email Pass:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Not Set');
console.log('');

// Test sending OTP
async function testEmail() {
    const testEmail = process.env.EMAIL_USER; // Send to yourself for testing
    const testOTP = '123456';

    console.log(`📤 Sending test OTP to: ${testEmail}`);
    console.log(`🔢 Test OTP: ${testOTP}\n`);

    try {
        // Test registration OTP
        console.log('1️⃣ Testing Registration OTP...');
        const result1 = await sendOTP(testEmail, testOTP);

        if (result1.success) {
            console.log('✅ Registration OTP sent successfully!');
            console.log('   Message ID:', result1.messageId);
        } else {
            console.log('❌ Failed to send registration OTP');
            console.log('   Error:', result1.error);
        }

        console.log('');

        // Test password reset OTP
        console.log('2️⃣ Testing Password Reset OTP...');
        const result2 = await sendPasswordResetOTP(testEmail, '4321');

        if (result2.success) {
            console.log('✅ Password reset OTP sent successfully!');
            console.log('   Message ID:', result2.messageId);
        } else {
            console.log('❌ Failed to send password reset OTP');
            console.log('   Error:', result2.error);
        }

        console.log('\n✅ Email test completed!');
        console.log('📬 Check your inbox:', testEmail);
        console.log('📁 Also check spam/junk folder if not in inbox');

    } catch (error) {
        console.error('\n❌ Test failed with error:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Make sure EMAIL_USER and EMAIL_PASS are set in .env');
        console.log('2. Use Gmail App Password (not regular password)');
        console.log('3. Enable 2-Step Verification on Google Account');
        console.log('4. Generate App Password: https://myaccount.google.com/apppasswords');
    }

    process.exit(0);
}

testEmail();
