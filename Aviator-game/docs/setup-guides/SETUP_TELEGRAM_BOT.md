# 🤖 Telegram Bot Setup Guide

## Overview

Telegram Bot allows users to login using their Telegram account and receive notifications about game events, payments, and more!

---

## What You'll Get

- ✅ One-click Telegram login
- ✅ Instant notifications
- ✅ Direct user communication
- ✅ Customer support via Telegram
- ✅ Marketing messages
- ✅ No phone number needed

---

## Step-by-Step Setup

### Step 1: Create Telegram Bot

1. Open Telegram app (mobile or desktop)
2. Search for: **@BotFather**
3. Start chat with BotFather
4. Send command: `/newbot`

**BotFather will ask:**

**Question 1:** "Alright, a new bot. How are we going to call it?"

```
Answer: Aviator Game Bot
```

**Question 2:** "Good. Now let's choose a username for your bot."

```
Answer: aviator_game_bot
```

**Rules for username:**

- Must end with 'bot'
- Must be unique
- 5-32 characters
- Only letters, numbers, and underscores

**Examples:**

- ✅ `aviator_game_bot`
- ✅ `AviatorGameBot`
- ✅ `aviator_official_bot`
- ❌ `aviator` (doesn't end with bot)
- ❌ `aviator-game-bot` (has hyphen)

### Step 2: Get Bot Token

After creating the bot, BotFather will send:

```
Done! Congratulations on your new bot. You will find it at t.me/aviator_game_bot.

Use this token to access the HTTP API:
123456789:ABCdefGHIjklMNOpqrsTUVwxyz-1234567

Keep your token secure and store it safely, it can be used by anyone to control your bot.
```

**Copy the token!** It looks like:

```
123456789:ABCdefGHIjklMNOpqrsTUVwxyz-1234567
```

### Step 3: Configure Bot Settings

**Set Bot Description:**

```
/setdescription
Select: @aviator_game_bot
Enter: Login to Aviator Game and get instant notifications!
```

**Set Bot About:**

```
/setabouttext
Select: @aviator_game_bot
Enter: Official Aviator Game Bot - Login, play, and win!
```

**Set Bot Profile Picture:**

```
/setuserpic
Select: @aviator_game_bot
Upload: Your game logo
```

**Set Bot Commands:**

```
/setcommands
Select: @aviator_game_bot
Enter:
start - Start the bot
help - Get help
balance - Check your balance
deposit - Make a deposit
withdraw - Request withdrawal
support - Contact support
```

### Step 4: Set Domain (Important!)

```
/setdomain
Select: @aviator_game_bot
Enter: localhost:5173
```

**For production:**

```
Enter: yourdomain.com
```

This allows Telegram login widget to work on your website.

### Step 5: Configure .env

Open `backend/.env` and add:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz-1234567
TELEGRAM_BOT_USERNAME=aviator_game_bot
```

### Step 6: Install Required Packages

```bash
cd backend
npm install node-telegram-bot-api
```

### Step 7: Test Bot

**Create test file:** `backend/test-telegram.js`

```javascript
require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  console.log(`Received: ${text} from ${chatId}`);

  if (text === "/start") {
    bot.sendMessage(chatId, "Welcome to Aviator Game! 🎮");
  }
});

console.log("✅ Bot is running...");
```

**Run test:**

```bash
node backend/test-telegram.js
```

**Test in Telegram:**

1. Open Telegram
2. Search for your bot: `@aviator_game_bot`
3. Send: `/start`
4. Bot should reply: "Welcome to Aviator Game! 🎮"

### Step 8: Restart Backend

```bash
cd backend
npm start
```

### Step 9: Test Telegram Login

1. Open app: `http://localhost:5173`
2. Click "Login"
3. Click "Telegram" button
4. Telegram widget opens
5. Authorize
6. You should be logged in!

---

## Telegram Login Widget

### How It Works:

The Telegram login widget is embedded in your login page:

```html
<script
  async
  src="https://telegram.org/js/telegram-widget.js?22"
  data-telegram-login="aviator_game_bot"
  data-size="large"
  data-auth-url="http://localhost:8000/api/auth/telegram"
  data-request-access="write"
></script>
```

