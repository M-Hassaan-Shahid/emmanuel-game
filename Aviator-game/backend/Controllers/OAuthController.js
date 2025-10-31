const jwt = require('jsonwebtoken');
const User = require('../Models/User');
const crypto = require('crypto');

// Google OAuth Callback
const googleCallback = async (req, res) => {
    try {
        const googleUser = req.user;

        if (!googleUser) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=authentication_failed`);
        }

        // Extract email and name
        const email = googleUser.emails?.[0]?.value || googleUser.email;
        const displayName = googleUser.displayName || googleUser.name?.givenName || 'User';

        // Find or create user in database
        let user = await User.findOne({ googleId: googleUser.id });

        if (!user) {
            // Generate unique user_id
            let uniqueUId;
            let isUnique = false;
            while (!isUnique) {
                uniqueUId = `G${Math.floor(10000 + Math.random() * 90000)}`;
                const existingId = await User.findOne({ user_id: uniqueUId });
                if (!existingId) {
                    isUnique = true;
                }
            }

            // Create new user
            const promoCode = `PROMO_${uniqueUId.slice(1, 5)}`;
            user = new User({
                googleId: googleUser.id,
                user_id: uniqueUId,
                email: email,
                username: displayName || email.split('@')[0],
                first_name: googleUser.name?.givenName,
                last_name: googleUser.name?.familyName,
                photo_url: googleUser.photos?.[0]?.value,
                isVerified: true,
                currency: 'STARS',
                balance: 0,
                promocode: promoCode,
            });

            await user.save();
            console.log('New Google user created with promocode:', promoCode);
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id.toString(), user_id: user.user_id, email: user.email, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Create user data object
        const userData = {
            id: user._id.toString(),
            _id: user._id.toString(),
            user_id: user.user_id,
            email: user.email,
            username: user.username,
            name: user.username,
            balance: user.balance || 0,
            currency: user.currency || 'STARS',
            photo_url: user.photo_url,
            isVerified: user.isVerified
        };

        // Redirect to frontend with token and user data
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`);
    } catch (error) {
        console.error('Error in Google callback:', error);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
    }
};

// Telegram Login Verification
const telegramLogin = async (req, res) => {
    try {
        const { id, first_name, last_name, username, photo_url, auth_date, hash } = req.body;

        // Verify Telegram data
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
            return res.status(503).json({
                success: false,
                message: 'Telegram authentication not configured'
            });
        }

        // Create data check string
        const dataCheckArr = [];
        for (const key in req.body) {
            if (key !== 'hash') {
                dataCheckArr.push(`${key}=${req.body[key]}`);
            }
        }
        dataCheckArr.sort();
        const dataCheckString = dataCheckArr.join('\n');

        // Create secret key
        const secretKey = crypto
            .createHash('sha256')
            .update(botToken)
            .digest();

        // Create hash
        const calculatedHash = crypto
            .createHmac('sha256', secretKey)
            .update(dataCheckString)
            .digest('hex');

        // Verify hash
        if (calculatedHash !== hash) {
            return res.status(401).json({
                success: false,
                message: 'Invalid Telegram authentication data'
            });
        }

        // Check if auth_date is recent (within 24 hours)
        const currentTime = Math.floor(Date.now() / 1000);
        if (currentTime - auth_date > 86400) {
            return res.status(401).json({
                success: false,
                message: 'Authentication data is too old'
            });
        }

        // Find or create user
        let user = await User.findOne({ telegramId: id });

        if (user) {
            console.log('Existing Telegram user found:', user.username);
        } else {
            // Generate unique user_id
            let uniqueUId;
            let isUnique = false;
            while (!isUnique) {
                uniqueUId = `T${Math.floor(10000 + Math.random() * 90000)}`;
                const existingId = await User.findOne({ user_id: uniqueUId });
                if (!existingId) {
                    isUnique = true;
                }
            }

            // Create new user
            user = new User({
                telegramId: id,
                username: username || `${first_name}${last_name ? '_' + last_name : ''}`,
                isVerified: true, // Telegram accounts are pre-verified
                user_id: uniqueUId,
                promocode: `PROMO_${uniqueUId.slice(0, 4).toUpperCase()}`,
                balance: 0,
                currency: 'STARS'
            });

            await user.save();
            console.log('New user created via Telegram:', user.username);
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            success: true,
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                balance: user.balance,
                user_id: user.user_id
            }
        });
    } catch (error) {
        console.error('Error in Telegram login:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during Telegram authentication',
            error: error.message
        });
    }
};

module.exports = {
    googleCallback,
    telegramLogin
};
