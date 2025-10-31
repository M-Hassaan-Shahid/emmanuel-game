# 🔐 Admin Login Credentials

## Default Admin Account

**Email:** `admin@aviator.com`  
**Password:** `1234`

---

## 🚀 How to Create Admin User

### Step 1: Make Sure MongoDB is Running

```bash
mongod
```

### Step 2: Create Admin User

**Option A: Use Batch File (Easy)**

```bash
CREATE_ADMIN_NOW.bat
```

**Option B: Manual Command**

```bash
cd backend
node createAdmin.js
```

---

## ✅ After Creating Admin

### Login via Web Interface

1. Go to http://localhost:3000
2. Enter:
   - **Email:** `admin@aviator.com`
   - **Password:** `1234`
3. Click Login

### Login via Telegram Bot

1. Start bot: `cd backend && start-admin-bot.bat`
2. Send: `/login admin@aviator.com 1234`

---

## 🔍 Verify Admin Exists

### Check in MongoDB

```bash
mongosh
use aviator
db.admin.find()
```

Should show your admin user.

### Check with Script

```bash
cd backend
node listAdmins.js
```

---

## 🐛 Troubleshooting

### Error: "Admin already exists"

Admin is already created! Just login with the credentials above.

### Error: "Email not found"

Admin hasn't been created yet. Run:

```bash
CREATE_ADMIN_NOW.bat
```

### Error: "MongoDB connection failed"

Make sure MongoDB is running:

```bash
mongod
```

---

## 🔐 Change Password

To create admin with different password:

1. Open `backend/createAdmin.js`
2. Change this line:

```javascript
const ADMIN_PASSWORD = "1234"; // Change to your password
```

3. Run: `node createAdmin.js`

---

## ✅ Quick Start

1. **Start MongoDB:** `mongod`
2. **Create Admin:** `CREATE_ADMIN_NOW.bat`
3. **Start Backend:** `cd backend && npm start`
4. **Start Frontend:** `cd frontend && npm start`
5. **Login:** http://localhost:3000
   - Email: `admin@aviator.com`
   - Password: `1234`

---

## 📞 Need Help?

If you're getting "Email not found" error:

1. Make sure MongoDB is running
2. Run `CREATE_ADMIN_NOW.bat`
3. Wait for "✅ Admin created successfully!"
4. Try logging in again

---

**Current Admin Credentials:**

- Email: `admin@aviator.com`
- Password: `1234`

**Remember to change the password after first login!**