### Widget Customization:

**Size:**

- `small` - Compact button
- `medium` - Standard size
- `large` - Large button

**Corner Radius:**

- `data-radius="10"` - Rounded corners

**Language:**

- `data-lang="en"` - English
- `data-lang="ru"` - Russian

---

## Bot Commands Implementation

### Create Bot Handler:

**File:** `backend/bot/telegram-bot.js`

```javascript
const TelegramBot = require("node-telegram-bot-api");
const User = require("../Models/User");

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Start command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username;

  await bot.sendMessage(
    chatId,
    `Welcome to Aviator Game, @${username}! 🎮\n\n` +
      `Use /help to see available commands.`
  );
});

// Help command
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;

  await bot.sendMessage(
    chatId,
    `📋 Available Commands:\n\n` +
      `/balance - Check your balance\n` +
      `/deposit - Make a deposit\n` +
      `/withdraw - Request withdrawal\n` +
      `/support - Contact support`
  );
});

// Balance command
bot.onText(/\/balance/, async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id;

  const user = await User.findOne({ telegramId: telegramId.toString() });

  if (!user) {
    await bot.sendMessage(
      chatId,
      `❌ Account not found. Please login first:\n` +
        `https://yourdomain.com/login`
    );
    return;
  }

  await bot.sendMessage(
    chatId,
    `💰 Your Balance: ₹${user.balance}\n\n` + `User ID: ${user.user_id}`
  );
});

module.exports = bot;
```

### Start Bot in Server:

**In `backend/index.js`:**

```javascript
// Start Telegram bot
if (process.env.TELEGRAM_BOT_TOKEN) {
  require("./bot/telegram-bot");
  console.log("✅ Telegram bot started");
}
```

---

## Sending Notifications

### Win Notification:

```javascript
const bot = require("./bot/telegram-bot");

async function notifyWin(userId, amount, multiplier) {
  const user = await User.findById(userId);

  if (user.telegramId) {
    await bot.sendMessage(
      user.telegramId,
      `🎉 Congratulations!\n\n` +
        `You won ₹${amount} at ${multiplier}x multiplier!\n` +
        `New balance: ₹${user.balance}`
    );
  }
}
```

### Deposit Confirmation:

```javascript
async function notifyDeposit(userId, amount) {
  const user = await User.findById(userId);

  if (user.telegramId) {
    await bot.sendMessage(
      user.telegramId,
      `✅ Deposit Successful!\n\n` +
        `Amount: ₹${amount}\n` +
        `New balance: ₹${user.balance}\n\n` +
        `Happy gaming! 🎮`
    );
  }
}
```

### Withdrawal Approved:

```javascript
async function notifyWithdrawal(userId, amount) {
  const user = await User.findById(userId);

  if (user.telegramId) {
    await bot.sendMessage(
      user.telegramId,
      `💸 Withdrawal Approved!\n\n` +
        `Amount: ₹${amount}\n` +
        `Processing time: 24-48 hours\n\n` +
        `Thank you for playing!`
    );
  }
}
```

---

## Troubleshooting

### Error: "Bot token is invalid"

**Cause:** Wrong token in .env

**Fix:**

1. Go to BotFather
2. Send: `/token`
3. Select your bot
4. Copy new token
5. Update .env

---

### Error: "Unauthorized"

**Cause:** Token format incorrect

**Fix:**

- Token should be: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`
- No spaces or extra characters
- Check .env file

---

### Error: "Bot not responding"

**Cause:** Bot not running or polling disabled

**Fix:**

```javascript
const bot = new TelegramBot(token, { polling: true });
```

---

### Error: "Domain not set"

**Cause:** Domain not configured with BotFather

**Fix:**

```
/setdomain
Select: @your_bot
Enter: yourdomain.com
```

---

### Error: "Login widget not showing"

**Cause:** Wrong bot username or domain

**Fix:**

1. Check TELEGRAM_BOT_USERNAME in .env
2. Verify domain with BotFather
3. Clear browser cache

