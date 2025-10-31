const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const { googleAuthCallback } = require('../Controllers/GoogleAuthController');

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    googleAuthCallback
);

module.exports = router;
