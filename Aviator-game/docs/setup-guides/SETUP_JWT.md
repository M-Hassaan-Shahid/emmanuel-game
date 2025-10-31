# 🔐 JWT Secret Setup Guide

## Overview

JWT (JSON Web Token) is used for secure user authentication. The JWT_SECRET is a secret key used to sign and verify tokens.

---

## What is JWT?

JWT is used to:

- ✅ Authenticate users
- ✅ Maintain user sessions
- ✅ Secure API endpoints
- ✅ Prevent unauthorized access

---

## Quick Setup

### Step 1: Generate a Strong Secret

**Option A: Use Online Generator**

1. Go to: https://randomkeygen.com/
2. Copy a "CodeIgniter Encryption Key" (256-bit)
3. Example: `a8f5f167f44f4964e6c998dee827110c`

**Option B: Use Node.js**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option C: Use OpenSSL**

```bash
openssl rand -hex 32
```

**Option D: Manual (Not Recommended)**

- Use at least 32 characters
- Mix letters, numbers, and symbols
- Example: `MyS3cr3tK3y!2024@Aviator#Game$Secure`

### Step 2: Add to .env

Open `backend/.env` and add:

```env
JWT_SECRET=your-generated-secret-key-here
```

**Example:**

```env
JWT_SECRET=a8f5f167f44f4964e6c998dee827110c3b9e5e9f6a8b7c5d4e3f2a1b0c9d8e7f
```

### Step 3: Restart Backend

```bash
cd backend
npm start
```

---

## Security Best Practices

### DO:

- ✅ Use at least 32 characters
- ✅ Use random characters
- ✅ Keep it secret (never commit to git)
- ✅ Use different secrets for dev/prod
- ✅ Change it if compromised

### DON'T:

- ❌ Use simple passwords like "secret123"
- ❌ Share your JWT secret
- ❌ Commit .env file to git
- ❌ Use the same secret across projects
- ❌ Use predictable patterns

---

## How JWT Works

### Login Flow:

```
1. User logs in with email/password
2. Backend verifies credentials
3. Backend creates JWT token with JWT_SECRET
4. Token sent to frontend
5. Frontend stores token in cookies
6. Frontend sends token with each request
7. Backend verifies token with JWT_SECRET
8. If valid, allow access
```

### Token Structure:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4OTAiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**Parts:**

1. Header (algorithm)
2. Payload (user data)
3. Signature (signed with JWT_SECRET)

---

## Token Expiry

### Current Configuration:

```javascript
// In UserController.js
const token = jwt.sign(
  { id: user._id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: "7d" } // Token expires in 7 days
);
```

### Modify Expiry:

- `'1h'` - 1 hour
- `'24h'` - 24 hours
- `'7d'` - 7 days (current)
- `'30d'` - 30 days

---

## Testing JWT

### Test Token Generation:

Create `backend/test-jwt.js`:

```javascript
require("dotenv").config();
const jwt = require("jsonwebtoken");

const testData = {
  id: "12345",
  email: "test@example.com",
};

const token = jwt.sign(testData, process.env.JWT_SECRET, { expiresIn: "1h" });
console.log("Generated Token:", token);

const decoded = jwt.verify(token, process.env.JWT_SECRET);
console.log("Decoded Data:", decoded);
```

Run:

```bash
node backend/test-jwt.js
```

**Expected output:**

```
Generated Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Decoded Data: { id: '12345', email: 'test@example.com', iat: 1234567890, exp: 1234571490 }
```

---

## Troubleshooting

### Error: "jwt must be provided"

**Cause:** No JWT_SECRET in .env

**Fix:**

```env
JWT_SECRET=your-secret-key-here
```

---

### Error: "invalid signature"

**Cause:** JWT_SECRET changed or token from different server

**Fix:**

- Use same JWT_SECRET across all servers
- Users need to login again after secret change

---

### Error: "jwt expired"

**Cause:** Token older than expiry time

**Fix:**

- User needs to login again
- Increase expiry time if needed

---

### Error: "jwt malformed"

**Cause:** Invalid token format

**Fix:**

- Check if token is being sent correctly
- Verify token format in cookies

---

## Environment-Specific Secrets

### Development (.env):

```env
JWT_SECRET=dev-secret-key-for-testing-only
```

### Production (.env.production):

```env
JWT_SECRET=prod-super-secure-random-key-a8f5f167f44f4964e6c998dee827110c
```

---

## Rotating JWT Secret

### When to Rotate:

- Security breach
- Employee leaves
- Regular security practice (every 6-12 months)
- Suspected compromise

### How to Rotate:

**Step 1:** Generate new secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Step 2:** Update .env

```env
JWT_SECRET=new-secret-key-here
```

**Step 3:** Restart server

```bash
npm start
```

**Step 4:** All users need to login again

---

## Multiple Secrets (Advanced)

### For Token Rotation:

```javascript
// Support old and new secrets during transition
const secrets = [process.env.JWT_SECRET, process.env.JWT_SECRET_OLD];

// Try verifying with each secret
for (const secret of secrets) {
  try {
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (err) {
    continue;
  }
}
```

---

## Security Checklist

- [ ] JWT_SECRET is at least 32 characters
- [ ] JWT_SECRET is random and unpredictable
- [ ] JWT_SECRET is not committed to git
- [ ] .env file is in .gitignore
- [ ] Different secrets for dev/prod
- [ ] Token expiry is set appropriately
- [ ] HTTPS is used in production
- [ ] Tokens are stored securely (httpOnly cookies)

---

## Common Mistakes

### ❌ Mistake 1: Weak Secret

```env
JWT_SECRET=secret123
```

### ✅ Correct:

```env
JWT_SECRET=a8f5f167f44f4964e6c998dee827110c3b9e5e9f6a8b7c5d4e3f2a1b0c9d8e7f
```

---

### ❌ Mistake 2: Committing to Git

```bash
git add .env
git commit -m "Added config"
```

### ✅ Correct:

```bash
# .gitignore
.env
.env.local
.env.production
```

---

### ❌ Mistake 3: Same Secret Everywhere

```env
# Dev, staging, and prod all use same secret
JWT_SECRET=same-secret-everywhere
```

### ✅ Correct:

```env
# Dev
JWT_SECRET=dev-secret-a8f5f167

# Prod
JWT_SECRET=prod-secret-x9y8z7w6
```

---

## Quick Reference

### Generate Secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Add to .env:

```env
JWT_SECRET=your-generated-secret-here
```

### Test:

```bash
cd backend
npm start
# Login should work without errors
```

---

## Additional Resources

### JWT Documentation:

- Official: https://jwt.io/
- Node.js Library: https://github.com/auth0/node-jsonwebtoken

### Security:

- OWASP JWT Guide: https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html

---

**Status:** ✅ Setup complete when users can login successfully

**Next Step:** Configure Email service for OTP

---

_Last Updated: October 14, 2025_
