const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const { googleCallback, telegramLogin } = require('../Controllers/OAuthController');

// Google OAuth Routes
router.get(
    '/auth/google',
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })
);

router.get(
    '/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed`,
        session: false
    }),
    googleCallback
);

// Telegram Login Route
router.post('/auth/telegram', telegramLogin);

module.exports = router;
