# 🔧 Telegram Bot Troubleshooting Guide

## Error: ECONNRESET / EFATAL

This error occurs when the bot can't connect to Telegram's servers.

### Common Causes & Solutions:

---

## ✅ Solution 1: Check Bot Token

Verify your bot token is correct:

1. Open Telegram and find **@BotFather**
2. Send `/mybots`
3. Select your bot
4. Click "API Token"
5. Compare with your `.env` file

**Your current token:** `7607406638:AAH8ks1PK-UX4A1RPjicZkWqb5aSIXzuuOI`

---

## ✅ Solution 2: Network/Firewall Issues

### Check if Telegram is blocked:

```bash
# Test connection to Telegram API
curl https://api.telegram.org/bot7607406638:AAH8ks1PK-UX4A1RPjicZkWqb5aSIXzuuOI/getMe
```

If this fails, Telegram might be blocked by:

- Your ISP
- Corporate firewall
- Government restrictions
- Antivirus software

### Fix Options:

**Option A: Use a VPN**

- Connect to a VPN service
- Restart the bot

**Option B: Use a Proxy**
Add to `backend/bot/adminBot.js`:

```javascript
const bot = new TelegramBot(process.env.TELEGRAM_ADMIN_BOT_TOKEN, {
  polling: true,
  request: {
    proxy: "http://your-proxy-server:port",
  },
});
```

**Option C: Use Webhook Instead of Polling**
Webhooks are more reliable than polling. See `backend/bot/adminBotWebhook.js`

---

## ✅ Solution 3: Restart with Better Error Handling

The bot has been updated with automatic retry logic. Simply restart:

```bash
cd backend
start-admin-bot.bat
```

The bot will now:

- Automatically retry on connection errors
- Log errors without crashing
- Continue working after temporary network issues

---

## ✅ Solution 4: Test Bot Manually

Test if your bot is working:

1. **Open Telegram**
2. **Search for your bot** (get username from BotFather)
3. **Send** `/start`
4. **Check if bot responds**

If bot responds in Telegram but shows errors in console, you can ignore the errors - the bot is working!

---

## ✅ Solution 5: Use Alternative Polling Settings

Edit `backend/bot/adminBot.js` and try different polling settings:

```javascript
const bot = new TelegramBot(process.env.TELEGRAM_ADMIN_BOT_TOKEN, {
  polling: {
    interval: 1000, // Increase interval
    autoStart: true,
    params: {
      timeout: 30, // Increase timeout
    },
  },
});
```

---

## ✅ Solution 6: Check MongoDB Connection

Sometimes the error appears due to MongoDB issues:

```bash
# Check if MongoDB is running
mongosh

# Or check connection in your app
```

Make sure MongoDB is running before starting the bot.

---

## ✅ Solution 7: Disable Polling Temporarily

If polling keeps failing, you can disable it and use webhook mode:

1. Stop the current bot
2. Use webhook version (requires public URL)
3. Or use bot through your main backend server

---

## 🔍 Debug Mode

To see more detailed errors, add this to `backend/bot/adminBot.js`:

```javascript
bot.on("polling_error", (error) => {
  console.error("Detailed polling error:");
  console.error("Code:", error.code);
  console.error("Message:", error.message);
  console.error("Stack:", error.stack);
});
```

---

## 📊 Check Bot Status

Verify your bot is active:

```bash
# Windows PowerShell
curl https://api.telegram.org/bot7607406638:AAH8ks1PK-UX4A1RPjicZkWqb5aSIXzuuOI/getMe

# Or visit in browser:
https://api.telegram.org/bot7607406638:AAH8ks1PK-UX4A1RPjicZkWqb5aSIXzuuOI/getMe
```

Expected response:

```json
{
  "ok": true,
  "result": {
    "id": 7607406638,
    "is_bot": true,
    "first_name": "Your Bot Name",
    "username": "your_bot_username"
  }
}
```

---

## ⚠️ Important Notes

1. **ECONNRESET is often temporary** - The bot will retry automatically
2. **Bot might still work** - Check Telegram app to see if bot responds
3. **Network issues are common** - Especially in regions where Telegram is restricted
4. **Use VPN if needed** - This solves most connection issues

---

## 🎯 Quick Fix Summary

**Most Common Fix:**

1. Restart your router/internet connection
2. Connect to a VPN
3. Restart the bot

**If that doesn't work:**

1. Verify bot token is correct
2. Check if Telegram API is accessible
3. Try webhook mode instead of polling

---

## 💡 Alternative: Run Bot Through Main Backend

Instead of running the bot separately, you can integrate it into your main backend:

Edit `backend/index.js` and add:

```javascript
// Start Telegram Admin Bot
if (process.env.TELEGRAM_ADMIN_BOT_TOKEN) {
  require("./bot/adminBot");
  console.log("✅ Telegram Admin Bot started");
}
```

Then just run your main backend:

```bash
npm start
```

---

## 📞 Still Having Issues?

1. Check bot logs for specific error messages
2. Test bot directly in Telegram app
3. Verify all environment variables are set
4. Try running bot on a different network
5. Consider using webhook mode for production

The bot has been updated with better error handling and will continue working despite connection errors!
