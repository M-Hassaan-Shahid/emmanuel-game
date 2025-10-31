// Quick test script to verify Nodemailer OTP is working
// Run: node backend/test-email.js

require('dotenv').config();
const { sendOTP, sendPasswordResetOTP } = require('./utils/mailer');

const testEmail = async () => {
    console.log('\n' + '='.repeat(70));
    console.log('🧪 TESTING NODEMAILER OTP SYSTEM');
    console.log('='.repeat(70));

    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_PASS === 'your-16-char-app-password-here') {
        console.log('\n❌ EMAIL NOT CONFIGURED!');
        console.log('\nPlease update backend/.env with:');
        console.log('EMAIL_USER=your-email@gmail.com');
        console.log('EMAIL_PASS=your-16-char-app-password');
        console.log('\nSee SETUP_NODEMAILER_OTP.md for instructions');
        console.log('='.repeat(70) + '\n');
        return;
    }

    console.log('\n✅ Email credentials found');
    console.log(`📧 Email: ${process.env.EMAIL_USER}`);
    console.log(`🔑 Password: ${'*'.repeat(16)}`);

    // Get test email from command line or use default
    const testEmailAddress = process.argv[2] || process.env.EMAIL_USER;

    console.log(`\n📬 Sending test OTP to: ${testEmailAddress}`);

    // Generate test OTP
    const testOTP = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`🔢 Generated OTP: ${testOTP}`);

    console.log('\n📤 Sending registration OTP email...');
    const result1 = await sendOTP(testEmailAddress, testOTP);

    if (result1.success) {
        console.log('✅ Registration OTP sent successfully!');
        console.log(`📨 Message ID: ${result1.messageId}`);
    } else {
        console.log('❌ Failed to send registration OTP');
        console.log(`Error: ${result1.error}`);
    }

    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test password reset OTP
    const resetOTP = Math.floor(1000 + Math.random() * 9000).toString();
    console.log(`\n🔢 Generated Reset OTP: ${resetOTP}`);
    console.log('📤 Sending password reset OTP email...');

    const result2 = await sendPasswordResetOTP(testEmailAddress, resetOTP);

    if (result2.success) {
        console.log('✅ Password reset OTP sent successfully!');
        console.log(`📨 Message ID: ${result2.messageId}`);
    } else {
        console.log('❌ Failed to send password reset OTP');
        console.log(`Error: ${result2.error}`);
    }

    console.log('\n' + '='.repeat(70));
    console.log('🎉 TEST COMPLETE');
    console.log('='.repeat(70));
    console.log('\n📧 Check your email inbox for 2 OTP emails');
    console.log('📁 Also check spam/junk folder if not in inbox');
    console.log('\n💡 If emails not received:');
    console.log('   1. Verify EMAIL_USER and EMAIL_PASS in .env');
    console.log('   2. Make sure using Gmail App Password (not regular password)');
    console.log('   3. Check 2-Step Verification is enabled');
    console.log('   4. See SETUP_NODEMAILER_OTP.md for help');
    console.log('='.repeat(70) + '\n');
};

// Run test
testEmail().catch(error => {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('\nFull error:', error);
    console.log('\n💡 See SETUP_NODEMAILER_OTP.md for troubleshooting\n');
});
