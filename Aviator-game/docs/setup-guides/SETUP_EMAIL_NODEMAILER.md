# 📧 Email / Nodemailer Setup Guide

## Overview

Nodemailer is used to send emails for OTP verification, password reset, and notifications in your Aviator Game.

---

## What You'll Get

- ✅ Email OTP for registration
- ✅ Password reset emails
- ✅ Welcome emails
- ✅ Transaction notifications
- ✅ Account alerts

---

## Quick Setup (Gmail)

### Step 1: Enable 2-Step Verification

1. Go to: https://myaccount.google.com/security
2. Scroll to "Signing in to Google"
3. Click "2-Step Verification"
4. Click "Get Started"
5. Follow the setup wizard:
   - Enter your password
   - Add phone number
   - Verify with code
   - Turn on 2-Step Verification

### Step 2: Generate App Password

1. Go to: https://myaccount.google.com/apppasswords
   - Or: Google Account → Security → App passwords
2. You may need to sign in again
3. Select app: **Mail**
4. Select device: **Other (Custom name)**
5. Enter name: **Aviator Game**
6. Click "Generate"

**You'll see a 16-character password:**

```
abcd efgh ijkl mnop
```

**Important:** Copy this immediately! You won't see it again.

### Step 3: Configure .env

Open `backend/.env` and add:

```env
# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=abcdefghijklmnop
```

**Important:**

- Remove all spaces from the App Password
- Example: `abcd efgh ijkl mnop` → `abcdefghijklmnop`

### Step 4: Test Email

Create `backend/test-email.js`:

```javascript
require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const mailOptions = {
  from: process.env.EMAIL_USER,
  to: "test@example.com", // Change to your email
  subject: "Test Email from Aviator Game",
  html: "<h1>Email is working!</h1><p>Your Nodemailer setup is correct.</p>",
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error("❌ Error:", error);
  } else {
    console.log("✅ Email sent:", info.response);
  }
});
```

Run:

```bash
node backend/test-email.js
```

**Expected output:**

```
✅ Email sent: 250 2.0.0 OK  1234567890 - gsmtp
```

### Step 5: Restart Backend

```bash
cd backend
npm start
```

---

## Email Templates

### Registration OTP Email:

