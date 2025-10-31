require('dotenv').config();
const { sendOTP } = require('./utils/mailer');

console.log('🧪 Testing Email Configuration\n');
console.log('📧 EMAIL_USER:', process.env.EMAIL_USER);
console.log('🔐 EMAIL_PASS:', process.env.EMAIL_PASS ? '***' + process.env.EMAIL_PASS.slice(-4) : 'NOT SET');
console.log('');

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('❌ Email credentials not configured!');
    console.log('\n📝 Setup Instructions:');
    console.log('1. Go to: https://myaccount.google.com/apppasswords');
    console.log('2. Sign in with your Gmail account');
    console.log('3. Create a new App Password for "Mail"');
    console.log('4. Copy the 16-character password (format: xxxx xxxx xxxx xxxx)');
    console.log('5. Update .env file:');
    console.log('   EMAIL_USER=your-email@gmail.com');
    console.log('   EMAIL_PASS=your16charpassword (remove spaces!)');
    process.exit(1);
}

async function testEmail() {
    try {
        console.log('📤 Sending test OTP to:', process.env.EMAIL_USER);
        const result = await sendOTP(process.env.EMAIL_USER, '123456');

        if (result.success) {
            console.log('\n✅ SUCCESS! Email sent successfully!');
            console.log('📬 Check your inbox:', process.env.EMAIL_USER);
            console.log('\n✅ Email configuration is working correctly!');
        } else {
            console.log('\n❌ FAILED to send email');
            console.log('Error:', result.error);
            console.log('\n💡 Common issues:');
            console.log('1. Wrong App Password (must be 16 chars from Google)');
            console.log('2. 2-Step Verification not enabled on Gmail');
            console.log('3. App Password has spaces (remove them!)');
        }
    } catch (error) {
        console.log('\n❌ ERROR:', error.message);
    }
}

testEmail();
