# 📱 Twilio SMS Setup Guide

## Overview

Twilio is used to send SMS OTP codes for phone number verification and password reset in your Aviator Game.

---

## What You'll Get

- ✅ SMS OTP for phone registration
- ✅ SMS OTP for password reset
- ✅ Phone number verification
- ✅ Global SMS delivery
- ✅ Reliable delivery rates

---

## Step-by-Step Setup

### Step 1: Create Twilio Account

1. Go to: https://www.twilio.com/try-twilio
2. Click "Sign up"
3. Fill in details:
   - First Name
   - Last Name
   - Email
   - Password
4. Verify email
5. Complete phone verification

### Step 2: Get Free Trial Credits

After signup, you'll receive:

- **$15 trial credit**
- Can send SMS to verified numbers only
- Good for testing

### Step 3: Get Account Credentials

1. Go to: https://console.twilio.com/
2. You'll see your dashboard with:
   - **Account SID:** `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Auth Token:** Click "Show" to reveal

**Copy both!**

### Step 4: Create Verify Service

**Important:** We use Twilio Verify API (not regular SMS)

1. Go to: https://console.twilio.com/us1/develop/verify/services
2. Click "Create new Service"
3. Friendly name: **Aviator Game OTP**
4. Click "Create"
5. Copy the **Service SID:** `VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 5: Configure .env

Open `backend/.env` and add:

```env
# Twilio Configuration (SMS)
TWILIO_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 6: Install Twilio Package

```bash
cd backend
npm install twilio
```

### Step 7: Test SMS

Create `backend/test-twilio.js`:

```javascript
require("dotenv").config();
const twilio = require("twilio");

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// Test with your verified phone number
const testPhone = "+923001234567"; // Change to your number

client.verify.v2
  .services(process.env.TWILIO_VERIFY_SERVICE_SID)
  .verifications.create({
    to: testPhone,
    channel: "sms",
  })
  .then((verification) => {
    console.log("✅ SMS sent successfully!");
    console.log("Status:", verification.status);
    console.log("Check your phone for OTP");
  })
  .catch((error) => {
    console.error("❌ Error:", error.message);
  });
```

Run:

```bash
node backend/test-twilio.js
```

**Expected output:**

```
✅ SMS sent successfully!
Status: pending
Check your phone for OTP
```

### Step 8: Verify OTP

Create `backend/test-twilio-verify.js`:

```javascript
require("dotenv").config();
const twilio = require("twilio");

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const testPhone = "+923001234567"; // Your number
const otp = "123456"; // OTP you received

client.verify.v2
  .services(process.env.TWILIO_VERIFY_SERVICE_SID)
  .verificationChecks.create({
    to: testPhone,
    code: otp,
  })
  .then((verification_check) => {
    console.log("✅ Verification status:", verification_check.status);
    if (verification_check.status === "approved") {
      console.log("✅ OTP is correct!");
    } else {
      console.log("❌ OTP is incorrect");
    }
  })
  .catch((error) => {
    console.error("❌ Error:", error.message);
  });
```

### Step 9: Restart Backend

```bash
cd backend
npm start
```

---

## Trial Account Limitations

### What You Can Do:

- ✅ Send SMS to verified numbers
- ✅ Test all features
- ✅ Develop and test app
- ✅ Use $15 credit

### What You Can't Do:

- ❌ Send SMS to unverified numbers
- ❌ Use in production
- ❌ Send to customers

### To Verify a Number:

1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
2. Click "Add a new Caller ID"
3. Enter phone number
4. Verify with code

---

## Upgrading to Paid Account

### When to Upgrade:

- Ready for production
- Need to send to any number
- Trial credit exhausted

### How to Upgrade:

**Step 1:** Add Payment Method

1. Go to: https://console.twilio.com/us1/billing/manage-billing/billing-overview
2. Click "Upgrade your account"
3. Add credit card
4. Add initial balance ($20 minimum)

**Step 2:** Remove Trial Restrictions

- Can now send to any number
- No verification needed
- Production ready

---

## Pricing

### SMS Costs (Pakistan):

- **Outbound SMS:** ~$0.0075 per message
- **Verification API:** Same cost
- **No monthly fee**
- **Pay per use**

### Cost Examples:

- 100 SMS: ~$0.75
- 1,000 SMS: ~$7.50
- 10,000 SMS: ~$75.00

### Monthly Estimates:

- **Small app (100 users/day):** ~$22/month
- **Medium app (500 users/day):** ~$112/month
- **Large app (1000 users/day):** ~$225/month

---

## Twilio Verify API vs Regular SMS

### Why Use Verify API?

**Verify API:**

- ✅ Automatic OTP generation
- ✅ Built-in rate limiting
- ✅ Fraud detection
- ✅ Retry logic
- ✅ Multiple channels (SMS, Voice, Email)
- ✅ Better security

**Regular SMS:**

- ❌ Manual OTP generation
- ❌ No rate limiting
- ❌ No fraud detection
- ❌ More code to write

**Recommendation:** Use Verify API (already implemented)

---

## Phone Number Format

### Supported Formats:

```javascript
// With country code (recommended)
"+923001234567"; // Pakistan
"+911234567890"; // India
"+12025551234"; // USA

