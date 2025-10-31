# 🔐 Google OAuth Setup Guide

## Overview

Google OAuth allows users to login to your Aviator Game using their Google account - no password needed!

---

## What You'll Get

- ✅ One-click Google login
- ✅ Automatic user creation
- ✅ Secure authentication
- ✅ No password management
- ✅ Email verification by Google

---

## Step-by-Step Setup

### Step 1: Create Google Cloud Project

1. Go to: https://console.cloud.google.com/
2. Click "Select a project" (top left)
3. Click "New Project"
4. Enter project details:
   - **Project name:** Aviator Game
   - **Organization:** (leave default)
5. Click "Create"
6. Wait for project creation (30 seconds)

### Step 2: Enable Google+ API

1. In the project dashboard, click "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on "Google+ API"
4. Click "Enable"
5. Wait for activation

**Alternative:** Enable "Google Identity Services"

1. Search for "Google Identity Services"
2. Click "Enable"

### Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose user type:

   - **External** (for public app)
   - Click "Create"

3. Fill in App Information:

   - **App name:** Aviator Game
   - **User support email:** your-email@gmail.com
   - **App logo:** (optional - upload your logo)
   - **Application home page:** http://localhost:5173 (for dev)
   - **Application privacy policy:** (optional)
   - **Application terms of service:** (optional)

4. Developer contact information:

   - **Email addresses:** your-email@gmail.com

5. Click "Save and Continue"

6. Scopes (Step 2):

   - Click "Add or Remove Scopes"
   - Select:
     - ✅ `.../auth/userinfo.email`
     - ✅ `.../auth/userinfo.profile`
   - Click "Update"
   - Click "Save and Continue"

7. Test users (Step 3):

   - Click "Add Users"
   - Add your email for testing
   - Click "Save and Continue"

8. Summary (Step 4):
   - Review information
   - Click "Back to Dashboard"

### Step 4: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: **Web application**
4. Name: **Aviator Game Web Client**

5. Authorized JavaScript origins:

   - Click "Add URI"
   - Add: `http://localhost:5173`
   - Add: `http://localhost:3000`
   - Add: `http://localhost:8000`
   - For production, add: `https://yourdomain.com`

6. Authorized redirect URIs:

   - Click "Add URI"
   - Add: `http://localhost:8000/api/auth/google/callback`
   - For production, add: `https://yourdomain.com/api/auth/google/callback`

7. Click "Create"

### Step 5: Copy Credentials

A popup will show your credentials:

- **Client ID:** `123456789-abcdefghijklmnop.apps.googleusercontent.com`
- **Client Secret:** `GOCSPX-abcdefghijklmnopqrstuvwxyz`

**Important:** Copy both immediately!

### Step 6: Configure .env

Open `backend/.env` and add:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
GOOGLE_CALLBACK_URL=http://localhost:8000/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
```

### Step 7: Install Required Packages

```bash
cd backend
npm install passport passport-google-oauth20
```

### Step 8: Restart Backend

```bash
cd backend
npm start
```

**Expected output:**

```
✅ Google OAuth strategy configured
Server is running on http://localhost:8000
```

### Step 9: Test Google Login

1. Open app: `http://localhost:5173`
2. Click "Login"
3. Click "Google" button
4. Select your Google account
5. Grant permissions
6. You should be logged in!

---

## Troubleshooting

### Error: "redirect_uri_mismatch"

**Full Error:**

```
Error 400: redirect_uri_mismatch
The redirect URI in the request: http://localhost:8000/api/auth/google/callback
does not match the ones authorized for the OAuth client.
```

**Cause:** Redirect URI not added to Google Console

**Fix:**

1. Go to Google Cloud Console
2. APIs & Services → Credentials
3. Click your OAuth client
4. Add to "Authorized redirect URIs":
   ```
   http://localhost:8000/api/auth/google/callback
   ```
5. Click "Save"
6. Wait 5 minutes for changes to propagate
7. Try again

---

### Error: "Access blocked: This app's request is invalid"

**Cause:** OAuth consent screen not configured

**Fix:**

1. Complete OAuth consent screen setup
2. Add your email as test user
3. Publish app (or keep in testing mode)

---

### Error: "invalid_client"

**Cause:** Wrong Client ID or Secret

**Fix:**

1. Go to Google Cloud Console
2. Check credentials
3. Copy correct Client ID and Secret
4. Update .env file
5. Restart backend

---

### Error: "Google OAuth not configured"

**Cause:** Missing credentials in .env

**Fix:**

```env
GOOGLE_CLIENT_ID=your-actual-client-id
GOOGLE_CLIENT_SECRET=your-actual-secret
```

---

### Error: "User not redirected after login"

**Cause:** Wrong FRONTEND_URL

**Fix:**

```env
FRONTEND_URL=http://localhost:5173
```

---

## Production Setup

### Step 1: Update OAuth Consent Screen

1. Go to OAuth consent screen
2. Click "Publish App"
3. Submit for verification (if needed)

### Step 2: Add Production URLs