---

## Security Best Practices

### DO:

- ✅ Keep bot token secret
- ✅ Verify Telegram data signature
- ✅ Use HTTPS in production
- ✅ Validate user data
- ✅ Rate limit bot commands

### DON'T:

- ❌ Share bot token
- ❌ Commit token to git
- ❌ Allow spam through bot
- ❌ Store sensitive data in bot messages
- ❌ Skip signature verification

---

## Signature Verification

### How It Works:

Telegram sends signed data to verify authenticity:

```javascript
const crypto = require("crypto");

function verifyTelegramAuth(data, botToken) {
  const { hash, ...userData } = data;

  // Create data check string
  const dataCheckArr = Object.keys(userData)
    .sort()
    .map((key) => `${key}=${userData[key]}`);
  const dataCheckString = dataCheckArr.join("\n");

  // Create secret key
  const secretKey = crypto.createHash("sha256").update(botToken).digest();

  // Create hash
  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  return calculatedHash === hash;
}
```

---

## Bot Features

### Basic Features:

- ✅ User authentication
- ✅ Balance checking
- ✅ Deposit notifications
- ✅ Withdrawal notifications
- ✅ Win/loss notifications
- ✅ Customer support

### Advanced Features:

- 📊 Game statistics
- 🎯 Betting tips
- 🏆 Leaderboards
- 🎁 Promotional offers
- 📈 Performance tracking
- 💬 Live chat support

---

## Bot Commands Reference

### User Commands:

```
/start - Welcome message
/help - Show help
/balance - Check balance
/deposit - Deposit instructions
/withdraw - Withdrawal request
/history - Game history
/stats - Your statistics
/support - Contact support
```

### Admin Commands:

```
/broadcast - Send message to all users
/stats_all - Platform statistics
/users - User count
/revenue - Revenue report
```

---

## Testing Checklist

- [ ] Bot created with BotFather
- [ ] Bot token copied
- [ ] Bot username noted
- [ ] Domain set with BotFather
- [ ] Token added to .env
- [ ] Backend restarted
- [ ] Test message sent to bot
- [ ] Bot responds correctly
- [ ] Login widget appears
- [ ] Telegram login works
- [ ] User data saved
- [ ] Notifications work

---

## Production Setup

### Step 1: Update Domain

```
/setdomain
Select: @aviator_game_bot
Enter: yourdomain.com
```

### Step 2: Update .env

```env
TELEGRAM_BOT_TOKEN=your-token
TELEGRAM_BOT_USERNAME=aviator_game_bot
FRONTEND_URL=https://yourdomain.com
```

### Step 3: Enable Webhook (Optional)

Instead of polling, use webhooks for better performance:

```javascript
const bot = new TelegramBot(token);
bot.setWebHook(`https://yourdomain.com/api/telegram-webhook`);
```

---

## Monitoring

### Bot Analytics:

1. Go to: https://t.me/BotFather
2. Send: `/mybots`
3. Select your bot
4. Click "Bot Settings" → "Statistics"

### Metrics Available:

- Total users
- Active users
- Messages sent/received
- Commands used

---

## Quick Reference

### Configuration:

```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_BOT_USERNAME=aviator_game_bot
```

### Create Bot:

1. Message @BotFather
2. Send `/newbot`
3. Follow instructions
4. Copy token

### Test Bot:

1. Search for bot in Telegram
2. Send `/start`
3. Bot should respond

### BotFather:

https://t.me/BotFather

---

## Support Resources

### Documentation:

- Telegram Bots: https://core.telegram.org/bots
- Bot API: https://core.telegram.org/bots/api
- Login Widget: https://core.telegram.org/widgets/login

### Libraries:

- node-telegram-bot-api: https://github.com/yagop/node-telegram-bot-api

---

## Cost

### Telegram Bot:

- **Cost:** FREE
- **Messages:** Unlimited
- **Users:** Unlimited
- **Features:** All included

**No hidden costs!**

---

**Status:** ✅ Setup complete when Telegram login works

**Next Step:** Test all authentication methods

---

_Last Updated: October 14, 2025_
