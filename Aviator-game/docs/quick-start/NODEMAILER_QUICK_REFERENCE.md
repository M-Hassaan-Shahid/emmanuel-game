# Nodemailer OTP - Quick Reference Card

## ✅ Status: READY TO USE

Your Nodemailer OTP system is **fully implemented**. Just add Gmail credentials!

---

## 🚀 Setup (2 Minutes)

### 1. Get Gmail App Password

```
https://myaccount.google.com/apppasswords
→ Select: Mail
→ Device: Other (Aviator Game)
→ Generate
→ Copy 16-char password
```

### 2. Update .env

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=abcdefghijklmnop  # No spaces!
```

### 3. Test

```bash
node backend/test-email.js your-email@gmail.com
```

---

## 📧 OTP Types

| Type           | Digits | Expiry | Use Case        |
| -------------- | ------ | ------ | --------------- |
| Registration   | 6      | 10 min | New user signup |
| Password Reset | 4      | 10 min | Forgot password |

---

## 🔌 API Endpoints

### Registration

```bash
# Send OTP
POST /api/sendmailsms
{ "email": "user@example.com" }

# Verify OTP
POST /api/verifyotpreg
{ "email": "user@example.com", "otp": "123456" }
```

### Password Reset

```bash
# Send OTP
POST /api/sendotp
{ "email": "user@example.com" }

# Verify OTP
POST /api/verifyOtp
{ "email": "user@example.com", "otp": "1234" }

# Reset Password
POST /api/resetPassword
{ "email": "user@example.com", "newPassword": "newpass" }
```

---

## 🧪 Quick Tests

### Test 1: Email Config

```bash
node backend/test-email.js
```

### Test 2: Send OTP

```bash
curl -X POST http://localhost:8000/api/sendmailsms \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Test 3: Verify OTP

```bash
curl -X POST http://localhost:8000/api/verifyotpreg \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'
```

---

## 🐛 Common Issues

| Problem           | Solution                                   |
| ----------------- | ------------------------------------------ |
| Email not sending | Use App Password, not regular password     |
| OTP not received  | Check spam folder                          |
| Invalid OTP       | Check 6 digits (registration) or 4 (reset) |
| OTP expired       | Request new OTP (10 min limit)             |
| Auth error        | Enable 2-Step Verification on Google       |

---

## 📁 Files

```
backend/
├── utils/mailer.js          # Nodemailer config
├── Controllers/UserController.js  # OTP logic
├── Routes/UserRoute.js      # API routes
└── test-email.js            # Test script
```

---

## 🔒 Security

✅ 10-minute expiration
✅ One-time use
✅ Secure storage
✅ Email validation
✅ Error handling

---

## 📊 Email Template Preview

```
┌─────────────────────────────┐
│  Email Verification         │
│                              │
│  Your OTP is:               │
│                              │
│     1 2 3 4 5 6             │
│                              │
│  Expires in 10 minutes      │
└─────────────────────────────┘
```

---

## 💡 Pro Tips

1. **Development:** OTP logged to console as fallback
2. **Production:** Use dedicated email (noreply@domain.com)
3. **Scaling:** Consider SendGrid/Mailgun for high volume
4. **Security:** Add rate limiting (3 requests/10 min)
5. **Testing:** Always check spam folder first

---

## 📚 Full Documentation

- **Setup Guide:** `SETUP_NODEMAILER_OTP.md`
- **Summary:** `NODEMAILER_OTP_SUMMARY.md`
- **This Card:** `NODEMAILER_QUICK_REFERENCE.md`

---

## ✅ Checklist

- [ ] Get Gmail App Password
- [ ] Update EMAIL_USER in .env
- [ ] Update EMAIL_PASS in .env (no spaces!)
- [ ] Restart backend server
- [ ] Run test: `node backend/test-email.js`
- [ ] Check email received
- [ ] Test registration flow
- [ ] Test password reset flow

---

## 🎉 You're Done!

**No coding needed.** Just configure and test!

```bash
# One command to test everything:
node backend/test-email.js your-email@gmail.com
```

📧 Check your inbox for 2 test OTP emails!