// Without country code (auto-adds +92)
"3001234567"; // Becomes +923001234567
```

### Country Codes:

- Pakistan: +92
- India: +91
- USA: +1
- UK: +44
- UAE: +971

---

## Troubleshooting

### Error: "Unable to create record: Invalid parameter"

**Cause:** Invalid phone number format

**Fix:**

```javascript
// Ensure phone starts with +
const formattedPhone = phone.startsWith("+") ? phone : `+92${phone}`;
```

---

### Error: "Account not authorized"

**Cause:** Trial account trying to send to unverified number

**Fix:**

1. Verify the phone number in Twilio console
2. Or upgrade to paid account

---

### Error: "Authenticate"

**Cause:** Wrong Account SID or Auth Token

**Fix:**

1. Go to Twilio console
2. Copy correct credentials
3. Update .env file
4. Restart backend

---

### Error: "Service not found"

**Cause:** Wrong Verify Service SID

**Fix:**

1. Go to Verify Services
2. Copy correct Service SID
3. Update .env file

---

### SMS not received

**Check:**

1. ✅ Phone number format correct
2. ✅ Phone number verified (trial account)
3. ✅ Twilio account has credit
4. ✅ Check Twilio logs for delivery status
5. ✅ Phone has signal

---

## Monitoring & Logs

### View SMS Logs:

1. Go to: https://console.twilio.com/us1/monitor/logs/sms
2. See all SMS sent
3. Check delivery status
4. View error messages

### Delivery Status:

- **Queued:** SMS in queue
- **Sent:** SMS sent to carrier
- **Delivered:** SMS delivered to phone
- **Failed:** SMS failed to deliver
- **Undelivered:** SMS not delivered

---

## Rate Limiting

### Twilio Verify API Limits:

**Per Phone Number:**

- Max 5 verification attempts per hour
- Max 10 verification checks per hour

**Per Service:**

- Max 100 verifications per second

**Built-in Protection:**

- Prevents spam
- Prevents abuse
- Automatic rate limiting

---

## Security Features

### Twilio Verify Includes:

1. **Fraud Detection**

   - Detects suspicious patterns
   - Blocks known bad actors
   - Prevents SMS pumping

2. **Rate Limiting**

   - Automatic per-number limits
   - Prevents abuse
   - Configurable

3. **Geo Permissions**
   - Restrict by country
   - Block specific regions
   - Reduce fraud

---

## Best Practices

### DO:

- ✅ Use Verify API (not regular SMS)
- ✅ Format phone numbers correctly
- ✅ Handle errors gracefully
- ✅ Log all SMS attempts
- ✅ Monitor costs
- ✅ Set spending limits

### DON'T:

- ❌ Store Auth Token in code
- ❌ Send SMS without validation
- ❌ Ignore rate limits
- ❌ Skip error handling
- ❌ Use trial account in production

---

## Alternative Channels

### Twilio Verify Supports:

1. **SMS** (default)

   - Most common
   - Works everywhere
   - ~$0.0075 per message

2. **Voice Call**

   - For users without SMS
   - Reads OTP over phone
   - ~$0.013 per minute

3. **Email**
   - Backup channel
   - Free
   - Slower delivery

### Use Multiple Channels:

```javascript
// Try SMS first
channel: "sms";

// If SMS fails, try voice
channel: "call";

// Or let user choose
channel: userPreference;
```

---

## Cost Optimization

### Tips to Reduce Costs:

1. **Use Email for Non-Critical**

   - Welcome emails
   - Newsletters
   - Notifications

2. **Implement Rate Limiting**

   - Prevent spam
   - Limit OTP requests
   - Block abuse

3. **Use Fallback OTP**

   - Console OTP for development
   - Reduces test costs

4. **Monitor Usage**

   - Set up alerts
   - Track costs daily
   - Identify unusual patterns

5. **Bulk Pricing**
   - Contact Twilio for volume discounts
   - Available for high-volume apps

---

## Testing in Development

### Use Console OTP:

```javascript
// In development, log OTP to console
if (process.env.NODE_ENV === "development") {
  console.log(`OTP for ${phone}: ${otp}`);
  // Don't send actual SMS
  return { success: true, otp };
}

// In production, send real SMS
await twilioClient.verify.v2
  .services(process.env.TWILIO_VERIFY_SERVICE_SID)
  .verifications.create({ to: phone, channel: "sms" });
```

**Saves money during development!**

---

## Webhook Configuration

### Get Delivery Status:

1. Go to Verify Service settings
2. Add webhook URL: `https://yourdomain.com/api/twilio-webhook`
3. Select events:

   - Verification started
   - Verification completed
   - Verification failed

4. Handle webhook:

```javascript
app.post("/api/twilio-webhook", (req, res) => {
  const { status, to, channel } = req.body;
  console.log(`SMS to ${to} via ${channel}: ${status}`);
  res.sendStatus(200);
});
```

---

## Quick Reference

### Configuration:

```env
TWILIO_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Send OTP:

```javascript
await client.verify.v2
  .services(process.env.TWILIO_VERIFY_SERVICE_SID)
  .verifications.create({
    to: "+923001234567",
    channel: "sms",
  });
```

### Verify OTP:

```javascript
await client.verify.v2
  .services(process.env.TWILIO_VERIFY_SERVICE_SID)
  .verificationChecks.create({
    to: "+923001234567",
    code: "123456",
  });
```

### Console:

https://console.twilio.com/

---

## Support Resources

### Documentation:

- Twilio Verify: https://www.twilio.com/docs/verify
- Node.js SDK: https://www.twilio.com/docs/libraries/node
- API Reference: https://www.twilio.com/docs/verify/api

### Support:

- Help Center: https://support.twilio.com/
- Community: https://www.twilio.com/community
- Status: https://status.twilio.com/

---

## Alternatives to Twilio

### If Twilio Doesn't Work:

1. **Vonage (Nexmo)**

   - Similar pricing
   - Good alternative
   - Easy migration

2. **AWS SNS**

   - Cheaper ($0.00645/SMS)
   - More complex setup
   - Good for AWS users

3. **MessageBird**
   - Competitive pricing
   - Good coverage
   - Similar API

---

**Status:** ✅ Setup complete when test SMS is received

**Next Step:** Test complete registration flow

---

_Last Updated: October 14, 2025_