1. Go to Credentials
2. Edit OAuth client
3. Add production URLs:

**Authorized JavaScript origins:**

```
https://yourdomain.com
https://www.yourdomain.com
```

**Authorized redirect URIs:**

```
https://yourdomain.com/api/auth/google/callback
https://www.yourdomain.com/api/auth/google/callback
```

### Step 3: Update Production .env

```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-secret
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
FRONTEND_URL=https://yourdomain.com
```

---

## Security Best Practices

### DO:

- ✅ Use HTTPS in production
- ✅ Keep Client Secret private
- ✅ Add only necessary scopes
- ✅ Verify user email
- ✅ Use different credentials for dev/prod

### DON'T:

- ❌ Commit credentials to git
- ❌ Share Client Secret
- ❌ Use same credentials across projects
- ❌ Request unnecessary permissions
- ❌ Skip OAuth consent screen setup

---

## Testing Checklist

- [ ] Google Cloud project created
- [ ] Google+ API enabled
- [ ] OAuth consent screen configured
- [ ] OAuth credentials created
- [ ] Credentials added to .env
- [ ] Backend restarted
- [ ] Google login button works
- [ ] User redirected to Google
- [ ] User can select account
- [ ] User redirected back to app
- [ ] User logged in successfully
- [ ] User data saved to database

---

## User Flow

```
1. User clicks "Google" button
   ↓
2. Redirected to: /api/auth/google
   ↓
3. Backend redirects to Google login
   ↓
4. User selects Google account
   ↓
5. User grants permissions
   ↓
6. Google redirects to: /api/auth/google/callback
   ↓
7. Backend verifies with Google
   ↓
8. Backend creates/finds user in database
   ↓
9. Backend generates JWT token
   ↓
10. Backend redirects to: /auth/callback?token=xxx&user=xxx
    ↓
11. Frontend stores token in cookies
    ↓
12. User logged in and redirected to /home
```

---

## What Data Google Provides

### Basic Profile:

```javascript
{
  id: '123456789',
  displayName: 'John Doe',
  emails: [{ value: 'john@gmail.com', verified: true }],
  photos: [{ value: 'https://...' }],
  provider: 'google'
}
```

### Stored in Database:

- Google ID (for future logins)
- Email (verified by Google)
- Username (from display name)
- Profile picture (optional)

---

## Managing OAuth Clients

### View All Clients:

1. Go to Credentials
2. See list of OAuth 2.0 Client IDs
3. Click to edit or delete

### Create Multiple Clients:

- Development client (localhost)
- Staging client (staging.yourdomain.com)
- Production client (yourdomain.com)

### Rotate Credentials:

1. Create new OAuth client
2. Update .env with new credentials
3. Test thoroughly
4. Delete old client

---

## Monitoring & Analytics

### Google Cloud Console:

1. Go to "APIs & Services" → "Dashboard"
2. View metrics:
   - API requests
   - Errors
   - Latency
   - Quotas

### Set Up Alerts:

1. Go to "Monitoring"
2. Create alert policies
3. Get notified of issues

---

## Quotas & Limits

### Free Tier:

- ✅ Unlimited OAuth requests
- ✅ 10,000 API calls/day (Google+ API)
- ✅ No cost for authentication

### Rate Limits:

- 100 requests/second per user
- 10,000 requests/day per project

---

## Common Issues

### Issue: "This app isn't verified"

**Cause:** App not verified by Google

**Solution:**

- For development: Click "Advanced" → "Go to Aviator Game (unsafe)"
- For production: Submit app for verification

---

### Issue: "Access denied"

**Cause:** User denied permissions

**Solution:**

- User needs to grant permissions
- Explain why permissions are needed
- Try login again

---

### Issue: "Email not provided"

**Cause:** Email scope not requested

**Solution:**

```javascript
passport.authenticate("google", {
  scope: ["profile", "email"], // Make sure 'email' is included
});
```

---

## Quick Reference

### Configuration:

```env
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
GOOGLE_CALLBACK_URL=http://localhost:8000/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
```

### Test Login:

1. Go to: http://localhost:5173
2. Click "Login"
3. Click "Google"
4. Select account
5. Should be logged in

### Console:

https://console.cloud.google.com/

---

## Support Resources

### Documentation:

- Google OAuth: https://developers.google.com/identity/protocols/oauth2
- Passport.js: http://www.passportjs.org/packages/passport-google-oauth20/

### Community:

- Stack Overflow: Tag `google-oauth`
- Google Support: https://support.google.com/cloud

---

## Migration Guide

### From Email/Password to Google OAuth:

**Step 1:** Link existing accounts

```javascript
// If user logs in with Google and email exists
const existingUser = await User.findOne({ email: googleEmail });
if (existingUser) {
  existingUser.googleId = googleId;
  await existingUser.save();
}
```

**Step 2:** Allow both login methods

- Users can login with email/password OR Google
- Same account, multiple login methods

---

**Status:** ✅ Setup complete when Google login works

**Next Step:** Setup Telegram Bot for Telegram login

---

_Last Updated: October 14, 2025_
