# 🔐 Telegram Authentication Setup Guide

## Overview

Telegram authentication allows users to login to your Aviator Game using their Telegram account - secure and instant!

---

## Prerequisites

- A Telegram account
- Access to [@BotFather](https://t.me/BotFather) on Telegram

---

## Step-by-Step Setup

### Step 1: Create a Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Start a chat with BotFather
3. Send the command: `/newbot`
4. Follow the prompts:
   - Enter a name for your bot (e.g., "Aviator Game Login")
   - Enter a username for your bot (must end with 'bot', e.g., "aviator_game_login_bot")
5. BotFather will provide you with a **Bot Token** - save this!

### Step 2: Set Bot Domain

1. In the BotFather chat, send: `/setdomain`
2. Select your bot from the list
3. Enter your domain (e.g., `localhost:8000` for development or `yourdomain.com` for production)

### Step 3: Configure Environment Variables

Add these to your `.env` file:

```env
# Telegram Authentication
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_BOT_USERNAME=your_bot_username_here
TELEGRAM_CALLBACK_URL=http://localhost:8000/api/auth/telegram/callback
```

Replace:

- `TELEGRAM_BOT_TOKEN`: The token you received from BotFather
- `TELEGRAM_BOT_USERNAME`: Your bot's username (without @)
- `TELEGRAM_CALLBACK_URL`: Your callback URL (update for production)

### Step 4: Update Frontend URL (if needed)

Make sure your `FRONTEND_URL` is set correctly in `.env`:

```env
FRONTEND_URL=http://localhost:5173
```

For production, update to your actual domain:

```env
FRONTEND_URL=https://yourdomain.com
```

---

## Testing

1. Start your backend server:

   ```bash
   npm start
   ```

2. Start your frontend:

   ```bash
   cd aviatorGameWeb
   npm run dev
   ```

3. Navigate to the login page
4. Click the "Telegram" button
5. You'll be redirected to Telegram's authentication page
6. Authorize the bot
7. You'll be redirected back to your app, logged in!

---

## How It Works

1. User clicks "Login with Telegram"
2. User is redirected to Telegram's authentication page
3. User authorizes the bot
4. Telegram redirects back with user data
5. Backend verifies the data using cryptographic hash
6. Backend creates/updates user account
7. Backend generates JWT token
8. User is logged in and redirected to home page

---

## Security Features

- **Hash Verification**: All data from Telegram is cryptographically verified
- **Time-based Validation**: Authentication data expires after 24 hours
- **Secure Tokens**: JWT tokens with configurable expiration
- **HTTPS Support**: Works with secure connections in production

---

## Troubleshooting

### "Telegram bot token not configured"

- Make sure `TELEGRAM_BOT_TOKEN` is set in your `.env` file
- Restart your backend server after adding the token

### "Invalid Telegram authentication data"

- Check that your bot token is correct
- Make sure the domain is set correctly in BotFather
- Verify that the callback URL matches your configuration

### Authentication data is too old

- The authentication link expires after 24 hours
- Try logging in again with a fresh link

---

## Production Deployment

When deploying to production:

1. Update environment variables:

   ```env
   TELEGRAM_CALLBACK_URL=https://yourdomain.com/api/auth/telegram/callback
   FRONTEND_URL=https://yourdomain.com
   ```

2. Set the domain in BotFather to your production domain

3. Ensure your server supports HTTPS

---

## Additional Resources

- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [Telegram Login Widget](https://core.telegram.org/widgets/login)
- [BotFather Commands](https://core.telegram.org/bots#6-botfather)

---

## Support

If you encounter issues:

1. Check the backend console for error messages
2. Verify all environment variables are set correctly
3. Ensure your bot token is valid
4. Check that the domain is configured in BotFather
