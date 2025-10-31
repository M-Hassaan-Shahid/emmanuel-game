# Telegram Authentication & Payment Flow

## Overview

This document explains how Telegram authentication works and how it integrates with the Telegram Stars payment system.

---

## 🔐 Authentication Flow (Similar to Google OAuth)

### 1. User Registration/Login Options

Users can authenticate via:

- **Email/Password** (traditional)
- **Google OAuth** (one-click)
- **Telegram OAuth** (one-click)

### 2. Telegram OAuth Flow

#### Option A: Direct Telegram Login (New Users)

```
1. User clicks "Login with Telegram" on website
2. Redirected to Telegram Login Widget
3. User authorizes in Telegram app
4. Telegram sends auth data to backend
5. Backend verifies hash signature
6. Creates/updates user with telegramId
7. Generates JWT token
8. Redirects to website with token
9. User is logged in
```

#### Option B: Link Existing Account (Existing Users)

```
1. User logs in with email/Google
2. Goes to Profile → "Link Telegram Account"
3. System generates 6-digit link code (expires in 5 min)
4. User opens Telegram bot
5. Sends: /start <link-code>
6. Bot verifies code with backend
7. Backend updates user record with telegramId
8. Account is linked
```

---

## 💳 Payment Flow (Requires Telegram Link)

### Prerequisites

- User MUST have Telegram account linked
- User MUST have telegramId in database
- Similar to how Google OAuth requires Google account

### Payment Process

#### Step 1: User Initiates Payment

```javascript
// Frontend checks if Telegram is linked
if (!user.telegramId) {
  toast.error("Please link your Telegram account first!");
  toast.info("Go to Profile → Link Telegram");
  return;
}
```

#### Step 2: Redirect to Telegram Bot

```javascript
// Create deep link with purchase amount
const deepLink = `https://t.me/${botUsername}?start=buy_${amount}`;
window.open(deepLink, "_blank");
```

#### Step 3: Bot Handles Purchase

```javascript
// Bot receives: /start buy_100
bot.onText(/\/start(.*)/, async (msg, match) => {
  const parameter = match[1].trim();

  if (parameter.startsWith("buy_")) {
    const amount = parseInt(parameter.split("_")[1]);

    // Check if user is linked
    const user = await User.findOne({ telegramId: msg.from.id });

    if (!user) {
      bot.sendMessage(chatId, "❌ Please link your account first!");
      return;
    }

    // Create Telegram Stars invoice
    await createStarsInvoice(chatId, amount);
  }
});
```

#### Step 4: User Pays in Telegram

```javascript
// Bot sends invoice
await bot.sendInvoice(
  chatId,
  title: `${amount} Telegram Stars`,
  description: `Add ${amount} Stars to your balance`,
  payload: `stars_${chatId}_${amount}_${Date.now()}`,
  currency: 'XTR', // Telegram Stars
  prices: [{ label: 'Telegram Stars', amount: amount }]
);
```

#### Step 5: Payment Verification

```javascript
// Bot receives successful payment
bot.on("successful_payment", async (msg) => {
  const payment = msg.successful_payment;
  const telegramId = msg.from.id;

  // Find user by telegramId
  const user = await User.findOne({ telegramId });

  // Update balance
  user.balance += amount;
  await user.save();

  // Create transaction record
  const transaction = new Transaction({
    user_id: user._id,
    amount: amount,
    transactionType: "recharge",
    paymentType: "telegram_stars",
    status: "approved",
    telegram_charge_id: payment.telegram_payment_charge_id,
  });
  await transaction.save();
});
```

#### Step 6: Balance Sync

```javascript
// Frontend polls for balance update
const checkPayment = setInterval(async () => {
  const response = await fetch("/api/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();

  if (data.user.balance > previousBalance) {
    // Payment successful!
    clearInterval(checkPayment);
    toast.success("Payment successful!");
    window.location.reload();
  }
}, 3000); // Check every 3 seconds
```

---

## 🔗 Why Telegram Link is Required

### Security Reasons

1. **Identity Verification**: Ensures the Telegram user is the same as website user
2. **Balance Sync**: Links Telegram payments to correct website account
3. **Fraud Prevention**: Prevents unauthorized payments to wrong accounts

### Technical Reasons

1. **User Mapping**: `telegramId` links Telegram user to database user
2. **Payment Attribution**: Knows which website account to credit
3. **Cross-Platform Sync**: Same balance on website and Telegram bot

### Similar to Google OAuth

Just like Google OAuth requires:

- Google account
- Authorization
- Email verification

Telegram Stars requires:

- Telegram account
- Account linking
- telegramId verification

---

## 📊 Database Schema

### User Model

```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  telegramId: String,        // ← Required for payments
  balance: Number,
  photo_url: String,
  // ... other fields
}
```

### Transaction Model

```javascript
{
  user_id: ObjectId,         // Links to User._id
  amount: Number,
  transactionType: 'recharge' | 'withdraw',
  paymentType: 'telegram_stars',
  status: 'pending' | 'approved' | 'rejected',
  telegram_charge_id: String,
  telegram_invoice_payload: String,
  createdAt: Date
}
```

---

## 🎯 Complete User Journey

### New User (No Account)

```
1. Visit website
2. Click "Login with Telegram"
3. Authorize in Telegram
4. Auto-logged in with telegramId
5. Can immediately buy Stars
```

### Existing User (Email/Google Login)

```
1. Login with email/Google
2. Go to Profile
3. Click "Link Telegram Account"
4. Get 6-digit code
5. Open Telegram bot
6. Send /start <code>
7. Account linked
8. Can now buy Stars
```

### Making a Payment

```
1. Click "Buy Stars" on website
2. System checks if Telegram linked
3. If not linked → Show error + link instructions
4. If linked → Redirect to Telegram bot
5. Bot shows invoice
6. User pays with Telegram Stars
7. Balance updates automatically
8. User can play game
```

---

## 🔧 Configuration Required

### Backend (.env)

```bash
# Telegram Bot Token (from @BotFather)
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_BOT_USERNAME=YourBotUsername

