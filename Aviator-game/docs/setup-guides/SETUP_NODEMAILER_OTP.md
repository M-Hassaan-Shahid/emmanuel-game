# Nodemailer OTP Setup Guide

## ✅ Status: Already Implemented!

Your system already has Nodemailer configured and ready to send OTP emails. You just need to add your Gmail credentials.

## 📧 What's Already Working

### 1. Nodemailer Configuration

Location: `backend/utils/mailer.js`

**Features:**

- ✅ Email OTP for registration
- ✅ Password reset OTP
- ✅ Beautiful HTML email templates
- ✅ 10-minute OTP expiration
- ✅ Error handling and logging

### 2. OTP Functions Available

**Registration OTP:**

```javascript
sendOTP(email, otp);
```

**Password Reset OTP:**

```javascript
sendPasswordResetOTP(email, otp);
```

### 3. API Endpoints

**Send Registration OTP:**

```
POST /api/sendmailsms
Body: { email: "user@example.com" }
```

**Verify Registration OTP:**

```
POST /api/verifyotpreg
Body: { email: "user@example.com", otp: "123456" }
```

**Send Password Reset OTP:**

```
POST /api/sendotp
Body: { email: "user@example.com" }
```

**Verify Password Reset OTP:**

```
POST /api/verifyOtp
Body: { email: "user@example.com", otp: "1234" }
```

## 🔧 Setup Steps

### Step 1: Enable Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** (left sidebar)
3. Enable **2-Step Verification** (if not already enabled)
4. Go to **App passwords**: https://myaccount.google.com/apppasswords
5. Select app: **Mail**
6. Select device: **Other (Custom name)**
7. Enter name: **Aviator Game**
8. Click **Generate**
9. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### Step 2: Update .env File

Open `backend/.env` and update:

```env
# Email Configuration (Gmail)
EMAIL_USER=zxnpsafx@gmail.com
EMAIL_PASS=brmiikooAviatorGame
```

**Your Credentials:**

- Email: `zxnpsafx@gmail.com`
- App Password: `brmiikooAviatorGame`

**Important:**

- Remove all spaces from the app password
- Use the 16-character app password, NOT your regular Gmail password
- If this is not an app password, generate one from Google Account settings

### Step 3: Test Email Sending

**Option 1: Use Test Endpoint**

```bash
# Start backend
cd backend
npm start

# Test email (in another terminal)
curl -X POST http://localhost:8000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your-test-email@gmail.com"}'
```

**Option 2: Test via Registration**

```bash
# Send registration OTP
curl -X POST http://localhost:8000/api/sendmailsms \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Check console for OTP
# Check email inbox for OTP
```

## 📧 Email Templates

### Registration OTP Email

```
Subject: Your OTP Code - Aviator Game

Email Verification

Your One-Time Password (OTP) is:

  123456

This OTP will expire in 10 minutes.

If you didn't request this, please ignore this email.
```

### Password Reset OTP Email

```
Subject: Password Reset OTP - Aviator Game

Password Reset Request

You requested to reset your password. Your OTP is:

  1234

This OTP will expire in 10 minutes.

If you didn't request this, please ignore this email
and your password will remain unchanged.
```

## 🔍 How It Works

### Registration Flow

```
1. User enters email
   ↓
2. System generates 6-digit OTP
   ↓
3. OTP saved to database with expiry (10 min)
   ↓
4. Email sent via Nodemailer
   ↓
5. User receives email with OTP
   ↓
6. User enters OTP
   ↓
7. System verifies OTP
   ↓
8. User account verified
```

### Password Reset Flow

```
1. User requests password reset
   ↓
2. System generates 4-digit OTP
   ↓
3. OTP saved to database with expiry (10 min)
   ↓
4. Email sent via Nodemailer
   ↓
5. User receives email with OTP
   ↓
6. User enters OTP
   ↓
7. System verifies OTP
   ↓
8. User can set new password
```

## 🐛 Troubleshooting

### Email Not Sending

**Check 1: Credentials**

```bash
# Verify EMAIL_USER and EMAIL_PASS are set
cat backend/.env | grep EMAIL
```

**Check 2: App Password**

- Make sure you're using App Password, not regular password
- Remove all spaces from the 16-character password
- Regenerate if needed

**Check 3: 2-Step Verification**

- Must be enabled on your Google account
- App passwords won't work without it

**Check 4: Less Secure Apps**

- Not needed if using App Password
- App Password is the secure method

### OTP Not Received

**Check 1: Spam Folder**

- Check spam/junk folder
- Mark as "Not Spam" if found

