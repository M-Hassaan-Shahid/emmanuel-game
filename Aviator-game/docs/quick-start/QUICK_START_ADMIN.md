# 🚀 Quick Start: Create Admin & Login

## Step-by-Step Guide

### 1️⃣ Start MongoDB

```bash
mongod
```

### 2️⃣ Create Admin User

```bash
cd backend
node createAdmin.js
```

**Default credentials created:**

- Email: `admin@aviator.com`
- Password: `admin123`

### 3️⃣ Start Backend

```bash
cd backend
npm start
```

### 4️⃣ Start Frontend

```bash
cd frontend
npm start
```

### 5️⃣ Login

**Option A: Web Interface**

1. Open http://localhost:3000
2. Login with:
   - Email: `admin@aviator.com`
   - Password: `admin123`

**Option B: Telegram Bot**

1. Start bot: `cd backend && start-admin-bot.bat`
2. Open Telegram and find your bot
3. Send: `/login admin@aviator.com admin123`

---

## 🎯 That's It!

You now have:

- ✅ Admin account created
- ✅ Can login to web panel
- ✅ Can use Telegram bot

**Remember:** Change the default password after first login!

---

## 📋 Quick Commands Reference

```bash
# Create admin
cd backend && node createAdmin.js

# Start backend
cd backend && npm start

# Start frontend
cd frontend && npm start

# Start Telegram bot
cd backend && start-admin-bot.bat

# Check admin in database
mongosh
use aviator
db.admin.find()
```

---

## 🔐 Custom Admin Credentials

To create admin with your own email/password:

1. Edit `backend/createAdmin.js`
2. Change these lines:

```javascript
const ADMIN_EMAIL = "your-email@example.com";
const ADMIN_PASSWORD = "your-password";
```

3. Run: `node createAdmin.js`

---

## ⚠️ Troubleshooting

**"Admin already exists"**

- Admin with that email already exists
- Use different email or delete existing admin

**"MongoDB connection failed"**

- Make sure MongoDB is running: `mongod`

**Can't login**

- Check backend is running on port 8000
- Check frontend is running on port 3000
- Verify credentials are correct

---

See `CREATE_ADMIN_GUIDE.md` for detailed instructions.
