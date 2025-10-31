const User = require("../Models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Telegram Auth Handler
const telegramAuthCallback = async (req, res) => {
    try {
        const { id, first_name, last_name, username, photo_url, auth_date, hash } = req.query;

        // Verify Telegram data
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
            throw new Error("Telegram bot token not configured");
        }

        // Verify the hash
        const dataCheckString = Object.keys(req.query)
            .filter(key => key !== 'hash')
            .sort()
            .map(key => `${key}=${req.query[key]}`)
            .join('\n');

        const secretKey = crypto.createHash('sha256').update(botToken).digest();
        const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

        if (calculatedHash !== hash) {
            throw new Error("Invalid Telegram authentication data");
        }

        // Check if auth_date is not too old (e.g., within 24 hours)
        const currentTime = Math.floor(Date.now() / 1000);
        if (currentTime - parseInt(auth_date) > 86400) {
            throw new Error("Authentication data is too old");
        }

        // Find or create user
        let user = await User.findOne({ telegramId: id });

        if (!user) {
            // Generate unique user ID
            let uniqueUId;
            let isUnique = false;

            while (!isUnique) {
                uniqueUId = `T${Math.floor(10000 + Math.random() * 90000)}`;
                const existingId = await User.findOne({ user_id: uniqueUId });
                if (!existingId) {
                    isUnique = true;
                }
            }

            user = new User({
                telegramId: id,
                user_id: uniqueUId,
                username: username || `user_${id}`,
                first_name: first_name,
                last_name: last_name,
                photo_url: photo_url,
                isVerified: true,
                promocode: `PROMO_${uniqueUId.toString().slice(0, 4).toUpperCase()}`,
            });

            await user.save();
            console.log(`✅ New user created via Telegram: ${username || id}`);
        } else {
            // Update existing user info
            user.username = username || user.username;
            user.first_name = first_name;
            user.last_name = last_name;
            user.photo_url = photo_url;
            await user.save();
            console.log(`✅ Existing user logged in via Telegram: ${username || id}`);
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Set cookies
        const options = {
            expires: new Date(Date.now() + 2592000000), // 30 days
            httpOnly: true,
            sameSite: "None",
            secure: process.env.NODE_ENV === "production"
        };

        res.cookie("token", token, options);
        res.cookie("user", JSON.stringify(user), options);

        // Redirect to frontend with user data
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const userEncoded = encodeURIComponent(JSON.stringify({
            _id: user._id,
            username: user.username,
            user_id: user.user_id,
            balance: user.balance,
            photo_url: user.photo_url,
            first_name: user.first_name,
            last_name: user.last_name
        }));

        res.redirect(`${frontendUrl}/auth/callback?auth=success&token=${token}&user=${userEncoded}`);
    } catch (error) {
        console.error("Error in Telegram auth:", error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/?auth=error&message=${encodeURIComponent(error.message)}`);
    }
};

module.exports = {
    telegramAuthCallback,
};
