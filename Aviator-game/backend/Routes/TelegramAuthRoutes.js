const express = require('express');
const router = express.Router();
const { telegramAuthCallback } = require('../Controllers/TelegramAuthController');

// Telegram Login Widget Callback
router.get('/telegram/callback', telegramAuthCallback);

// Redirect to Telegram login page
router.get('/telegram', (req, res) => {
    const botUsername = process.env.TELEGRAM_BOT_USERNAME;
    const callbackUrl = process.env.TELEGRAM_CALLBACK_URL || 'http://localhost:8000/api/auth/telegram/callback';
    
    if (!botUsername) {
        return res.status(500).json({ error: 'Telegram bot not configured' });
    }

    // Redirect to Telegram login widget page
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/telegram-login?bot=${botUsername}&callback=${encodeURIComponent(callbackUrl)}`);
});

module.exports = router;