```javascript
const mailOptions = {
  from: `"Aviator Game" <${process.env.EMAIL_USER}>`,
  to: userEmail,
  subject: "Your OTP Code - Aviator Game",
  html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Aviator Game - Email Verification</h2>
      <p>Your OTP code for registration is:</p>
      <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
        ${otp}
      </div>
      <p>This code will expire in 10 minutes.</p>
      <p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
    </div>
  `,
  text: `Your OTP code is ${otp}. This code will expire in 10 minutes.`,
};
```

### Password Reset Email:

```javascript
const mailOptions = {
  from: `"Aviator Game" <${process.env.EMAIL_USER}>`,
  to: userEmail,
  subject: "Password Reset - Aviator Game",
  html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #FF5722;">Password Reset Request</h2>
      <p>You requested to reset your password. Your OTP is:</p>
      <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
        ${otp}
      </div>
      <p>This code will expire in 10 minutes.</p>
      <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email and your password will remain unchanged.</p>
    </div>
  `,
};
```

---

## Troubleshooting

### Error: "Invalid login: 535-5.7.8 Username and Password not accepted"

**Cause:** Using regular Gmail password instead of App Password

**Fix:**

1. Enable 2-Step Verification
2. Generate App Password
3. Use App Password in .env (not your regular password)
4. Remove all spaces from App Password

---

### Error: "self signed certificate in certificate chain"

**Cause:** SSL certificate issue

**Fix:**
Already handled in code with proper Gmail service configuration. If still occurs:

```javascript
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});
```

---

### Error: "Connection timeout"

**Cause:** Network or firewall blocking SMTP

**Fix:**

1. Check internet connection
2. Check firewall settings
3. Try different network
4. Verify Gmail service is not down

---

### Email not received

**Check:**

1. ✅ Spam/Junk folder
2. ✅ Email address is correct
3. ✅ Gmail App Password is correct (16 chars, no spaces)
4. ✅ Backend console shows "✅ Email sent successfully"
5. ✅ Check Gmail "Sent" folder

---

### Error: "Daily sending quota exceeded"

**Cause:** Gmail free tier limit (500 emails/day)

**Fix:**

- Wait 24 hours for quota reset
- Upgrade to Google Workspace
- Use SendGrid for production

---

## Gmail Limits

### Free Gmail Account:

- **Limit:** 500 emails per day
- **Recipients:** 500 per day
- **Attachment size:** 25 MB
- **Cost:** FREE

**Good for:**

- Development
- Testing
- Small apps (<500 users/day)

---

## Production Alternative: SendGrid

### Why SendGrid?

- ✅ 100 emails/day FREE
- ✅ 40,000-100,000 emails/month (paid)
- ✅ Better deliverability
- ✅ Email analytics
- ✅ Template management
- ✅ No daily limits

### SendGrid Setup:

**Step 1:** Create Account

1. Go to: https://sendgrid.com/
2. Sign up for free account
3. Verify email

**Step 2:** Create API Key

1. Go to Settings → API Keys
2. Click "Create API Key"
3. Name: "Aviator Game"
4. Permissions: "Full Access"
5. Click "Create & View"
6. Copy API key (starts with `SG.`)

**Step 3:** Configure .env

```env
# SendGrid Configuration
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
```

**Step 4:** Update Code

```javascript
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: userEmail,
  from: process.env.EMAIL_FROM,
  subject: "Your OTP Code",
  html: emailTemplate,
};

await sgMail.send(msg);
```

**Step 5:** Install Package

```bash
npm install @sendgrid/mail
```

---

## Other Email Services

### 1. Mailgun

- **Free:** 5,000 emails/month
- **Paid:** $35/month for 50,000 emails
- **Setup:** Similar to SendGrid

### 2. AWS SES

- **Cost:** $0.10 per 1,000 emails
- **Pros:** Very cheap, scalable
- **Cons:** Complex setup

### 3. Postmark

- **Free:** 100 emails/month
- **Paid:** $15/month for 10,000 emails
- **Pros:** Great deliverability

---

## Email Best Practices

### For Production:

1. **Use Professional Email Service**

   - SendGrid, Mailgun, or AWS SES
   - Better deliverability
   - No daily limits

2. **Verify Domain**

   - Add SPF records
   - Add DKIM records
   - Improves deliverability

3. **Use Templates**

   - Consistent branding
   - Easy to update
   - Professional look

4. **Monitor Delivery**

   - Track open rates
   - Track bounce rates
   - Handle failures

5. **Respect Limits**
   - Don't spam
   - Implement rate limiting
   - Allow unsubscribe

---

## Email Configuration Options

### Gmail (Development):

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### SendGrid (Production):

```env
SENDGRID_API_KEY=SG.xxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
```

### Custom SMTP:

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=username
SMTP_PASS=password
SMTP_SECURE=false
```

---

## Testing Emails

### Test Different Scenarios:

1. **Registration OTP**

   - Register new user
   - Check email received
   - Verify OTP works

2. **Password Reset**

   - Request password reset
   - Check email received
   - Verify OTP works

3. **Welcome Email**

   - Complete registration
   - Check welcome email

4. **Transaction Notification**
   - Make deposit
   - Check confirmation email

---

## Monitoring

### Check Email Logs:

```javascript
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error("❌ Email failed:", error);
    // Log to database or monitoring service
  } else {
    console.log("✅ Email sent:", info.messageId);
    // Log success
  }
});
```

### Track Metrics:

- Emails sent
- Emails delivered
- Emails bounced
- Emails opened (with SendGrid)

---

## Security Tips

### DO:

- ✅ Use App Password (not regular password)
- ✅ Keep credentials in .env
- ✅ Never commit .env to git
- ✅ Use HTTPS in production
- ✅ Validate email addresses

### DON'T:

- ❌ Share App Password
- ❌ Use regular Gmail password
- ❌ Send spam
- ❌ Store passwords in code
- ❌ Exceed rate limits

---

## Quick Reference

### Gmail Setup:

1. Enable 2-Step Verification
2. Generate App Password
3. Add to .env (no spaces)
4. Test email sending

### Configuration:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=abcdefghijklmnop
```

### Test:

```bash
node backend/test-email.js
```

### Gmail Settings:

https://myaccount.google.com/apppasswords

---

## Support Resources

### Nodemailer:

- Docs: https://nodemailer.com/
- GitHub: https://github.com/nodemailer/nodemailer

### Gmail:

- Support: https://support.google.com/mail
- App Passwords: https://support.google.com/accounts/answer/185833

### SendGrid:

- Docs: https://docs.sendgrid.com/
- Support: https://support.sendgrid.com/

---

## Migration Path

### From Gmail to SendGrid:

**Step 1:** Set up SendGrid account
**Step 2:** Get API key
**Step 3:** Update .env
**Step 4:** Update email sending code
**Step 5:** Test thoroughly
**Step 6:** Deploy

**No downtime required!**

---

**Status:** ✅ Setup complete when test email is received

**Next Step:** Configure Twilio for SMS OTP

---

_Last Updated: October 14, 2025_
