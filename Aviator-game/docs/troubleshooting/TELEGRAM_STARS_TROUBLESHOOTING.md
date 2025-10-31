# Telegram Stars Payment - Troubleshooting Guide

## 🔧 Fixes Applied

### 1. Added Payment Webhook Handler

- **File:** `backend/Routes/TelegramStarsRoutes.js`
- **Endpoint:** `POST /api/telegram/payment-webhook`
- **Purpose:** Processes successful payments and updates user balance

### 2. Updated Bot Payment Handler

- **File:** `backend/bot/telegramStarsBot.js`
- **Change:** Bot now calls webhook when payment is successful
- **Purpose:** Syncs payment status between Telegram and website

### 3. Auto-Start Bot

- **File:** `backend/index.js`
- **Change:** Bot automatically starts with backend server
- **Purpose:** Ensures bot is always running to process payments

---

## ✅ How to Test

### Step 1: Check Environment Variables

```bash
# Make sure these are set in backend/.env
TELEGRAM_BOT_TOKEN=your_bot_token_here
BACKEND_URL=http://localhost:8000
```

### Step 2: Start Backend

```bash
cd backend
npm start
```

**Look for this message:**

```
✅ Telegram Stars Bot initialized
```

### Step 3: Test Payment Flow

1. **Login to website**
2. **Click "Add Money"**
3. **Select "⭐ Telegram Stars"**
4. **Enter amount** (e.g., 100)
5. **Click "Pay with Telegram Stars"**
6. **Payment window opens**
7. **Complete payment in Telegram**
8. **Wait for confirmation**
9. **Balance updates automatically!**

---

## 🐛 Common Issues & Solutions

### Issue 1: "Failed to create invoice"

**Cause:** Bot token not configured or invalid

**Solution:**

```bash
# Check if token is set
cat backend/.env | grep TELEGRAM_BOT_TOKEN

# If empty, add your bot token:
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

### Issue 2: Payment window doesn't open

**Cause:** Popup blocked by browser

**Solution:**

- Allow popups for your website
- Check browser console for errors
- Try different browser

### Issue 3: Payment successful but balance not updated

**Cause:** Bot not running or webhook not called

**Solution:**

```bash
# Check backend console for:
✅ Web payment processed: web_stars_...

# If not showing, restart backend:
npm start
```

### Issue 4: "Transaction not found"

**Cause:** Transaction not created before payment

**Solution:**

- Check backend logs for errors
- Verify database connection
- Check Transaction model exists

### Issue 5: Bot not starting

**Cause:** Missing dependencies or invalid token

**Solution:**

```bash
# Install dependencies
npm install node-telegram-bot-api axios

# Check token is valid
# Go to @BotFather on Telegram
# Send /mybots → Select your bot → API Token
```

---

## 📊 Debug Checklist

- [ ] Backend server running
- [ ] Bot initialized message shown
- [ ] TELEGRAM_BOT_TOKEN set in .env
- [ ] User logged in on website
- [ ] Amount entered (> 0)
- [ ] Payment method selected (Telegram Stars)
- [ ] Popups allowed in browser
- [ ] Payment window opens
- [ ] Payment completed in Telegram
- [ ] Backend logs show "Web payment processed"
- [ ] Transaction status updated to "approved"
- [ ] User balance increased
- [ ] Website shows new balance

---

## 🔍 Check Backend Logs

### Successful Payment Flow:

```
✅ Telegram Stars Bot initialized
POST /api/telegram/create-invoice 200
✅ Web payment processed: web_stars_user123_100_1234567890
GET /api/telegram/payment-status/trans123 200
```

### Failed Payment Flow:

```
❌ Failed to initialize Telegram Stars Bot: Invalid token
POST /api/telegram/create-invoice 500
Error: Failed to create invoice
```

---

## 🧪 Manual Testing

### Test Invoice Creation:

```bash
curl -X POST http://localhost:8000/api/telegram/create-invoice \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "your_user_id",
    "amount": 100,
    "description": "Test payment"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Invoice created successfully",
  "invoiceLink": "https://t.me/$...",
  "transactionId": "trans123"
}
```

### Test Payment Status:

```bash
curl http://localhost:8000/api/telegram/payment-status/trans123
```

**Expected Response:**

```json
{
  "success": true,
  "status": "pending",
  "amount": 100,
  "transactionType": "recharge"
}
```

---

## 🔒 Security Notes

1. **Never expose bot token** in frontend code
2. **Validate all webhook calls** to prevent fraud
3. **Use HTTPS in production** for secure payments
4. **Log all transactions** for audit trail
5. **Implement rate limiting** to prevent abuse

---

## 📝 Database Schema

### Transaction Model:

```javascript
{
  user_id: ObjectId,
  amount: Number,
  transactionType: 'recharge',
  paymentType: 'telegram_stars',
  status: 'pending' | 'approved' | 'failed',
  telegram_invoice_payload: String,
  telegram_charge_id: String,
  createdAt: Date
}
```

### User Model:

```javascript
{
  _id: ObjectId,
  email: String,
  balance: Number,
  telegramId: String (optional)
}
```

---

## 🚀 Production Deployment

### Before Going Live:

1. **Set Production URLs:**

```env
BACKEND_URL=https://your-domain.com
FRONTEND_URL=https://your-domain.com
```

2. **Use Production Bot:**

- Create production bot via @BotFather
- Update TELEGRAM_BOT_TOKEN

3. **Enable HTTPS:**

- Required for Telegram payments
- Use SSL certificate

4. **Test Thoroughly:**

- Test with real Telegram Stars
- Verify balance updates
- Check transaction logs

5. **Monitor:**

- Set up error logging
- Monitor payment success rate
- Track failed transactions

---

## 📞 Support

If payment still not working:

1. **Check Backend Console** for error messages
2. **Check Browser Console** for frontend errors
3. **Verify Bot Token** is correct
4. **Test with Different Amount** (try 1, 10, 100)
5. **Try Different Browser** to rule out browser issues
6. **Check Database** for transaction records
7. **Restart Backend** to reload bot

---

## ✅ Success Indicators

When everything works correctly:

1. ✅ Bot starts with backend
2. ✅ Invoice link created
3. ✅ Payment window opens
4. ✅ User completes payment
5. ✅ Bot receives payment notification
6. ✅ Webhook called successfully
7. ✅ Transaction status updated
8. ✅ User balance increased
9. ✅ Website polls and gets updated status
10. ✅ Success message shown
11. ✅ Page refreshes with new balance

**All steps should complete in < 10 seconds!**
