# 🔐 Setup Credentials Guide - Twilio & Nodemailer

## ✅ Current Status

Your application has **complete working implementations** for:

- ✅ **Nodemailer** (Email OTP) - Fully configured
- ✅ **Twilio** (SMS OTP) - Fully configured

**You only need to add the credentials/tokens!**

---

## 📧 1. Nodemailer (Email OTP) Setup

### Current Configuration

Location: `backend/utils/mailer.js`

```javascript
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

### What You Need to Add

In your `backend/.env` file:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
```

### How to Get Gmail App Password

1. **Enable 2-Step Verification**

   - Go to: https://myaccount.google.com/security
   - Click "2-Step Verification"
   - Follow setup instructions

2. **Generate App Password**

   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it: "Aviator Game"
   - Click "Generate"
   - Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

3. **Add to .env**
   ```env
   EMAIL_USER=hassanbwp116@gmail.com
   EMAIL_PASS=nkfoqwlarzdkkotk
   ```

### Test Email Setup

Run this command:

```bash
node backend/test-email.js
```

Expected output:

```
✅ Email sent successfully
```

---

## 📱 2. Twilio (SMS OTP) Setup

### Current Configuration

Location: `backend/Controllers/UserController.js`

```javascript
const twilioClient = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

await twilioClient.verify.v2
  .services(process.env.TWILIO_VERIFY_SERVICE_SID)
  .verifications.create({
    to: formattedContact,
    channel: "sms",
  });
```

### What You Need to Add

In your `backend/.env` file:

```env
TWILIO_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### How to Get Twilio Credentials

#### Step 1: Create Twilio Account

1. Go to: https://www.twilio.com/try-twilio
2. Sign up (free trial gives $15 credit)
3. Verify your email and phone number

#### Step 2: Get Account SID & Auth Token

1. Go to: https://console.twilio.com/
2. On dashboard, you'll see:
   - **Account SID**: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Auth Token**: Click "Show" to reveal

#### Step 3: Create Verify Service

1. Go to: https://console.twilio.com/us1/develop/verify/services
2. Click "Create new Service"
3. Friendly name: **Aviator Game OTP**
4. Click "Create"
5. Copy the **Service SID**: `VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

#### Step 4: Add to .env

```env
TWILIO_SID=AC1234567890abcdef1234567890abcd
TWILIO_AUTH_TOKEN=your_auth_token_from_console
TWILIO_VERIFY_SERVICE_SID=VA1234567890abcdef1234567890abcd
```

### Test Twilio Setup

Create `backend/test-twilio.js`:

```javascript
require("dotenv").config();
const twilio = require("twilio");

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
const testPhone = "+923001234567"; // Your verified number

client.verify.v2
  .services(process.env.TWILIO_VERIFY_SERVICE_SID)
  .verifications.create({
    to: testPhone,
    channel: "sms",
  })
  .then((verification) => {
    console.log("✅ SMS sent successfully!");
    console.log("Status:", verification.status);
  })
  .catch((error) => {
    console.error("❌ Error:", error.message);
  });
```

Run:

```bash
node backend/test-twilio.js
```

---

## 🔍 How It Works in Your App

### Email Registration Flow

1. User enters email on registration page
2. Backend generates 6-digit OTP
3. **Nodemailer sends email** with OTP
4. User receives email and enters OTP
5. Backend verifies OTP and creates account

### Phone Registration Flow

1. User enters phone number on registration page
2. Backend calls Twilio Verify API
3. **Twilio sends SMS** with OTP
4. User receives SMS and enters OTP
5. Backend verifies OTP with Twilio
6. Account created

---

## 📝 Complete .env Example

```env
# ============================================
# EMAIL - NODEMAILER (REQUIRED)
# ============================================
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password

# ============================================
# SMS - TWILIO (REQUIRED)
# ============================================
TWILIO_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ============================================
# OTHER REQUIRED CONFIGS
# ============================================
PORT=8000
MONGODB_URI=mongodb://127.0.0.1:27017/aviator
JWT_SECRET=your-super-secret-jwt-key-change-this
FRONTEND_URL=http://localhost:5173
```

---

## ✅ Verification Checklist

### Nodemailer (Email)

- [ ] Gmail 2-Step Verification enabled
- [ ] App Password generated
- [ ] EMAIL_USER added to .env
- [ ] EMAIL_PASS added to .env
- [ ] Test email sent successfully

### Twilio (SMS)

- [ ] Twilio account created
- [ ] Account SID copied
- [ ] Auth Token copied
- [ ] Verify Service created
- [ ] Service SID copied
- [ ] TWILIO_SID added to .env
- [ ] TWILIO_AUTH_TOKEN added to .env
- [ ] TWILIO_VERIFY_SERVICE_SID added to .env
- [ ] Test SMS sent successfully

---

## 🚀 Quick Start

1. **Copy .env.example to .env**

   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Add Email Credentials**

   - Get Gmail App Password
   - Update EMAIL_USER and EMAIL_PASS

3. **Add Twilio Credentials**

   - Create Twilio account
   - Get SID, Auth Token, and Service SID
   - Update TWILIO\_\* variables

4. **Restart Backend**

   ```bash
   npm start
   ```

5. **Test Registration**
   - Try email registration
   - Try phone registration
   - Check console logs for OTP

---

## 🐛 Troubleshooting

### Email Not Sending

- ✅ Check 2-Step Verification is enabled
- ✅ Use App Password, not regular password
- ✅ Check EMAIL_USER format (full email)
- ✅ Check for typos in .env

### SMS Not Sending

- ✅ Phone number must be verified (trial account)
- ✅ Use international format (+92...)
- ✅ Check Twilio account has credit
- ✅ Verify Service SID is correct
- ✅ Check Twilio console logs

---

## 💰 Costs

### Nodemailer (Gmail)

- **FREE** - No cost for sending emails

### Twilio

- **Trial**: $15 free credit
- **SMS Cost**: ~$0.0075 per SMS
- **Verify API**: Included in SMS cost
- **Upgrade**: Add payment method for production

---

## 📚 Additional Resources

- **Nodemailer Docs**: https://nodemailer.com/
- **Twilio Console**: https://console.twilio.com/
- **Twilio Verify Docs**: https://www.twilio.com/docs/verify
- **Gmail App Passwords**: https://myaccount.google.com/apppasswords

---

## ✨ Summary

Your application is **100% ready** for OTP functionality!

**Just add these 5 credentials to your .env file:**

1. EMAIL_USER
2. EMAIL_PASS
3. TWILIO_SID
4. TWILIO_AUTH_TOKEN
5. TWILIO_VERIFY_SERVICE_SID

Then restart your backend and you're good to go! 🎉
