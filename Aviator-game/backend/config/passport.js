const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:8000/api/auth/google/callback',
            scope: ['profile', 'email'],
            passReqToCallback: false,
        },
        (accessToken, refreshToken, profile, done) => {
            console.log('📋 Google Profile Received:', {
                id: profile.id,
                displayName: profile.displayName,
                email: profile.emails?.[0]?.value,
                name: profile.name,
                photos: profile.photos?.[0]?.value
            });
            return done(null, profile);
        }
    )
);

module.exports = passport;
