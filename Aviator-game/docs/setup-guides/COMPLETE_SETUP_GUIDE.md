# 🚀 Complete Setup Guide - Start to Finish

## Prerequisites

- ✅ MongoDB installed and running
- ✅ Node.js installed
- ✅ Dependencies installed (`npm install` in backend and frontend)

---

## 🎯 Quick Setup (5 Steps)

### Step 1: Start MongoDB

```bash
mongod
```

Leave this terminal running.

### Step 2: Setup Admin User

Double-click: `SETUP_ADMIN.bat`

Or manually:

```bash
cd backend
node checkAdmin.js
node createAdmin.js
```

### Step 3: Start Backend

Open new terminal:

```bash
cd backend
npm start
```

Wait for: `✅ MongoDB connected` and `Server is running on http://localhost:8000`

### Step 4: Start Frontend

Open new terminal:

```bash
cd frontend
npm start
```

Browser should open to http://localhost:3000

### Step 5: Login

- **Email:** `admin@aviator.com`
- **Password:** `1234`

---

## 📋 Detailed Steps

### 1️⃣ MongoDB Setup

**Check if MongoDB is running:**

```bash
mongosh
```

If it connects, MongoDB is running. Type `exit` to quit.

**If not running, start it:**

```bash
mongod
```

---

### 2️⃣ Admin User Setup

**Check if admin exists:**

```bash
cd backend
node checkAdmin.js
```

**Create admin if needed:**

```bash
node createAdmin.js
```

**Expected output:**

```
✅ Admin created successfully!
================================
Email: admin@aviator.com
Password: 1234
================================
```

---

### 3️⃣ Backend Setup

**Start backend:**

```bash
cd backend
npm start
```

**Expected output:**

```
✅ MongoDB connected
Server is running on http://localhost:8000
Socket.IO server running
```

**Verify backend is working:**
Open browser: http://localhost:8000
Should see: "Hello World !"

---

### 4️⃣ Frontend Setup

**Start frontend:**

```bash
cd frontend
npm start
```

**Expected output:**

```
Compiled successfully!
Local: http://localhost:3000
```

Browser should automatically open.

---

### 5️⃣ Login & Test

**Login credentials:**

- Email: `admin@aviator.com`
- Password: `1234`

**What to check:**

- ✅ No CORS errors in console
- ✅ Login successful
- ✅ Redirected to dashboard
- ✅ Can see admin panel

---

## 🔧 Troubleshooting

### Issue: "Email not found"

**Solution:** Admin user doesn't exist. Run:

```bash
SETUP_ADMIN.bat
```

### Issue: "MongoDB connection failed"

**Solution:** MongoDB not running. Run:

```bash
mongod
```

### Issue: "Port 8000 already in use"

**Solution:** Kill the process:

```bash
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F
```

### Issue: "CORS error"

**Solution:** Make sure backend restarted after CORS fix:

```bash
cd backend
npm start
```

### Issue: Frontend not loading

**Solution:** Clear cache and restart:

```bash
cd frontend
rmdir /s /q node_modules\.cache
npm start
```

---

## 📊 Service URLs

| Service  | URL                       | Status Check                |
| -------- | ------------------------- | --------------------------- |
| Frontend | http://localhost:3000     | Should show login page      |
| Backend  | http://localhost:8000     | Should show "Hello World !" |
| MongoDB  | mongodb://localhost:27017 | Run `mongosh` to test       |

---

## ✅ Verification Checklist

After setup, verify:

### Backend

- [ ] MongoDB connected message
- [ ] Server running on port 8000
- [ ] No errors in console
- [ ] http://localhost:8000 shows response

### Frontend

- [ ] Compiled successfully
- [ ] Opens in browser
- [ ] No errors in browser console
- [ ] Login page visible

### Admin User

- [ ] Admin created successfully
- [ ] Can login with credentials
- [ ] Redirected to dashboard after login

### Socket.IO

- [ ] "Socket connected" in console (or similar)
- [ ] No WebSocket errors
- [ ] Game loads properly

---

## 🎮 Optional: Telegram Bot

**Start Telegram Admin Bot:**

```bash
cd backend
start-admin-bot.bat
```

**Login via Telegram:**

1. Find your bot on Telegram
2. Send: `/start`
3. Send: `/login admin@aviator.com 1234`

---

## 📁 Useful Scripts

```bash
# Check if admin exists
cd backend
node checkAdmin.js

# Create admin
cd backend
node createAdmin.js

# List all admins
cd backend
node listAdmins.js

# Test CORS
cd backend
node test-cors.js

# Restart everything
restart-all.bat

# Setup admin (interactive)
SETUP_ADMIN.bat
```

---

## 🔐 Security Notes

**After first login:**

1. Change the default password
2. Update admin email if needed
3. Add more admin users if required

**For production:**

1. Use strong passwords
2. Enable HTTPS
3. Update CORS origins
4. Use environment variables for secrets

---

## 🎯 Quick Commands Reference

```bash
# Start MongoDB
mongod

# Start Backend
cd backend && npm start

# Start Frontend
cd frontend && npm start

# Create Admin
cd backend && node createAdmin.js

# Check Admin
cd backend && node checkAdmin.js

# Restart All
restart-all.bat
```

---

## ✅ Success Indicators

Everything is working when you see:

1. ✅ MongoDB: "✅ MongoDB connected"
2. ✅ Backend: "Server is running on http://localhost:8000"
3. ✅ Frontend: "Compiled successfully!"
4. ✅ Admin: Can login without errors
5. ✅ Dashboard: Loads after login
6. ✅ Console: No red errors

---

## 📞 Still Having Issues?

### Check Logs

- **Backend:** Terminal where backend is running
- **Frontend:** Browser console (F12)
- **MongoDB:** MongoDB terminal

### Common Fixes

```bash
# Kill all Node processes
taskkill /F /IM node.exe

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 🎉 You're All Set!

Your Aviator Game platform is now ready to use!

**Login at:** http://localhost:3000

- Email: `admin@aviator.com`
- Password: `1234`

**Enjoy!** 🚀
