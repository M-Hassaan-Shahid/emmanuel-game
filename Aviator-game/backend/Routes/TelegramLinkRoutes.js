const express = require('express');
const router = express.Router();
const User = require('../Models/User');
const crypto = require('crypto');

// Store temporary link codes
const linkCodes = new Map();

// Generate link code for user
router.post('/generate-link-code', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if already linked
        if (user.telegramId) {
            return res.json({
                success: true,
                alreadyLinked: true,
                message: 'Telegram account already linked'
            });
        }

        // Generate unique 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Store code with expiry (5 minutes)
        linkCodes.set(code, {
            userId: userId,
            email: user.email,
            username: user.username || user.user_id,
            expires: Date.now() + 5 * 60 * 1000 // 5 minutes
        });

        // Clean up expired codes
        setTimeout(() => {
            linkCodes.delete(code);
        }, 5 * 60 * 1000);

        res.json({
            success: true,
            linkCode: code,
            expiresIn: 300, // seconds
            botUsername: process.env.TELEGRAM_BOT_USERNAME || 'YourBotUsername'
        });

    } catch (error) {
        console.error('Generate link code error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate link code'
        });
    }
});

// Verify link code (called by Telegram bot)
router.post('/verify-link-code', async (req, res) => {
    try {
        const { code, telegramId, telegramUsername } = req.body;

        if (!code || !telegramId) {
            return res.status(400).json({
                success: false,
                message: 'Code and Telegram ID are required'
            });
        }

        // Check if code exists
        const linkData = linkCodes.get(code);
        if (!linkData) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired link code'
            });
        }

        // Check if expired
        if (Date.now() > linkData.expires) {
            linkCodes.delete(code);
            return res.status(400).json({
                success: false,
                message: 'Link code has expired'
            });
        }

        // Update user with Telegram ID
        const user = await User.findByIdAndUpdate(
            linkData.userId,
            {
                telegramId: telegramId.toString(),
                username: telegramUsername || linkData.username
            },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Remove used code
        linkCodes.delete(code);

        res.json({
            success: true,
            message: 'Telegram account linked successfully',
            user: {
                email: user.email,
                username: user.username,
                balance: user.balance
            }
        });

    } catch (error) {
        console.error('Verify link code error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify link code'
        });
    }
});

// Check link status
router.get('/link-status/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            isLinked: !!user.telegramId,
            telegramId: user.telegramId || null
        });

    } catch (error) {
        console.error('Link status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check link status'
        });
    }
});

// Unlink Telegram account
router.post('/unlink', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { $unset: { telegramId: 1 } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'Telegram account unlinked successfully'
        });

    } catch (error) {
        console.error('Unlink error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to unlink account'
        });
    }
});

module.exports = router;