# Backend URL (for bot callbacks)
BACKEND_URL=http://localhost:8000

# Frontend URL (for redirects)
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

```bash
# Backend API URL
VITE_APP_BACKEND_URL=http://localhost:8000

# Telegram Bot Username (without @)
VITE_TELEGRAM_BOT_USERNAME=YourBotUsername
```

---

## ✅ Testing Checklist

### 1. Test Telegram Login (New User)

- [ ] Click "Login with Telegram"
- [ ] Authorize in Telegram
- [ ] Redirected back to website
- [ ] User logged in with telegramId
- [ ] Can access profile

### 2. Test Account Linking (Existing User)

- [ ] Login with email/Google
- [ ] Go to Profile → Link Telegram
- [ ] Generate link code
- [ ] Open Telegram bot
- [ ] Send /start <code>
- [ ] Account linked successfully
- [ ] telegramId saved in database

### 3. Test Payment Flow

- [ ] Click "Buy Stars"
- [ ] Check if Telegram linked
- [ ] Redirect to Telegram bot
- [ ] Bot shows invoice
- [ ] Complete payment
- [ ] Balance updates on website
- [ ] Transaction saved in database

### 4. Test Error Handling

- [ ] Try to pay without linking → Shows error
- [ ] Try expired link code → Shows error
- [ ] Try invalid payment → Shows error

---

## 🚨 Common Issues & Solutions

### Issue: "Please link your Telegram account first"

**Solution**: User needs to link Telegram account via Profile → Link Telegram

### Issue: Payment not reflecting on website

**Solution**:

1. Check if telegramId matches in database
2. Check bot logs for payment processing
3. Verify transaction was created
4. Check balance polling is working

### Issue: Link code expired

**Solution**: Generate new code (expires in 5 minutes)

### Issue: Bot not responding

**Solution**:

1. Check TELEGRAM_BOT_TOKEN is correct
2. Verify bot is running
3. Check bot has proper permissions

---

## 📝 Summary

**Telegram Authentication = Google OAuth**

- Both require external account
- Both need authorization
- Both link to website account

**Telegram Payment = Requires Authentication**

- Must have telegramId in database
- Links payment to correct user
- Ensures secure balance updates

**Flow**: Login/Link → Verify → Pay → Update Balance

This is the proper, secure way to handle Telegram Stars payments!