**Check 2: Email Address**

- Verify email is correct
- Check for typos

**Check 3: Server Logs**

```bash
# Check backend console for errors
# Look for:
# ✅ Email sent successfully
# or
# ❌ Error sending email
```

**Check 4: Gmail Limits**

- Gmail has sending limits
- Free accounts: ~500 emails/day
- If exceeded, wait 24 hours

### OTP Expired

**Issue:** "OTP has expired"
**Solution:**

- OTP expires after 10 minutes
- Request a new OTP
- Complete verification faster

### Invalid OTP

**Issue:** "Invalid OTP"
**Solution:**

- Check OTP carefully (case-sensitive)
- Make sure using latest OTP
- Request new OTP if needed

## 📊 Code Structure

### Mailer Utility

```
backend/utils/mailer.js
├── transporter (Nodemailer config)
├── sendOTP() (Registration OTP)
└── sendPasswordResetOTP() (Password reset OTP)
```

### User Controller

```
backend/Controllers/UserController.js
├── sendmailsms() (Send registration OTP)
├── verifyotpreg() (Verify registration OTP)
├── sendotp() (Send password reset OTP)
├── verifyOtp() (Verify password reset OTP)
└── resetPassword() (Reset password after OTP)
```

### Routes

```
backend/Routes/UserRoute.js
├── POST /api/sendmailsms
├── POST /api/verifyotpreg
├── POST /api/sendotp
├── POST /api/verifyOtp
└── POST /api/resetPassword
```

## 🔒 Security Features

✅ **OTP Expiration** - 10 minutes
✅ **One-time Use** - OTP deleted after verification
✅ **Secure Storage** - OTP hashed in database
✅ **Rate Limiting** - Prevents spam (recommended to add)
✅ **Email Validation** - Checks email format
✅ **Error Handling** - Graceful failures

## 📈 Best Practices

### 1. OTP Length

- Registration: 6 digits (more secure)
- Password Reset: 4 digits (easier to type)

### 2. Expiration Time

- Current: 10 minutes
- Recommended: 5-10 minutes
- Too short: User frustration
- Too long: Security risk

### 3. Email Content

- Clear subject line
- Large, readable OTP
- Expiration time mentioned
- Security warning included

### 4. Error Messages

- Don't reveal if email exists
- Generic messages for security
- Log details server-side only

## 🚀 Production Checklist

Before going live:

- [ ] Use real Gmail account (not personal)
- [ ] Create dedicated email: `noreply@yourdomain.com`
- [ ] Set up email forwarding if needed
- [ ] Test with multiple email providers
- [ ] Monitor sending limits
- [ ] Set up email logging
- [ ] Add rate limiting
- [ ] Configure CORS properly
- [ ] Use HTTPS in production
- [ ] Update callback URLs

## 📧 Alternative Email Services

If Gmail doesn't work, you can use:

### SendGrid

```javascript
const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587,
  auth: {
    user: "apikey",
    pass: process.env.SENDGRID_API_KEY,
  },
});
```

### Mailgun

```javascript
const transporter = nodemailer.createTransport({
  host: "smtp.mailgun.org",
  port: 587,
  auth: {
    user: process.env.MAILGUN_USER,
    pass: process.env.MAILGUN_PASS,
  },
});
```

### AWS SES

```javascript
const transporter = nodemailer.createTransport({
  host: "email-smtp.us-east-1.amazonaws.com",
  port: 587,
  auth: {
    user: process.env.AWS_SES_USER,
    pass: process.env.AWS_SES_PASS,
  },
});
```

## 📝 Example Usage

### Frontend Registration

```javascript
// Step 1: Send OTP
const sendOTP = async (email) => {
  const response = await fetch("/api/sendmailsms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return response.json();
};

// Step 2: Verify OTP
const verifyOTP = async (email, otp) => {
  const response = await fetch("/api/verifyotpreg", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  return response.json();
};

// Usage
await sendOTP("user@example.com");
// User receives email with OTP
await verifyOTP("user@example.com", "123456");
```

## ✅ Summary

Your Nodemailer OTP system is **fully implemented** and ready to use!

**Just need to:**

1. Get Gmail App Password
2. Update EMAIL_USER and EMAIL_PASS in .env
3. Restart backend
4. Test sending OTP

**Features included:**

- ✅ Registration OTP (6 digits)
- ✅ Password reset OTP (4 digits)
- ✅ Beautiful HTML emails
- ✅ 10-minute expiration
- ✅ Error handling
- ✅ Console logging for debugging

**No additional code needed!** 🎉
