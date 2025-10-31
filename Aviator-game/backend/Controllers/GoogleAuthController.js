const User = require("../Models/User");
const jwt = require("jsonwebtoken");

const googleAuthCallback = async (req, res) => {
    try {
        const googleUser = req.user;

        // Extract email from profile
        const email = googleUser.emails?.[0]?.value || googleUser.email;
        const displayName = googleUser.displayName || googleUser.name?.givenName || 'User';

        console.log('🔍 Google OAuth - Full profile:', googleUser);
        console.log('🔍 Google OAuth - Extracted data:', {
            id: googleUser.id,
            email: email,
            displayName: displayName,
            givenName: googleUser.name?.givenName,
            familyName: googleUser.name?.familyName,
            photo: googleUser.photos?.[0]?.value
        });

        let user = await User.findOne({ googleId: googleUser.id });
        console.log('🔍 Database lookup result:', user ? 'User found' : 'User not found');

        if (!user) {
            let uniqueUId;
            let isUnique = false;

            while (!isUnique) {
                uniqueUId = `G${Math.floor(10000 + Math.random() * 90000)}`;
                const existingId = await User.findOne({ user_id: uniqueUId });
                if (!existingId) {
                    isUnique = true;
                }
            }

            const newUserData = {
                googleId: googleUser.id,
                user_id: uniqueUId,
                email: email,
                username: displayName || email.split('@')[0],
                first_name: googleUser.name?.givenName || googleUser.given_name,
                last_name: googleUser.name?.familyName || googleUser.family_name,
                photo_url: googleUser.photos?.[0]?.value || googleUser.picture,
                isVerified: true,
                currency: 'STARS',
                balance: 0,
                promocode: `PROMO_${uniqueUId.toString().slice(0, 4).toUpperCase()}`,
            };

            console.log('📝 Creating new user with data:', newUserData);
            user = new User(newUserData);

            const savedUser = await user.save();
            console.log(`✅ New user SAVED to database:`, {
                _id: savedUser._id,
                email: savedUser.email,
                user_id: savedUser.user_id,
                googleId: savedUser.googleId
            });
        } else {
            console.log('🔄 Updating existing user:', user.email);
            user.email = email;
            user.username = displayName || user.username;
            user.first_name = googleUser.name?.givenName || googleUser.given_name || user.first_name;
            user.last_name = googleUser.name?.familyName || googleUser.family_name || user.last_name;
            user.photo_url = googleUser.photos?.[0]?.value || googleUser.picture || user.photo_url;
            const updatedUser = await user.save();
            console.log(`✅ Existing user UPDATED in database:`, {
                _id: updatedUser._id,
                email: updatedUser.email,
                username: updatedUser.username
            });
        }

        // Convert Mongoose document to plain object
        const userObj = user.toObject ? user.toObject() : user;

        console.log('👤 User object before JWT:', userObj);

        // Ensure we have required user data
        if (!userObj._id || !userObj.email) {
            console.error('❌ User object is missing required fields!');
            throw new Error('User data incomplete');
        }

        const jwtPayload = {
            id: userObj._id.toString(),
            user_id: userObj.user_id,
            email: userObj.email,
            username: userObj.username,
            name: userObj.username
        };

        console.log('🔐 Creating JWT with payload:', jwtPayload);

        const token = jwt.sign(
            jwtPayload,
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        console.log('✅ JWT created, length:', token.length);

        const options = {
            expires: new Date(Date.now() + 2592000000),
            httpOnly: false, // Changed to false so frontend can read it
            sameSite: "Lax", // Changed to Lax for better compatibility
            secure: process.env.NODE_ENV === 'production'
        };

        // Store token in cookie
        res.cookie("token", token, options);

        // Create user data object with all required fields
        const userData = {
            _id: userObj._id?.toString(),
            id: userObj._id?.toString(),
            user_id: userObj.user_id,
            email: userObj.email,
            username: userObj.username,
            name: userObj.username,
            balance: userObj.balance || 0,
            currency: userObj.currency || 'STARS',
            photo_url: userObj.photo_url,
            isVerified: userObj.isVerified
        };

        console.log('📤 User data to store in cookie:', userData);

        // Store user data in a separate, non-httpOnly cookie so frontend can read it
        res.cookie("user", JSON.stringify(userData), {
            ...options,
            httpOnly: false // Allow frontend to read this cookie
        });

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        // Redirect with token AND user data in URL (most reliable method)
        const userEncoded = encodeURIComponent(JSON.stringify(userData));
        const redirectUrl = `${frontendUrl}/oauth/callback?token=${token}&user=${userEncoded}`;
        console.log('🔗 Redirecting to:', redirectUrl);
        console.log('📦 User data being sent:', userData);

        res.redirect(redirectUrl);
    } catch (error) {
        console.error("❌ Error in Google auth:", error);
        console.error("❌ Error stack:", error.stack);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/?auth=error&message=${encodeURIComponent(error.message)}`);
    }
};

module.exports = {
    googleAuthCallback,
};