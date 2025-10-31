# 🤖 Telegram Admin Bot - Quick Start Guide

## ✅ Bot Token Integrated!

Your Telegram Admin Bot token has been successfully integrated into the system.

**Bot Token:** `7607406638:AAH8ks1PK-UX4A1RPjicZkWqb5aSIXzuuOI`

---

## 🚀 How to Start the Bot

### Option 1: Using Batch File (Windows)

```bash
cd backend
start-admin-bot.bat
```

### Option 2: Using Command Line

```bash
cd backend
node bot/startBot.js
```

---

## 📱 How to Use the Bot

### Step 1: Find Your Bot on Telegram

1. Open Telegram app
2. Search for your bot (use the bot username from BotFather)
3. Click "Start" or send `/start`

### Step 2: Login as Admin

```
/login your-admin-email@example.com your-password
```

**Example:**

```
/login admin@aviator.com admin123
```

### Step 3: Use the Menu

After login, you'll see a menu with these options:

- **👥 Users** - View, search, and manage users
- **💰 Payments** - Approve/reject recharge and withdrawal requests
- **📊 Statistics** - View real-time platform statistics
- **🎮 Game Control** - Enable/disable the game instantly
- **⚙️ Settings** - View all platform settings
- **📢 Broadcast** - Send messages to all users
- **🔓 Logout** - Logout from admin panel

---

## 🎯 Available Features

### 1. User Management

- View all users (last 10)
- Search users: `/searchuser username`
- View top users by balance
- See detailed user information

### 2. Payment Control

- View pending recharge requests
- View pending withdrawal requests
- Approve payment: `/approve transaction_id`
- Reject payment: `/reject transaction_id`

### 3. Statistics Dashboard

- Total users & active users
- Total transactions & pending payments
- Total recharge, withdrawals, and revenue

### 4. Game Control

- Enable/disable game with one tap
- View current game status
- See min/max bet amounts

### 5. Settings View

- View all platform settings
- Game timers, fees, and limits
- Bonus and withdrawal settings

### 6. Broadcast Messages

- Send announcements to all users
- Format: `/broadcast Your message here`

---

## 📋 Quick Commands Reference

```
/start              - Start the bot
/login email pass   - Login as admin
/searchuser query   - Search for a user
/approve txn_id     - Approve transaction
/reject txn_id      - Reject transaction
/broadcast message  - Send message to all users
/help               - Show help message
```

---

## ⚠️ Important Notes

1. **Keep Bot Running**: The bot must be running to receive and process commands
2. **Admin Credentials**: You need admin account credentials to login
3. **MongoDB Required**: Make sure MongoDB is running and connected
4. **Security**: Never share your bot token publicly

---

## 🔧 Troubleshooting

### Bot Not Responding?

1. Check if the bot is running (look for "✅ Admin Telegram Bot is running..." message)
2. Verify MongoDB connection
3. Check if bot token is correct in `.env` file

### Can't Login?

1. Make sure you have an admin account in the database
2. Use correct email and password format: `/login email password`
3. Check MongoDB connection

### Commands Not Working?

1. Make sure you're logged in first
2. Use exact command format (case-sensitive)
3. Check bot console for error messages

---

## 🎉 You're All Set!

Your Telegram Admin Bot is ready to use. Start the bot and begin managing your platform from Telegram!

**Next Steps:**

1. Start the bot using `start-admin-bot.bat`
2. Open Telegram and find your bot
3. Login with admin credentials
4. Start managing your platform!

---

## 📞 Need Help?

- Check the full setup guide: `Telegram_Bot_Guide/TELEGRAM_ADMIN_BOT_SETUP.md`
- Review bot code: `backend/bot/adminBot.js`
- Test bot connection: Send `/start` to your bot on Telegram
